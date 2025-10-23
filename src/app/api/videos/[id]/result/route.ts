import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

/**
 * GET /api/videos/[id]/result
 * Récupère les résultats d'une génération de vidéo depuis la base de données
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

    // Récupérer la génération de vidéo avec ses fichiers
    const videoGeneration = await prisma.videoGeneration.findFirst({
      where: {
        id,
        authorId: user.id, // Vérifier que l'utilisateur est propriétaire
      },
      include: {
        videos: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!videoGeneration) {
      return NextResponse.json(
        { error: 'Génération de vidéo non trouvée' },
        { status: 404 }
      );
    }

    // Vérifier que la génération est terminée
    if (videoGeneration.status !== 'COMPLETED') {
      return NextResponse.json(
        { 
          error: 'Génération non terminée',
          status: videoGeneration.status,
          progress: videoGeneration.progress,
        },
        { status: 400 }
      );
    }

    // Vérifier qu'il y a des vidéos
    if (videoGeneration.videos.length === 0) {
      return NextResponse.json(
        { error: 'Aucune vidéo disponible pour cette génération' },
        { status: 404 }
      );
    }

    // Construire la réponse au format attendu par le frontend
    const response = {
      job_id: videoGeneration.id,
      status: 'completed',
      message: videoGeneration.message || 'Génération terminée avec succès',
      videos: videoGeneration.videos.map((video) => ({
        filename: video.filename,
        file_path: video.s3Key,
        // Si fileUrl est null, utiliser filePath ou s3Key comme fallback
        // Le backend pourrait ne pas envoyer file_url dans certains cas
        file_url: video.fileUrl || video.filePath || video.s3Key,
        file_size: video.fileSize,
        format: video.format,
        duration_seconds: video.durationSeconds,
        aspect_ratio: video.aspectRatio,
        dimensions: {
          width: video.width,
          height: video.height,
        },
        created_at: video.createdAt.toISOString(),
      })),
      generation_metadata: videoGeneration.videos[0]?.metadata ? {
        model_name: videoGeneration.model,
        model_version: videoGeneration.modelVersion || '2.0',
        processing_time: videoGeneration.processingTime || 0,
        generation_time: videoGeneration.generationTime || 0,
        download_time: videoGeneration.downloadTime || 0,
        prompt_used: videoGeneration.prompt,
        num_videos_requested: videoGeneration.numberOfVideos,
        num_videos_generated: videoGeneration.videos.length,
        config_used: {
          aspect_ratio: videoGeneration.aspectRatio,
          duration_seconds: videoGeneration.durationSeconds,
          person_generation: videoGeneration.personGeneration,
        },
        ...(typeof videoGeneration.videos[0].metadata === 'object' ? videoGeneration.videos[0].metadata : {}),
      } : undefined,
      generated_at: videoGeneration.completedAt?.toISOString() || videoGeneration.createdAt.toISOString(),
      success: true,
      num_videos: videoGeneration.videos.length,
      prompt: videoGeneration.prompt,
    };

    console.log('✅ [Video Result API] Résultats récupérés:', {
      job_id: videoGeneration.id,
      num_videos: response.num_videos,
      has_urls: videoGeneration.videos.every(v => v.fileUrl),
      video_urls: videoGeneration.videos.map(v => ({
        filename: v.filename,
        fileUrl: v.fileUrl,
        has_url: !!v.fileUrl
      })),
    });

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ [Video Result API] Erreur:', error);
    
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
