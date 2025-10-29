/**
 * Webhook pour la complétion des générations de vidéos personnalisées
 * Reçoit les notifications du backend CrewAI quand une vidéo avec image de référence est générée
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { VideoJobStatus } from '@prisma/client';

// Configuration
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'sorami-webhook-secret-key-2025';
const ENVIRONMENT = process.env.NODE_ENV || 'development';

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

// ============================================================================
// INTERFACES WEBHOOK PAYLOAD
// ============================================================================

interface VideoData {
  filename: string;
  file_path: string;
  s3_key: string;
  s3_url: string;
  url: string;
  size_bytes: number;
  duration: string;
  aspect_ratio: string;
  dimensions?: {
    width: number;
    height: number;
  };
  created_at?: string;
}

interface VideoMetadata {
  model_name: string;
  model_version: string;
  processing_time?: number;
  generation_time?: number;
  download_time?: number;
  prompt_used?: string;
  num_videos_requested: number;
  num_videos_generated: number;
  config_used?: {
    aspect_ratio: string;
    duration_seconds: number;
    person_generation?: string;
  };
}

interface VideoCompletionData {
  videos: VideoData[];
  job_id: string;
  user_id: string;
  num_videos: number;
  metadata?: VideoMetadata;
  generated_at?: string;
  success?: boolean;
  prompt?: string;
}

interface VideoWebhookPayload {
  job_id: string;
  status: 'completed' | 'failed' | 'pending' | 'processing' | 'generating' | 'downloading';
  content_type: 'video';
  timestamp: string;
  has_data: boolean;
  data?: VideoCompletionData;
  error?: string;
  message?: string;
  environment: 'development' | 'production';
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convertir le statut webhook en VideoJobStatus Prisma
 */
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

/**
 * Calculer le pourcentage de progression
 */
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

/**
 * Parser la durée (formats: "8s", "8.5", 8)
 */
function parseDuration(duration: string | number | undefined): number {
  if (!duration) return 8; // Valeur par défaut si undefined/null
  if (typeof duration === 'number') return duration;
  const parsed = parseFloat(duration.toString().replace('s', ''));
  return isNaN(parsed) ? 8 : parsed;
}

// ============================================================================
// WEBHOOK HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log('\n🎬 [Video Personnalisée Webhook] Réception d\'un webhook...');

    // 1. Vérification du secret en production
    const headersList = await headers();
    const webhookSecret = headersList.get('x-webhook-secret');
    
    if (ENVIRONMENT === 'production' && webhookSecret !== WEBHOOK_SECRET) {
      console.error('❌ [Video Personnalisée Webhook] Secret invalide');
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid webhook secret' },
        { status: 401 }
      );
    }

    // 2. Parsing du payload
    let payload: VideoWebhookPayload;
    try {
      payload = await request.json();
    } catch (parseError) {
      console.error('❌ [Video Personnalisée Webhook] Erreur de parsing JSON:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    console.log('📦 [Video Personnalisée Webhook] Payload reçu:', {
      job_id: payload.job_id,
      status: payload.status,
      content_type: payload.content_type,
      has_data: payload.has_data,
      user_id: payload.data?.user_id,
      num_videos: payload.data?.num_videos || 0,
    });

    // 3. Validation des champs obligatoires
    if (!payload.job_id || !payload.status || payload.content_type !== 'video') {
      console.error('❌ [Video Personnalisée Webhook] Champs obligatoires manquants');
      return NextResponse.json(
        { error: 'Invalid payload', message: 'Missing required fields or wrong content_type' },
        { status: 400 }
      );
    }

    // 4. Vérification d'idempotence
    const idempotencyKey = `${payload.job_id}-${payload.status}`;
    const existingProcess = processedWebhooks.get(idempotencyKey);
    
    if (existingProcess && Date.now() - existingProcess < IDEMPOTENCE_WINDOW_MS) {
      const age = Date.now() - existingProcess;
      console.log('⚠️ [Video Personnalisée Webhook] Webhook déjà traité:', {
        jobId: payload.job_id,
        ageSeconds: Math.round(age / 1000),
      });
      return NextResponse.json({
        success: true,
        message: 'Webhook déjà traité',
      });
    }

    // Marquer comme en cours de traitement
    processedWebhooks.set(idempotencyKey, Date.now());

    // ========================================================================
    // TRAITEMENT DES ÉCHECS
    // ========================================================================
    
    if (payload.status === 'failed') {
      console.error('❌ [Video Personnalisée Webhook] Génération échouée:', payload.error);
      
      try {
        const videoGeneration = await prisma.videoGeneration.findUnique({
          where: { id: payload.job_id },
        });

        if (videoGeneration) {
          await prisma.videoGeneration.update({
            where: { id: payload.job_id },
            data: {
              status: 'FAILED',
              error: payload.error || payload.message || 'Erreur inconnue',
              message: payload.error || payload.message,
              progress: 0,
            },
          });

          // Créer notification d'échec
          await prisma.notification.create({
            data: {
              userId: videoGeneration.authorId,
              type: 'VIDEO_FAILED',
              title: '❌ Échec de génération de vidéo personnalisée',
              message: payload.error || 'La génération de la vidéo personnalisée a échoué.',
              metadata: {
                generationId: videoGeneration.id,
                error: payload.error,
              },
              isRead: false,
            },
          });

          console.log('🔔 [Video Personnalisée Webhook] Notification d\'échec créée');
        }
      } catch (dbError) {
        console.error('❌ [Video Personnalisée Webhook] Erreur DB:', dbError);
      }
      
      return NextResponse.json({
        success: true,
        message: 'Échec de génération enregistré',
      });
    }

    // ========================================================================
    // TRAITEMENT DES STATUTS INTERMÉDIAIRES
    // ========================================================================
    
    if (payload.status !== 'completed') {
      console.log('ℹ️ [Video Personnalisée Webhook] Statut intermédiaire:', payload.status);
      
      try {
        const videoGeneration = await prisma.videoGeneration.findUnique({
          where: { id: payload.job_id },
        });

        if (videoGeneration) {
          const prismaStatus = mapStatusToJobStatus(payload.status);
          const progress = getProgressPercentage(payload.status);

          await prisma.videoGeneration.update({
            where: { id: payload.job_id },
            data: {
              status: prismaStatus,
              progress,
              message: payload.message || `Statut: ${payload.status}`,
            },
          });

          console.log('📝 [Video Personnalisée Webhook] Statut mis à jour:', {
            job_id: payload.job_id,
            status: prismaStatus,
            progress,
          });
        }
      } catch (dbError) {
        console.error('❌ [Video Personnalisée Webhook] Erreur de mise à jour:', dbError);
      }
      
      return NextResponse.json({
        success: true,
        message: `Statut mis à jour: ${payload.status}`,
      });
    }

    // ========================================================================
    // TRAITEMENT DU SUCCÈS (status = 'completed')
    // ========================================================================
    
    const videoData = payload.data;
    if (!videoData || !videoData.videos || videoData.videos.length === 0) {
      console.error('❌ [Video Personnalisée Webhook] Données de vidéo manquantes');
      return NextResponse.json(
        { error: 'Données de vidéo manquantes' },
        { status: 400 }
      );
    }

    if (!videoData.user_id) {
      console.error('❌ [Video Personnalisée Webhook] user_id manquant dans le payload');
      return NextResponse.json(
        { error: 'user_id manquant' },
        { status: 400 }
      );
    }

    console.log('✅ [Video Personnalisée Webhook] Génération réussie:', {
      job_id: payload.job_id,
      user_id: videoData.user_id,
      num_videos: videoData.videos.length,
      model: videoData.metadata?.model_name,
      generation_time: videoData.metadata?.generation_time,
    });

    // 💾 Enregistrer en base de données
    try {
      // 1️⃣ Chercher l'utilisateur par Clerk ID
      const targetUser = await prisma.user.findUnique({
        where: { clerkId: videoData.user_id },
        include: {
          organizationMemberships: {
            take: 1,
            include: { organization: true },
          },
        },
      });

      if (!targetUser) {
        console.error('❌ [Video Personnalisée Webhook] Utilisateur non trouvé:', videoData.user_id);
        return NextResponse.json(
          { error: 'Utilisateur non trouvé', user_id: videoData.user_id },
          { status: 404 }
        );
      }

      console.log('✅ [Video Personnalisée Webhook] Utilisateur trouvé:', {
        userId: targetUser.id,
        clerkId: targetUser.clerkId,
        email: targetUser.email,
      });

      // 2️⃣ Vérifier si VideoGeneration existe déjà
      let videoGeneration = await prisma.videoGeneration.findUnique({
        where: { id: payload.job_id },
        include: { videos: true, author: true },
      });

      const firstVideo = videoData.videos[0];
      console.log('🎥 [Video Personnalisée Webhook] First video data:', {
        filename: firstVideo.filename,
        duration: firstVideo.duration,
        aspect_ratio: firstVideo.aspect_ratio,
        s3_key: firstVideo.s3_key,
      });
      
      const durationSeconds = parseDuration(firstVideo?.duration);

      // ⚛️ TRANSACTION ATOMIQUE pour éviter race condition avec polling
      videoGeneration = await prisma.$transaction(async (tx) => {
        let generation;
        
        if (videoGeneration) {
          // Mise à jour d'une génération existante
          console.log('📝 [Video Personnalisée Webhook] VideoGeneration existante, mise à jour...');
          
          generation = await tx.videoGeneration.update({
            where: { id: payload.job_id },
            data: {
              status: 'COMPLETED',
              progress: 100,
              completedAt: new Date(videoData.generated_at || payload.timestamp),
              model: videoData.metadata?.model_name || videoGeneration.model,
              modelVersion: videoData.metadata?.model_version || videoGeneration.modelVersion,
              processingTime: videoData.metadata?.processing_time,
              generationTime: videoData.metadata?.generation_time,
              downloadTime: videoData.metadata?.download_time,
              message: `${videoData.videos.length} vidéo(s) personnalisée(s) générée(s) avec succès`,
            },
            include: { videos: true, author: true },
          });
        } else {
          // Création d'une nouvelle génération AVEC vidéos atomiquement
          console.log('🆕 [Video Personnalisée Webhook] Création atomique VideoGeneration + Videos...');
          
          // Préparer les données des vidéos
          const videosData = videoData.videos.map((video) => {
            const duration = parseDuration(video?.duration);
            const width = video?.dimensions?.width || 1920;
            const height = video?.dimensions?.height || 1080;
            
            return {
              filename: video?.filename || video?.file_path?.split('/').pop() || 'video.mp4',
              s3Key: video?.s3_key || video?.file_path || '',
              fileUrl: video?.url || video?.s3_url || '',
              filePath: video?.file_path || '',
              fileSize: video?.size_bytes || 0,
              format: 'mp4',
              durationSeconds: duration,
              aspectRatio: video?.aspect_ratio || '16:9',
              width,
              height,
              metadata: {
                model: videoData.metadata?.model_name,
                generation_time: videoData.metadata?.generation_time,
                created_at: video?.created_at,
                type: 'personnalisee',
              },
            };
          });

          generation = await tx.videoGeneration.create({
            data: {
              id: payload.job_id,
              authorId: targetUser.id,
              organizationId: targetUser.organizationMemberships?.[0]?.organizationId || null,
              prompt: videoData.prompt || videoData.metadata?.prompt_used || 'Vidéo personnalisée générée',
              aspectRatio: firstVideo?.aspect_ratio || '16:9',
              numberOfVideos: videoData.videos.length,
              durationSeconds: durationSeconds,
              personGeneration: videoData.metadata?.config_used?.person_generation || 'ALLOW_ALL',
              model: videoData.metadata?.model_name || 'veo-2.0-generate-001',
              modelVersion: videoData.metadata?.model_version || '2.0',
              status: 'COMPLETED',
              progress: 100,
              createdAt: new Date(payload.timestamp),
              completedAt: new Date(videoData.generated_at || payload.timestamp),
              processingTime: videoData.metadata?.processing_time,
              generationTime: videoData.metadata?.generation_time,
              downloadTime: videoData.metadata?.download_time,
              message: `${videoData.videos.length} vidéo(s) personnalisée(s) générée(s) avec succès`,
              // ✅ Créer les vidéos EN MÊME TEMPS (nested create)
              videos: {
                create: videosData,
              },
            },
            include: { videos: true, author: true },
          });

          console.log('✅ [Video Personnalisée Webhook] VideoGeneration + Videos créées atomiquement:', {
            id: generation.id,
            authorId: generation.authorId,
            videosCount: generation.videos.length,
          });
        }

        // Si mise à jour et vidéos manquantes, les créer dans la transaction
        if (videoGeneration && generation.videos.length === 0) {
          console.log('📹 [Video Personnalisée Webhook] Ajout des VideoFile manquants...');
          
          for (const video of videoData.videos) {
            const duration = parseDuration(video?.duration);
            const width = video?.dimensions?.width || 1920;
            const height = video?.dimensions?.height || 1080;
            
            await tx.videoFile.create({
              data: {
                generationId: generation.id,
                filename: video?.filename || video?.file_path?.split('/').pop() || 'video.mp4',
                s3Key: video?.s3_key || video?.file_path || '',
                fileUrl: video?.url || video?.s3_url || '',
                filePath: video?.file_path || '',
                fileSize: video?.size_bytes || 0,
                format: 'mp4',
                durationSeconds: duration,
                aspectRatio: video?.aspect_ratio || '16:9',
                width,
                height,
                metadata: {
                  model: videoData.metadata?.model_name,
                  generation_time: videoData.metadata?.generation_time,
                  created_at: video?.created_at,
                  type: 'personnalisee',
                },
              },
            });
          }

          console.log('✅ [Video Personnalisée Webhook] Vidéos ajoutées:', {
            generationId: generation.id,
            videosCount: videoData.videos.length,
          });
        }

        return generation;
      });

      // 4️⃣ Créer notification pour l'utilisateur
      await prisma.notification.create({
        data: {
          userId: videoGeneration.authorId,
          type: 'VIDEO_COMPLETED',
          title: '🎬 Vidéo personnalisée générée avec succès',
          message: `${videoData.videos.length} vidéo(s) personnalisée(s) créée(s) à partir de votre image.`,
          metadata: {
            generationId: videoGeneration.id,
            videosCount: videoData.videos.length,
            model: videoData.metadata?.model_name,
            processingTime: videoData.metadata?.processing_time,
            type: 'personnalisee',
          },
          isRead: false,
        },
      });

      console.log('🔔 [Video Personnalisée Webhook] Notification créée pour:', videoGeneration.authorId);

    } catch (dbError) {
      console.error('❌ [Video Personnalisée Webhook] Erreur d\'enregistrement en base:', dbError);
      // Supprimer de la map pour permettre une nouvelle tentative
      processedWebhooks.delete(idempotencyKey);
      throw dbError;
    }

    const processingTime = Date.now() - startTime;
    console.log(`⏱️ [Video Personnalisée Webhook] Traitement terminé en ${processingTime}ms`);

    return NextResponse.json({
      success: true,
      message: `${videoData.videos.length} vidéo(s) personnalisée(s) générée(s) avec succès`,
      job_id: payload.job_id,
      videos_count: videoData.videos.length,
      processing_time_ms: processingTime,
      received: true,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('❌ [Video Personnalisée Webhook] Erreur:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        processing_time_ms: processingTime,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// MÉTHODES HTTP NON AUTORISÉES
// ============================================================================

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed', message: 'Only POST requests are accepted' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed', message: 'Only POST requests are accepted' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed', message: 'Only POST requests are accepted' },
    { status: 405 }
  );
}
