/**
 * API Route: Individual Blog Post
 * Gestion d'un article spécifique (GET, PUT, DELETE)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-admin';
import slugify from 'slugify';
import readingTime from 'reading-time';

/**
 * GET /api/blog/posts/[id]
 * Récupérer un article par ID ou slug
 * Si slug, incrémente les vues automatiquement
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    // Déterminer si c'est un ID ou un slug
    const isSlug = !id.startsWith('clk') && !id.startsWith('cm'); // cuid patterns

    let post;
    
    if (isSlug) {
      // Récupérer par slug et incrémenter les vues
      post = await prisma.blogPost.update({
        where: { slug: id },
        data: { viewsCount: { increment: 1 } },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              bio: true,
            },
          },
          comments: {
            where: { status: 'APPROVED' },
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      });
    } else {
      // Récupérer par ID (admin dashboard)
      post = await prisma.blogPost.findUnique({
        where: { id },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              bio: true,
            },
          },
          comments: {
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      });
    }

    if (!post) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    // Si pas publié, vérifier que l'utilisateur est admin
    if (!post.published) {
      try {
        await requireAdmin();
      } catch {
        return NextResponse.json(
          { error: 'Blog post not found' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(post);
  } catch (error: any) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog post', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/blog/posts/[id]
 * Mettre à jour un article (Admin uniquement)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier que l'utilisateur est admin
    await requireAdmin();

    const { id } = await params;
    const body = await request.json();

    const {
      title,
      excerpt,
      content,
      coverImage,
      category,
      tags,
      status,
      published,
      publishedAt,
      metaTitle,
      metaDescription,
      metaKeywords,
    } = body;

    // Vérifier que l'article existe
    const existingPost = await prisma.blogPost.findUnique({
      where: { id },
    });

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    // Préparer les données de mise à jour
    const updateData: any = {};

    if (title !== undefined) {
      updateData.title = title;
      
      // Regénérer le slug si le titre change
      if (title !== existingPost.title) {
        let newSlug = slugify(title, { lower: true, strict: true });
        
        // Vérifier l'unicité (sauf pour l'article actuel)
        const slugExists = await prisma.blogPost.findFirst({
          where: {
            slug: newSlug,
            id: { not: id },
          },
        });

        if (slugExists) {
          newSlug = `${newSlug}-${Date.now()}`;
        }

        updateData.slug = newSlug;
      }
    }

    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (category !== undefined) updateData.category = category;
    if (status !== undefined) updateData.status = status;
    if (metaTitle !== undefined) updateData.metaTitle = metaTitle;
    if (metaDescription !== undefined) updateData.metaDescription = metaDescription;
    if (metaKeywords !== undefined) updateData.metaKeywords = metaKeywords;

    // Gérer le contenu et recalculer le temps de lecture
    if (content !== undefined) {
      updateData.content = content;
      const stats = readingTime(content);
      updateData.readingTime = Math.ceil(stats.minutes);
    }

    // Gérer les tags
    if (tags !== undefined) {
      let parsedTags: string[] = [];
      if (typeof tags === 'string') {
        try {
          parsedTags = JSON.parse(tags);
        } catch {
          parsedTags = tags.split(',').map((t: string) => t.trim());
        }
      } else if (Array.isArray(tags)) {
        parsedTags = tags;
      }
      updateData.tags = JSON.stringify(parsedTags);
    }

    // Gérer la publication
    if (published !== undefined) {
      updateData.published = published;
      
      // Si on publie pour la première fois
      if (published && !existingPost.published) {
        updateData.publishedAt = publishedAt ? new Date(publishedAt) : new Date();
      }
    }

    if (publishedAt !== undefined && publishedAt !== null) {
      updateData.publishedAt = new Date(publishedAt);
    }

    // Mettre à jour l'article
    const post = await prisma.blogPost.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json(post);
  } catch (error: any) {
    console.error('Error updating blog post:', error);
    
    if (error.message.includes('Admin access required')) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update blog post', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/blog/posts/[id]
 * Supprimer un article (Admin uniquement)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier que l'utilisateur est admin
    await requireAdmin();

    const { id } = await params;

    // Vérifier que l'article existe
    const existingPost = await prisma.blogPost.findUnique({
      where: { id },
    });

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    // Supprimer l'article (cascade supprimera les commentaires)
    await prisma.blogPost.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Blog post deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting blog post:', error);
    
    if (error.message.includes('Admin access required')) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete blog post', details: error.message },
      { status: 500 }
    );
  }
}
