import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

/**
 * GET /api/images/[id]/result
 * Récupère les résultats d'une génération d'images depuis la base de données
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

    // Récupérer la génération d'images avec ses fichiers
    const imageGeneration = await prisma.imageGeneration.findFirst({
      where: {
        id,
        authorId: user.id, // Vérifier que l'utilisateur est propriétaire
      },
      include: {
        images: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!imageGeneration) {
      return NextResponse.json(
        { error: 'Génération d\'images non trouvée' },
        { status: 404 }
      );
    }

    // Vérifier que la génération est terminée
    if (imageGeneration.status !== 'COMPLETED') {
      return NextResponse.json(
        { 
          error: 'Génération non terminée',
          status: imageGeneration.status,
          progress: imageGeneration.progress,
        },
        { status: 400 }
      );
    }

    // Transformer les données en format attendu par le frontend
    const result = {
      job_id: imageGeneration.id,
      status: 'COMPLETED', // Statut en MAJUSCULES pour correspondre au type ImageJobStatus
      images: imageGeneration.images.map((img) => ({
        url: img.fileUrl || '', // URL S3 de l'image
        file_path: img.s3Key,
        format: img.format,
        dimensions: img.aspectRatio,
        size_bytes: img.fileSize,
        description: (img.metadata as any)?.description || imageGeneration.prompt,
      })),
      metadata: {
        model_name: imageGeneration.model,
        version: imageGeneration.modelVersion || '1.0',
        generation_time_seconds: imageGeneration.processingTime || 0,
        input_tokens: 0, // Pas stocké actuellement
        output_size_bytes: imageGeneration.images.reduce(
          (total, img) => total + img.fileSize,
          0
        ),
        timestamp: imageGeneration.completedAt?.toISOString() || imageGeneration.createdAt.toISOString(),
      },
      generated_at: imageGeneration.completedAt?.toISOString() || imageGeneration.createdAt.toISOString(),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erreur lors de la récupération des résultats d\'images:', error);

    if (error instanceof Error && error.message === 'Utilisateur non authentifié') {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Erreur lors de la récupération des résultats' },
      { status: 500 }
    );
  }
}
