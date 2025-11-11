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
        bookId: true, // ✅ Ajout du bookId
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
        error: job.error || undefined,
        bookId: job.bookId || undefined, // ✅ Retourner le bookId
      });
    }
    
    // Pour les jobs en cours, vérifier le statut avec CrewAI backend
    // ✅ Implémenté: Polling du backend Flask pour mise à jour du statut
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:9000';
      const token = request.headers.get('authorization')?.split(' ')[1];
      
      const backendResponse = await fetch(
        `${backendUrl}/api/jobs/${jobId}/status`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (backendResponse.ok) {
        const backendData = await backendResponse.json();
        
        // Mettre à jour le job dans Prisma si le statut a changé
        if (backendData.status !== job.status || backendData.progress !== job.progress) {
          await prisma.bookJob.update({
            where: { id: jobId },
            data: {
              status: backendData.status,
              progress: backendData.progress || job.progress,
              error: backendData.error || job.error,
            },
          });
        }
        
        return NextResponse.json({
          status: backendData.status,
          progress: backendData.progress || job.progress,
          result: backendData.result || job.result,
          error: backendData.error || undefined,
          bookId: job.bookId || undefined, // ✅ Retourner le bookId
        });
      }
    } catch (backendError) {
      console.error('⚠️ Backend CrewAI non disponible, utilisation des données Prisma:', backendError);
      // Fallback: retourner les données de Prisma si le backend est indisponible
    }
    
    return NextResponse.json({
      status: job.status,
      progress: job.progress,
      result: job.result,
      error: job.error || undefined,
      bookId: job.bookId || undefined, // ✅ Retourner le bookId
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