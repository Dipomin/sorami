import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
const ENVIRONMENT = process.env.NODE_ENV || 'development';

// Map pour suivre les jobs déjà traités (idempotence)
const processedJobs = new Map<string, number>();
const IDEMPOTENCE_WINDOW = 5 * 60 * 1000; // 5 minutes

interface BlogArticleData {
  job_id?: string;
  title: string;
  meta_description: string;
  introduction: string;
  sections: Array<{ heading: string; content: string }>;
  conclusion: string;
  tags: string[];
  main_keywords: string[];
  seo_score: number;
  word_count: number;
  readability_score: string;
  full_content: string;
  generated_at: string;
  completed_at?: string; // Optionnel - utilise timestamp si absent
}

type WebhookStatus = 'completed' | 'failed' | 'pending' | 'generating_outline' | 'writing_chapters' | 'finalizing';

interface BlogWebhookPayload {
  job_id: string;
  status: WebhookStatus;
  content_type?: 'blog';
  timestamp: string;
  environment?: 'development' | 'production';
  // Support des deux formats : 'blog_data' (ancien) et 'data' (nouveau selon doc)
  blog_data?: BlogArticleData;
  data?: BlogArticleData;
  error_message?: string;
  message?: string;
  progress?: number;
}

export async function POST(request: Request) {
  const startTime = Date.now();
  
  try {
    console.log('🎯 [Blog Webhook] Réception d\'un webhook...');

    // Vérification du secret en production
    if (ENVIRONMENT === 'production') {
      const secret = request.headers.get('X-Webhook-Secret');
      if (secret !== WEBHOOK_SECRET) {
        console.error('❌ [Blog Webhook] Secret invalide');
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    const payload: BlogWebhookPayload = await request.json();
    console.log('📦 [Blog Webhook] Payload reçu:', {
      job_id: payload.job_id,
      status: payload.status,
      has_data: !!(payload.data || payload.blog_data),
      data_keys: payload.data ? Object.keys(payload.data) : (payload.blog_data ? Object.keys(payload.blog_data) : []),
    });

    // Vérification de l'idempotence
    const lastProcessed = processedJobs.get(payload.job_id);
    if (lastProcessed && Date.now() - lastProcessed < IDEMPOTENCE_WINDOW) {
      console.log('⚠️ [Blog Webhook] Job déjà traité récemment:', payload.job_id);
      return NextResponse.json({ 
        success: true, 
        message: 'Job déjà traité' 
      });
    }

    // Récupérer le job existant
    const blogJob = await prisma.blogJob.findFirst({
      where: { externalJobId: payload.job_id },
    });

    if (!blogJob) {
      console.error('❌ [Blog Webhook] Job non trouvé:', payload.job_id);
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    if (payload.status === 'failed') {
      console.error('❌ [Blog Webhook] Génération échouée:', payload.error_message);
      
      await prisma.blogJob.update({
        where: { id: blogJob.id },
        data: {
          status: 'FAILED',
          error: payload.error_message || 'Erreur inconnue',
          completedAt: new Date(),
        },
      });

      return NextResponse.json({ 
        success: true,
        message: 'Job status updated to failed'
      });
    }

    // Normaliser les données (supporter 'blog_data' et 'data')
    const articleData = payload.blog_data || payload.data;

    // Si status = 'completed' mais pas de données, c'est une mise à jour de progression
    if (payload.status === 'completed' && !articleData) {
      console.warn('⚠️ [Blog Webhook] Status completed sans données - attente des données');
      
      await prisma.blogJob.update({
        where: { id: blogJob.id },
        data: {
          status: 'FINALIZING',
          progress: payload.progress || 95,
          message: payload.message || 'Finalisation en cours...',
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({ 
        success: true,
        message: 'Job status updated - waiting for article data'
      });
    }

    // Si c'est un statut de progression (generating_outline, writing_chapters, etc.)
    const progressStatuses: WebhookStatus[] = ['pending', 'generating_outline', 'writing_chapters', 'finalizing'];
    if (progressStatuses.includes(payload.status)) {
      console.log(`📊 [Blog Webhook] Mise à jour de progression: ${payload.status}`);
      
      const statusMap: Record<string, any> = {
        'generating_outline': { status: 'GENERATING_OUTLINE', progress: 25 },
        'writing_chapters': { status: 'WRITING_CHAPTERS', progress: 60 },
        'finalizing': { status: 'FINALIZING', progress: 90 },
      };

      const statusUpdate = statusMap[payload.status] || { status: 'PENDING', progress: 0 };

      await prisma.blogJob.update({
        where: { id: blogJob.id },
        data: {
          ...statusUpdate,
          progress: payload.progress || statusUpdate.progress,
          message: payload.message || `Étape: ${payload.status}`,
          currentStep: payload.status,
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({ 
        success: true,
        message: 'Progress update received'
      });
    }

    // À ce stade, on doit avoir des données pour un job completed
    if (!articleData) {
      console.error('❌ [Blog Webhook] Status completed mais données manquantes');
      return NextResponse.json(
        { error: 'Missing article data for completed status' },
        { status: 400 }
      );
    }

    console.log('✅ [Blog Webhook] Création de l\'article...');

    // Utiliser completed_at s'il existe, sinon timestamp du payload
    const completedAtDate = articleData.completed_at 
      ? new Date(articleData.completed_at) 
      : new Date(payload.timestamp);

    // Transaction pour créer l'article
    const result = await prisma.$transaction(async (tx) => {
      // Créer l'article
      const blogArticle = await tx.blogArticle.create({
        data: {
          title: articleData.title,
          topic: (blogJob.inputData as any).topic,
          goal: (blogJob.inputData as any).goal || '',
          metaDescription: articleData.meta_description,
          introduction: articleData.introduction,
          conclusion: articleData.conclusion,
          fullContent: articleData.full_content,
          seoScore: articleData.seo_score,
          wordCount: articleData.word_count,
          readabilityScore: articleData.readability_score,
          targetWordCount: (blogJob.inputData as any).target_word_count || 2000,
          tags: articleData.tags,
          mainKeywords: articleData.main_keywords,
          sections: articleData.sections as any,
          status: 'REVIEW',
          visibility: 'PRIVATE',
          authorId: blogJob.userId,
          organizationId: blogJob.organizationId,
          generatedAt: new Date(articleData.generated_at),
          completedAt: completedAtDate,
        },
      });

      // Mettre à jour le job
      await tx.blogJob.update({
        where: { id: blogJob.id },
        data: {
          status: 'COMPLETED',
          progress: 100,
          result: articleData as any,
          blogArticleId: blogArticle.id,
          completedAt: new Date(),
        },
      });

      return blogArticle;
    });

    // Marquer le job comme traité
    processedJobs.set(payload.job_id, Date.now());
    
    // Nettoyer les anciens jobs de la map
    setTimeout(() => {
      const cutoff = Date.now() - IDEMPOTENCE_WINDOW;
      processedJobs.forEach((timestamp, jobId) => {
        if (timestamp < cutoff) {
          processedJobs.delete(jobId);
        }
      });
    }, 1000);

    const duration = Date.now() - startTime;
    console.log(`✅ [Blog Webhook] Article créé avec succès en ${duration}ms:`, {
      article_id: result.id,
      title: result.title,
      word_count: result.wordCount,
      seo_score: result.seoScore,
    });

    return NextResponse.json({
      success: true,
      article_id: result.id,
      title: result.title,
      processing_time_ms: duration,
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ [Blog Webhook] Erreur après ${duration}ms:`, error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
