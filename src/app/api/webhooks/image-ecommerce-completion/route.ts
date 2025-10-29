/**
 * Webhook pour la complétion des générations d'images e-commerce
 * Reçoit les notifications du backend CrewAI quand une image e-commerce est générée
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

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

interface GeneratedImage {
  s3_url: string;          // URL S3 signée (prioritaire)
  file_url?: string;       // URL S3 alternative
  s3_key: string;          // Chemin S3
  filename: string;        // Nom du fichier
  file_size: number;       // Taille en bytes
  dimensions: string | { width: number; height: number };
  format?: string;
  description?: string;
}

interface GenerationMetadata {
  model_name: string;
  version: string;
  generation_time_seconds: number;
  input_tokens?: number;
  output_size_bytes?: number;
  timestamp: string;
}

interface EcommerceImageData {
  job_id: string;
  user_id: string; // Clerk ID de l'utilisateur
  images: GeneratedImage[];
  generation_metadata: GenerationMetadata;
  status: string;
  generated_at: string;
  num_images: number;
}

interface EcommerceWebhookPayload {
  job_id: string;
  status: 'completed' | 'failed' | 'pending' | 'processing' | 'generating' | 'saving';
  content_type: 'image';
  timestamp: string;
  has_data: boolean;
  data?: EcommerceImageData;
  error?: string;
  message?: string;
  environment: 'development' | 'production';
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Parse les dimensions d'une image (string "832x1248" ou objet {width, height})
 */
function parseDimensions(dimensions: string | { width: number; height: number }): {
  width: number;
  height: number;
  aspectRatio: string;
} {
  if (typeof dimensions === 'string') {
    const parts = dimensions.split('x');
    const width = parseInt(parts[0]) || 1024;
    const height = parseInt(parts[1]) || 1024;
    return { width, height, aspectRatio: dimensions };
  } else if (dimensions && typeof dimensions === 'object') {
    const width = dimensions.width || 1024;
    const height = dimensions.height || 1024;
    return { width, height, aspectRatio: `${width}x${height}` };
  }
  
  // Valeurs par défaut
  return { width: 1024, height: 1024, aspectRatio: '1024x1024' };
}

/**
 * Mapper les statuts webhook vers les statuts Prisma
 */
function mapStatusToPrisma(status: string): 'PENDING' | 'PROCESSING' | 'GENERATING' {
  const statusMap: Record<string, 'PENDING' | 'PROCESSING' | 'GENERATING'> = {
    'pending': 'PENDING',
    'processing': 'PROCESSING',
    'generating': 'GENERATING',
    'saving': 'GENERATING',
  };
  return statusMap[status.toLowerCase()] || 'PROCESSING';
}

/**
 * Calculer le pourcentage de progression
 */
function getProgressPercentage(status: string): number {
  const progressMap: Record<string, number> = {
    'pending': 10,
    'processing': 30,
    'generating': 60,
    'saving': 90,
    'completed': 100,
    'failed': 0,
  };
  return progressMap[status.toLowerCase()] || 0;
}

// ============================================================================
// WEBHOOK HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log('🛍️ [E-commerce Image Webhook] Réception d\'un webhook...');

    // 1. Vérification du secret en production
    const headersList = await headers();
    const webhookSecret = headersList.get('x-webhook-secret');
    
    if (ENVIRONMENT === 'production' && webhookSecret !== WEBHOOK_SECRET) {
      console.error('❌ [E-commerce Image Webhook] Secret invalide');
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid webhook secret' },
        { status: 401 }
      );
    }

    // 2. Parsing du payload
    let payload: EcommerceWebhookPayload;
    try {
      payload = await request.json();
    } catch (parseError) {
      console.error('❌ [E-commerce Image Webhook] Erreur de parsing JSON:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    console.log('📦 [E-commerce Image Webhook] Payload reçu:', {
      job_id: payload.job_id,
      status: payload.status,
      content_type: payload.content_type,
      has_data: payload.has_data,
      user_id: payload.data?.user_id,
      images_count: payload.data?.images?.length || 0,
    });
    
    // Log des URLs S3 pour debug
    if (payload.data?.images && payload.data.images.length > 0) {
      console.log('🖼️ [E-commerce Image Webhook] URLs S3 reçues:', 
        payload.data.images.map((img, i) => ({
          index: i,
          s3_key: img.s3_key,
          s3_url: img.s3_url,
          file_url: img.file_url,
          filename: img.filename,
          format: img.format,
          dimensions: img.dimensions,
        }))
      );
    }

    // 3. Validation des champs obligatoires
    if (!payload.job_id || !payload.status || !payload.timestamp) {
      console.error('❌ [E-commerce Image Webhook] Champs obligatoires manquants');
      return NextResponse.json(
        { error: 'Invalid payload', message: 'Missing required fields: job_id, status, timestamp' },
        { status: 400 }
      );
    }

    // 4. Vérification d'idempotence
    const idempotencyKey = `${payload.job_id}-${payload.status}`;
    const existingProcess = processedWebhooks.get(idempotencyKey);
    
    if (existingProcess && Date.now() - existingProcess < IDEMPOTENCE_WINDOW_MS) {
      const age = Date.now() - existingProcess;
      console.log('⚠️ [E-commerce Image Webhook] Webhook déjà traité:', {
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
      console.error('❌ [E-commerce Image Webhook] Génération échouée:', payload.error);
      
      try {
        const imageGeneration = await prisma.imageGeneration.findUnique({
          where: { id: payload.job_id },
        });

        if (imageGeneration) {
          await prisma.imageGeneration.update({
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
              userId: imageGeneration.authorId,
              type: 'IMAGE_FAILED',
              title: '❌ Échec de génération d\'image e-commerce',
              message: payload.error || 'La génération de l\'image e-commerce a échoué.',
              metadata: {
                generationId: imageGeneration.id,
                error: payload.error,
              },
              isRead: false,
            },
          });

          console.log('🔔 [E-commerce Image Webhook] Notification d\'échec créée');
        }
      } catch (dbError) {
        console.error('❌ [E-commerce Image Webhook] Erreur DB:', dbError);
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
      console.log('ℹ️ [E-commerce Image Webhook] Statut intermédiaire:', payload.status);
      
      try {
        const imageGeneration = await prisma.imageGeneration.findUnique({
          where: { id: payload.job_id },
        });

        if (imageGeneration) {
          const prismaStatus = mapStatusToPrisma(payload.status);
          const progress = getProgressPercentage(payload.status);

          await prisma.imageGeneration.update({
            where: { id: payload.job_id },
            data: {
              status: prismaStatus,
              progress,
              message: payload.message || `Statut: ${payload.status}`,
            },
          });

          console.log('📝 [E-commerce Image Webhook] Statut mis à jour:', {
            job_id: payload.job_id,
            status: prismaStatus,
            progress,
          });
        }
      } catch (dbError) {
        console.error('❌ [E-commerce Image Webhook] Erreur de mise à jour:', dbError);
      }
      
      return NextResponse.json({
        success: true,
        message: `Statut mis à jour: ${payload.status}`,
      });
    }

    // ========================================================================
    // TRAITEMENT DU SUCCÈS (status = 'completed')
    // ========================================================================
    
    const imageData = payload.data;
    if (!imageData || !imageData.images || imageData.images.length === 0) {
      console.error('❌ [E-commerce Image Webhook] Données d\'images manquantes');
      return NextResponse.json(
        { error: 'Données d\'images manquantes' },
        { status: 400 }
      );
    }

    if (!imageData.user_id) {
      console.error('❌ [E-commerce Image Webhook] user_id manquant dans le payload');
      return NextResponse.json(
        { error: 'user_id manquant' },
        { status: 400 }
      );
    }

    console.log('✅ [E-commerce Image Webhook] Génération réussie:', {
      job_id: payload.job_id,
      user_id: imageData.user_id,
      images_count: imageData.images.length,
      model: imageData.generation_metadata?.model_name,
      generation_time: imageData.generation_metadata?.generation_time_seconds,
    });

    // 💾 Enregistrer en base de données
    try {
      // 1️⃣ Chercher l'utilisateur par Clerk ID
      const targetUser = await prisma.user.findUnique({
        where: { clerkId: imageData.user_id },
        include: {
          organizationMemberships: {
            take: 1,
            include: { organization: true },
          },
        },
      });

      if (!targetUser) {
        console.error('❌ [E-commerce Image Webhook] Utilisateur non trouvé:', imageData.user_id);
        return NextResponse.json(
          { error: 'Utilisateur non trouvé', user_id: imageData.user_id },
          { status: 404 }
        );
      }

      console.log('✅ [E-commerce Image Webhook] Utilisateur trouvé:', {
        userId: targetUser.id,
        clerkId: targetUser.clerkId,
        email: targetUser.email,
      });

      // 2️⃣ Vérifier si ImageGeneration existe déjà
      let imageGeneration = await prisma.imageGeneration.findUnique({
        where: { id: payload.job_id },
        include: { images: true, author: true },
      });

      const firstImage = imageData.images[0];
      const { width: imgWidth, height: imgHeight } = parseDimensions(firstImage.dimensions);

      // ⚛️ TRANSACTION ATOMIQUE pour éviter race condition avec polling
      imageGeneration = await prisma.$transaction(async (tx) => {
        let generation;
        
        if (imageGeneration) {
          // Mise à jour d'une génération existante
          console.log('📝 [E-commerce Image Webhook] ImageGeneration existante, mise à jour...');
          
          generation = await tx.imageGeneration.update({
            where: { id: payload.job_id },
            data: {
              status: 'COMPLETED',
              progress: 100,
              completedAt: new Date(imageData.generated_at || payload.timestamp),
              model: imageData.generation_metadata?.model_name || imageGeneration.model,
              modelVersion: imageData.generation_metadata?.version,
              processingTime: imageData.generation_metadata?.generation_time_seconds,
              message: `${imageData.images.length} image(s) e-commerce générée(s) avec succès`,
            },
            include: { images: true, author: true },
          });
        } else {
          // Création d'une nouvelle génération AVEC images atomiquement
          console.log('🆕 [E-commerce Image Webhook] Création atomique ImageGeneration + Images...');
          
          // Préparer les données des images
          const imagesData = imageData.images.map((image) => {
            const { width, height, aspectRatio } = parseDimensions(image.dimensions);
            return {
              filename: image.filename,
              s3Key: image.s3_key,
              fileUrl: image.s3_url || image.file_url || '',  // Utiliser s3_url en priorité
              fileSize: image.file_size || 0,
              format: (image.format || 'PNG').toUpperCase(),
              width,
              height,
              aspectRatio,
              metadata: {
                description: image.description || 'Image e-commerce générée',
                model: imageData.generation_metadata?.model_name,
                generation_time: imageData.generation_metadata?.generation_time_seconds,
                type: 'ecommerce',
              },
            };
          });

          generation = await tx.imageGeneration.create({
            data: {
              id: payload.job_id,
              authorId: targetUser.id,
              organizationId: targetUser.organizationMemberships?.[0]?.organizationId || null,
              prompt: firstImage.description || 'Image e-commerce générée',
              model: imageData.generation_metadata?.model_name || 'gemini-2.5-flash-image',
              modelVersion: imageData.generation_metadata?.version,
              numImages: imageData.images.length,
              size: `${imgWidth}x${imgHeight}`,
              style: 'ecommerce',
              status: 'COMPLETED',
              progress: 100,
              createdAt: payload.timestamp ? new Date(payload.timestamp) : new Date(),
              completedAt: imageData.generated_at ? new Date(imageData.generated_at) : new Date(),
              processingTime: imageData.generation_metadata?.generation_time_seconds,
              message: `${imageData.images.length} image(s) e-commerce générée(s) avec succès`,
              // ✅ Créer les images EN MÊME TEMPS (nested create)
              images: {
                create: imagesData,
              },
            },
            include: { images: true, author: true },
          });

          console.log('✅ [E-commerce Image Webhook] ImageGeneration + Images créées atomiquement:', {
            id: generation.id,
            authorId: generation.authorId,
            imagesCount: generation.images.length,
            firstImageUrl: generation.images[0]?.fileUrl || 'N/A',
          });
        }

        // Si mise à jour et images manquantes, les créer dans la transaction
        if (imageGeneration && generation.images.length === 0) {
          console.log('📸 [E-commerce Image Webhook] Ajout des ImageFile manquants...');
          
          for (const image of imageData.images) {
            const { width, height, aspectRatio } = parseDimensions(image.dimensions);
            
            await tx.imageFile.create({
              data: {
                generationId: generation.id,
                filename: image.filename,
                s3Key: image.s3_key,
                fileUrl: image.s3_url || image.file_url || '',  // Utiliser s3_url en priorité
                fileSize: image.file_size || 0,
                format: (image.format || 'PNG').toUpperCase(),
                width,
                height,
                aspectRatio,
                metadata: {
                  description: image.description || 'Image e-commerce générée',
                  model: imageData.generation_metadata?.model_name,
                  generation_time: imageData.generation_metadata?.generation_time_seconds,
                  type: 'ecommerce',
                },
              },
            });
          }

          console.log('✅ [E-commerce Image Webhook] Images ajoutées:', {
            generationId: generation.id,
            imagesCount: imageData.images.length,
          });
        }

        return generation;
      });

      // 4️⃣ Créer notification pour l'utilisateur
      await prisma.notification.create({
        data: {
          userId: imageGeneration.authorId,
          type: 'IMAGE_COMPLETED',
          title: '🛍️ Image e-commerce générée avec succès',
          message: `${imageData.images.length} image(s) e-commerce créée(s) pour votre produit.`,
          metadata: {
            generationId: imageGeneration.id,
            imagesCount: imageData.images.length,
            model: imageData.generation_metadata?.model_name,
            processingTime: imageData.generation_metadata?.generation_time_seconds,
            type: 'ecommerce',
          },
          isRead: false,
        },
      });

      console.log('🔔 [E-commerce Image Webhook] Notification créée pour:', imageGeneration.authorId);

    } catch (dbError) {
      console.error('❌ [E-commerce Image Webhook] Erreur d\'enregistrement en base:', dbError);
      // Supprimer de la map pour permettre une nouvelle tentative
      processedWebhooks.delete(idempotencyKey);
      throw dbError;
    }

    const processingTime = Date.now() - startTime;
    console.log(`⏱️ [E-commerce Image Webhook] Traitement terminé en ${processingTime}ms`);

    return NextResponse.json({
      success: true,
      message: `${imageData.images.length} image(s) e-commerce générée(s) avec succès`,
      job_id: payload.job_id,
      images_count: imageData.images.length,
      processing_time_ms: processingTime,
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('❌ [E-commerce Image Webhook] Erreur:', error);
    
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
