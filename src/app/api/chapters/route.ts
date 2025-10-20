import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const data = await request.json();
    
    const { bookId, title, content, order } = data;
    
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
    
    const chapter = await prisma.chapter.create({
      data: {
        bookId,
        title,
        content,
        order,
      },
    });
    
    return NextResponse.json(chapter);
    
  } catch (error) {
    console.error('Erreur lors de la création du chapitre:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}