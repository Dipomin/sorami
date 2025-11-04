#!/usr/bin/env node

/**
 * Script de test pour vérifier l'API /api/plans
 * Usage: node scripts/test-plans-api.mjs
 */

async function testPlansAPI() {
  try {
    console.log('🧪 Test de l\'API /api/plans...\n');

    const response = await fetch('http://localhost:3000/api/plans');
    
    console.log('📡 Statut de la réponse:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur:', errorText);
      return;
    }

    const data = await response.json();
    
    console.log('\n✅ Réponse reçue avec succès!\n');
    console.log('📊 Résumé:');
    console.log('   - Success:', data.success);
    console.log('   - Source:', data.source);
    console.log('   - Nombre de plans:', data.count);
    
    if (data.plans && data.plans.length > 0) {
      console.log('\n📋 Plans disponibles:\n');
      
      // Grouper par intervalle
      const monthly = data.plans.filter(p => p.interval === 'monthly');
      const annually = data.plans.filter(p => p.interval === 'annually');
      
      if (monthly.length > 0) {
        console.log('   📅 PLANS MENSUELS:');
        monthly.forEach(plan => {
          console.log(`      - ${plan.name}: ${plan.amount.toLocaleString()} ${plan.currency}`);
        });
        console.log('');
      }
      
      if (annually.length > 0) {
        console.log('   📅 PLANS ANNUELS:');
        annually.forEach(plan => {
          console.log(`      - ${plan.name}: ${plan.amount.toLocaleString()} ${plan.currency}`);
        });
        console.log('');
      }
    }
    
    console.log('✅ Test réussi!');
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    
    if (error.cause?.code === 'ECONNREFUSED') {
      console.log('\n💡 Le serveur Next.js ne semble pas être démarré.');
      console.log('   Lancez `npm run dev` dans un autre terminal.');
    }
  }
}

testPlansAPI();
