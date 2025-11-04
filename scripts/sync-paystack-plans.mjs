#!/usr/bin/env node

/**
 * Script pour synchroniser les plans Paystack avec la base de données locale
 * Utilise directement l'API Paystack pour récupérer et mettre à jour les plans
 * 
 * Usage: node scripts/sync-paystack-plans.mjs
 */

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE = 'https://api.paystack.co';

async function syncPlans() {
  try {
    console.log('🔄 Synchronisation des plans Paystack...\n');

    // Vérifier la clé API
    if (!PAYSTACK_SECRET_KEY || PAYSTACK_SECRET_KEY === '') {
      console.error('❌ PAYSTACK_SECRET_KEY non configurée dans .env');
      process.exit(1);
    }

    // Récupérer les plans depuis Paystack
    console.log('📡 Récupération des plans depuis Paystack...');
    const response = await fetch(`${PAYSTACK_BASE}/plan`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`❌ Erreur Paystack API: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error('Détails:', errorText);
      process.exit(1);
    }

    const data = await response.json();

    if (!data.status || !data.data) {
      console.error('❌ Réponse Paystack invalide');
      console.log('Réponse reçue:', JSON.stringify(data, null, 2));
      process.exit(1);
    }

    const paystackPlans = data.data;
    console.log(`✅ ${paystackPlans.length} plans trouvés sur Paystack\n`);

    // Synchroniser chaque plan
    console.log('💾 Synchronisation avec la base de données...\n');
    for (const plan of paystackPlans) {
      const amount = Math.round(plan.amount / 100);
      
      const syncedPlan = await prisma.paystackPlan.upsert({
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

      console.log(`  ✓ ${syncedPlan.name}`);
      console.log(`    - ID: ${syncedPlan.paystackId}`);
      console.log(`    - Montant: ${syncedPlan.amount.toLocaleString()} ${syncedPlan.currency}`);
      console.log(`    - Intervalle: ${syncedPlan.interval}`);
      console.log('');
    }

    // Afficher le résumé
    const allPlans = await prisma.paystackPlan.findMany({
      orderBy: { amount: 'asc' },
    });

    console.log('\n📊 Résumé des plans en base de données:');
    console.log(`   Total: ${allPlans.length} plans\n`);

    // Grouper par intervalle
    const byInterval = allPlans.reduce((acc, plan) => {
      if (!acc[plan.interval]) acc[plan.interval] = [];
      acc[plan.interval].push(plan);
      return acc;
    }, {});

    for (const [interval, plans] of Object.entries(byInterval)) {
      console.log(`   ${interval.toUpperCase()}:`);
      plans.forEach(plan => {
        console.log(`     - ${plan.name}: ${plan.amount.toLocaleString()} ${plan.currency}`);
      });
      console.log('');
    }

    console.log('✅ Synchronisation terminée avec succès!');
  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

syncPlans();
