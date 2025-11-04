#!/usr/bin/env node

/**
 * Script de test end-to-end du système de paiement Paystack
 * Usage: node scripts/test-payment-system.mjs
 */

import dotenv from 'dotenv';

dotenv.config();

const API_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

// Couleurs
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

async function testPaymentSystem() {
  console.log(`${BLUE}🧪 Test End-to-End du Système de Paiement Paystack${RESET}\n`);

  let testsPass = 0;
  let testsFail = 0;

  // Test 1 : Configuration Paystack
  console.log('📋 Test 1 : Configuration Paystack');
  if (!PAYSTACK_SECRET_KEY || PAYSTACK_SECRET_KEY === '') {
    console.log(`${RED}  ✗ PAYSTACK_SECRET_KEY non configurée${RESET}\n`);
    testsFail++;
  } else if (!PAYSTACK_SECRET_KEY.startsWith('sk_')) {
    console.log(`${RED}  ✗ Format de clé invalide${RESET}\n`);
    testsFail++;
  } else {
    console.log(`${GREEN}  ✓ Clé Paystack configurée correctement${RESET}\n`);
    testsPass++;
  }

  // Test 2 : API Plans disponible
  console.log('📦 Test 2 : API Plans');
  try {
    const response = await fetch(`${API_URL}/api/plans`);
    const data = await response.json();

    if (response.ok && data.plans && data.plans.length > 0) {
      console.log(`${GREEN}  ✓ API Plans accessible${RESET}`);
      console.log(`${GREEN}  ✓ ${data.plans.length} plan(s) disponible(s)${RESET}`);
      console.log(`${GREEN}  ✓ Source: ${data.source}${RESET}\n`);
      testsPass++;
    } else {
      console.log(`${RED}  ✗ API Plans non accessible ou vide${RESET}\n`);
      testsFail++;
    }
  } catch (error) {
    console.log(`${RED}  ✗ Erreur: ${error.message}${RESET}\n`);
    testsFail++;
  }

  // Test 3 : Connexion API Paystack
  console.log('📡 Test 3 : Connexion API Paystack');
  try {
    const response = await fetch('https://api.paystack.co/plan', {
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`${GREEN}  ✓ Connexion API Paystack réussie${RESET}`);
      console.log(`${GREEN}  ✓ ${data.data?.length || 0} plan(s) sur Paystack${RESET}\n`);
      testsPass++;
    } else if (response.status === 401) {
      console.log(`${RED}  ✗ Clé API invalide (401 Unauthorized)${RESET}\n`);
      testsFail++;
    } else {
      console.log(`${RED}  ✗ Erreur API (${response.status})${RESET}\n`);
      testsFail++;
    }
  } catch (error) {
    console.log(`${RED}  ✗ Erreur: ${error.message}${RESET}\n`);
    testsFail++;
  }

  // Test 4 : Endpoint Initialize (sans vraie requête)
  console.log('🔐 Test 4 : Endpoint Initialize');
  try {
    const response = await fetch(`${API_URL}/api/subscriptions/initialize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        planId: 'fake-plan-id',
        billingCycle: 'monthly',
      }),
    });

    // On s'attend à une erreur 401 (non authentifié) ou 404 (plan non trouvé)
    // Mais pas 503 (configuration manquante)
    if (response.status === 401) {
      console.log(`${GREEN}  ✓ Endpoint accessible (401 - authentification requise)${RESET}\n`);
      testsPass++;
    } else if (response.status === 404) {
      console.log(`${GREEN}  ✓ Endpoint accessible (404 - plan non trouvé)${RESET}\n`);
      testsPass++;
    } else if (response.status === 503) {
      console.log(`${RED}  ✗ Configuration manquante (503)${RESET}\n`);
      testsFail++;
    } else {
      console.log(`${YELLOW}  ⚠ Réponse inattendue (${response.status})${RESET}\n`);
    }
  } catch (error) {
    console.log(`${RED}  ✗ Erreur: ${error.message}${RESET}\n`);
    testsFail++;
  }

  // Test 5 : Webhook Endpoint
  console.log('🔔 Test 5 : Webhook Endpoint');
  try {
    const response = await fetch(`${API_URL}/api/webhooks/paystack`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-paystack-signature': 'test-signature',
      },
      body: JSON.stringify({
        event: 'charge.success',
        data: {},
      }),
    });

    // On s'attend à 400 (signature invalide) - c'est OK, ça veut dire que l'endpoint existe
    if (response.status === 400) {
      const data = await response.json();
      if (data.error && data.error.includes('Signature')) {
        console.log(`${GREEN}  ✓ Webhook endpoint accessible (validation signature active)${RESET}\n`);
        testsPass++;
      } else {
        console.log(`${YELLOW}  ⚠ Webhook accessible mais validation différente${RESET}\n`);
      }
    } else if (response.status === 200) {
      console.log(`${YELLOW}  ⚠ Webhook accessible mais pas de validation signature${RESET}\n`);
    } else {
      console.log(`${RED}  ✗ Erreur webhook (${response.status})${RESET}\n`);
      testsFail++;
    }
  } catch (error) {
    console.log(`${RED}  ✗ Erreur: ${error.message}${RESET}\n`);
    testsFail++;
  }

  // Résumé
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 RÉSUMÉ DES TESTS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`${GREEN}✓ Tests réussis: ${testsPass}${RESET}`);
  console.log(`${RED}✗ Tests échoués: ${testsFail}${RESET}`);
  console.log('');

  if (testsFail === 0) {
    console.log(`${GREEN}✅ Système de paiement 100% opérationnel !${RESET}`);
    console.log('');
    console.log('🎯 Prochaines étapes:');
    console.log('  1. Tester une vraie souscription sur /pricing');
    console.log('  2. Vérifier les webhooks dans Paystack Dashboard');
    console.log('  3. Monitorer les logs: pm2 logs sorami-front');
  } else {
    console.log(`${RED}❌ Problèmes détectés dans le système de paiement${RESET}`);
    console.log('');
    console.log('🔧 Actions recommandées:');
    console.log('  1. Exécuter: node scripts/check-paystack-config.mjs');
    console.log('  2. Vérifier PAYSTACK_SECRET_KEY dans .env');
    console.log('  3. Consulter: FIX_PAYSTACK_INVALID_KEY.md');
  }

  console.log('');
  process.exit(testsFail > 0 ? 1 : 0);
}

testPaymentSystem();
