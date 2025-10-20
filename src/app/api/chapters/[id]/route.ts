import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '@/lib/auth';

const prisma = new PrismaClient();

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const resolvedParams = await params;
    const chapterId = resolvedParams.id;
    const data = await request.json();
    
    const { title, content, order } = data;
    
    // Vérifier que le chapitre existe et appartient à un livre de l'utilisateur
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: {
        book: {
          select: {
            authorId: true,
          },
        },
      },
    });
    
    if (!chapter) {
      return NextResponse.json({ error: 'Chapitre non trouvé' }, { status: 404 });
    }
    
    if (chapter.book.authorId !== user.id) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }
    
    const updatedChapter = await prisma.chapter.update({
      where: { id: chapterId },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(order !== undefined && { order }),
      },
    });
    
    return NextResponse.json(updatedChapter);
    
  } catch (error) {
    console.error('Erreur lors de la mise à jour du chapitre:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const resolvedParams = await params;
    const chapterId = resolvedParams.id;
    
    // Vérifier que le chapitre existe et appartient à un livre de l'utilisateur
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: {
        book: {
          select: {
            authorId: true,
          },
        },
      },
    });
    
    if (!chapter) {
      return NextResponse.json({ error: 'Chapitre non trouvé' }, { status: 404 });
    }
    
    if (chapter.book.authorId !== user.id) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }
    
    await prisma.chapter.delete({
      where: { id: chapterId },
    });
    
    return NextResponse.json({ message: 'Chapitre supprimé avec succès' });
    
  } catch (error) {
    console.error('Erreur lors de la suppression du chapitre:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}