#!/usr/bin/env node

/**
 * Script de vérification de la configuration Paystack
 * Usage: node scripts/check-paystack-config.mjs
 */

import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const prisma = new PrismaClient();
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY;
const PAYSTACK_WEBHOOK_SECRET = process.env.PAYSTACK_WEBHOOK_SECRET;
const PAYSTACK_BASE = 'https://api.paystack.co';

// Couleurs
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

async function checkPaystackConfig() {
  console.log(`${BLUE}🔍 Vérification de la configuration Paystack...${RESET}\n`);

  let errors = 0;
  let warnings = 0;

  // 1. Vérifier les variables d'environnement
  console.log('📋 1. Variables d\'environnement\n');

  if (!PAYSTACK_SECRET_KEY || PAYSTACK_SECRET_KEY === '') {
    console.log(`${RED}  ✗ PAYSTACK_SECRET_KEY non configurée${RESET}`);
    errors++;
  } else {
    const keyPrefix = PAYSTACK_SECRET_KEY.substring(0, 10);
    console.log(`${GREEN}  ✓ PAYSTACK_SECRET_KEY configurée${RESET} (${keyPrefix}...)`);
    
    // Vérifier le format
    if (PAYSTACK_SECRET_KEY.startsWith('sk_test_')) {
      console.log(`${YELLOW}  ⚠ Mode TEST détecté (sk_test_)${RESET}`);
      warnings++;
    } else if (PAYSTACK_SECRET_KEY.startsWith('sk_live_')) {
      console.log(`${GREEN}  ✓ Mode PRODUCTION (sk_live_)${RESET}`);
    } else {
      console.log(`${RED}  ✗ Format de clé invalide (doit commencer par sk_test_ ou sk_live_)${RESET}`);
      errors++;
    }
  }

  if (!PAYSTACK_PUBLIC_KEY || PAYSTACK_PUBLIC_KEY === '') {
    console.log(`${RED}  ✗ PAYSTACK_PUBLIC_KEY non configurée${RESET}`);
    errors++;
  } else {
    const keyPrefix = PAYSTACK_PUBLIC_KEY.substring(0, 10);
    console.log(`${GREEN}  ✓ PAYSTACK_PUBLIC_KEY configurée${RESET} (${keyPrefix}...)`);
  }

  if (!PAYSTACK_WEBHOOK_SECRET || PAYSTACK_WEBHOOK_SECRET === '') {
    console.log(`${YELLOW}  ⚠ PAYSTACK_WEBHOOK_SECRET non configurée${RESET}`);
    warnings++;
  } else {
    console.log(`${GREEN}  ✓ PAYSTACK_WEBHOOK_SECRET configurée${RESET}`);
  }

  console.log('');

  // 2. Tester la connexion à l'API Paystack
  console.log('📡 2. Test de connexion API Paystack\n');

  if (PAYSTACK_SECRET_KEY && PAYSTACK_SECRET_KEY !== '') {
    try {
      console.log('  Tentative de connexion...');
      
      const response = await fetch(`${PAYSTACK_BASE}/balance`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`${GREEN}  ✓ Connexion API réussie${RESET}`);
        
        if (data.data) {
          const balanceFormatted = (data.data[0]?.balance / 100).toLocaleString();
          const currency = data.data[0]?.currency || 'NGN';
          console.log(`${GREEN}  ✓ Balance: ${balanceFormatted} ${currency}${RESET}`);
        }
      } else if (response.status === 401) {
        console.log(`${RED}  ✗ ERREUR 401: Clé API invalide ou expirée${RESET}`);
        errors++;
        
        const errorData = await response.json().catch(() => ({}));
        if (errorData.message) {
          console.log(`${RED}    Message: ${errorData.message}${RESET}`);
        }
      } else {
        console.log(`${RED}  ✗ Erreur API (${response.status}): ${response.statusText}${RESET}`);
        errors++;
      }
    } catch (error) {
      console.log(`${RED}  ✗ Erreur de connexion: ${error.message}${RESET}`);
      errors++;
    }
  } else {
    console.log(`${RED}  ✗ Impossible de tester (clé manquante)${RESET}`);
  }

  console.log('');

  // 3. Vérifier les plans dans Paystack
  console.log('📦 3. Vérification des plans Paystack\n');

  if (PAYSTACK_SECRET_KEY && PAYSTACK_SECRET_KEY !== '') {
    try {
      const response = await fetch(`${PAYSTACK_BASE}/plan`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const plans = data.data || [];
        
        console.log(`${GREEN}  ✓ ${plans.length} plan(s) trouvé(s) sur Paystack${RESET}`);
        
        if (plans.length > 0) {
          console.log('');
          plans.forEach(plan => {
            const amount = (plan.amount / 100).toLocaleString();
            console.log(`    - ${plan.name}: ${amount} ${plan.currency} (${plan.interval})`);
            console.log(`      Code: ${plan.plan_code}`);
          });
        } else {
          console.log(`${YELLOW}  ⚠ Aucun plan configuré sur Paystack${RESET}`);
          warnings++;
        }
      } else {
        console.log(`${RED}  ✗ Impossible de récupérer les plans (${response.status})${RESET}`);
        errors++;
      }
    } catch (error) {
      console.log(`${RED}  ✗ Erreur: ${error.message}${RESET}`);
      errors++;
    }
  }

  console.log('');

  // 4. Vérifier les plans en base de données locale
  console.log('💾 4. Vérification des plans en base de données\n');

  try {
    const dbPlans = await prisma.paystackPlan.findMany({
      orderBy: { amount: 'asc' },
    });

    console.log(`${GREEN}  ✓ ${dbPlans.length} plan(s) en cache local${RESET}`);
    
    if (dbPlans.length > 0) {
      console.log('');
      const monthlyPlans = dbPlans.filter(p => p.interval === 'monthly');
      const annualPlans = dbPlans.filter(p => p.interval === 'annually');
      
      if (monthlyPlans.length > 0) {
        console.log('  Plans mensuels:');
        monthlyPlans.forEach(plan => {
          console.log(`    - ${plan.name}: ${plan.amount.toLocaleString()} ${plan.currency}`);
          console.log(`      ID: ${plan.id} | Paystack: ${plan.paystackId}`);
        });
      }
      
      if (annualPlans.length > 0) {
        console.log('');
        console.log('  Plans annuels:');
        annualPlans.forEach(plan => {
          console.log(`    - ${plan.name}: ${plan.amount.toLocaleString()} ${plan.currency}`);
          console.log(`      ID: ${plan.id} | Paystack: ${plan.paystackId}`);
        });
      }
    } else {
      console.log(`${YELLOW}  ⚠ Aucun plan en cache (exécuter: node scripts/sync-paystack-plans.mjs)${RESET}`);
      warnings++;
    }
  } catch (error) {
    console.log(`${RED}  ✗ Erreur de connexion DB: ${error.message}${RESET}`);
    errors++;
  }

  console.log('');

  // 5. Vérifier les webhooks
  console.log('🔔 5. Configuration des webhooks\n');

  const webhookUrl = process.env.NEXT_PUBLIC_WEBHOOK_URL || process.env.NEXT_PUBLIC_APP_URL;
  
  if (webhookUrl) {
    console.log(`${GREEN}  ✓ URL webhook configurée${RESET}`);
    console.log(`    ${webhookUrl}/api/webhooks/paystack`);
  } else {
    console.log(`${YELLOW}  ⚠ URL webhook non configurée${RESET}`);
    warnings++;
  }

  if (!PAYSTACK_WEBHOOK_SECRET) {
    console.log(`${YELLOW}  ⚠ Secret webhook non configuré (les webhooks ne seront pas vérifiés)${RESET}`);
    warnings++;
  }

  console.log('');

  // Résumé
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 RÉSUMÉ');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  if (errors === 0 && warnings === 0) {
    console.log(`${GREEN}✅ Configuration Paystack parfaite !${RESET}`);
    console.log('');
    console.log('Prêt pour la production 🚀');
  } else {
    if (errors > 0) {
      console.log(`${RED}❌ ${errors} erreur(s) bloquante(s)${RESET}`);
    }
    if (warnings > 0) {
      console.log(`${YELLOW}⚠️  ${warnings} avertissement(s)${RESET}`);
    }
    console.log('');
    
    if (errors > 0) {
      console.log(`${RED}⛔ Configuration Paystack incomplète - Corrigez les erreurs avant de déployer${RESET}`);
    } else {
      console.log(`${YELLOW}⚠️  Configuration Paystack fonctionnelle mais avec des avertissements${RESET}`);
    }
  }
  
  console.log('');

  // Recommandations
  if (errors > 0 || warnings > 0) {
    console.log('💡 RECOMMANDATIONS:\n');
    
    if (!PAYSTACK_SECRET_KEY) {
      console.log('  1. Configurez PAYSTACK_SECRET_KEY dans .env.production');
      console.log('     Obtenez-la sur: https://dashboard.paystack.com/settings/developer');
    }
    
    if (PAYSTACK_SECRET_KEY && PAYSTACK_SECRET_KEY.startsWith('sk_test_')) {
      console.log('  2. Utilisez une clé LIVE (sk_live_) en production');
    }
    
    if (errors > 0) {
      console.log('  3. Vérifiez que la clé est valide sur le dashboard Paystack');
    }
    
    console.log('');
  }

  await prisma.$disconnect();
  process.exit(errors > 0 ? 1 : 0);
}

checkPaystackConfig();
