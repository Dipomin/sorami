import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const resolvedParams = await params;
    const jobId = resolvedParams.id;
    
    const job = await prisma.bookJob.findUnique({
      where: { id: jobId },
      select: {
        id: true,
        status: true,
        progress: true,
        result: true,
        error: true,
        userId: true,
      },
    });
    
    if (!job) {
      return NextResponse.json({ error: 'Job non trouvé' }, { status: 404 });
    }
    
    // Vérifier que l'utilisateur est propriétaire du job
    if (job.userId !== user.id) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }
    
    // Si le job est terminé, retourner directement
    if (job.status === 'COMPLETED' || job.status === 'FAILED') {
      return NextResponse.json({
        status: job.status,
        progress: job.progress,
        result: job.result,
        error: job.error || undefined
      });
    }
    
    // Pour les jobs en cours, vérifier le statut avec CrewAI
    // TODO: Implémenter la vérification du statut avec CrewAI
    
    return NextResponse.json({
      status: job.status,
      progress: job.progress,
      result: job.result,
      error: job.error || undefined
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération du statut du job:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}