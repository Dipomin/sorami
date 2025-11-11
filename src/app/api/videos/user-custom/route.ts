import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { getVideoPresignedUrl } from '@/lib/s3-storage';

/**
 * GET /api/videos/user-custom
 * Récupère toutes les générations de vidéos personnalisées complétées de l'utilisateur connecté
 * Avec support de pagination et lazy loading
 */
export async function GET(request: NextRequest) {
  try {
    // Authentification requise
    const user = await requireAuth();

    // Paramètres de pagination
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const skip = (page - 1) * limit;

    console.log(`📥 [User Custom Videos API] Récupération des vidéos personnalisées, page ${page}, limit ${limit}`);

    // Récupérer les générations de vidéos personnalisées de l'utilisateur avec statut COMPLETED
    // On filtre par les générations qui ont des reference_images ou un aspect_ratio personnalisé
    const videoGenerations = await prisma.videoGeneration.findMany({
      where: {
        authorId: user.id,
        status: 'COMPLETED',
        // Filtrer les vidéos personnalisées (avec images de référence ou durée > 5s)
        OR: [
          { durationSeconds: { gte: 6 } }, // Vidéos avec durée personnalisée
          { aspectRatio: '16:10' }, // Aspect ratio personnalisé
        ],
      },
      include: {
        videos: {
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

    console.log(`✅ [User Custom Videos API] Trouvé ${videoGenerations.length} générations`);

    // Transformer les données et régénérer les URLs présignées
    const generations = await Promise.all(
      videoGenerations.map(async (gen) => {
        const videosWithFreshUrls = await Promise.all(
          gen.videos
            .filter(vid => vid.fileUrl && vid.fileUrl.trim() !== '')
            .map(async (vid) => {
              // Régénérer URL présignée
              const freshUrl = await getVideoPresignedUrl(vid.fileUrl!, 3600); // 1h de validité
              
              return {
                id: vid.id,
                filename: vid.filename,
                fileUrl: freshUrl,
                fileSize: vid.fileSize,
                format: vid.format,
                width: vid.width,
                height: vid.height,
                durationSeconds: vid.durationSeconds,
                createdAt: vid.createdAt.toISOString(),
                generation: {
                  prompt: gen.prompt,
                  aspectRatio: gen.aspectRatio,
                  createdAt: gen.createdAt.toISOString(),
                },
              };
            })
        );

        return {
          id: gen.id,
          prompt: gen.prompt,
          aspectRatio: gen.aspectRatio,
          durationSeconds: gen.durationSeconds,
          createdAt: gen.createdAt.toISOString(),
          completedAt: gen.completedAt?.toISOString() || null,
          videos: videosWithFreshUrls,
        };
      })
    );

    return NextResponse.json({
      generations,
      page,
      limit,
    });
  } catch (error) {
    console.error('❌ [User Custom Videos API] Erreur récupération vidéos personnalisées:', error);

    if (error instanceof Error && error.message === 'Utilisateur non authentifié') {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error: 'Erreur lors de la récupération des vidéos personnalisées',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
