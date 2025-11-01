/**
 * API Route: Blog Comments
 * Gestion des commentaires de blog
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { requireAdmin } from '@/lib/auth-admin';

/**
 * GET /api/blog/comments
 * Liste des commentaires
 * Public: commentaires approuvés
 * Admin: tous les commentaires
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Paramètres
    const postId = searchParams.get('postId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const skip = (page - 1) * limit;

    // Vérifier si l'utilisateur est admin
    let isAdmin = false;
    try {
      await requireAdmin();
      isAdmin = true;
    } catch {
      // Pas admin
    }

    // Construction de la query WHERE
    const where: any = {};

    if (postId) {
      where.postId = postId;
    }

    // Si pas admin, on ne montre que les commentaires approuvés
    if (!isAdmin) {
      where.status = 'APPROVED';
    } else if (status) {
      // Si admin et status spécifié
      where.status = status;
    }

    // Récupérer les commentaires
    const [comments, total] = await Promise.all([
      prisma.blogComment.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          post: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.blogComment.count({ where }),
    ]);

    return NextResponse.json({
      comments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + comments.length < total,
      },
    });
  } catch (error: any) {
    console.error('Error fetching blog comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog comments', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/blog/comments
 * Créer un nouveau commentaire (Utilisateur authentifié)
 */
export async function POST(request: NextRequest) {
  try {
    // Vérifier que l'utilisateur est authentifié
    const user = await requireAuth();

    const body = await request.json();
    const { postId, content } = body;

    // Validation
    if (!postId || !content) {
      return NextResponse.json(
        { error: 'Post ID and content are required' },
        { status: 400 }
      );
    }

    if (content.length < 3) {
      return NextResponse.json(
        { error: 'Comment must be at least 3 characters' },
        { status: 400 }
      );
    }

    if (content.length > 5000) {
      return NextResponse.json(
        { error: 'Comment must be less than 5000 characters' },
        { status: 400 }
      );
    }

    // Vérifier que l'article existe et est publié
    const post = await prisma.blogPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    if (!post.published) {
      return NextResponse.json(
        { error: 'Cannot comment on unpublished posts' },
        { status: 403 }
      );
    }

    // user est déjà l'objet User de la BD (retourné par requireAuth)
    // Créer le commentaire (status PENDING par défaut pour modération)
    const comment = await prisma.blogComment.create({
      data: {
        postId,
        authorId: user.id,
        content,
        status: 'PENDING', // Modération requise
      },
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

    return NextResponse.json(comment, { status: 201 });
  } catch (error: any) {
    console.error('Error creating blog comment:', error);
    
    if (error.message.includes('Authentication required')) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create blog comment', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/blog/comments
 * Mettre à jour un commentaire (Admin: changer status, Auteur: modifier contenu)
 */
export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { id, content, status } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Comment ID is required' },
        { status: 400 }
      );
    }

    // Vérifier que le commentaire existe
    const existingComment = await prisma.blogComment.findUnique({
      where: { id },
      include: { author: true },
    });

    if (!existingComment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    // user est déjà l'objet User de la BD (retourné par requireAuth)
    // Vérifier les permissions
    const isAdmin = user.role === 'ADMIN';
    const isAuthor = existingComment.authorId === user.id;

    if (!isAdmin && !isAuthor) {
      return NextResponse.json(
        { error: 'Forbidden - You can only edit your own comments' },
        { status: 403 }
      );
    }

    // Préparer les données de mise à jour
    const updateData: any = {};

    // Seul l'admin peut changer le status
    if (status !== undefined) {
      if (!isAdmin) {
        return NextResponse.json(
          { error: 'Forbidden - Only admins can change comment status' },
          { status: 403 }
        );
      }
      updateData.status = status;
    }

    // L'auteur peut modifier le contenu (si pas encore approuvé ou admin)
    if (content !== undefined) {
      if (!isAuthor && !isAdmin) {
        return NextResponse.json(
          { error: 'Forbidden - You can only edit your own comments' },
          { status: 403 }
        );
      }

      if (content.length < 3 || content.length > 5000) {
        return NextResponse.json(
          { error: 'Comment must be between 3 and 5000 characters' },
          { status: 400 }
        );
      }

      updateData.content = content;
    }

    // Mettre à jour le commentaire
    const comment = await prisma.blogComment.update({
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

    return NextResponse.json(comment);
  } catch (error: any) {
    console.error('Error updating blog comment:', error);
    
    if (error.message.includes('Authentication required')) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update blog comment', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/blog/comments
 * Supprimer un commentaire (Admin ou auteur)
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Comment ID is required' },
        { status: 400 }
      );
    }

    // Vérifier que le commentaire existe
    const existingComment = await prisma.blogComment.findUnique({
      where: { id },
    });

    if (!existingComment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    // user est déjà l'objet User de la BD (retourné par requireAuth)
    // Vérifier les permissions
    const isAdmin = user.role === 'ADMIN';
    const isAuthor = existingComment.authorId === user.id;

    if (!isAdmin && !isAuthor) {
      return NextResponse.json(
        { error: 'Forbidden - You can only delete your own comments' },
        { status: 403 }
      );
    }

    // Supprimer le commentaire
    await prisma.blogComment.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Comment deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting blog comment:', error);
    
    if (error.message.includes('Authentication required')) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete blog comment', details: error.message },
      { status: 500 }
    );
  }
}
