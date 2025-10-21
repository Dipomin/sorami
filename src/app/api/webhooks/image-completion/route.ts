import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
const ENVIRONMENT = process.env.NODE_ENV || 'development';

// Map pour suivre les jobs déjà traités (idempotence)
const processedJobs = new Map<string, number>();
const IDEMPOTENCE_WINDOW = 5 * 60 * 1000; // 5 minutes

interface GeneratedImage {
  file_path: string;
  url: string;
  description: string;
  format: string;
  size_bytes: number;
  dimensions: string;
}

interface ImageMetadata {
  model_name: string;
  version: string;
  generation_time_seconds: number;
  input_tokens: number;
  output_size_bytes: number;
  timestamp: string;
}

interface ImageGenerationData {
  job_id: string;
  images: GeneratedImage[];
  metadata: ImageMetadata;
  status: string;
  generated_at: string;
}

type WebhookStatus = 'completed' | 'failed' | 'pending' | 'initializing' | 'generating' | 'saving';

interface ImageWebhookPayload {
  job_id: string;
  status: WebhookStatus;
  timestamp: string;
  environment?: 'development' | 'production';
  data?: ImageGenerationData;
  error_message?: string;
  message?: string;
  progress?: number;
}

export async function POST(request: Request) {
  const startTime = Date.now();
  
  try {
    console.log('🎨 [Image Webhook] Réception d\'un webhook de génération d\'images...');

    // Vérification du secret en production
    if (ENVIRONMENT === 'production') {
      const secret = request.headers.get('X-Webhook-Secret');
      if (secret !== WEBHOOK_SECRET) {
        console.error('❌ [Image Webhook] Secret invalide');
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    const payload: ImageWebhookPayload = await request.json();
    console.log('📦 [Image Webhook] Payload reçu:', {
      job_id: payload.job_id,
      status: payload.status,
      has_data: !!payload.data,
      images_count: payload.data?.images?.length || 0,
    });

    // Vérification de l'idempotence
    const lastProcessed = processedJobs.get(payload.job_id);
    if (lastProcessed && Date.now() - lastProcessed < IDEMPOTENCE_WINDOW) {
      console.log('⚠️ [Image Webhook] Job déjà traité récemment:', payload.job_id);
      return NextResponse.json({ 
        success: true, 
        message: 'Job déjà traité' 
      });
    }

    if (payload.status === 'failed') {
      console.error('❌ [Image Webhook] Génération échouée:', payload.error_message);
      
      // Marquer comme traité
      processedJobs.set(payload.job_id, Date.now());
      
      return NextResponse.json({
        success: true,
        message: 'Échec de génération enregistré',
      });
    }

    if (payload.status !== 'completed') {
      console.log('ℹ️ [Image Webhook] Statut intermédiaire:', payload.status);
      return NextResponse.json({
        success: true,
        message: `Statut mis à jour: ${payload.status}`,
      });
    }

    // Traitement du statut 'completed'
    const imageData = payload.data;
    if (!imageData || !imageData.images || imageData.images.length === 0) {
      console.error('❌ [Image Webhook] Données d\'images manquantes');
      return NextResponse.json(
        { error: 'Données d\'images manquantes' },
        { status: 400 }
      );
    }

    console.log('✅ [Image Webhook] Génération réussie:', {
      job_id: payload.job_id,
      images_count: imageData.images.length,
      model: imageData.metadata?.model_name,
      generation_time: imageData.metadata?.generation_time_seconds,
    });

    // Pour l'instant, on enregistre juste le succès
    // Dans une future version, on pourrait créer un modèle ImageGeneration dans Prisma
    console.log('💾 [Image Webhook] Images générées:', imageData.images.map(img => ({
      url: img.url,
      format: img.format,
      dimensions: img.dimensions,
      size_kb: Math.round(img.size_bytes / 1024),
    })));

    // Marquer comme traité
    processedJobs.set(payload.job_id, Date.now());

    const processingTime = Date.now() - startTime;
    console.log(`⏱️ [Image Webhook] Traitement terminé en ${processingTime}ms`);

    return NextResponse.json({
      success: true,
      message: `${imageData.images.length} image(s) générée(s) avec succès`,
      job_id: payload.job_id,
      images_count: imageData.images.length,
      processing_time_ms: processingTime,
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('❌ [Image Webhook] Erreur:', error);
    
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

// Nettoyage périodique des jobs traités (optionnel)
setInterval(() => {
  const now = Date.now();
  const entries = Array.from(processedJobs.entries());
  for (const [jobId, timestamp] of entries) {
    if (now - timestamp > IDEMPOTENCE_WINDOW) {
      processedJobs.delete(jobId);
    }
  }
}, IDEMPOTENCE_WINDOW);
