import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { headers } from 'next/headers';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Types conformes à la documentation CrewAI
interface ChapterData {
  title: string;
  content: string;
  description?: string;
}

interface BookData {
  book_title: string;
  topic: string;
  goal: string;
  outline: Array<{
    title: string;
    description: string;
  }>;
  chapters: ChapterData[];
  generated_at: string;
  word_count: number;
  chapter_count: number;
}

interface WebhookPayload {
  job_id: string;
  status: 'completed' | 'failed';
  timestamp: string;
  environment: 'development' | 'production';
  book_data?: BookData;
  user_id?: string; // Ajouté pour compatibilité
  error?: string;
}

// Store pour idempotency (empêcher le double traitement)
const processedWebhooks = new Map<string, { timestamp: number; status: string }>();
const IDEMPOTENCY_WINDOW = 5 * 60 * 1000; // 5 minutes

// Nettoyer les entrées expirées toutes les 10 minutes
setInterval(() => {
  const now = Date.now();
  // Utiliser Array.from pour compatibilité TypeScript
  Array.from(processedWebhooks.entries()).forEach(([key, value]) => {
    if (now - value.timestamp > IDEMPOTENCY_WINDOW) {
      processedWebhooks.delete(key);
    }
  });
}, 10 * 60 * 1000);

/**
 * Tronque une chaîne de caractères à la longueur maximale spécifiée
 * Ajoute '...' si la chaîne est tronquée
 */
function truncateString(str: string, maxLength: number): string {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
}

/**
 * Nettoie et valide les données du livre avant insertion
 */
function sanitizeBookData(bookData: BookData): {
  title: string;
  description: string;
  topic: string;
  goal: string;
} {
  return {
    title: truncateString(bookData.book_title, 255),
    description: truncateString(bookData.goal || '', 65000), // TEXT field
    topic: truncateString(bookData.topic, 188), // VARCHAR(191) - on garde une marge
    goal: truncateString(bookData.goal, 65000), // TEXT field
  };
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // 1. Récupération et logging des headers
    const headersList = await headers();
    const origin = headersList.get('origin') || headersList.get('referer');
    const webhookSecret = headersList.get('x-webhook-secret');
    
    const isDevelopment = process.env.NODE_ENV === 'development';
    const expectedSecret = process.env.WEBHOOK_SECRET || 'sorami-webhook-secret-key-2025';
    
    console.log('📬 Webhook reçu du backend', {
      origin: origin || 'local/test',
      environment: isDevelopment ? 'development' : 'production',
      timestamp: new Date().toISOString()
    });

    // 2. Vérification de sécurité stricte en production
    if (!isDevelopment) {
      if (webhookSecret !== expectedSecret) {
        console.error('❌ Secret webhook invalide', {
          provided: webhookSecret ? 'present' : 'missing',
          origin
        });
        return NextResponse.json(
          { error: 'Unauthorized', message: 'Invalid webhook secret' },
          { status: 401 }
        );
      }
      console.log('✅ Secret webhook validé');
    } else {
      console.log('🔓 Mode développement - pas de vérification du secret');
    }

    // 3. Parsing et validation du payload
    let payload: WebhookPayload;
    try {
      payload = await request.json();
    } catch (parseError) {
      console.error('❌ Erreur de parsing JSON:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    // 4. Validation des champs obligatoires
    if (!payload.job_id || !payload.status || !payload.timestamp) {
      console.error('❌ Données invalides dans le webhook', {
        hasJobId: !!payload.job_id,
        hasStatus: !!payload.status,
        hasTimestamp: !!payload.timestamp
      });
      return NextResponse.json(
        { error: 'Invalid payload', message: 'Missing required fields: job_id, status, timestamp' },
        { status: 400 }
      );
    }

    // 5. Vérification d'idempotence (éviter le double traitement)
    const idempotencyKey = `${payload.job_id}-${payload.status}`;
    const existingProcess = processedWebhooks.get(idempotencyKey);
    
    if (existingProcess) {
      const age = Date.now() - existingProcess.timestamp;
      console.log('⚠️ Webhook déjà traité (idempotence)', {
        jobId: payload.job_id,
        ageSeconds: Math.round(age / 1000),
        previousStatus: existingProcess.status
      });
      
      return NextResponse.json({
        success: true,
        message: 'Webhook already processed (idempotent)',
        job_id: payload.job_id,
        processed_at: new Date(existingProcess.timestamp).toISOString()
      });
    }

    // Marquer comme en cours de traitement
    processedWebhooks.set(idempotencyKey, {
      timestamp: Date.now(),
      status: 'processing'
    });

    console.log('📚 Traitement du webhook', {
      job_id: payload.job_id,
      status: payload.status,
      environment: payload.environment,
      hasBookData: !!payload.book_data,
      hasUserId: !!payload.user_id
    });

    // 6. Vérifier que le job existe dans notre base
    let existingJob: Awaited<ReturnType<typeof prisma.bookJob.findUnique<{
      where: { id: string };
      include: { book: true; user: true };
    }>>>;
    
    existingJob = await prisma.bookJob.findUnique({
      where: { id: payload.job_id },
      include: {
        book: true,
        user: true,
      }
    });

    // Si le job n'existe pas avec l'ID du webhook, chercher un job RUNNING/PENDING récent
    if (!existingJob) {
      console.log('⚠️ Job non trouvé avec ID webhook, recherche d\'un job en cours...', { 
        webhookJobId: payload.job_id,
        bookTitle: payload.book_data?.book_title 
      });
      
      // Extraire le userId du payload ou utiliser un user par défaut
      let userId = payload.user_id;
      
      if (!userId) {
        // Chercher le premier utilisateur
        const firstUser = await prisma.user.findFirst({
          orderBy: { createdAt: 'asc' }
        });
        
        if (!firstUser) {
          console.error('❌ Aucun utilisateur trouvé dans la base de données');
          processedWebhooks.delete(idempotencyKey);
          return NextResponse.json(
            { 
              error: 'No user found', 
              message: 'Cannot create job without a valid user. Please ensure at least one user exists in the database.',
              job_id: payload.job_id 
            },
            { status: 400 }
          );
        }
        
        userId = firstUser.id;
        console.log('📝 Utilisation du premier utilisateur trouvé:', userId);
      }

      // Chercher un job RUNNING ou PENDING récent (dernière heure)
      // Ne pas filtrer par userId car le webhook peut ne pas avoir le bon userId
      const recentJob = await prisma.bookJob.findFirst({
        where: {
          jobType: 'BOOK_GENERATION',
          status: { in: ['RUNNING', 'PENDING'] },
          createdAt: {
            gte: new Date(Date.now() - 60 * 60 * 1000) // Dernière heure
          }
        },
        orderBy: { createdAt: 'desc' },
        include: {
          book: true,
          user: true,
        }
      });

      if (recentJob) {
        console.log('✅ Job en cours trouvé, utilisation pour lier le livre', {
          jobId: recentJob.id,
          webhookJobId: payload.job_id,
          userId: recentJob.userId,
          bookTitle: payload.book_data?.book_title
        });
        
        // Utiliser le job existant
        existingJob = recentJob;
        
        // Mettre à jour userId pour les notifications
        userId = recentJob.userId;
      } else {
        console.log('⚠️ Aucun job en cours trouvé, création automatique');
        
        // Créer un nouveau job avec l'ID du webhook
        try {
          const newJob = await prisma.bookJob.create({
            data: {
              id: payload.job_id,
              userId: userId,
              jobType: 'BOOK_GENERATION',
              status: 'RUNNING',
              inputData: payload.book_data ? {
                title: payload.book_data.book_title,
                topic: payload.book_data.topic,
                goal: payload.book_data.goal,
              } : {}
            },
            include: {
              book: true,
              user: true,
            }
          });
          
          existingJob = newJob;
          
          console.log('✅ Job créé automatiquement', { 
            jobId: newJob.id, 
            userId: newJob.userId 
          });
        } catch (createError) {
          console.error('❌ Erreur lors de la création du job:', createError);
          processedWebhooks.delete(idempotencyKey);
          return NextResponse.json(
            { 
              error: 'Failed to create job', 
              message: createError instanceof Error ? createError.message : 'Unknown error',
              job_id: payload.job_id 
            },
            { status: 500 }
          );
        }
      }
    }

    // 7. Traitement selon le statut
    let result;
    if (payload.status === 'completed') {
      if (!payload.book_data) {
        console.error('❌ book_data manquant pour un statut completed');
        processedWebhooks.delete(idempotencyKey);
        return NextResponse.json(
          { error: 'book_data is required for completed status' },
          { status: 400 }
        );
      }
      result = await handleBookCompletion(payload, existingJob);
    } else if (payload.status === 'failed') {
      result = await handleBookFailure(payload, existingJob);
    } else {
      console.error('❌ Statut inconnu', { status: payload.status });
      processedWebhooks.delete(idempotencyKey);
      return NextResponse.json(
        { error: 'Invalid status', message: 'Status must be "completed" or "failed"' },
        { status: 400 }
      );
    }

    // 8. Mettre à jour le statut de traitement
    processedWebhooks.set(idempotencyKey, {
      timestamp: Date.now(),
      status: 'completed'
    });

    const processingTime = Date.now() - startTime;
    console.log('✅ Webhook traité avec succès', {
      job_id: payload.job_id,
      processingTimeMs: processingTime,
      status: payload.status
    });

    // 9. Réponse de succès (toujours 200 pour confirmer la réception)
    return NextResponse.json({
      success: true,
      message: 'Webhook reçu et traité avec succès',
      job_id: payload.job_id,
      processed_at: new Date().toISOString(),
      processing_time_ms: processingTime,
      result
    });

  } catch (error) {
    console.error('❌ Erreur lors du traitement du webhook:', error);

    // Nettoyer l'entrée d'idempotence en cas d'erreur
    const errorPayload = (error as any).payload;
    if (errorPayload?.job_id) {
      processedWebhooks.delete(`${errorPayload.job_id}-${errorPayload.status}`);
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  } finally {
    // Déconnexion Prisma (bonne pratique)
    await prisma.$disconnect();
  }
}

// Méthodes non autorisées
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

/**
 * Traite un livre complété avec succès
 * Utilise une transaction Prisma pour garantir l'atomicité
 */
async function handleBookCompletion(
  payload: WebhookPayload,
  existingJob: any
): Promise<{ bookId: string; chaptersCreated: number }> {
  
  console.log(`📖 Traitement du livre: ${payload.book_data!.book_title}`);
  
  const startTime = Date.now();
  
  try {
    // Sanitize les données du livre avant insertion
    const sanitizedData = sanitizeBookData(payload.book_data!);
    
    console.log('🧹 Données nettoyées:', {
      titleLength: sanitizedData.title.length,
      topicLength: sanitizedData.topic.length,
      goalLength: sanitizedData.goal.length,
      descriptionLength: sanitizedData.description.length
    });
    
    // Utiliser une transaction Prisma pour garantir l'atomicité
    const result = await prisma.$transaction(async (tx) => {
      let book;
      
      // 1. Créer ou mettre à jour le livre
      if (existingJob.bookId) {
        console.log(`🔄 Mise à jour du livre existant: ${existingJob.bookId}`);
        
        book = await tx.book.update({
          where: { id: existingJob.bookId },
          data: {
            title: sanitizedData.title,
            description: sanitizedData.description,
            topic: sanitizedData.topic,
            goal: sanitizedData.goal,
            status: 'PUBLISHED',
            publishedAt: new Date(),
          }
        });
      } else {
        console.log(`📚 Création d'un nouveau livre`);
        
        book = await tx.book.create({
          data: {
            title: sanitizedData.title,
            description: sanitizedData.description,
            topic: sanitizedData.topic,
            goal: sanitizedData.goal,
            status: 'PUBLISHED',
            publishedAt: new Date(),
            authorId: existingJob.userId,
            organizationId: existingJob.organizationId,
          }
        });
      }

      // 2. Supprimer les anciens chapitres (si mise à jour)
      if (existingJob.bookId) {
        const deletedCount = await tx.chapter.deleteMany({
          where: { bookId: book.id }
        });
        console.log(`🗑️ ${deletedCount.count} chapitres supprimés`);
      }

      // 3. Créer les nouveaux chapitres
      const chapters = payload.book_data!.chapters;
      const chaptersToCreate = chapters.map((chapter, index) => ({
        bookId: book.id,
        title: chapter.title,
        content: chapter.content,
        description: chapter.description || '',
        order: index + 1,
      }));

      await tx.chapter.createMany({
        data: chaptersToCreate
      });

      console.log(`✅ ${chapters.length} chapitres créés`);

      // 4. Mettre à jour le job comme terminé (utiliser l'ID du job existant)
      await tx.bookJob.update({
        where: { id: existingJob.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          result: {
            bookId: book.id,
            title: payload.book_data!.book_title,
            chaptersCount: chapters.length,
            wordCount: payload.book_data!.word_count,
            generatedAt: payload.book_data!.generated_at,
            webhookJobId: payload.job_id, // Garder une trace de l'ID du webhook
          },
          bookId: book.id,
        }
      });

      return {
        bookId: book.id,
        chaptersCreated: chapters.length,
        wordCount: payload.book_data!.word_count
      };
    });

    // 5. Créer une notification pour l'utilisateur (hors transaction)
    await createUserNotification(
      existingJob.userId,
      'BOOK_COMPLETED',
      `Votre livre "${payload.book_data!.book_title}" a été généré avec succès !`,
      {
        bookId: result.bookId,
        jobId: payload.job_id,
        chaptersCount: result.chaptersCreated,
        wordCount: result.wordCount
      }
    );

    const processingTime = Date.now() - startTime;
    console.log(`✅ Livre créé avec succès`, {
      bookId: result.bookId,
      chaptersCreated: result.chaptersCreated,
      wordCount: result.wordCount,
      processingTimeMs: processingTime
    });

    return result;

  } catch (error) {
    console.error('❌ Erreur lors de la création du livre:', error);
    
    // Log détaillé de l'erreur
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error('Prisma error code:', error.code);
      console.error('Prisma error meta:', error.meta);
    }
    
    throw error;
  }
}

/**
 * Traite un échec de génération de livre
 */
async function handleBookFailure(
  payload: WebhookPayload,
  existingJob: any
): Promise<{ jobId: string; error: string }> {
  
  console.log(`❌ Traitement de l'échec pour le job: ${payload.job_id}`);
  
  try {
    // Mettre à jour le job comme échoué (utiliser l'ID du job existant)
    await prisma.bookJob.update({
      where: { id: existingJob.id },
      data: {
        status: 'FAILED',
        completedAt: new Date(),
        error: payload.error || 'Échec de la génération sans détails',
      }
    });

    // Créer une notification d'échec pour l'utilisateur
    await createUserNotification(
      existingJob.userId,
      'BOOK_FAILED',
      `La génération de votre livre a échoué.`,
      {
        jobId: existingJob.id,
        webhookJobId: payload.job_id,
        error: payload.error || 'Erreur inconnue',
        timestamp: payload.timestamp
      }
    );

    console.log(`✅ Échec enregistré pour le job: ${existingJob.id}`);

    return {
      jobId: existingJob.id,
      error: payload.error || 'Unknown error'
    };

  } catch (error) {
    console.error('❌ Erreur lors du traitement de l\'échec:', error);
    throw error;
  }
}

/**
 * Crée une notification pour l'utilisateur
 * ✅ Implémenté avec Prisma + Logs pour futures intégrations email/push
 */
async function createUserNotification(
  userId: string,
  type: 'BOOK_COMPLETED' | 'BOOK_FAILED' | 'BOOK_PROGRESS',
  message: string,
  metadata: Record<string, any> = {}
): Promise<void> {
  try {
    const title = 
      type === 'BOOK_COMPLETED' ? '✅ Livre terminé !' : 
      type === 'BOOK_FAILED' ? '❌ Échec de génération' : 
      '🔄 Progression';

    // ✅ Implémenté: Création en base de données avec Prisma
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        metadata,
        isRead: false,
      }
    });

    console.log('✅ Notification sauvegardée en base:', {
      id: notification.id,
      userId,
      type,
      title,
    });

    // ✅ Log structuré pour intégration future avec service d'email
    // À implémenter: Service d'envoi d'emails (SendGrid, Resend, etc.)
    console.log('📧 [Email Queue] Notification email à envoyer:', {
      userId,
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      // Pour implémenter plus tard:
      // - Récupérer l'email de l'utilisateur
      // - Créer un template email HTML
      // - Envoyer via SendGrid/Resend/AWS SES
    });

    // ✅ Log structuré pour intégration future avec push notifications
    // À implémenter: Service de push (Firebase Cloud Messaging, OneSignal, etc.)
    console.log('📱 [Push Queue] Push notification à envoyer:', {
      userId,
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      // Pour implémenter plus tard:
      // - Récupérer les tokens FCM de l'utilisateur
      // - Créer payload de notification
      // - Envoyer via Firebase/OneSignal
    });

  } catch (error) {
    console.error('⚠️ Erreur lors de la création de la notification:', error);
    // Ne pas faire échouer le webhook pour une erreur de notification
    // Les notifications sont "nice to have" mais pas critiques
  }
}