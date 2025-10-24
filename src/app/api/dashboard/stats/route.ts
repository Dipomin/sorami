import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const user = await requireAuth();

    // Récupérer les stats réelles de l'utilisateur
    const [
      imagesCount,
      videosCount,
      articlesCount,
      booksCount,
      recentImages,
      recentVideos,
      recentArticles,
      recentBooks,
    ] = await Promise.all([
      // Compter les images générées
      prisma.imageGeneration.count({
        where: { authorId: user.id },
      }),
      // Compter les vidéos créées
      prisma.videoGeneration.count({
        where: { authorId: user.id },
      }),
      // Compter les articles publiés
      prisma.blogArticle.count({
        where: { authorId: user.id },
      }),
      // Compter les ebooks complétés
      prisma.book.count({
        where: { 
          authorId: user.id,
          status: 'PUBLISHED',
        },
      }),
      // Images récentes (30 derniers jours)
      prisma.imageGeneration.count({
        where: {
          authorId: user.id,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      // Vidéos récentes (30 derniers jours)
      prisma.videoGeneration.count({
        where: {
          authorId: user.id,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      // Articles récents (30 derniers jours)
      prisma.blogArticle.count({
        where: {
          authorId: user.id,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      // Livres récents (30 derniers jours)
      prisma.book.count({
        where: {
          authorId: user.id,
          status: 'PUBLISHED',
          publishedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    // Calculer les variations en %
    const calculateChange = (current: number, recent: number) => {
      if (current === 0) return '+0%';
      const percentage = ((recent / current) * 100).toFixed(0);
      return `+${percentage}%`;
    };

    const stats = {
      images: {
        total: imagesCount,
        change: calculateChange(imagesCount, recentImages),
      },
      videos: {
        total: videosCount,
        change: calculateChange(videosCount, recentVideos),
      },
      articles: {
        total: articlesCount,
        change: calculateChange(articlesCount, recentArticles),
      },
      books: {
        total: booksCount,
        change: calculateChange(booksCount, recentBooks),
      },
    };

    return NextResponse.json({ success: true, stats });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    
    if (error instanceof Error && error.message === 'Utilisateur non authentifié') {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    );
  }
}
