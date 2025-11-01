import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/legal
 * Récupère toutes les pages légales publiées
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const includeUnpublished = searchParams.get('includeUnpublished') === 'true';

    if (slug) {
      // Récupérer une page spécifique
      const page = await prisma.legalPage.findUnique({
        where: { slug },
      });

      if (!page || (!page.published && !includeUnpublished)) {
        return NextResponse.json(
          { error: 'Page légale non trouvée' },
          { status: 404 }
        );
      }

      return NextResponse.json({ page });
    }

    // Récupérer toutes les pages
    const pages = await prisma.legalPage.findMany({
      where: includeUnpublished ? undefined : { published: true },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        slug: true,
        title: true,
        version: true,
        published: true,
        publishedAt: true,
        updatedAt: true,
        metaTitle: true,
        metaDescription: true,
      },
    });

    return NextResponse.json({ pages });
  } catch (error) {
    console.error('Erreur récupération pages légales:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/legal
 * Créer ou mettre à jour une page légale (Admin seulement)
 */
export async function POST(request: NextRequest) {
  try {
    // TODO: Ajouter vérification admin avec Clerk
    const body = await request.json();
    const {
      slug,
      title,
      content,
      version,
      published,
      metaTitle,
      metaDescription,
    } = body;

    if (!slug || !title || !content) {
      return NextResponse.json(
        { error: 'slug, title et content sont requis' },
        { status: 400 }
      );
    }

    // Vérifier si la page existe
    const existingPage = await prisma.legalPage.findUnique({
      where: { slug },
    });

    let page;
    if (existingPage) {
      // Mettre à jour
      page = await prisma.legalPage.update({
        where: { slug },
        data: {
          title,
          content,
          version: version || existingPage.version,
          published,
          publishedAt: published && !existingPage.published ? new Date() : existingPage.publishedAt,
          metaTitle,
          metaDescription,
        },
      });
    } else {
      // Créer
      page = await prisma.legalPage.create({
        data: {
          slug,
          title,
          content,
          version: version || '1.0',
          published: published || false,
          publishedAt: published ? new Date() : null,
          metaTitle,
          metaDescription,
        },
      });
    }

    return NextResponse.json({ page });
  } catch (error) {
    console.error('Erreur création/mise à jour page légale:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/legal
 * Supprimer une page légale (Admin seulement)
 */
export async function DELETE(request: NextRequest) {
  try {
    // TODO: Ajouter vérification admin
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json(
        { error: 'slug requis' },
        { status: 400 }
      );
    }

    await prisma.legalPage.delete({
      where: { slug },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur suppression page légale:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
