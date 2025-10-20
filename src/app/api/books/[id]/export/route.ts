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
    const bookId = resolvedParams.id;
    
    // Récupérer le format depuis la query string
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'pdf';
    
    // Valider le format
    if (!['pdf', 'epub', 'docx'].includes(format)) {
      return NextResponse.json(
        { error: 'Format non supporté. Utilisez: pdf, epub, ou docx' },
        { status: 400 }
      );
    }
    
    // Récupérer le livre avec ses chapitres
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      include: {
        chapters: {
          orderBy: {
            order: 'asc',
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
    
    // Vérifier les permissions
    if (book.authorId !== user.id) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }
    
    // TODO: Implémenter la génération réelle des fichiers
    // Pour l'instant, retournons un fichier texte simple
    const content = generateTextContent(book);
    
    // Déterminer le type MIME selon le format
    const mimeTypes = {
      pdf: 'application/pdf',
      epub: 'application/epub+zip',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };
    
    const response = new NextResponse(content, {
      headers: {
        'Content-Type': mimeTypes[format as keyof typeof mimeTypes],
        'Content-Disposition': `attachment; filename="${book.title}.${format}"`,
      },
    });
    
    return response;
  } catch (error) {
    console.error('Erreur lors de l\'export du livre:', error);
    
    if (error instanceof Error && error.message === 'Utilisateur non authentifié') {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de l\'export du livre' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Génère le contenu texte du livre
 * TODO: Remplacer par une vraie génération PDF/EPUB/DOCX
 */
function generateTextContent(book: any): string {
  let content = `${book.title}\n`;
  content += `${'='.repeat(book.title.length)}\n\n`;
  
  if (book.description) {
    content += `${book.description}\n\n`;
  }
  
  content += `Auteur: ${book.authorId}\n`;
  content += `Date de création: ${new Date(book.createdAt).toLocaleDateString('fr-FR')}\n\n`;
  content += `${'='.repeat(50)}\n\n`;
  
  book.chapters.forEach((chapter: any, index: number) => {
    content += `Chapitre ${index + 1}: ${chapter.title}\n`;
    content += `${'-'.repeat(40)}\n\n`;
    
    // Retirer les balises HTML du contenu
    const plainText = chapter.content
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"');
    
    content += `${plainText}\n\n`;
  });
  
  return content;
}
