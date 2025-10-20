import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser, requireAuth } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      // Retourner une liste vide pour les utilisateurs non connectés
      return NextResponse.json({ books: [] });
    }
    
    // Récupérer tous les livres de l'utilisateur
    const books = await prisma.book.findMany({
      where: {
        authorId: user.id,
      },
      include: {
        chapters: {
          orderBy: {
            order: 'asc',
          },
        },
        _count: {
          select: {
            chapters: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json({ books });
  } catch (error) {
    console.error('Erreur lors de la récupération des livres:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des livres' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    
    const body = await request.json();
    const { title, description, topic, goal, genre, targetAudience, chapters = [] } = body;
    
    // Validation des données
    if (!title || !description || !topic || !goal) {
      return NextResponse.json(
        { error: 'Le titre, la description, le sujet et l\'objectif sont requis' },
        { status: 400 }
      );
    }
    
    // Créer le livre avec ses chapitres
    const book = await prisma.book.create({
      data: {
        title,
        description,
        topic,
        goal,
        genre: genre || 'FICTION',
        targetAudience: targetAudience || 'GENERAL',
        status: 'DRAFT',
        authorId: user.id,
        organizationId: user.organizationMemberships[0]?.organizationId || null,
        chapters: {
          create: chapters.map((chapter: any, index: number) => ({
            title: chapter.title || `Chapitre ${index + 1}`,
            content: chapter.content || '',
            order: index + 1,
            status: 'DRAFT',
          })),
        },
      },
      include: {
        chapters: {
          orderBy: {
            order: 'asc',
          },
        },
        _count: {
          select: {
            chapters: true,
          },
        },
      },
    });
    
    return NextResponse.json(book, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du livre:', error);
    
    if (error instanceof Error && error.message === 'Utilisateur non authentifié') {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la création du livre' },
      { status: 500 }
    );
  }
}