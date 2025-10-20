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
    
    // Récupérer le job avec vérification de propriété
    const job = await prisma.bookJob.findUnique({
      where: { id: jobId },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });
    
    if (!job) {
      return NextResponse.json(
        { error: 'Job non trouvé' },
        { status: 404 }
      );
    }
    
    // Vérifier que l'utilisateur possède ce job
    if (job.userId !== user.id) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(job);
  } catch (error) {
    console.error('Erreur lors de la récupération du job:', error);
    
    if (error instanceof Error && error.message === 'Utilisateur non authentifié') {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du job' },
      { status: 500 }
    );
  }
}