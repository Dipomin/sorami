/**
 * API Route: Blog Posts
 * Gestion CRUD des articles de blog
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { requireAdmin } from '@/lib/auth-admin';
import slugify from 'slugify';
import readingTime from 'reading-time';

// Configuration pour les uploads
export const runtime = 'nodejs';

/**
 * GET /api/blog/posts
 * Liste des articles avec pagination, filtres et recherche
 * Public: articles publiés seulement
 * Admin: tous les articles
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Paramètres de pagination
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const skip = (page - 1) * limit;

    // Filtres
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const authorId = searchParams.get('authorId');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'publishedAt'; // publishedAt, viewsCount, createdAt
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Vérifier si l'utilisateur est admin
    let isAdmin = false;
    try {
      await requireAdmin();
      isAdmin = true;
    } catch {
      // Pas admin, on continue en mode public
    }

    // Construction de la query WHERE
    const where: any = {};

    // Si pas admin, on ne montre que les articles publiés
    if (!isAdmin) {
      where.published = true;
      where.status = 'PUBLISHED';
    } else if (status) {
      // Si admin et status spécifié
      where.status = status;
    }

    // Filtres additionnels
    if (category) {
      where.category = category;
    }
    if (authorId) {
      where.authorId = authorId;
    }

    // Recherche dans titre, excerpt et contenu
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { excerpt: { contains: search } },
        { content: { contains: search } },
      ];
    }

    // Récupérer les articles
    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
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
          _count: {
            select: { comments: true },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.blogPost.count({ where }),
    ]);

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + posts.length < total,
      },
    });
  } catch (error: any) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog posts', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/blog/posts
 * Créer un nouvel article (Admin uniquement)
 */
export async function POST(request: NextRequest) {
  try {
    // Vérifier que l'utilisateur est admin
    const admin = await requireAdmin();

    const body = await request.json();
    const {
      title,
      excerpt,
      content,
      coverImage,
      category,
      tags,
      status = 'DRAFT',
      published = false,
      publishedAt,
      metaTitle,
      metaDescription,
      metaKeywords,
    } = body;

    // Validation
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Générer le slug à partir du titre
    let slug = slugify(title, { lower: true, strict: true });
    
    // Vérifier l'unicité du slug
    const existingPost = await prisma.blogPost.findUnique({
      where: { slug },
    });

    if (existingPost) {
      // Ajouter un timestamp au slug
      slug = `${slug}-${Date.now()}`;
    }

    // Calculer le temps de lecture
    const stats = readingTime(content);
    const readingTimeMinutes = Math.ceil(stats.minutes);

    // Parser les tags (JSON string vers array)
    let parsedTags: string[] = [];
    if (tags) {
      if (typeof tags === 'string') {
        try {
          parsedTags = JSON.parse(tags);
        } catch {
          parsedTags = tags.split(',').map((t: string) => t.trim());
        }
      } else if (Array.isArray(tags)) {
        parsedTags = tags;
      }
    }

    // Créer l'article
    const post = await prisma.blogPost.create({
      data: {
        slug,
        title,
        excerpt,
        content,
        coverImage,
        authorId: admin.id,
        category,
        tags: JSON.stringify(parsedTags),
        status,
        published,
        publishedAt: publishedAt ? new Date(publishedAt) : (published ? new Date() : null),
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || excerpt,
        metaKeywords,
        readingTime: readingTimeMinutes,
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

    return NextResponse.json(post, { status: 201 });
  } catch (error: any) {
    console.error('Error creating blog post:', error);
    
    if (error.message.includes('Admin access required')) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create blog post', details: error.message },
      { status: 500 }
    );
  }
}
