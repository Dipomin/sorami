import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const PAYSTACK_BASE = 'https://api.paystack.co';
const SECRET = process.env.PAYSTACK_SECRET_KEY || '';

/**
 * GET /api/plans
 * Récupère tous les plans d'abonnement depuis Paystack et les synchronise avec la DB
 * Si Paystack échoue, retourne les plans depuis la DB locale
 */
export async function GET(request: NextRequest) {
  try {
    // Vérifier si la clé Paystack est configurée
    if (!SECRET || SECRET === '') {
      console.error('PAYSTACK_SECRET_KEY non configurée');
      // Fallback : retourner les plans depuis la DB
      const dbPlans = await prisma.paystackPlan.findMany({
        orderBy: { amount: 'asc' },
      });
      
      if (dbPlans.length === 0) {
        return NextResponse.json(
          { error: 'Configuration Paystack manquante et aucun plan en cache' },
          { status: 503 }
        );
      }
      
      return NextResponse.json({
        success: true,
        plans: dbPlans,
        count: dbPlans.length,
        source: 'cache',
      });
    }

    // 1. Récupérer les plans depuis Paystack
    const response = await fetch(`${PAYSTACK_BASE}/plan`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SECRET}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Erreur Paystack API:', response.status, response.statusText);
      
      // Fallback : retourner les plans depuis la DB
      const dbPlans = await prisma.paystackPlan.findMany({
        orderBy: { amount: 'asc' },
      });
      
      if (dbPlans.length > 0) {
        console.log('Utilisation des plans en cache suite à erreur Paystack');
        return NextResponse.json({
          success: true,
          plans: dbPlans,
          count: dbPlans.length,
          source: 'cache',
        });
      }
      
      return NextResponse.json(
        { error: 'Service Paystack temporairement indisponible' },
        { status: 503 }
      );
    }

    const data = await response.json();

    if (!data.status || !data.data) {
      console.error('Réponse Paystack invalide:', data);
      
      // Fallback : retourner les plans depuis la DB
      const dbPlans = await prisma.paystackPlan.findMany({
        orderBy: { amount: 'asc' },
      });
      
      if (dbPlans.length > 0) {
        return NextResponse.json({
          success: true,
          plans: dbPlans,
          count: dbPlans.length,
          source: 'cache',
        });
      }
      
      return NextResponse.json(
        { error: 'Données Paystack invalides' },
        { status: 500 }
      );
    }

    const paystackPlans = data.data;

    // 2. Synchroniser les plans avec la base de données
    const syncedPlans = await Promise.all(
      paystackPlans.map(async (plan: any) => {
        // Convertir le montant de kobo/centimes en unité principale
        const amount = Math.round(plan.amount / 100);

        // Upsert le plan dans la DB
        return await prisma.paystackPlan.upsert({
          where: { paystackId: plan.plan_code },
          update: {
            name: plan.name,
            amount,
            interval: plan.interval,
            currency: plan.currency || 'XOF',
            description: plan.description || null,
            updatedAt: new Date(),
          },
          create: {
            paystackId: plan.plan_code,
            name: plan.name,
            amount,
            interval: plan.interval,
            currency: plan.currency || 'XOF',
            description: plan.description || null,
          },
        });
      })
    );

    // 3. Retourner les plans triés par montant
    const sortedPlans = syncedPlans.sort((a, b) => a.amount - b.amount);

    return NextResponse.json({
      success: true,
      plans: sortedPlans,
      count: sortedPlans.length,
      source: 'paystack',
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des plans:', error);
    
    // Fallback final : essayer de retourner les plans depuis la DB
    try {
      const dbPlans = await prisma.paystackPlan.findMany({
        orderBy: { amount: 'asc' },
      });
      
      if (dbPlans.length > 0) {
        console.log('Utilisation des plans en cache suite à erreur serveur');
        return NextResponse.json({
          success: true,
          plans: dbPlans,
          count: dbPlans.length,
          source: 'cache',
        });
      }
    } catch (dbError) {
      console.error('Erreur lors de la récupération depuis la DB:', dbError);
    }
    
    return NextResponse.json(
      {
        error: 'Service temporairement indisponible',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}

/**
 * POST /api/plans
 * Crée un nouveau plan dans Paystack et le synchronise avec la DB
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, amount, interval, currency = 'XOF', description } = body;

    // Validation
    if (!name || !amount || !interval) {
      return NextResponse.json(
        { error: 'Paramètres requis : name, amount, interval' },
        { status: 400 }
      );
    }

    // Valider l'intervalle
    const validIntervals = ['daily', 'weekly', 'monthly', 'quarterly', 'biannually', 'annually'];
    if (!validIntervals.includes(interval)) {
      return NextResponse.json(
        { error: `Intervalle invalide. Valeurs acceptées: ${validIntervals.join(', ')}` },
        { status: 400 }
      );
    }

    // 1. Créer le plan dans Paystack
    const response = await fetch(`${PAYSTACK_BASE}/plan`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        amount: Math.round(amount * 100), // Convertir en kobo/centimes
        interval,
        currency,
        description: description || undefined,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erreur création plan Paystack:', errorData);
      return NextResponse.json(
        { error: errorData.message || 'Erreur lors de la création du plan' },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (!data.status || !data.data) {
      return NextResponse.json(
        { error: 'Réponse Paystack invalide' },
        { status: 500 }
      );
    }

    const paystackPlan = data.data;

    // 2. Créer le plan dans la base de données
    const dbPlan = await prisma.paystackPlan.create({
      data: {
        paystackId: paystackPlan.plan_code,
        name: paystackPlan.name,
        amount: Math.round(paystackPlan.amount / 100),
        interval: paystackPlan.interval,
        currency: paystackPlan.currency || 'XOF',
        description: paystackPlan.description || null,
      },
    });

    return NextResponse.json({
      success: true,
      plan: dbPlan,
      paystackPlanCode: paystackPlan.plan_code,
    }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du plan:', error);
    return NextResponse.json(
      {
        error: 'Erreur serveur lors de la création du plan',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
