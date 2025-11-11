import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const user = await requireAuth();

    // Récupérer toutes les générations d'images de l'utilisateur
    const imageGenerations = await prisma.imageGeneration.findMany({
      where: {
        authorId: user.id,
        status: 'COMPLETED', // Seulement les images complétées
      },
      include: {
        images: true, // Inclure les fichiers images liés
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transformer les données pour le frontend
    const formattedGenerations = imageGenerations.map((gen) => ({
      id: gen.id,
      prompt: gen.prompt,
      status: gen.status,
      images: gen.images.map((img) => ({
        id: img.id,
        url: img.fileUrl || '',
        s3Key: img.s3Key,
        filename: img.filename,
        width: img.width,
        height: img.height,
        format: img.format,
        aspectRatio: img.aspectRatio,
        metadata: img.metadata,
      })),
      generationMetadata: {
        model: gen.model,
        modelVersion: gen.modelVersion,
        processingTime: gen.processingTime,
        numImages: gen.numImages,
        size: gen.size,
        quality: gen.quality,
        style: gen.style,
      },
      createdAt: gen.createdAt.toISOString(),
      updatedAt: gen.updatedAt.toISOString(),
      completedAt: gen.completedAt?.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      generations: formattedGenerations,
      count: formattedGenerations.length,
    });
  } catch (error) {
    console.error('❌ Erreur récupération des images:', error);
    return NextResponse.json(
      {
        error: 'Erreur lors de la récupération des images',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
