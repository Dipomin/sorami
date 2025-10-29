import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Récupère le statut d'une génération de vidéo depuis la base de données
 * ✅ Évite les problèmes de token JWT avec le backend
 * ✅ Plus rapide que le polling backend
 * ✅ Fonctionne même si le backend est down
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Récupérer la génération depuis Prisma
    const generation = await prisma.videoGeneration.findUnique({
      where: { id },
      include: {
        videos: { // ✅ Relation 1-to-many, prendre le premier
          orderBy: { createdAt: 'asc' },
          take: 1,
        },
      },
    });

    // Si pas encore créée dans la DB (webhook pas encore reçu)
    if (!generation) {
      return NextResponse.json(
        {
          status: 'PENDING',
          progress: 0,
          message: "En attente de la génération...",
          videoFile: null,
        },
        { status: 404 }
      );
    }

    // Prendre la première vidéo (il peut y en avoir plusieurs)
    const videoFile = generation.videos[0] || null;

    // Mapper les données au format attendu par le frontend
    const response = {
      status: generation.status,
      progress: generation.progress,
      message: generation.message || 'Génération en cours...',
      error: generation.error,
      videoFile: videoFile
        ? {
            id: videoFile.id,
            url: videoFile.fileUrl,
            s3Key: videoFile.s3Key,
            filename: videoFile.filename,
            duration: videoFile.durationSeconds,
            width: videoFile.width,
            height: videoFile.height,
            format: videoFile.format,
            fileSize: videoFile.fileSize,
            metadata: videoFile.metadata,
          }
        : null,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ Erreur récupération statut vidéo:', error);
    return NextResponse.json(
      {
        status: 'FAILED',
        progress: 0,
        message: 'Erreur serveur',
        error: String(error),
        videoFile: null,
      },
      { status: 500 }
    );
  }
}
