import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/credits
 * Récupère les informations de crédits de l'utilisateur connecté
 */
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Récupérer l'utilisateur avec ses informations de crédits
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        credits: true,
        totalCreditsUsed: true,
        creditsUpdatedAt: true,
        paystackSubscriptions: {
          where: { status: 'ACTIVE' },
          include: {
            plan: true,
          },
          take: 1,
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Récupérer l'historique récent des transactions de crédits
    const recentTransactions = await prisma.creditTransaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        amount: true,
        type: true,
        description: true,
        createdAt: true,
        metadata: true,
      },
    });

    // Informations de l'abonnement actif
    const activeSubscription = user.paystackSubscriptions[0] || null;

    return NextResponse.json({
      credits: {
        available: user.credits,
        used: user.totalCreditsUsed,
        total: user.credits + user.totalCreditsUsed,
        updatedAt: user.creditsUpdatedAt,
      },
      subscription: activeSubscription ? {
        plan: activeSubscription.plan.name,
        creditsPerPeriod: activeSubscription.plan.credits,
        interval: activeSubscription.plan.interval,
        currentPeriodEnd: activeSubscription.currentPeriodEnd,
        status: activeSubscription.status,
      } : null,
      recentTransactions,
    });
  } catch (error) {
    console.error('Erreur récupération crédits:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
