import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/credits/deduct
 * Déduit des crédits du compte utilisateur
 * Body: { amount: number, description: string, metadata?: any }
 */
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { amount, description, metadata } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Montant invalide' },
        { status: 400 }
      );
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, credits: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier si l'utilisateur a suffisamment de crédits
    if (user.credits < amount) {
      return NextResponse.json(
        { 
          error: 'Crédits insuffisants',
          available: user.credits,
          required: amount,
        },
        { status: 402 } // Payment Required
      );
    }

    // Déduire les crédits dans une transaction
    const result = await prisma.$transaction(async (tx) => {
      // Mettre à jour les crédits de l'utilisateur
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          credits: { decrement: amount },
          totalCreditsUsed: { increment: amount },
          creditsUpdatedAt: new Date(),
        },
        select: {
          credits: true,
          totalCreditsUsed: true,
        },
      });

      // Créer une transaction de crédits pour l'historique
      const creditTransaction = await tx.creditTransaction.create({
        data: {
          userId: user.id,
          amount: -amount, // Négatif pour une déduction
          type: 'USAGE',
          description: description || 'Utilisation de crédits',
          metadata: metadata || {},
        },
      });

      return {
        user: updatedUser,
        transaction: creditTransaction,
      };
    });

    return NextResponse.json({
      success: true,
      credits: {
        remaining: result.user.credits,
        used: result.user.totalCreditsUsed,
        deducted: amount,
      },
      transactionId: result.transaction.id,
    });
  } catch (error) {
    console.error('Erreur déduction crédits:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
