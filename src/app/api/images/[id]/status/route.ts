import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

/**
 * GET /api/images/[id]/status
 * Récupère le statut d'une génération d'images depuis la base de données
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

    // Récupérer la génération d'images
    const imageGeneration = await prisma.imageGeneration.findFirst({
      where: {
        id,
        authorId: user.id, // Vérifier que l'utilisateur est propriétaire
      },
    });

    if (!imageGeneration) {
      return NextResponse.json(
        { error: 'Génération d\'images non trouvée' },
        { status: 404 }
      );
    }

    // Mapper les statuts Prisma vers les statuts attendus par le frontend
    // NOTE: Les statuts doivent être en MAJUSCULES pour correspondre au type ImageJobStatus
    const statusMap: Record<string, string> = {
      'PENDING': 'PENDING',
      'PROCESSING': 'INITIALIZING',
      'GENERATING': 'GENERATING',
      'COMPLETED': 'COMPLETED',
      'FAILED': 'FAILED',
    };

    const status = statusMap[imageGeneration.status] || 'PENDING';

    const response = {
      job_id: imageGeneration.id,
      status,
      progress: imageGeneration.progress,
      message: imageGeneration.message || `Statut: ${status}`,
      created_at: imageGeneration.createdAt.toISOString(),
      updated_at: imageGeneration.updatedAt.toISOString(),
    };

    // Ajouter les informations d'erreur si échec
    if (imageGeneration.status === 'FAILED') {
      return NextResponse.json({
        ...response,
        error: imageGeneration.error || 'Erreur inconnue',
      });
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Erreur lors de la récupération du statut d\'images:', error);

    if (error instanceof Error && error.message === 'Utilisateur non authentifié') {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Erreur lors de la récupération du statut' },
      { status: 500 }
    );
  }
}
