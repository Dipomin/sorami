import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Récupère le statut d'une génération d'image depuis la base de données
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
    const generation = await prisma.imageGeneration.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { createdAt: 'asc' },
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
          images: [],
        },
        { status: 404 }
      );
    }

    // Mapper les données au format attendu par le frontend
    const response = {
      status: generation.status,
      progress: generation.progress,
      message: generation.message || 'Génération en cours...',
      error: generation.error,
      images: generation.images.map((img) => ({
        id: img.id,
        url: img.fileUrl, // ✅ Correction: fileUrl au lieu de url
        s3Key: img.s3Key,
        filename: img.filename,
        width: img.width,
        height: img.height,
        format: img.format,
        aspectRatio: img.aspectRatio,
        metadata: img.metadata,
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ Erreur récupération statut image:', error);
    return NextResponse.json(
      {
        status: 'FAILED',
        progress: 0,
        message: 'Erreur serveur',
        error: String(error),
        images: [],
      },
      { status: 500 }
    );
  }
}
