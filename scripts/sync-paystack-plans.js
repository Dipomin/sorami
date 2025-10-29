#!/usr/bin/env node

/**
 * Script de synchronisation des plans Paystack
 * Usage: node scripts/sync-paystack-plans.js
 */

const PAYSTACK_BASE = 'https://api.paystack.co';
const SECRET = process.env.PAYSTACK_SECRET_KEY;

if (!SECRET) {
  console.error('❌ PAYSTACK_SECRET_KEY non définie dans .env');
  process.exit(1);
}

async function syncPlans() {
  try {
    console.log('🔄 Synchronisation des plans Paystack...\n');

    // 1. Récupérer les plans depuis Paystack
    const response = await fetch(`${PAYSTACK_BASE}/plan`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SECRET}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur Paystack (${response.status}): ${errorText}`);
    }

    const data = await response.json();

    if (!data.status || !data.data) {
      throw new Error('Réponse Paystack invalide');
    }

    const plans = data.data;
    console.log(`📊 ${plans.length} plan(s) trouvé(s) sur Paystack:\n`);

    // 2. Afficher les plans
    plans.forEach((plan, index) => {
      const amount = plan.amount / 100;
      console.log(`${index + 1}. ${plan.name}`);
      console.log(`   Code: ${plan.plan_code}`);
      console.log(`   Montant: ${amount} ${plan.currency}`);
      console.log(`   Intervalle: ${plan.interval}`);
      console.log(`   Description: ${plan.description || 'N/A'}`);
      console.log('');
    });

    // 3. Synchroniser avec l'API locale
    console.log('💾 Synchronisation avec la base de données...\n');

    const syncResponse = await fetch('http://localhost:3000/api/plans', {
      method: 'GET',
    });

    if (!syncResponse.ok) {
      const errorData = await syncResponse.json();
      throw new Error(`Erreur API: ${errorData.error}`);
    }

    const syncData = await syncResponse.json();
    console.log(`✅ Synchronisation réussie!`);
    console.log(`📝 ${syncData.count} plan(s) synchronisé(s) dans la base de données\n`);

    // 4. Afficher le résumé
    console.log('📋 Plans disponibles:');
    syncData.plans.forEach((plan, index) => {
      console.log(`${index + 1}. ${plan.name} - ${plan.amount} ${plan.currency}/${plan.interval}`);
    });

  } catch (error) {
    console.error('\n❌ Erreur lors de la synchronisation:', error.message);
    process.exit(1);
  }
}

// Exécuter
syncPlans();
