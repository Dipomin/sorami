import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { getImagePresignedUrl } from '@/lib/s3-storage';

/**
 * GET /api/images/user?page=1&limit=12
 * Récupère les générations d'images complétées de l'utilisateur connecté avec pagination
 */
export async function GET(request: NextRequest) {
  try {
    // Authentification requise
    const user = await requireAuth();

    // Pagination
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;

    // Récupérer les générations d'images de l'utilisateur avec statut COMPLETED
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
      skip,
      take: limit,
    });

    // Transformer les données pour le frontend
    // ✅ Générer de nouvelles URLs présignées pour chaque image
    const generations = await Promise.all(
      imageGenerations.map(async (gen) => {
        const imagesWithFreshUrls = await Promise.all(
          gen.images
            .filter(img => img.fileUrl && img.fileUrl.trim() !== '') // Filtrer par fileUrl (URL S3)
            .map(async (img) => {
              // Générer une nouvelle URL présignée à partir de l'ancienne URL
              const freshUrl = await getImagePresignedUrl(img.fileUrl!, 3600); // 1h de validité
              
              return {
                id: img.id,
                filename: img.filename,
                fileUrl: freshUrl, // ✅ URL fraîche
                fileSize: img.fileSize,
                format: img.format,
                width: img.width,
                height: img.height,
                aspectRatio: img.aspectRatio,
                createdAt: img.createdAt.toISOString(),
              };
            })
        );

        return {
          id: gen.id,
          prompt: gen.prompt,
          status: gen.status,
          numImages: gen.numImages,
          createdAt: gen.createdAt.toISOString(),
          completedAt: gen.completedAt?.toISOString() || null,
          model: gen.model,
          processingTime: gen.processingTime,
          images: imagesWithFreshUrls,
        };
      })
    );

    return NextResponse.json({
      generations,
      page,
      limit,
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
