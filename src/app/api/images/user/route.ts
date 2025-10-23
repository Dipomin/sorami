import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

/**
 * GET /api/images/user
 * Récupère toutes les générations d'images complétées de l'utilisateur connecté
 */
export async function GET(request: Request) {
  try {
    // Authentification requise
    const user = await requireAuth();

    // Récupérer toutes les générations d'images de l'utilisateur avec statut COMPLETED
    const imageGenerations = await prisma.imageGeneration.findMany({
      where: {
        authorId: user.id,
        status: 'COMPLETED',
      },
      include: {
        images: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        completedAt: 'desc',
      },
    });

    // Transformer les données pour le frontend
    const generations = imageGenerations.map((gen) => ({
      id: gen.id,
      prompt: gen.prompt,
      status: gen.status,
      numImages: gen.numImages,
      createdAt: gen.createdAt.toISOString(),
      completedAt: gen.completedAt?.toISOString() || null,
      model: gen.model,
      processingTime: gen.processingTime,
      images: gen.images.map((img) => ({
        id: img.id,
        filename: img.filename,
        fileUrl: img.fileUrl || '',
        fileSize: img.fileSize,
        format: img.format,
        width: img.width,
        height: img.height,
        aspectRatio: img.aspectRatio,
        createdAt: img.createdAt.toISOString(),
      })),
    }));

    return NextResponse.json({
      success: true,
      count: generations.length,
      generations,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des générations d\'images:', error);

    if (error instanceof Error && error.message === 'Utilisateur non authentifié') {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Erreur lors de la récupération des générations' },
      { status: 500 }
    );
  }
}
