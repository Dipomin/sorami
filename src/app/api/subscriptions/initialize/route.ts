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
    // 0. 🔑 CRITIQUE : Vérifier que la clé Paystack est configurée
    if (!SECRET || SECRET === '') {
      console.error('❌ PAYSTACK_SECRET_KEY non configurée ou vide');
      return NextResponse.json(
        { 
          error: 'Configuration Paystack manquante. Veuillez contacter le support.',
          details: 'PAYSTACK_SECRET_KEY non configurée dans les variables d\'environnement'
        },
        { status: 503 }
      );
    }

    // Vérifier que c'est bien une clé valide (commence par sk_)
    if (!SECRET.startsWith('sk_test_') && !SECRET.startsWith('sk_live_')) {
      console.error('❌ PAYSTACK_SECRET_KEY invalide (ne commence pas par sk_test_ ou sk_live_)');
      return NextResponse.json(
        { 
          error: 'Configuration Paystack invalide. Veuillez contacter le support.',
          details: 'Format de clé Paystack incorrect'
        },
        { status: 503 }
      );
    }

    // Logger l'environnement (masqué pour la sécurité)
    const keyPrefix = SECRET.substring(0, 10);
    console.log(`🔑 Utilisation de la clé Paystack: ${keyPrefix}...`);

    // 1. Vérifier l'authentification
    const { userId } = getAuth(request);

    console.log(`👤 Initialisation abonnement pour userId: ${userId}`);

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

    console.log(`📧 Récupération utilisateur: ${user} 'Utilisateur non trouvé'`);

    if (!user || !user.email) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé ou email manquant' },
        { status: 404 }
      );
    }

    // 3. Récupérer le plan sélectionné et le cycle de facturation
    const body = await request.json();
    const { planId, billingCycle = 'monthly' } = body;

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

    // 5. Initialiser une transaction avec le plan Paystack
    // Les plans annuels sont maintenant créés directement dans Paystack
    // donc on utilise toujours le plan.paystackId
    const transactionData: any = {
      email: user.email,
      amount: plan.amount * 100, // Convertir en kobo/centimes
      plan: plan.paystackId, // Utiliser le plan Paystack (mensuel ou annuel)
      callback_url: `${APP_URL}/paystack/callback`,
      metadata: {
        userId: user.id,
        planId: plan.id,
        type: 'subscription',
        billingCycle,
        cancel_action: `${APP_URL}/pricing`,
      },
      channels: ['card'], // Seulement carte pour les abonnements
    };

    console.log(`📡 Initialisation transaction Paystack pour ${user.email} - Plan: ${plan.name}`);

    const initResponse = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transactionData),
    });

    if (!initResponse.ok) {
      const errorData = await initResponse.json().catch(() => ({ message: 'Erreur inconnue' }));
      console.error('❌ Erreur initialisation transaction Paystack:', {
        status: initResponse.status,
        statusText: initResponse.statusText,
        error: errorData,
        plan: plan.name,
        userEmail: user.email,
      });

      // Messages d'erreur détaillés selon le code HTTP
      let userMessage = 'Erreur lors de l\'initialisation du paiement';
      if (initResponse.status === 401) {
        userMessage = 'Erreur d\'authentification Paystack. Veuillez réessayer ou contacter le support.';
        console.error('🔴 CRITIQUE: Clé Paystack invalide ou expirée !');
      } else if (initResponse.status === 400) {
        userMessage = errorData.message || 'Données de paiement invalides';
      } else if (initResponse.status === 404) {
        userMessage = 'Plan d\'abonnement non trouvé sur Paystack';
      } else if (initResponse.status === 500) {
        userMessage = 'Erreur serveur Paystack. Veuillez réessayer dans quelques instants.';
      }

      return NextResponse.json(
        { 
          error: userMessage,
          details: errorData.message || initResponse.statusText,
          status: initResponse.status
        },
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
