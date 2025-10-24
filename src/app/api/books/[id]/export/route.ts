import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '@/lib/auth';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import nodepub from 'nodepub';

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
    
    // ✅ Implémenté: Génération des fichiers selon le format demandé
    let content: Buffer | string;
    let mimeType: string;
    
    switch (format) {
      case 'pdf':
        content = await generatePdfContent(book);
        mimeType = 'application/pdf';
        break;
      case 'epub':
        content = await generateEpubContent(book);
        mimeType = 'application/epub+zip';
        break;
      case 'docx':
        content = await generateDocxContent(book);
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
      default:
        // Fallback vers texte simple
        content = generateTextContent(book);
        mimeType = 'text/plain';
    }
    
    // Convertir Buffer en Uint8Array pour NextResponse
    let bodyContent: string | Uint8Array<ArrayBuffer>;
    let contentLength: number;
    
    if (content instanceof Buffer) {
      bodyContent = new Uint8Array(content) as Uint8Array<ArrayBuffer>;
      contentLength = content.byteLength;
    } else {
      const textContent = content as string;
      bodyContent = textContent;
      contentLength = new TextEncoder().encode(textContent).length;
    }

    const response = new NextResponse(bodyContent as BodyInit, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${sanitizeFilename(book.title)}.${format}"`,
        'Content-Length': String(contentLength),
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

// ============================================================================
// HELPERS DE GÉNÉRATION DE FICHIERS
// ============================================================================

/**
 * Nettoie un nom de fichier pour éviter les caractères invalides
 */
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[<>:"/\\|?*]/g, '') // Caractères invalides Windows/Unix
    .replace(/\s+/g, '_') // Espaces → underscores
    .substring(0, 200); // Limite de longueur
}

/**
 * Extrait le texte brut d'un contenu HTML
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
}

/**
 * ✅ Génère le contenu texte du livre
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
    content += `${stripHtml(chapter.content)}\n\n`;
  });
  
  return content;
}

/**
 * ✅ Génère un PDF professionnel avec jsPDF
 */
async function generatePdfContent(book: any): Promise<Buffer> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Fonction helper pour ajouter une nouvelle page si nécessaire
  const checkPageBreak = (lineHeight: number) => {
    if (yPosition + lineHeight > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // Titre du livre
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  const titleLines = doc.splitTextToSize(book.title, maxWidth);
  titleLines.forEach((line: string) => {
    checkPageBreak(10);
    doc.text(line, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;
  });
  yPosition += 10;

  // Description
  if (book.description) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'italic');
    const descLines = doc.splitTextToSize(stripHtml(book.description), maxWidth);
    descLines.forEach((line: string) => {
      checkPageBreak(7);
      doc.text(line, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 7;
    });
    yPosition += 10;
  }

  // Métadonnées
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  checkPageBreak(5);
  doc.text(`Date de création: ${new Date(book.createdAt).toLocaleDateString('fr-FR')}`, margin, yPosition);
  yPosition += 5;
  doc.text(`Nombre de chapitres: ${book.chapters.length}`, margin, yPosition);
  yPosition += 15;

  // Ligne de séparation
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // Chapitres
  book.chapters.forEach((chapter: any, index: number) => {
    // Titre du chapitre
    checkPageBreak(15);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    const chapterTitle = `Chapitre ${index + 1}: ${chapter.title}`;
    doc.text(chapterTitle, margin, yPosition);
    yPosition += 10;

    // Contenu du chapitre
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const content = stripHtml(chapter.content);
    const contentLines = doc.splitTextToSize(content, maxWidth);
    
    contentLines.forEach((line: string) => {
      checkPageBreak(6);
      doc.text(line, margin, yPosition);
      yPosition += 6;
    });
    
    yPosition += 10;
  });

  // Convertir en Buffer
  const pdfArrayBuffer = doc.output('arraybuffer');
  return Buffer.from(pdfArrayBuffer);
}

/**
 * ✅ Génère un EPUB professionnel avec nodepub
 */
async function generateEpubContent(book: any): Promise<Buffer> {
  const epub = nodepub.document({
    id: book.id,
    title: book.title,
    author: 'Sorami AI',
    description: stripHtml(book.description || ''),
    publisher: 'Sorami',
    published: new Date(book.createdAt).toISOString(),
  });

  // Ajouter CSS personnalisé
  epub.addCSS(`
    body { 
      font-family: Georgia, serif; 
      line-height: 1.6; 
      margin: 2em;
    }
    h1 { 
      color: #333; 
      margin-top: 2em; 
      margin-bottom: 1em;
      font-size: 1.8em;
    }
    p { 
      text-align: justify; 
      margin-bottom: 1em;
    }
  `);

  // Ajouter les chapitres
  book.chapters.forEach((chapter: any, index: number) => {
    epub.addSection(
      `Chapitre ${index + 1}`,
      `<h1>${chapter.title}</h1>${chapter.content}`,
      false, // excludeFromContents
      false  // isFrontMatter
    );
  });

  // Générer l'EPUB
  return new Promise((resolve, reject) => {
    epub.getFilesForEPUB((err: Error | null, files: any) => {
      if (err) {
        reject(err);
        return;
      }
      
      epub.writeEPUB(
        (epubErr: Error | null, content: Buffer) => {
          if (epubErr) {
            reject(epubErr);
            return;
          }
          resolve(content);
        },
        '/tmp', // Dossier temporaire (non utilisé avec writeEPUB callback)
        `${book.id}`, // Nom de fichier
        files
      );
    });
  });
}

/**
 * ✅ Génère un DOCX professionnel avec docx.js
 */
async function generateDocxContent(book: any): Promise<Buffer> {
  const sections = [];

  // Titre du document
  sections.push(
    new Paragraph({
      text: book.title,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  // Description
  if (book.description) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: stripHtml(book.description),
            italics: true,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      })
    );
  }

  // Métadonnées
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Date de création: ${new Date(book.createdAt).toLocaleDateString('fr-FR')}`,
          size: 20,
        }),
      ],
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Nombre de chapitres: ${book.chapters.length}`,
          size: 20,
        }),
      ],
      spacing: { after: 600 },
    })
  );

  // Chapitres
  book.chapters.forEach((chapter: any, index: number) => {
    // Titre du chapitre
    sections.push(
      new Paragraph({
        text: `Chapitre ${index + 1}: ${chapter.title}`,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      })
    );

    // Contenu du chapitre (séparer par paragraphes)
    const content = stripHtml(chapter.content);
    const paragraphs = content.split('\n\n').filter(p => p.trim());
    
    paragraphs.forEach(para => {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: para.trim(),
              size: 24,
            }),
          ],
          spacing: { after: 200 },
          alignment: AlignmentType.JUSTIFIED,
        })
      );
    });
  });

  // Créer le document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: sections,
      },
    ],
  });

  // Générer le buffer
  const buffer = await Packer.toBuffer(doc);
  return Buffer.from(buffer);
}
