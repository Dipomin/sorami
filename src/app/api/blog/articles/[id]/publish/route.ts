import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

/**
 * Helper pour parser les champs qui peuvent être du JSON ou du texte simple
 */
function safeJsonParse(value: string | null | undefined, fallback: any = []): any {
  if (!value) return fallback;
  
  try {
    return JSON.parse(value);
  } catch {
    // Si ce n'est pas du JSON valide, traiter comme du texte simple
    if (typeof value === 'string' && value.trim()) {
      // Si c'est une chaîne simple, on la met dans un tableau
      return [value];
    }
    return fallback;
  }
}

/**
 * POST /api/blog/articles/[id]/publish
 * Publie un article de blog
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const articleId = (await params).id;

    // Vérifier que l'article existe et appartient à l'utilisateur
    const existingArticle = await prisma.blogArticle.findUnique({
      where: { id: articleId },
    });

    if (!existingArticle) {
      return NextResponse.json(
        { error: 'Article non trouvé' },
        { status: 404 }
      );
    }

    if (existingArticle.authorId !== user.id) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    // Vérifier que l'article a le contenu minimum requis
    if (!existingArticle.title || !existingArticle.fullContent) {
      return NextResponse.json(
        { error: 'L\'article doit avoir un titre et du contenu pour être publié' },
        { status: 400 }
      );
    }

    // Mettre à jour l'article
    const updatedArticle = await prisma.blogArticle.update({
      where: { id: articleId },
      data: {
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
        publishedAt: new Date(),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Créer un BlogPost pour le blog public (optionnel)
    // Cela permet d'avoir une version publique de l'article
    try {
      const slug = existingArticle.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Vérifier si un BlogPost existe déjà
      const existingPost = await prisma.blogPost.findFirst({
        where: {
          title: existingArticle.title,
          authorId: user.id,
        },
      });

      if (!existingPost) {
        // Calculer le temps de lecture
        const wordCount = existingArticle.wordCount || 0;
        const readingTime = Math.ceil(wordCount / 200);

        await prisma.blogPost.create({
          data: {
            slug: `${slug}-${Date.now()}`,
            title: existingArticle.title,
            excerpt: existingArticle.metaDescription || existingArticle.introduction?.substring(0, 200),
            content: `${existingArticle.introduction || ''}\n\n${existingArticle.fullContent || ''}\n\n${existingArticle.conclusion || ''}`,
            authorId: user.id,
            metaTitle: existingArticle.title,
            metaDescription: existingArticle.metaDescription,
            metaKeywords: existingArticle.mainKeywords ? JSON.stringify(existingArticle.mainKeywords) : null,
            tags: existingArticle.tags ? existingArticle.tags.toString() : null,
            status: 'PUBLISHED',
            published: true,
            publishedAt: new Date(),
            readingTime,
          },
        });
      }
    } catch (postError) {
      console.error('⚠️ [Blog Publish API] Erreur création BlogPost:', postError);
      // On continue même si la création du BlogPost échoue
    }

    // Parser les champs JSON pour la réponse avec gestion d'erreur
    const responseData = {
      ...updatedArticle,
      tags: safeJsonParse(updatedArticle.tags as string, []),
      mainKeywords: safeJsonParse(updatedArticle.mainKeywords as string, []),
      sections: safeJsonParse(updatedArticle.sections as string, []),
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('❌ [Blog Publish API] Erreur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la publication' },
      { status: 500 }
    );
  }
}
