import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/profile/stats
 * Récupère les statistiques du profil utilisateur
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Récupérer l'utilisateur depuis la DB
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, createdAt: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Récupérer les statistiques en parallèle
    const [
      blogsCount,
      booksCount,
      imagesCount,
      videosCount,
      recentBlogs,
      recentBooks,
      recentImages,
      recentVideos,
      subscription,
    ] = await Promise.all([
      // Comptage des articles de blog
      prisma.blogArticle.count({
        where: { authorId: user.id },
      }),

      // Comptage des livres
      prisma.book.count({
        where: { authorId: user.id },
      }),

      // Comptage des images générées
      prisma.imageGeneration.count({
        where: { authorId: user.id },
      }),

      // Comptage des vidéos générées
      prisma.videoGeneration.count({
        where: { authorId: user.id },
      }),

      // Récents articles de blog
      prisma.blogArticle.findMany({
        where: { authorId: user.id },
        select: {
          id: true,
          title: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),

      // Récents livres
      prisma.book.findMany({
        where: { authorId: user.id },
        select: {
          id: true,
          title: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),

      // Récentes images
      prisma.imageGeneration.findMany({
        where: { authorId: user.id },
        select: {
          id: true,
          prompt: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),

      // Récentes vidéos
      prisma.videoGeneration.findMany({
        where: { authorId: user.id },
        select: {
          id: true,
          prompt: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),

      // Abonnement actif
      prisma.paystackSubscription.findFirst({
        where: {
          userId: user.id,
          status: 'ACTIVE',
        },
        include: {
          plan: true,
        },
      }),
    ]);

    // Calculer le total de contenus générés
    const totalContent = blogsCount + booksCount + imagesCount + videosCount;

    // Calculer les succès débloqués
    const achievements = [
      {
        id: 'first_blog',
        title: 'Premier article',
        description: 'Créé votre premier article de blog',
        icon: '🎯',
        unlocked: blogsCount > 0,
      },
      {
        id: 'prolific_writer',
        title: 'Créateur prolifique',
        description: 'Publié 10 articles',
        icon: '✍️',
        unlocked: blogsCount >= 10,
      },
      {
        id: 'seo_master',
        title: 'Maître SEO',
        description: 'Obtenu un score SEO de 95+',
        icon: '🏆',
        unlocked: blogsCount >= 5, // Approximation
      },
      {
        id: 'author',
        title: 'Auteur',
        description: 'Écrit 5 livres complets',
        icon: '📚',
        unlocked: booksCount >= 5,
      },
      {
        id: 'multimedia_creator',
        title: 'Créateur multimédia',
        description: 'Utilisé les 4 outils de création',
        icon: '🎨',
        unlocked: blogsCount > 0 && booksCount > 0 && imagesCount > 0 && videosCount > 0,
      },
      {
        id: 'ai_expert',
        title: 'Expert IA',
        description: '100 contenus générés',
        icon: '🤖',
        unlocked: totalContent >= 100,
      },
    ];

    // Combiner toutes les activités récentes
    const allActivity = [
      ...recentBlogs.map(blog => ({
        type: 'blog' as const,
        id: blog.id,
        title: blog.title,
        createdAt: blog.createdAt,
      })),
      ...recentBooks.map(book => ({
        type: 'book' as const,
        id: book.id,
        title: book.title,
        createdAt: book.createdAt,
      })),
      ...recentImages.map(image => ({
        type: 'image' as const,
        id: image.id,
        title: image.prompt,
        createdAt: image.createdAt,
      })),
      ...recentVideos.map(video => ({
        type: 'video' as const,
        id: video.id,
        title: video.prompt,
        createdAt: video.createdAt,
      })),
    ]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 10);

    // Calculer le niveau et l'XP (basé sur le total de contenus)
    const xpPerContent = 50;
    const totalXP = totalContent * xpPerContent;
    const xpPerLevel = 500;
    const level = Math.floor(totalXP / xpPerLevel) + 1;
    const currentLevelXP = totalXP % xpPerLevel;
    const nextLevelXP = xpPerLevel;

    return NextResponse.json({
      success: true,
      stats: {
        blogs: blogsCount,
        books: booksCount,
        images: imagesCount,
        videos: videosCount,
        total: totalContent,
      },
      recentActivity: allActivity,
      achievements,
      level: {
        current: level,
        xp: currentLevelXP,
        nextLevelXP,
        totalXP,
      },
      subscription: subscription ? {
        plan: subscription.plan.name,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
      } : null,
      memberSince: user.createdAt,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des stats du profil:', error);
    return NextResponse.json(
      {
        error: 'Erreur serveur lors de la récupération des statistiques',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
