/**
 * Webhook pour la complétion des générations de vidéos
 * Reçoit les notifications du backend CrewAI quand une vidéo est générée
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

// Interface du payload webhook selon la documentation
interface VideoWebhookPayload {
  job_id: string;
  status: 'completed' | 'failed' | 'pending' | 'processing' | 'generating' | 'downloading';
  content_type: 'video';
  timestamp: string;
  has_data: boolean;
  data?: {
    job_id: string;
    status: string;
    videos: Array<{
      filename: string;
      file_path: string;
      file_url: string | null;
      file_size: number;
      format: string;
      duration_seconds: number;
      aspect_ratio: string;
      dimensions: {
        width: number;
        height: number;
      };
      created_at: string;
    }>;
    metadata?: {
      model_name: string;
      model_version: string;
      processing_time: number;
      generation_time: number;
      download_time: number;
      prompt_used: string;
      num_videos_requested: number;
      num_videos_generated: number;
      config_used: {
        aspect_ratio: string;
        duration_seconds: number;
        person_generation: string;
      };
    };
    generated_at: string;
    success: boolean;
    num_videos: number;
    prompt?: string;
  };
  environment: 'development' | 'production';
}

// Map pour l'idempotence (éviter le double traitement)
const processedWebhooks = new Map<string, number>();
const IDEMPOTENCE_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

// Nettoyage périodique des webhooks traités
setInterval(() => {
  const now = Date.now();
  const entries = Array.from(processedWebhooks.entries());
  for (const [jobId, timestamp] of entries) {
    if (now - timestamp > IDEMPOTENCE_WINDOW_MS) {
      processedWebhooks.delete(jobId);
    }
  }
}, 60000); // Nettoyer toutes les minutes

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    console.log('\n🎬 [Video Webhook] Réception d\'un webhook de complétion vidéo...');

    // Vérification du secret en production
    const headersList = await headers();
    const webhookSecret = headersList.get('x-webhook-secret');
    
    if (process.env.NODE_ENV === 'production') {
      const expectedSecret = process.env.WEBHOOK_SECRET;
      if (!expectedSecret || webhookSecret !== expectedSecret) {
        console.error('❌ [Video Webhook] Secret invalide ou manquant');
        return NextResponse.json(
          { error: 'Unauthorized: Invalid webhook secret' },
          { status: 401 }
        );
      }
    }

    // Parser le payload
    const payload: VideoWebhookPayload = await request.json();
    console.log('📦 [Video Webhook] Payload reçu:', {
      job_id: payload.job_id,
      status: payload.status,
      content_type: payload.content_type,
      has_data: payload.has_data,
      environment: payload.environment,
    });

    // Validation du payload
    if (!payload.job_id || !payload.status || payload.content_type !== 'video') {
      console.error('❌ [Video Webhook] Payload invalide:', payload);
      return NextResponse.json(
        { error: 'Invalid payload: missing required fields or wrong content_type' },
        { status: 400 }
      );
    }

    // Vérification de l'idempotence
    if (processedWebhooks.has(payload.job_id)) {
      console.log('⚠️ [Video Webhook] Webhook déjà traité (idempotence):', payload.job_id);
      return NextResponse.json(
        { 
          message: 'Webhook already processed',
          job_id: payload.job_id,
          status: 'duplicate'
        },
        { status: 200 }
      );
    }

    // Traitement selon le statut
    if (payload.status === 'completed' && payload.has_data && payload.data) {
      console.log('✅ [Video Webhook] Génération vidéo réussie!');
      console.log(`   📹 Nombre de vidéos: ${payload.data.num_videos}`);
      console.log(`   🎬 Prompt: "${payload.data.prompt || 'N/A'}"`);
      
      // TODO: Sauvegarder dans la base de données avec Prisma
      // Exemple de structure pour le modèle Prisma VideoGeneration:
      /*
      await prisma.videoGeneration.create({
        data: {
          jobId: payload.job_id,
          userId: userId, // À récupérer depuis le contexte
          organizationId: organizationId, // À récupérer depuis le contexte
          status: 'COMPLETED',
          prompt: payload.data.prompt || '',
          videos: {
            create: payload.data.videos.map(video => ({
              filename: video.filename,
              filePath: video.file_path,
              fileUrl: video.file_url,
              fileSize: video.file_size,
              format: video.format,
              durationSeconds: video.duration_seconds,
              aspectRatio: video.aspect_ratio,
              width: video.dimensions.width,
              height: video.dimensions.height,
            }))
          },
          metadata: payload.data.metadata ? JSON.stringify(payload.data.metadata) : null,
          completedAt: new Date(payload.data.generated_at),
        }
      });
      */

      // Marquer comme traité
      processedWebhooks.set(payload.job_id, Date.now());

      const duration = Date.now() - startTime;
      console.log(`✅ [Video Webhook] Traitement réussi en ${duration}ms\n`);

      return NextResponse.json({
        success: true,
        message: 'Video generation webhook processed successfully',
        job_id: payload.job_id,
        num_videos: payload.data.num_videos,
        processing_time_ms: duration,
      });

    } else if (payload.status === 'failed') {
      console.error('❌ [Video Webhook] Génération vidéo échouée:', payload.job_id);
      
      // TODO: Mettre à jour le statut dans la base de données
      /*
      await prisma.videoGeneration.update({
        where: { jobId: payload.job_id },
        data: {
          status: 'FAILED',
          error: payload.data?.error || 'Unknown error',
        }
      });
      */

      // Marquer comme traité même en cas d'échec
      processedWebhooks.set(payload.job_id, Date.now());

      return NextResponse.json({
        success: true,
        message: 'Video generation failure recorded',
        job_id: payload.job_id,
        status: 'failed',
      });

    } else {
      // Statuts intermédiaires (pending, processing, generating, downloading)
      console.log(`📊 [Video Webhook] Mise à jour du statut: ${payload.status}`);
      
      // TODO: Mettre à jour la progression dans la base de données
      /*
      await prisma.videoGeneration.update({
        where: { jobId: payload.job_id },
        data: {
          status: payload.status.toUpperCase(),
          progress: getProgressPercentage(payload.status),
        }
      });
      */

      return NextResponse.json({
        success: true,
        message: `Video generation status updated: ${payload.status}`,
        job_id: payload.job_id,
        status: payload.status,
      });
    }

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('❌ [Video Webhook] Erreur lors du traitement:', error);
    
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        duration_ms: duration,
      },
      { status: 500 }
    );
  }
}

// Méthode GET pour vérifier la santé du webhook
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    webhook: 'video-completion',
    timestamp: new Date().toISOString(),
    idempotence_cache_size: processedWebhooks.size,
  });
}
