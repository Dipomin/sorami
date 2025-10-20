import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { title, topic, goal, chapters = [], bookId } = body;
    
    // Validation des données
    if (!title || !topic || !goal) {
      return NextResponse.json(
        { error: 'Le sujet et l\'objectif sont requis' },
        { status: 400 }
      );
    }
    
    // Si un bookId est fourni, vérifier que l'utilisateur en est propriétaire
    if (bookId) {
      const book = await prisma.book.findUnique({
        where: { id: bookId },
        select: { authorId: true },
      });
      
      if (!book || book.authorId !== user.id) {
        return NextResponse.json(
          { error: 'Livre non trouvé ou accès non autorisé' },
          { status: 403 }
        );
      }
    }
    
    // Créer un job de génération
    const job = await prisma.bookJob.create({
      data: {
        jobType: 'BOOK_GENERATION',
        status: 'PENDING',
        priority: 'NORMAL',
        userId: user.id,
        organizationId: user.organizationMemberships[0]?.organizationId || null,
        bookId: bookId || null,
        inputData: {
          title,
          topic,
          goal,
          chapters,
          totalChapters: chapters.length,
          estimatedDuration: chapters.length * 5, // 5 minutes par chapitre
        },
      },
    });
    
    // Appeler l'API CrewAI
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9006';
    
    try {
      const webhookUrl = process.env.NEXT_PUBLIC_WEBHOOK_URL || 'http://localhost:3000/api/webhooks/book-completion';
      
      const response = await fetch(`${apiUrl}/api/books/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          topic,
          goal,
          chapters,
          jobId: job.id,
          userId: user.id,
          webhookUrl: webhookUrl,
          metadata: {
            organizationId: user.organizationMemberships[0]?.organizationId || null
          }
        }),
      });
      
      if (response.ok) {
        // Mettre à jour le statut du job
        await prisma.bookJob.update({
          where: { id: job.id },
          data: {
            status: 'RUNNING',
            startedAt: new Date(),
          },
        });
        
        return NextResponse.json({
          jobId: job.id,
          status: 'RUNNING',
          message: 'Génération en cours...',
        });
      } else {
        // Marquer le job comme échoué
        await prisma.bookJob.update({
          where: { id: job.id },
          data: {
            status: 'FAILED',
            error: 'Erreur lors de l\'appel à l\'API de génération',
            completedAt: new Date(),
          },
        });
        
        return NextResponse.json(
          { error: 'Erreur lors du démarrage de la génération' },
          { status: 500 }
        );
      }
    } catch (apiError) {
      console.error('Erreur API CrewAI:', apiError);
      
      // Déterminer le type d'erreur pour un meilleur diagnostic
      let errorMessage = 'Service de génération non disponible';
      let errorDetails = '';
      
      if (apiError instanceof Error) {
        if (apiError.message.includes('ECONNRESET') || apiError.message.includes('ECONNREFUSED')) {
          errorDetails = `Impossible de se connecter au service CrewAI sur ${apiUrl}`;
        } else if (apiError.message.includes('fetch failed')) {
          errorDetails = `Échec de la connexion au service CrewAI`;
        } else {
          errorDetails = apiError.message;
        }
      }
      
      // Marquer le job comme échoué avec des détails
      await prisma.bookJob.update({
        where: { id: job.id },
        data: {
          status: 'FAILED',
          error: `${errorMessage}: ${errorDetails}`,
          completedAt: new Date(),
        },
      });
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: errorDetails,
          apiUrl: apiUrl,
          suggestion: 'Vérifiez que le service CrewAI est démarré et accessible'
        },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Erreur lors de la génération:', error);
    
    if (error instanceof Error && error.message === 'Utilisateur non authentifié') {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la génération' },
      { status: 500 }
    );
  }
}