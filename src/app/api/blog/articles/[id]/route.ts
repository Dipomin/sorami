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
    // Pour les tags, on peut split par virgule
    if (typeof value === 'string' && value.trim()) {
      // Si c'est une chaîne simple, on la met dans un tableau
      return [value];
    }
    return fallback;
  }
}

/**
 * GET /api/blog/articles/[id]
 * Récupère un article de blog par son ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const articleId = ((await params)).id;

    const article = await prisma.blogArticle.findUnique({
      where: { id: articleId },
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

    if (!article) {
      return NextResponse.json(
        { error: 'Article non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur a accès à cet article
    if (article.authorId !== user.id) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    // Parser les champs JSON avec gestion d'erreur
    const responseData = {
      ...article,
      tags: safeJsonParse(article.tags as string, []),
      mainKeywords: safeJsonParse(article.mainKeywords as string, []),
      sections: safeJsonParse(article.sections as string, []),
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('❌ [Blog Article API] Erreur:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/blog/articles/[id]
 * Met à jour un article de blog
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const articleId = params.id;
    const body = await request.json();

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

    // Préparer les données de mise à jour
    const updateData: any = {};

    if (body.title !== undefined) {
      updateData.title = body.title;
    }

    if (body.metaDescription !== undefined) {
      updateData.metaDescription = body.metaDescription;
    }

    if (body.introduction !== undefined) {
      updateData.introduction = body.introduction;
    }

    if (body.conclusion !== undefined) {
      updateData.conclusion = body.conclusion;
    }

    if (body.fullContent !== undefined) {
      updateData.fullContent = body.fullContent;
      // Recalculer le nombre de mots
      updateData.wordCount = body.fullContent.split(/\s+/).filter((word: string) => word.length > 0).length;
    }

    if (body.tags !== undefined) {
      updateData.tags = JSON.stringify(body.tags);
    }

    if (body.status !== undefined) {
      updateData.status = body.status;
    }

    if (body.visibility !== undefined) {
      updateData.visibility = body.visibility;
    }

    // Mettre à jour l'article
    const updatedArticle = await prisma.blogArticle.update({
      where: { id: articleId },
      data: updateData,
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

    // Parser les champs JSON pour la réponse avec gestion d'erreur
    const responseData = {
      ...updatedArticle,
      tags: safeJsonParse(updatedArticle.tags as string, []),
      mainKeywords: safeJsonParse(updatedArticle.mainKeywords as string, []),
      sections: safeJsonParse(updatedArticle.sections as string, []),
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('❌ [Blog Article Update API] Erreur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/blog/articles/[id]
 * Supprime un article de blog
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const articleId = params.id;

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

    // Supprimer l'article
    await prisma.blogArticle.delete({
      where: { id: articleId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ [Blog Article Delete API] Erreur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}
