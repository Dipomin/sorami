import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

const PAYSTACK_BASE = 'https://api.paystack.co';
const SECRET = process.env.PAYSTACK_SECRET_KEY || '';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/**
 * POST /api/subscriptions/initialize
 * Initialise un paiement pour un abonnement
 * 
 * IMPORTANT: Paystack nécessite un paiement initial pour obtenir une autorisation
 * avant de créer l'abonnement. Le workflow est:
 * 1. Initialiser une transaction avec le plan_code
 * 2. Rediriger vers Paystack pour le paiement
 * 3. Le webhook charge.success créera l'abonnement automatiquement
 */
export async function POST(request: NextRequest) {
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
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!user || !user.email) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé ou email manquant' },
        { status: 404 }
      );
    }

    // 3. Récupérer le plan sélectionné
    const body = await request.json();
    const { planId } = body;

    if (!planId) {
      return NextResponse.json(
        { error: 'planId requis' },
        { status: 400 }
      );
    }

    // Récupérer le plan depuis la DB
    const plan = await prisma.paystackPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan non trouvé' },
        { status: 404 }
      );
    }

    // 4. Vérifier qu'il n'y a pas déjà un abonnement actif
    const existingSubscription = await prisma.paystackSubscription.findFirst({
      where: {
        userId: user.id,
        status: 'ACTIVE',
      },
    });

    if (existingSubscription) {
      return NextResponse.json(
        { error: 'Vous avez déjà un abonnement actif' },
        { status: 400 }
      );
    }

    // 5. Initialiser une transaction avec le plan (pas un abonnement direct)
    // Paystack créera l'abonnement automatiquement après le premier paiement
    const initResponse = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.email,
        amount: plan.amount * 100, // Convertir en kobo/centimes
        plan: plan.paystackId, // Ceci indique à Paystack de créer un abonnement
        callback_url: `${APP_URL}/paystack/callback`,
        metadata: {
          userId: user.id,
          planId: plan.id,
          type: 'subscription',
          cancel_action: `${APP_URL}/pricing`,
        },
        channels: ['card'], // Seulement carte pour les abonnements
      }),
    });

    if (!initResponse.ok) {
      const errorData = await initResponse.json();
      console.error('Erreur initialisation transaction Paystack:', errorData);
      return NextResponse.json(
        { error: errorData.message || 'Erreur lors de l\'initialisation du paiement' },
        { status: initResponse.status }
      );
    }

    const initData = await initResponse.json();

    if (!initData.status || !initData.data) {
      return NextResponse.json(
        { error: 'Réponse Paystack invalide' },
        { status: 500 }
      );
    }

    // 6. Créer une transaction en attente dans la DB
    await prisma.transaction.create({
      data: {
        userId: user.id,
        reference: initData.data.reference,
        amount: plan.amount,
        currency: plan.currency,
        status: 'PENDING',
        providerData: {
          type: 'SUBSCRIPTION',
          planId: plan.id,
          paystackPlanCode: plan.paystackId,
        },
      },
    });

    // 7. Retourner l'URL d'autorisation
    return NextResponse.json({
      success: true,
      authorizationUrl: initData.data.authorization_url,
      reference: initData.data.reference,
      message: 'Transaction initialisée. Veuillez compléter le paiement pour activer l\'abonnement.',
    }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de l\'abonnement:', error);
    return NextResponse.json(
      {
        error: 'Erreur serveur lors de l\'initialisation de l\'abonnement',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
