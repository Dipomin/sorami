import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const user = await requireAuth();

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');

    const where: any = {
      authorId: user.id,
    };

    if (organizationId) {
      where.organizationId = organizationId;
    }

    const blogs = await prisma.blogArticle.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        title: true,
        topic: true,
        metaDescription: true,
        seoScore: true,
        wordCount: true,
        targetWordCount: true,
        tags: true,
        mainKeywords: true,
        status: true,
        visibility: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        authorId: true,
        organizationId: true,
      },
    });

    return NextResponse.json(blogs);
  } catch (error) {
    console.error('Erreur lors de la récupération des articles:', error);
    return NextResponse.json(
      { 
        error: 'Erreur interne du serveur',
        message: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}
