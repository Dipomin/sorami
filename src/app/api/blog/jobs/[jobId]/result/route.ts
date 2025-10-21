import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const CREWAI_API_URL = process.env.CREWAI_API_URL || 'http://localhost:9006';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    await requireAuth();

    const { jobId } = await params;

    // Récupérer le job depuis la base de données
    const blogJob = await prisma.blogJob.findFirst({
      where: { externalJobId: jobId },
      include: {
        blogArticle: true,
      },
    });

    if (!blogJob) {
      return NextResponse.json(
        { error: 'Job non trouvé' },
        { status: 404 }
      );
    }

    // Si le job est terminé et qu'on a un article, retourner directement
    if (blogJob.status === 'COMPLETED' && blogJob.blogArticle) {
      return NextResponse.json({
        success: true,
        blog_article: {
          id: blogJob.blogArticle.id,
          title: blogJob.blogArticle.title,
          topic: blogJob.blogArticle.topic,
          content: blogJob.blogArticle.fullContent,
          sections: blogJob.blogArticle.sections,
          seo_score: blogJob.blogArticle.seoScore,
          word_count: blogJob.blogArticle.wordCount,
          readability_score: blogJob.blogArticle.readabilityScore,
          tags: blogJob.blogArticle.tags,
          main_keywords: blogJob.blogArticle.mainKeywords,
          meta_description: blogJob.blogArticle.metaDescription,
        },
      });
    }

    // Essayer de récupérer le résultat depuis l'API CrewAI
    try {
      const response = await fetch(`${CREWAI_API_URL}/api/blog/result/${jobId}`, {
        signal: AbortSignal.timeout(5000), // Timeout de 5 secondes
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
    } catch (fetchError) {
      console.warn('Backend CrewAI non disponible, vérification des données locales:', fetchError);
    }

    // Si le job n'est pas terminé
    if (blogJob.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Article pas encore terminé', status: blogJob.status },
        { status: 400 }
      );
    }

    // Si on a un résultat dans le job mais pas d'article lié
    if (blogJob.result) {
      return NextResponse.json({
        success: true,
        blog_article: blogJob.result,
      });
    }

    return NextResponse.json(
      { error: 'Résultat non disponible' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Erreur lors de la récupération du résultat:', error);
    return NextResponse.json(
      { 
        error: 'Erreur interne du serveur',
        message: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}
