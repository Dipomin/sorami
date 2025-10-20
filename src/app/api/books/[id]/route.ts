import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser, requireAuth } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const resolvedParams = await params;
    const bookId = resolvedParams.id;
    
    // Récupérer le livre avec ses chapitres
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      include: {
        chapters: {
          orderBy: {
            order: 'asc',
          },
        },
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            chapters: true,
          },
        },
      },
    });
    
    if (!book) {
      return NextResponse.json(
        { error: 'Livre non trouvé' },
        { status: 404 }
      );
    }
    
    // Vérifier les permissions : propriétaire ou livre public
    if (book.visibility !== 'PUBLIC' && (!user || book.authorId !== user.id)) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(book);
  } catch (error) {
    console.error('Erreur lors de la récupération du livre:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du livre' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const resolvedParams = await params;
    const bookId = resolvedParams.id;
    const body = await request.json();
    
    // Vérifier que l'utilisateur possède le livre
    const existingBook = await prisma.book.findUnique({
      where: { id: bookId },
      select: { authorId: true },
    });
    
    if (!existingBook) {
      return NextResponse.json(
        { error: 'Livre non trouvé' },
        { status: 404 }
      );
    }
    
    if (existingBook.authorId !== user.id) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }
    
    // Mettre à jour le livre
    const updatedBook = await prisma.book.update({
      where: { id: bookId },
      data: {
        title: body.title,
        description: body.description,
        topic: body.topic,
        goal: body.goal,
        genre: body.genre,
        targetAudience: body.targetAudience,
        status: body.status,
        visibility: body.visibility,
        content: body.content,
        outline: body.outline,
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
    
    return NextResponse.json(updatedBook);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du livre:', error);
    
    if (error instanceof Error && error.message === 'Utilisateur non authentifié') {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du livre' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const resolvedParams = await params;
    const bookId = resolvedParams.id;
    
    // Vérifier que l'utilisateur possède le livre
    const existingBook = await prisma.book.findUnique({
      where: { id: bookId },
      select: { authorId: true },
    });
    
    if (!existingBook) {
      return NextResponse.json(
        { error: 'Livre non trouvé' },
        { status: 404 }
      );
    }
    
    if (existingBook.authorId !== user.id) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }
    
    // Supprimer le livre (et ses chapitres via cascade)
    await prisma.book.delete({
      where: { id: bookId },
    });
    
    return NextResponse.json({ message: 'Livre supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du livre:', error);
    
    if (error instanceof Error && error.message === 'Utilisateur non authentifié') {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du livre' },
      { status: 500 }
    );
  }
}