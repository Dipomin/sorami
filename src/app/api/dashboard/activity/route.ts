import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const user = await requireAuth();

    // Récupérer l'activité récente (les 10 dernières actions)
    const [images, videos, articles, books] = await Promise.all([
      prisma.imageGeneration.findMany({
        where: { authorId: user.id },
        take: 3,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          prompt: true,
          createdAt: true,
          status: true,
        },
      }),
      prisma.videoGeneration.findMany({
        where: { authorId: user.id },
        take: 3,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          prompt: true,
          createdAt: true,
          status: true,
        },
      }),
      prisma.blogArticle.findMany({
        where: { authorId: user.id },
        take: 3,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          createdAt: true,
          status: true,
        },
      }),
      prisma.book.findMany({
        where: { authorId: user.id },
        take: 3,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          createdAt: true,
          status: true,
        },
      }),
    ]);

    // Formater les activités avec un type commun
    const activities = [
      ...images.map(img => ({
        type: 'image' as const,
        title: img.prompt.substring(0, 60) + (img.prompt.length > 60 ? '...' : ''),
        time: img.createdAt,
        status: img.status.toLowerCase() === 'completed' ? 'completed' : 'processing',
        id: img.id,
      })),
      ...videos.map(vid => ({
        type: 'video' as const,
        title: vid.prompt.substring(0, 60) + (vid.prompt.length > 60 ? '...' : ''),
        time: vid.createdAt,
        status: vid.status.toLowerCase() === 'completed' ? 'completed' : 'processing',
        id: vid.id,
      })),
      ...articles.map(art => ({
        type: 'article' as const,
        title: art.title,
        time: art.createdAt,
        status: art.status === 'PUBLISHED' ? 'completed' : 'processing',
        id: art.id,
      })),
      ...books.map(book => ({
        type: 'book' as const,
        title: book.title,
        time: book.createdAt,
        status: book.status === 'PUBLISHED' ? 'completed' : 'processing',
        id: book.id,
      })),
    ];

    // Trier par date (plus récent en premier) et limiter à 10
    const sortedActivities = activities
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 10)
      .map(activity => ({
        ...activity,
        time: formatTimeAgo(activity.time),
      }));

    return NextResponse.json({ 
      success: true, 
      activities: sortedActivities,
    });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    
    if (error instanceof Error && error.message === 'Utilisateur non authentifié') {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'activité' },
      { status: 500 }
    );
  }
}

/**
 * Formate une date en texte relatif (ex: "Il y a 2 heures")
 */
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - new Date(date).getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) return 'À l\'instant';
  if (diffInMinutes < 60) return `Il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;
  if (diffInHours < 24) return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
  if (diffInDays === 1) return 'Hier';
  if (diffInDays < 7) return `Il y a ${diffInDays} jours`;
  if (diffInDays < 30) return `Il y a ${Math.floor(diffInDays / 7)} semaine${Math.floor(diffInDays / 7) > 1 ? 's' : ''}`;
  return `Il y a ${Math.floor(diffInDays / 30)} mois`;
}
