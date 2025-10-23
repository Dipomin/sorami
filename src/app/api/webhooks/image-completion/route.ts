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
      
      // 💾 Mettre à jour le statut en base de données
      try {
        const imageGeneration = await prisma.imageGeneration.findUnique({
          where: { id: payload.job_id },
        });

        if (imageGeneration) {
          await prisma.imageGeneration.update({
            where: { id: payload.job_id },
            data: {
              status: 'FAILED',
              error: payload.error_message || payload.message || 'Erreur inconnue',
              message: payload.error_message || payload.message,
            },
          });

          // 🔔 Créer notification d'échec
          await prisma.notification.create({
            data: {
              userId: imageGeneration.authorId,
              type: 'IMAGE_FAILED',
              title: '❌ Échec de génération d\'images',
              message: payload.error_message || 'La génération des images a échoué.',
              metadata: {
                generationId: imageGeneration.id,
                error: payload.error_message,
              },
              isRead: false,
            },
          });

          console.log('🔔 [Image Webhook] Notification d\'échec créée pour:', imageGeneration.authorId);
        }
      } catch (dbError) {
        console.error('❌ [Image Webhook] Erreur lors de la mise à jour en base:', dbError);
      }
      
      // Marquer comme traité
      processedJobs.set(payload.job_id, Date.now());
      
      return NextResponse.json({
        success: true,
        message: 'Échec de génération enregistré',
      });
    }

    if (payload.status !== 'completed') {
      console.log('ℹ️ [Image Webhook] Statut intermédiaire:', payload.status);
      
      // 💾 Mettre à jour le statut et le progrès en base de données
      try {
        const imageGeneration = await prisma.imageGeneration.findUnique({
          where: { id: payload.job_id },
        });

        if (imageGeneration) {
          // Mapper les statuts webhook vers les statuts Prisma
          const statusMap: Record<string, 'PENDING' | 'PROCESSING' | 'GENERATING'> = {
            'pending': 'PENDING',
            'initializing': 'PROCESSING',
            'generating': 'GENERATING',
            'saving': 'GENERATING',
          };

          const prismaStatus = statusMap[payload.status] || 'PROCESSING';
          
          // Calculer le progrès basé sur le statut
          const progressMap: Record<string, number> = {
            'pending': 10,
            'initializing': 25,
            'generating': 60,
            'saving': 90,
          };

          const progress = payload.progress || progressMap[payload.status] || imageGeneration.progress;

          await prisma.imageGeneration.update({
            where: { id: payload.job_id },
            data: {
              status: prismaStatus,
              progress,
              message: payload.message || `Statut: ${payload.status}`,
            },
          });

          console.log('📝 [Image Webhook] Statut mis à jour:', {
            job_id: payload.job_id,
            status: prismaStatus,
            progress,
          });
        }
      } catch (dbError) {
        console.error('❌ [Image Webhook] Erreur lors de la mise à jour du statut:', dbError);
      }
      
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
      first_image_dimensions_type: typeof imageData.images[0]?.dimensions,
      first_image_dimensions_value: imageData.images[0]?.dimensions,
      first_image_size_bytes: imageData.images[0]?.size_bytes,
    });

    // 💾 Enregistrer les images dans la base de données
    try {
      // 1️⃣ Vérifier si ImageGeneration existe déjà avec ce job_id
      let imageGeneration = await prisma.imageGeneration.findUnique({
        where: { id: payload.job_id },
        include: { images: true, author: true },
      });

      if (imageGeneration) {
        console.log('📝 [Image Webhook] ImageGeneration existante trouvée, mise à jour...');
        
        // Mettre à jour le statut
        imageGeneration = await prisma.imageGeneration.update({
          where: { id: payload.job_id },
          data: {
            status: 'COMPLETED',
            progress: 100,
            completedAt: new Date(imageData.generated_at || payload.timestamp),
            model: imageData.metadata?.model_name || imageGeneration.model,
            modelVersion: imageData.metadata?.version,
            processingTime: imageData.metadata?.generation_time_seconds,
            message: `${imageData.images.length} image(s) générée(s) avec succès`,
          },
          include: { images: true, author: true },
        });

        // 2️⃣ Créer les ImageFile si pas déjà créés
        if (imageGeneration.images.length === 0) {
          console.log('📸 [Image Webhook] Création des ImageFile...');
          
          for (const image of imageData.images) {
            // Parse dimensions "1024x1024" → width: 1024, height: 1024
            // Gérer le cas où dimensions peut être un objet {width, height} ou une string "1024x1024"
            let width = 1024;
            let height = 1024;
            let aspectRatio = '1024x1024';
            
            if (typeof image.dimensions === 'string') {
              const parts = image.dimensions.split('x');
              width = parseInt(parts[0]) || 1024;
              height = parseInt(parts[1]) || 1024;
              aspectRatio = image.dimensions;
            } else if (image.dimensions && typeof image.dimensions === 'object') {
              // Si dimensions est un objet {width, height}
              const dims = image.dimensions as any;
              width = dims.width || 1024;
              height = dims.height || 1024;
              aspectRatio = `${width}x${height}`;
            }
            
            await prisma.imageFile.create({
              data: {
                generationId: imageGeneration.id,
                filename: image.file_path.split('/').pop() || 'image',
                s3Key: image.file_path,
                fileUrl: image.url,
                fileSize: image.size_bytes || 0, // Valeur par défaut si manquante
                format: image.format.toUpperCase(),
                width,
                height,
                aspectRatio,
                metadata: {
                  description: image.description,
                  model: imageData.metadata?.model_name,
                  generation_time: imageData.metadata?.generation_time_seconds,
                },
              },
            });
          }

          console.log('✅ [Image Webhook] Images enregistrées en base de données:', {
            generationId: imageGeneration.id,
            imagesCount: imageData.images.length,
          });
        } else {
          console.log('ℹ️ [Image Webhook] ImageFile déjà existants, pas de duplication');
        }

        // 3️⃣ Créer notification pour l'utilisateur
        await prisma.notification.create({
          data: {
            userId: imageGeneration.authorId,
            type: 'IMAGE_COMPLETED',
            title: '🎨 Images générées avec succès',
            message: `${imageData.images.length} image(s) créée(s) à partir de votre prompt.`,
            metadata: {
              generationId: imageGeneration.id,
              imagesCount: imageData.images.length,
              model: imageData.metadata?.model_name,
              processingTime: imageData.metadata?.generation_time_seconds,
            },
            isRead: false,
          },
        });

        console.log('🔔 [Image Webhook] Notification créée pour l\'utilisateur:', imageGeneration.authorId);

      } else {
        console.warn('⚠️ [Image Webhook] ImageGeneration non trouvée pour job_id:', payload.job_id);
        console.warn('🔧 [Image Webhook] Création d\'une nouvelle entrée ImageGeneration...');
        
        // 🆕 CRÉER l'entrée ImageGeneration si elle n'existe pas
        // Note: Nous devons deviner certaines informations car le backend ne nous les envoie pas
        
        // Récupérer le premier utilisateur actif ou un utilisateur par défaut
        // IMPORTANT: Dans un vrai système, le backend devrait nous envoyer user_id
        const firstUser = await prisma.user.findFirst({
          orderBy: { createdAt: 'asc' },
          include: {
            organizationMemberships: {
              take: 1,
              include: {
                organization: true,
              },
            },
          },
        });
        
        if (!firstUser) {
          console.error('❌ [Image Webhook] Aucun utilisateur trouvé dans la base de données');
          throw new Error('Impossible de créer ImageGeneration sans utilisateur');
        }
        
        // Extraire les informations du premier ImageFile pour reconstruire le prompt
        const firstImage = imageData.images[0];
        
        // Parse dimensions avec gestion robuste
        let imgWidth = 1024;
        let imgHeight = 1024;
        if (typeof firstImage.dimensions === 'string') {
          const parts = firstImage.dimensions.split('x');
          imgWidth = parseInt(parts[0]) || 1024;
          imgHeight = parseInt(parts[1]) || 1024;
        } else if (firstImage.dimensions && typeof firstImage.dimensions === 'object') {
          const dims = firstImage.dimensions as any;
          imgWidth = dims.width || 1024;
          imgHeight = dims.height || 1024;
        }
        
        imageGeneration = await prisma.imageGeneration.create({
          data: {
            id: payload.job_id, // Utiliser le job_id du backend comme ID
            authorId: firstUser.id,
            organizationId: firstUser.organizationMemberships?.[0]?.organizationId || null,
            prompt: firstImage.description || 'Image générée depuis le backend',
            model: imageData.metadata?.model_name || 'gemini-2.5-flash-image',
            modelVersion: imageData.metadata?.version,
            numImages: imageData.images.length,
            size: `${imgWidth}x${imgHeight}`,
            style: 'photorealistic', // Valeur par défaut
            status: 'COMPLETED',
            progress: 100,
            createdAt: new Date(payload.timestamp),
            completedAt: new Date(imageData.generated_at || payload.timestamp),
            processingTime: imageData.metadata?.generation_time_seconds,
            message: `${imageData.images.length} image(s) générée(s) avec succès`,
          },
          include: { images: true, author: true },
        });
        
        console.log('✅ [Image Webhook] ImageGeneration créée:', {
          id: imageGeneration.id,
          authorId: imageGeneration.authorId,
        });
        
        // Créer les ImageFile
        console.log('📸 [Image Webhook] Création des ImageFile...');
        
        for (const image of imageData.images) {
          // Parse dimensions avec gestion robuste
          let imgWidth = 1024;
          let imgHeight = 1024;
          let aspectRatio = '1024x1024';
          
          if (typeof image.dimensions === 'string') {
            const parts = image.dimensions.split('x');
            imgWidth = parseInt(parts[0]) || 1024;
            imgHeight = parseInt(parts[1]) || 1024;
            aspectRatio = image.dimensions;
          } else if (image.dimensions && typeof image.dimensions === 'object') {
            const dims = image.dimensions as any;
            imgWidth = dims.width || 1024;
            imgHeight = dims.height || 1024;
            aspectRatio = `${imgWidth}x${imgHeight}`;
          }
          
          await prisma.imageFile.create({
            data: {
              generationId: imageGeneration.id,
              filename: image.file_path.split('/').pop() || 'image',
              s3Key: image.file_path,
              fileUrl: image.url,
              fileSize: image.size_bytes || 0, // Valeur par défaut si manquante
              format: image.format.toUpperCase(),
              width: imgWidth,
              height: imgHeight,
              aspectRatio,
              metadata: {
                description: image.description,
                model: imageData.metadata?.model_name,
                generation_time: imageData.metadata?.generation_time_seconds,
              },
            },
          });
        }
        
        console.log('✅ [Image Webhook] Images créées depuis le backend:', {
          generationId: imageGeneration.id,
          imagesCount: imageData.images.length,
        });
        
        // Créer notification
        await prisma.notification.create({
          data: {
            userId: imageGeneration.authorId,
            type: 'IMAGE_COMPLETED',
            title: '🎨 Images générées avec succès',
            message: `${imageData.images.length} image(s) créée(s).`,
            metadata: {
              generationId: imageGeneration.id,
              imagesCount: imageData.images.length,
              model: imageData.metadata?.model_name,
              processingTime: imageData.metadata?.generation_time_seconds,
              source: 'backend-direct', // Indique que c'est venu directement du backend
            },
            isRead: false,
          },
        });
        
        console.log('🔔 [Image Webhook] Notification créée pour:', imageGeneration.authorId);
      }

    } catch (dbError) {
      console.error('❌ [Image Webhook] Erreur lors de l\'enregistrement en base:', dbError);
      // On continue malgré l'erreur DB pour ne pas bloquer le webhook
    }

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
