import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '@/lib/auth';

const prisma = new PrismaClient();

/**
 * POST /api/books/[id]/export-formatted
 * 
 * Exporte le livre formaté avec pagination selon le format de page choisi (A4, A5)
 * Retourne le HTML paginé prêt pour la conversion en PDF/DOCX/EPUB côté client
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const resolvedParams = await params;
    const bookId = resolvedParams.id;
    const body = await request.json();
    
    const { pageFormat = 'A4' } = body;

    console.log('📄 [Export Formatted API] Début de l\'export formaté paginé');
    console.log('📚 [Export Formatted API] Book ID:', bookId);
    console.log('📐 [Export Formatted API] Format de page:', pageFormat);

    // Récupérer le livre avec son contenu formaté
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!book) {
      console.error('❌ [Export Formatted API] Livre non trouvé:', bookId);
      return NextResponse.json(
        { error: 'Livre non trouvé' },
        { status: 404 }
      );
    }

    if (book.authorId !== user.id) {
      console.error('❌ [Export Formatted API] Accès non autorisé');
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    if (!book.content) {
      console.error('❌ [Export Formatted API] Aucun contenu formaté disponible');
      return NextResponse.json(
        { error: 'Le livre n\'a pas encore été formaté. Utilisez d\'abord la fonction "Mise en forme pro (IA)".' },
        { status: 400 }
      );
    }

    console.log('✅ [Export Formatted API] Livre trouvé:', book.title);
    console.log('📊 [Export Formatted API] Taille du contenu:', book.content.length, 'caractères');

    // Définir les dimensions selon le format
    const pageFormats: Record<string, { width: string; height: string; margin: string }> = {
      A4: {
        width: '210mm',
        height: '297mm',
        margin: '25mm',
      },
      A5: {
        width: '148mm',
        height: '210mm',
        margin: '20mm',
      },
    };

    const format = pageFormats[pageFormat] || pageFormats.A4;

    // Créer le HTML paginé avec les styles CSS pour impression
    const paginatedHTML = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${book.title}</title>
  <style>
    @page {
      size: ${format.width} ${format.height};
      margin: ${format.margin};
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Garamond', 'Times New Roman', serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #1a1a1a;
      background: white;
    }

    .page {
      page-break-after: always;
      position: relative;
      width: 100%;
      min-height: calc(${format.height} - 2 * ${format.margin});
      padding: 20pt;
    }

    .page:last-child {
      page-break-after: avoid;
    }

    /* Page de titre */
    .title-page {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      height: 100%;
      padding: 40pt;
    }

    .title-page h1 {
      font-size: 24pt;
      font-weight: bold;
      margin-bottom: 20pt;
      text-transform: uppercase;
      letter-spacing: 2pt;
    }

    .title-page .author {
      font-size: 14pt;
      margin-top: 20pt;
      font-style: italic;
    }

    .title-page .description {
      font-size: 11pt;
      margin-top: 30pt;
      max-width: 80%;
      line-height: 1.5;
    }

    /* Numérotation des pages */
    .page-number {
      position: absolute;
      bottom: 10pt;
      right: 20pt;
      font-size: 10pt;
      color: #666;
    }

    /* En-têtes */
    h1, h2, h3, h4, h5, h6 {
      font-family: 'Garamond', 'Times New Roman', serif;
      font-weight: bold;
      margin-top: 24pt;
      margin-bottom: 12pt;
      page-break-after: avoid;
      color: #1a1a1a;
    }

    h1 {
      font-size: 20pt;
      text-align: center;
      text-transform: uppercase;
      letter-spacing: 1pt;
      page-break-before: always;
      margin-top: 0;
      padding-top: 40pt;
    }

    h2 {
      font-size: 16pt;
      page-break-before: always;
    }

    h3 {
      font-size: 14pt;
    }

    h4 {
      font-size: 13pt;
    }

    /* Paragraphes */
    p {
      text-align: justify;
      text-indent: 1.5em;
      margin-bottom: 0;
      orphans: 3;
      widows: 3;
    }

    p:first-child,
    h1 + p,
    h2 + p,
    h3 + p,
    h4 + p {
      text-indent: 0;
    }

    /* Listes */
    ul, ol {
      margin: 12pt 0;
      padding-left: 30pt;
    }

    li {
      margin-bottom: 6pt;
    }

    /* Citations */
    blockquote {
      margin: 18pt 30pt;
      padding: 12pt 20pt;
      border-left: 4pt solid #4a90e2;
      background-color: #f5f9fc;
      font-style: italic;
      page-break-inside: avoid;
    }

    /* Code */
    code {
      font-family: 'Courier New', monospace;
      font-size: 10pt;
      background-color: #f0f0f0;
      padding: 2pt 4pt;
      border-radius: 2pt;
    }

    pre {
      font-family: 'Courier New', monospace;
      font-size: 9pt;
      background-color: #f5f5f5;
      padding: 12pt;
      border-radius: 4pt;
      margin: 12pt 0;
      overflow-x: auto;
      page-break-inside: avoid;
    }

    /* Liens */
    a {
      color: #4a90e2;
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }

    /* Tableaux */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 18pt 0;
      page-break-inside: avoid;
    }

    th, td {
      border: 1pt solid #ddd;
      padding: 8pt;
      text-align: left;
    }

    th {
      background-color: #f5f5f5;
      font-weight: bold;
    }

    /* Images */
    img {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 18pt auto;
      page-break-inside: avoid;
    }

    /* Éviter les ruptures de page inappropriées */
    h1, h2, h3, h4, h5, h6 {
      page-break-after: avoid;
    }

    p, blockquote, ul, ol, table, pre {
      page-break-inside: avoid;
    }

    /* Séparateurs */
    hr {
      border: none;
      border-top: 1pt solid #ddd;
      margin: 24pt 0;
    }

    /* Table des matières */
    .toc {
      page-break-after: always;
      margin-top: 40pt;
    }

    .toc h2 {
      text-align: center;
      margin-bottom: 24pt;
      page-break-before: avoid;
    }

    .toc ul {
      list-style: none;
      padding: 0;
    }

    .toc li {
      margin-bottom: 8pt;
      padding-left: 20pt;
    }

    .toc a {
      color: #1a1a1a;
      text-decoration: none;
    }

    .toc a:hover {
      color: #4a90e2;
    }

    /* Style d'impression */
    @media print {
      body {
        background: white;
      }

      .page {
        margin: 0;
        border: none;
        box-shadow: none;
      }

      a {
        color: #1a1a1a;
      }
    }
  </style>
</head>
<body>
  <!-- Page de titre -->
  <div class="page title-page">
    <h1>${book.title}</h1>
    <div class="author">par ${book.author.firstName || ''} ${book.author.lastName || ''}</div>
    ${book.description ? `<div class="description">${book.description}</div>` : ''}
  </div>

  <!-- Contenu formaté -->
  <div class="page">
    ${book.content}
  </div>

</body>
</html>
    `.trim();

    console.log('✅ [Export Formatted API] HTML paginé généré');
    console.log('📊 [Export Formatted API] Taille du HTML:', paginatedHTML.length, 'caractères');

    return NextResponse.json({
      success: true,
      html: paginatedHTML,
      metadata: {
        bookTitle: book.title,
        pageFormat,
        dimensions: format,
        contentLength: book.content.length,
        htmlLength: paginatedHTML.length,
      },
    });
  } catch (error) {
    console.error('❌ [Export Formatted API] Erreur:', error);

    if (error instanceof Error && error.message === 'Utilisateur non authentifié') {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error: 'Erreur lors de la génération du document',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
