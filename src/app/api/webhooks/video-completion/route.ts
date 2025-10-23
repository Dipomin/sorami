/**
 * Webhook pour la complétion des générations de vidéos
 * Reçoit les notifications du backend CrewAI quand une vidéo est générée
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { VideoJobStatus } from '@prisma/client';

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
      file_url?: string | null;  // ⚠️ Ancienne clé (optionnelle)
      url?: string | null;       // ✅ Nouvelle clé du backend
      s3_key?: string;           // ✅ Clé S3 du backend
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

// Helper: Convertir le statut webhook en VideoJobStatus Prisma
function mapStatusToJobStatus(status: string): VideoJobStatus {
  const statusMap: Record<string, VideoJobStatus> = {
    'pending': 'PENDING',
    'processing': 'PROCESSING',
    'generating': 'PROCESSING',
    'downloading': 'PROCESSING',
    'completed': 'COMPLETED',
    'failed': 'FAILED',
  };
  return statusMap[status.toLowerCase()] || 'PENDING';
}

// Helper: Calculer le pourcentage de progression
function getProgressPercentage(status: string): number {
  const progressMap: Record<string, number> = {
    'pending': 0,
    'processing': 25,
    'generating': 50,
    'downloading': 75,
    'completed': 100,
    'failed': 0,
  };
  return progressMap[status.toLowerCase()] || 0;
}

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
      console.log(`   🔗 URLs des vidéos:`, payload.data.videos.map(v => ({
        filename: v.filename,
        file_url: v.file_url,
        has_url: !!v.file_url
      })));
      
      // Récupérer la génération existante pour obtenir l'authorId
      const existingGeneration = await prisma.videoGeneration.findUnique({
        where: { id: payload.job_id },
        select: { authorId: true, organizationId: true },
      });

      if (!existingGeneration) {
        console.error('❌ [Video Webhook] VideoGeneration introuvable:', payload.job_id);
        return NextResponse.json(
          { error: 'VideoGeneration not found', job_id: payload.job_id },
          { status: 404 }
        );
      }

      // Mettre à jour la génération avec les résultats
      await prisma.videoGeneration.update({
        where: { id: payload.job_id },
        data: {
          status: 'COMPLETED',
          progress: 100,
          message: 'Génération terminée avec succès',
          completedAt: new Date(payload.data.generated_at),
          processingTime: payload.data.metadata?.processing_time,
          generationTime: payload.data.metadata?.generation_time,
          downloadTime: payload.data.metadata?.download_time,
          model: payload.data.metadata?.model_name || 'veo-2.0-generate-001',
          modelVersion: payload.data.metadata?.model_version || '2.0',
          // Créer les fichiers vidéo associés
          videos: {
            create: payload.data.videos.map(video => {
              // ✅ Priorité: url (nouveau) > file_url (ancien) > null
              const videoUrl = video.url || video.file_url || null;
              const s3Key = video.s3_key || video.file_path;
              
              console.log(`🔗 Mapping vidéo: ${video.filename}`);
              console.log(`   - video.url: ${video.url || 'null'}`);
              console.log(`   - video.file_url: ${video.file_url || 'null'}`);
              console.log(`   - videoUrl (final): ${videoUrl || 'null'}`);
              console.log(`   - s3Key: ${s3Key}`);
              
              return {
                filename: video.filename,
                s3Key: s3Key,
                fileUrl: videoUrl,
                filePath: video.file_path,
                fileSize: video.file_size,
                format: video.format,
                durationSeconds: video.duration_seconds,
                aspectRatio: video.aspect_ratio,
                width: video.dimensions.width,
                height: video.dimensions.height,
                metadata: payload.data?.metadata ? payload.data.metadata as any : undefined,
              };
            })
          },
        },
      });

      console.log(`   💾 ${payload.data.videos.length} fichier(s) vidéo sauvegardé(s)`);
      
      if (payload.data.metadata) {
        console.log(`   ⏱️ Temps de traitement: ${payload.data.metadata.processing_time}s`);
        console.log(`   🎨 Temps de génération: ${payload.data.metadata.generation_time}s`);
        console.log(`   📥 Temps de téléchargement: ${payload.data.metadata.download_time}s`);
      }

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
      
      // Mettre à jour le statut d'échec dans la base de données
      const errorMessage = payload.data?.metadata?.prompt_used 
        ? `Échec de génération pour: "${payload.data.metadata.prompt_used}"`
        : 'Erreur inconnue lors de la génération';

      await prisma.videoGeneration.update({
        where: { id: payload.job_id },
        data: {
          status: 'FAILED',
          error: errorMessage,
          progress: 0,
          message: 'La génération a échoué',
          completedAt: new Date(),
        }
      });

      console.log(`   ❌ Erreur enregistrée: ${errorMessage}`);

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
      
      // Mettre à jour la progression dans la base de données
      const prismaStatus = mapStatusToJobStatus(payload.status);
      const progress = getProgressPercentage(payload.status);
      
      // Messages descriptifs selon le statut
      const statusMessages: Record<string, string> = {
        'pending': 'En attente de traitement',
        'processing': 'Traitement en cours',
        'generating': 'Génération de la vidéo en cours',
        'downloading': 'Téléchargement de la vidéo depuis Google',
      };

      await prisma.videoGeneration.update({
        where: { id: payload.job_id },
        data: {
          status: prismaStatus,
          progress,
          message: statusMessages[payload.status] || `Statut: ${payload.status}`,
        }
      });

      console.log(`   📈 Progression: ${progress}% - ${statusMessages[payload.status]}`);

      return NextResponse.json({
        success: true,
        message: `Video generation status updated: ${payload.status}`,
        job_id: payload.job_id,
        status: payload.status,
        progress,
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
