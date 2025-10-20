import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const data = await request.json();
    
    const { bookId, organizationId, jobType, inputData, priority = 'NORMAL' } = data;
    
    // Vérifier que le livre existe et appartient à l'utilisateur
    const book = await prisma.book.findUnique({
      where: { id: bookId },
    });
    
    if (!book) {
      return NextResponse.json({ error: 'Livre non trouvé' }, { status: 404 });
    }
    
    if (book.authorId !== user.id) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }
    
    const job = await prisma.bookJob.create({
      data: {
        bookId,
        organizationId,
        userId: user.id,
        jobType,
        priority,
        inputData,
        status: 'PENDING'
      },
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
    
    return NextResponse.json(job);
    
  } catch (error) {
    console.error('Erreur lors de la création du job:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('bookId');
    const userId = searchParams.get('userId');
    
    const whereClause: any = {};
    
    // Si bookId est spécifié, filtrer par livre
    if (bookId) {
      // Vérifier que le livre appartient à l'utilisateur
      const book = await prisma.book.findUnique({
        where: { id: bookId },
      });
      
      if (!book || book.authorId !== user.id) {
        return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
      }
      
      whereClause.bookId = bookId;
    } else {
      // Sinon, filtrer par utilisateur connecté
      whereClause.userId = user.id;
    }
    
    const jobs = await prisma.bookJob.findMany({
      where: whereClause,
      include: {
        book: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json(jobs);
    
  } catch (error) {
    console.error('Erreur lors de la récupération des jobs:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}