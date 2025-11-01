import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '@/lib/auth';
import OpenAI from 'openai';

const prisma = new PrismaClient();

const PROFESSIONAL_FORMAT_PROMPT = `Contexte :
Tu es un expert en édition, typographie et mise en page professionnelle de livres imprimés et numériques.
Tu maîtrises les normes de mise en forme éditoriale (marges, titres, interlignes, pagination, etc.) utilisées dans l'édition littéraire et scientifique.
Tu transformes un texte brut en un manuscrit parfaitement formaté, prêt à être publié sous forme de livre papier ou eBook.

Objectif :
Mettre en forme le texte fourni selon les critères professionnels d'un livre.

Consignes de mise en forme :
- Police principale : Garamond ou Times New Roman, taille 12 pt
- Interligne : 1,5
- Marges standards : 2,5 cm de chaque côté
- Justification du texte (aligné à gauche et à droite)
- Numérotation automatique des pages
- Titres de chapitres en majuscules, centrés, taille 16 pt, gras
- Saut de page avant chaque nouveau chapitre
- Paragraphes indentés (1 cm), sans ligne blanche entre eux
- Citations en retrait, italique
- Dialogues avec tirets cadratins (—) et retour à la ligne
- Table des matières générée automatiquement à partir des titres de chapitres
- Page de titre avec : titre du livre, nom de l'auteur, sous-titre éventuel
- Page de remerciements et dédicace (si présentes)
- Numérotation commençant après les pages liminaires
- Structure finale pour exportation en PDF et EPUB

Tâche :
Reformate le texte en suivant toutes les règles ci-dessus.
Génère la structure complète du livre avec table des matières, chapitres, pagination et style cohérent.
Retourne le contenu formaté en HTML riche avec les styles CSS inline appropriés.

IMPORTANT: Retourne UNIQUEMENT le HTML formaté, sans explications supplémentaires.`;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const resolvedParams = await params;
    const bookId = resolvedParams.id;

    // Initialize OpenAI client (must be inside handler to avoid build-time errors)
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    console.log('📚 [Format API] Début de la mise en forme professionnelle du livre:', bookId);

    // Récupérer le livre avec tous ses chapitres
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
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!book) {
      console.error('❌ [Format API] Livre non trouvé pour l\'ID:', bookId);
      return NextResponse.json(
        { error: 'Livre non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier les permissions
    if (book.authorId !== user.id) {
      console.error('❌ [Format API] Accès non autorisé - User:', user.id, 'Author:', book.authorId);
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    console.log('📖 [Format API] Livre trouvé:', book.title);
    console.log('📄 [Format API] Nombre de chapitres:', book.chapters.length);
    console.log('📋 [Format API] Liste des chapitres:');
    book.chapters.forEach((chapter, index) => {
      const contentPreview = chapter.content.substring(0, 100).replace(/\n/g, ' ');
      console.log(`  ${index + 1}. "${chapter.title}" (order: ${chapter.order}) - ${chapter.content.length} caractères`);
      console.log(`     Aperçu: ${contentPreview}...`);
    });

    // Construire le texte complet du livre
    const authorName = `${book.author.firstName || ''} ${book.author.lastName || ''}`.trim() || 'Auteur Inconnu';
    
    let fullText = `TITRE: ${book.title}\n\n`;
    fullText += `AUTEUR: ${authorName}\n\n`;
    if (book.description) {
      fullText += `DESCRIPTION: ${book.description}\n\n`;
    }
    fullText += `---\n\n`;

    // Ajouter tous les chapitres
    book.chapters.forEach((chapter, index) => {
      fullText += `CHAPITRE ${index + 1}: ${chapter.title}\n\n`;
      
      // Retirer les balises HTML pour avoir le texte brut
      const plainText = chapter.content
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/\s+/g, ' ')
        .trim();
      
      console.log(`  ✍️ [Format API] Chapitre ${index + 1} ajouté: "${chapter.title}" (${plainText.length} caractères)`);
      console.log(`     Contenu brut: ${plainText.substring(0, 150)}...`);
      
      fullText += `${plainText}\n\n`;
      fullText += `---\n\n`;
    });

    console.log('📝 [Format API] Texte complet assemblé');
    console.log('📊 [Format API] Taille totale du texte:', fullText.length, 'caractères');
    console.log('📖 [Format API] Aperçu du texte complet (500 premiers caractères):');
    console.log(fullText.substring(0, 500));
    console.log('...');
    
    console.log('🤖 [Format API] Appel à OpenAI GPT-4 Mini...');

    // Appeler GPT-4 Mini pour la mise en forme
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: PROFESSIONAL_FORMAT_PROMPT,
        },
        {
          role: 'user',
          content: `Voici le livre à mettre en forme professionnellement:\n\n${fullText}`,
        },
      ],
      temperature: 0.3, // Moins de créativité, plus de cohérence
      max_tokens: 16000, // Suffisant pour un livre complet
    });

    const formattedContent = completion.choices[0]?.message?.content;

    if (!formattedContent) {
      console.error('❌ [Format API] Aucun contenu formaté reçu de OpenAI');
      throw new Error('Aucun contenu formaté reçu de OpenAI');
    }

    console.log('✅ [Format API] Mise en forme réussie');
    console.log('📊 [Format API] Taille du contenu formaté:', formattedContent.length, 'caractères');
    console.log('📖 [Format API] Aperçu du contenu formaté (500 premiers caractères):');
    console.log(formattedContent.substring(0, 500));
    console.log('...');
    console.log('💰 [Format API] Tokens utilisés:', {
      prompt: completion.usage?.prompt_tokens,
      completion: completion.usage?.completion_tokens,
      total: completion.usage?.total_tokens,
    });

    // Sauvegarder la version formatée dans le livre
    await prisma.book.update({
      where: { id: bookId },
      data: {
        content: formattedContent,
        updatedAt: new Date(),
      },
    });

    console.log('💾 [Format API] Version formatée sauvegardée dans la base de données');

    return NextResponse.json({
      success: true,
      formattedContent,
      metadata: {
        originalLength: fullText.length,
        formattedLength: formattedContent.length,
        chaptersCount: book.chapters.length,
        tokensUsed: completion.usage?.total_tokens,
      },
    });
  } catch (error) {
    console.error('❌ [Format API] Erreur lors de la mise en forme:', error);
    
    if (error instanceof Error && error.message === 'Utilisateur non authentifié') {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Erreur lors de la mise en forme du livre',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * PUT /api/books/[id]/format
 * 
 * Met à jour le contenu formaté d'un livre après édition par l'utilisateur
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const resolvedParams = await params;
    const bookId = resolvedParams.id;
    const body = await request.json();

    const { content } = body;

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Contenu invalide' },
        { status: 400 }
      );
    }

    console.log('💾 [Format API PUT] Mise à jour du contenu formaté du livre:', bookId);
    console.log('📊 [Format API PUT] Taille du nouveau contenu:', content.length, 'caractères');

    // Récupérer le livre pour vérifier les permissions
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      select: {
        id: true,
        authorId: true,
        title: true,
      },
    });

    if (!book) {
      console.error('❌ [Format API PUT] Livre non trouvé:', bookId);
      return NextResponse.json(
        { error: 'Livre non trouvé' },
        { status: 404 }
      );
    }

    if (book.authorId !== user.id) {
      console.error('❌ [Format API PUT] Accès non autorisé');
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    // Mettre à jour le contenu formaté
    await prisma.book.update({
      where: { id: bookId },
      data: {
        content: content,
        updatedAt: new Date(),
      },
    });

    console.log('✅ [Format API PUT] Contenu formaté mis à jour avec succès');

    return NextResponse.json({
      success: true,
      message: 'Contenu formaté mis à jour avec succès',
      contentLength: content.length,
    });
  } catch (error) {
    console.error('❌ [Format API PUT] Erreur lors de la mise à jour:', error);

    if (error instanceof Error && error.message === 'Utilisateur non authentifié') {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error: 'Erreur lors de la mise à jour du contenu',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
