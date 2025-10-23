import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

/**
 * GET /api/videos/[id]/status
 * Récupère le statut d'une génération de vidéo depuis la base de données
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authentification requise via Clerk
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }
    
    // Récupérer l'utilisateur depuis Prisma
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }
    
    const { id } = await params;

    // Récupérer la génération de vidéo
    const videoGeneration = await prisma.videoGeneration.findFirst({
      where: {
        id,
        authorId: user.id, // Vérifier que l'utilisateur est propriétaire
      },
    });

    if (!videoGeneration) {
      return NextResponse.json(
        { error: 'Génération de vidéo non trouvée' },
        { status: 404 }
      );
    }

    // Mapper les statuts Prisma vers les statuts attendus par le frontend
    const statusMap: Record<string, string> = {
      'PENDING': 'pending',
      'PROCESSING': 'processing',
      'GENERATING': 'generating',
      'COMPLETED': 'completed',
      'FAILED': 'failed',
    };

    const status = statusMap[videoGeneration.status] || 'pending';

    const response = {
      job_id: videoGeneration.id,
      status,
      progress: videoGeneration.progress,
      message: videoGeneration.message || `Statut: ${status}`,
      error: videoGeneration.error || undefined,
      created_at: videoGeneration.createdAt.toISOString(),
      updated_at: videoGeneration.updatedAt.toISOString(),
      completed_at: videoGeneration.completedAt?.toISOString() || undefined,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ [Video Status API] Erreur:', error);
    
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
