import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

const PAYSTACK_BASE = 'https://api.paystack.co';
const SECRET = process.env.PAYSTACK_SECRET_KEY || '';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/**
 * POST /api/payments/one-time/initialize
 * Initialise un paiement unique (non-abonnement) pour l'achat de crédits
 * 
 * Workflow:
 * 1. Initialiser une transaction Paystack simple (sans plan)
 * 2. Rediriger vers Paystack pour le paiement
 * 3. Le webhook charge.success créditera l'utilisateur automatiquement
 */
export async function POST(request: NextRequest) {
  try {
    // 0. 🔑 Vérifier que la clé Paystack est configurée
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

    // Vérifier que c'est bien une clé valide
    if (!SECRET.startsWith('sk_test_') && !SECRET.startsWith('sk_live_')) {
      console.error('❌ PAYSTACK_SECRET_KEY invalide');
      return NextResponse.json(
        { 
          error: 'Configuration Paystack invalide. Veuillez contacter le support.',
          details: 'Format de clé Paystack incorrect'
        },
        { status: 503 }
      );
    }

    const keyPrefix = SECRET.substring(0, 10);
    console.log(`🔑 Utilisation de la clé Paystack: ${keyPrefix}...`);

    // 1. Vérifier l'authentification
    const { userId } = getAuth(request);

    console.log(`👤 Initialisation paiement unique pour userId: ${userId}`);

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

    console.log(`📧 Récupération utilisateur: ${user ? 'OK' : 'Non trouvé'}`);

    if (!user || !user.email) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé ou email manquant' },
        { status: 404 }
      );
    }

    // 3. Récupérer les détails de l'offre
    const body = await request.json();
    const { offerType = 'pack-createur', amount = 5000 } = body;

    // Définir les crédits selon l'offre
    const offerDetails = {
      'pack-createur': {
        amount: 5000,
        credits: {
          images: 20,
          blogPosts: 2,
        },
        name: 'Pack Créateur',
      },
    };

    const offer = offerDetails[offerType as keyof typeof offerDetails];

    if (!offer) {
      return NextResponse.json(
        { error: 'Offre non trouvée' },
        { status: 404 }
      );
    }

    // 4. Vérifier le montant
    if (amount !== offer.amount) {
      return NextResponse.json(
        { error: 'Montant invalide' },
        { status: 400 }
      );
    }

    // 5. Initialiser une transaction simple (sans plan)
    const transactionData = {
      email: user.email,
      amount: offer.amount * 100, // Convertir en kobo/centimes
      callback_url: `${APP_URL}/paystack/callback`,
      metadata: {
        userId: user.id,
        type: 'one-time-purchase',
        offerType,
        credits: offer.credits,
        userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
      },
      channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money'],
      cancel_action: `${APP_URL}/pricing`,
    };

    console.log(`📡 Initialisation transaction Paystack pour ${user.email} - Offre: ${offer.name}`);

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
        userEmail: user.email,
      });

      let userMessage = 'Erreur lors de l\'initialisation du paiement';
      let developerMessage = '';
      
      if (initResponse.status === 401) {
        userMessage = 'Configuration Paystack invalide. Le service de paiement est temporairement indisponible. Veuillez contacter le support.';
        developerMessage = `
🔴 ERREUR CRITIQUE : Clé Paystack invalide ou expirée !

La clé actuelle (${SECRET.substring(0, 12)}...) retourne une erreur 401 Unauthorized.

📋 SOLUTION IMMÉDIATE :
1. Allez sur https://dashboard.paystack.com/settings/api-keys
2. Copiez la nouvelle "Test Secret Key" (sk_test_xxx)
3. Mettez à jour .env.local :
   PAYSTACK_SECRET_KEY="sk_test_VOTRE_NOUVELLE_CLE"
4. Redémarrez le serveur : npm run dev

📖 Guide complet : FIX_ERREUR_401_PAYSTACK.md
🧪 Tester la clé : ./test-paystack-key.sh

Code d'erreur Paystack : ${errorData.code || 'invalid_Key'}
        `.trim();
        
        console.error('🔴 CRITIQUE: Clé Paystack invalide ou expirée !');
        console.error(developerMessage);
      } else if (initResponse.status === 400) {
        userMessage = errorData.message || 'Données de paiement invalides';
      } else if (initResponse.status === 500) {
        userMessage = 'Erreur serveur Paystack. Veuillez réessayer dans quelques instants.';
      }

      return NextResponse.json(
        { 
          error: userMessage,
          details: errorData.message || initResponse.statusText,
          status: initResponse.status,
          ...(process.env.NODE_ENV === 'development' && initResponse.status === 401 && { 
            developerMessage: developerMessage 
          })
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
        amount: offer.amount,
        currency: 'XOF',
        status: 'PENDING',
        providerData: {
          type: 'one-time-purchase',
          offerType,
          credits: offer.credits,
          authorizationUrl: initData.data.authorization_url,
        },
      },
    });

    // 7. Retourner l'URL d'autorisation
    return NextResponse.json({
      success: true,
      authorizationUrl: initData.data.authorization_url,
      reference: initData.data.reference,
      message: `Paiement de ${offer.amount} F CFA pour ${offer.name}. Veuillez compléter le paiement.`,
    }, { status: 201 });

  } catch (error) {
    console.error('Erreur lors de l\'initialisation du paiement unique:', error);
    return NextResponse.json(
      {
        error: 'Erreur serveur lors de l\'initialisation du paiement',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
