import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/subscriptions/current
 * Récupère l'abonnement actif de l'utilisateur connecté
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Vérifier l'authentification
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // 2. Récupérer l'utilisateur depuis la DB
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // 3. Récupérer l'abonnement actif
    const subscription = await prisma.paystackSubscription.findFirst({
      where: {
        userId: user.id,
        status: 'ACTIVE',
      },
      include: {
        plan: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!subscription) {
      return NextResponse.json({
        success: true,
        subscription: null,
        message: 'Aucun abonnement actif',
      });
    }

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        paystackId: subscription.paystackId,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        createdAt: subscription.createdAt,
        plan: {
          id: subscription.plan.id,
          name: subscription.plan.name,
          amount: subscription.plan.amount,
          interval: subscription.plan.interval,
          currency: subscription.plan.currency,
          description: subscription.plan.description,
        },
      },
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'abonnement:', error);
    return NextResponse.json(
      {
        error: 'Erreur serveur lors de la récupération de l\'abonnement',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
