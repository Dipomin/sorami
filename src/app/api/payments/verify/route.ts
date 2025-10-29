import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import paystack from '@/lib/paystack';

/**
 * GET /api/payments/verify?reference=xxx
 * Vérifie un paiement Paystack et retourne le statut
 */
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Récupérer la référence
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');

    if (!reference) {
      return NextResponse.json(
        { success: false, error: 'Référence manquante' },
        { status: 400 }
      );
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, email: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier si la transaction existe déjà en DB
    const existingTransaction = await prisma.transaction.findUnique({
      where: { reference },
      include: {
        user: {
          select: {
            paystackSubscriptions: {
              where: { status: 'ACTIVE' },
              include: { plan: true },
              take: 1,
            },
          },
        },
      },
    });

    // Si la transaction existe et est SUCCESS, retourner le résultat
    if (existingTransaction && existingTransaction.status === 'SUCCESS') {
      const activeSubscription = existingTransaction.user.paystackSubscriptions[0];

      return NextResponse.json({
        success: true,
        message: 'Paiement déjà confirmé',
        transaction: {
          reference: existingTransaction.reference,
          amount: existingTransaction.amount,
          currency: existingTransaction.currency,
          status: existingTransaction.status,
        },
        subscription: activeSubscription ? {
          plan: activeSubscription.plan.name,
          credits: activeSubscription.plan.credits,
          status: activeSubscription.status,
        } : null,
      });
    }

    // Sinon, vérifier avec Paystack API
    console.log(`🔍 Vérification paiement Paystack: ${reference}`);
    
    const verifyResponse = await paystack.verifyTransaction(reference);

    if (!verifyResponse.ok || !verifyResponse.body.status) {
      console.error('❌ Erreur vérification Paystack:', verifyResponse.body);
      return NextResponse.json(
        { 
          success: false, 
          error: verifyResponse.body.message || 'Échec de la vérification du paiement' 
        },
        { status: 400 }
      );
    }

    const paystackData = verifyResponse.body.data;

    // Vérifier que le paiement est réussi
    if (paystackData.status !== 'success') {
      return NextResponse.json(
        {
          success: false,
          error: `Paiement ${paystackData.status}`,
        },
        { status: 400 }
      );
    }

    // Mettre à jour la transaction en DB
    await prisma.transaction.updateMany({
      where: { reference },
      data: {
        status: 'SUCCESS',
        providerData: paystackData,
        updatedAt: new Date(),
      },
    });

    console.log(`✅ Paiement vérifié avec succès: ${reference}`);

    // Note: Le webhook devrait déjà avoir traité ce paiement et créé l'abonnement
    // On vérifie juste ici et on retourne le statut

    // Récupérer l'abonnement créé par le webhook
    const subscription = await prisma.paystackSubscription.findFirst({
      where: {
        userId: user.id,
        status: 'ACTIVE',
      },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      message: 'Paiement confirmé avec succès !',
      transaction: {
        reference,
        amount: paystackData.amount / 100, // Convertir de kobo en XOF
        currency: paystackData.currency || 'XOF',
        status: 'SUCCESS',
      },
      subscription: subscription ? {
        plan: subscription.plan.name,
        credits: subscription.plan.credits,
        status: subscription.status,
      } : null,
    });
  } catch (error) {
    console.error('❌ Erreur vérification paiement:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur serveur lors de la vérification du paiement',
      },
      { status: 500 }
    );
  }
}
