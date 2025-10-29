/**
 * Service de gestion des crédits
 * Fonctions helper pour la déduction et la vérification des crédits
 */

import { prisma } from '@/lib/prisma';

// Coût en crédits par type de génération
export const CREDIT_COSTS = {
  IMAGE: 1,           // 1 crédit par image
  VIDEO: 5,           // 5 crédits par vidéo
  BLOG: 2,            // 2 crédits par article de blog
  BOOK: 10,           // 10 crédits par ebook
  IMAGE_ECOMMERCE: 2, // 2 crédits par image e-commerce
  VIDEO_CUSTOM: 8,    // 8 crédits par vidéo personnalisée
} as const;

export type ContentType = keyof typeof CREDIT_COSTS;

interface DeductCreditsParams {
  userId: string;
  contentType: ContentType;
  quantity?: number; // Nombre d'items générés (ex: 3 images = 3 crédits)
  metadata?: Record<string, any>;
}

interface DeductCreditsResult {
  success: boolean;
  creditsRemaining: number;
  creditsDeducted: number;
  transactionId?: string;
  error?: string;
}

/**
 * Déduit des crédits du compte utilisateur
 * @param params - Paramètres de déduction
 * @returns Résultat de la déduction
 */
export async function deductCredits(params: DeductCreditsParams): Promise<DeductCreditsResult> {
  const { userId, contentType, quantity = 1, metadata = {} } = params;

  try {
    // Calculer le nombre de crédits à déduire
    const creditCost = CREDIT_COSTS[contentType];
    const totalCredits = creditCost * quantity;

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, credits: true },
    });

    if (!user) {
      return {
        success: false,
        creditsRemaining: 0,
        creditsDeducted: 0,
        error: 'Utilisateur non trouvé',
      };
    }

    // Vérifier si l'utilisateur a suffisamment de crédits
    if (user.credits < totalCredits) {
      return {
        success: false,
        creditsRemaining: user.credits,
        creditsDeducted: 0,
        error: `Crédits insuffisants (disponibles: ${user.credits}, requis: ${totalCredits})`,
      };
    }

    // Déduire les crédits dans une transaction
    const result = await prisma.$transaction(async (tx) => {
      // Mettre à jour les crédits de l'utilisateur
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          credits: { decrement: totalCredits },
          totalCreditsUsed: { increment: totalCredits },
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
          userId: userId,
          amount: -totalCredits, // Négatif pour une déduction
          type: 'USAGE',
          description: `Génération ${contentType.toLowerCase()} (${quantity}x)`,
          metadata: {
            contentType,
            quantity,
            creditCost,
            ...metadata,
          },
        },
      });

      return {
        user: updatedUser,
        transaction: creditTransaction,
      };
    });

    return {
      success: true,
      creditsRemaining: result.user.credits,
      creditsDeducted: totalCredits,
      transactionId: result.transaction.id,
    };
  } catch (error) {
    console.error('❌ Erreur déduction crédits:', error);
    return {
      success: false,
      creditsRemaining: 0,
      creditsDeducted: 0,
      error: error instanceof Error ? error.message : 'Erreur serveur',
    };
  }
}

/**
 * Vérifie si l'utilisateur a suffisamment de crédits
 * @param userId - ID de l'utilisateur
 * @param contentType - Type de contenu à générer
 * @param quantity - Quantité à générer
 * @returns true si suffisamment de crédits, false sinon
 */
export async function checkCredits(
  userId: string,
  contentType: ContentType,
  quantity: number = 1
): Promise<{ hasCredits: boolean; available: number; required: number }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true },
  });

  if (!user) {
    return { hasCredits: false, available: 0, required: 0 };
  }

  const required = CREDIT_COSTS[contentType] * quantity;

  return {
    hasCredits: user.credits >= required,
    available: user.credits,
    required,
  };
}

/**
 * Rembourse des crédits (en cas d'échec de génération)
 * @param userId - ID de l'utilisateur
 * @param amount - Montant à rembourser
 * @param reason - Raison du remboursement
 */
export async function refundCredits(
  userId: string,
  amount: number,
  reason: string
): Promise<boolean> {
  try {
    await prisma.$transaction(async (tx) => {
      // Créditer l'utilisateur
      await tx.user.update({
        where: { id: userId },
        data: {
          credits: { increment: amount },
          totalCreditsUsed: { decrement: amount },
          creditsUpdatedAt: new Date(),
        },
      });

      // Créer une transaction de remboursement
      await tx.creditTransaction.create({
        data: {
          userId,
          amount: amount, // Positif pour un remboursement
          type: 'REFUND',
          description: `Remboursement: ${reason}`,
          metadata: { reason },
        },
      });
    });

    return true;
  } catch (error) {
    console.error('❌ Erreur remboursement crédits:', error);
    return false;
  }
}
