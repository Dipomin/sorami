import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

const CREWAI_API_URL = process.env.CREWAI_API_URL || 'http://localhost:9006';

export async function POST(request: Request) {
  try {
    // Authentification requise
    const user = await requireAuth();

    // Obtenir le token JWT Clerk pour l'envoyer au backend
    const { getToken } = await auth();
    const token = await getToken();

    if (!token) {
      return NextResponse.json(
        { error: 'Token d\'authentification manquant' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { topic, goal, target_word_count = 2000 } = body;

    if (!topic) {
      return NextResponse.json(
        { error: 'Le sujet est requis' },
        { status: 400 }
      );
    }

    // Validation du nombre de mots
    if (target_word_count < 800 || target_word_count > 5000) {
      return NextResponse.json(
        { error: 'Le nombre de mots doit être entre 800 et 5000' },
        { status: 400 }
      );
    }

    // Créer d'abord un BlogJob dans la base de données
    const blogJob = await prisma.blogJob.create({
      data: {
        jobType: 'BLOG_GENERATION',
        status: 'PENDING',
        progress: 0,
        inputData: {
          topic,
          goal: goal || '',
          target_word_count,
        },
        userId: user.id,
        organizationId: user.organizationMemberships[0]?.organizationId || null,
      },
    });

    // Essayer d'appeler l'API CrewAI backend avec le token
    try {
      const response = await fetch(`${CREWAI_API_URL}/api/blog/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // ✅ Token Clerk inclus
        },
        body: JSON.stringify({
          topic,
          goal: goal || undefined,
          target_word_count,
        }),
        signal: AbortSignal.timeout(10000), // Timeout de 10 secondes
      });

      if (response.ok) {
        const data = await response.json();

        // Mettre à jour le job avec l'ID externe
        await prisma.blogJob.update({
          where: { id: blogJob.id },
          data: {
            externalJobId: data.job_id,
          },
        });

        return NextResponse.json({
          job_id: data.job_id,
          status: data.status,
          message: data.message,
          created_at: data.created_at,
          internal_job_id: blogJob.id,
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Erreur CrewAI:', errorData);
        
        // Mettre à jour le statut du job
        await prisma.blogJob.update({
          where: { id: blogJob.id },
          data: {
            status: 'FAILED',
            error: `Backend error: ${errorData.error || 'Service indisponible'}`,
          },
        });

        return NextResponse.json(
          { 
            error: 'Erreur lors de la génération de l\'article',
            details: errorData.error || 'Service indisponible',
            job_id: blogJob.id,
          },
          { status: response.status }
        );
      }
    } catch (fetchError) {
      // Si le backend n'est pas disponible, créer un job en mode "simulation"
      console.warn('Backend CrewAI non disponible:', fetchError);
      
      // Mettre à jour le job avec un message d'avertissement
      await prisma.blogJob.update({
        where: { id: blogJob.id },
        data: {
          status: 'PENDING',
          message: '⚠️ Backend non disponible. Le job sera traité dès que le backend sera en ligne.',
          error: 'Backend CrewAI non disponible',
        },
      });

      return NextResponse.json({
        job_id: blogJob.id,
        status: 'pending',
        message: '⚠️ Job créé localement. Backend CrewAI non disponible.',
        warning: 'Le backend de génération n\'est pas accessible. L\'article sera généré dès que le service sera disponible.',
        created_at: blogJob.createdAt.toISOString(),
        internal_job_id: blogJob.id,
      });
    }
  } catch (error) {
    console.error('Erreur lors de la génération de l\'article:', error);
    return NextResponse.json(
      { 
        error: 'Erreur interne du serveur',
        message: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}
