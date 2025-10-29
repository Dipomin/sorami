import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

const CREWAI_API_URL = process.env.CREWAI_API_URL || 'http://localhost:9006';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    await requireAuth();

    // Obtenir le token JWT Clerk
    const { getToken } = await auth();
    const token = await getToken();

    const { jobId } = await params;

    // Récupérer le job depuis la base de données
    // Le jobId est maintenant l'ID Prisma directement
    const blogJob = await prisma.blogJob.findUnique({
      where: { id: jobId },
    });

    if (!blogJob) {
      return NextResponse.json(
        { error: 'Job non trouvé' },
        { status: 404 }
      );
    }

    // Essayer de récupérer le statut depuis l'API CrewAI avec token
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${CREWAI_API_URL}/api/blog/status/${jobId}`, {
        headers,
        signal: AbortSignal.timeout(5000), // Timeout de 5 secondes
      });

      if (response.ok) {
        const data = await response.json();

        // Mettre à jour le job dans la base de données
        await prisma.blogJob.update({
          where: { id: blogJob.id },
          data: {
            status: data.status.toUpperCase() as any,
            progress: data.progress || 0,
            message: data.message,
            currentStep: data.status,
            updatedAt: new Date(),
          },
        });

        return NextResponse.json(data);
      }
    } catch (fetchError) {
      // Si le backend n'est pas disponible, utiliser les données locales
      console.warn('Backend CrewAI non disponible, utilisation des données locales:', fetchError);
    }

    // Fallback: utiliser les données de la base de données
    const statusResponse = {
      job_id: blogJob.id, // ✨ Utiliser l'ID Prisma
      status: blogJob.status.toLowerCase(),
      progress: blogJob.progress,
      message: blogJob.message || 'Traitement en cours...',
      current_step: blogJob.currentStep,
      created_at: blogJob.createdAt.toISOString(),
      updated_at: blogJob.updatedAt.toISOString(),
      started_at: blogJob.startedAt?.toISOString(),
      completed_at: blogJob.completedAt?.toISOString(),
    };

    return NextResponse.json(statusResponse);
  } catch (error) {
    console.error('Erreur lors de la récupération du statut:', error);
    return NextResponse.json(
      { 
        error: 'Erreur interne du serveur',
        message: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}
