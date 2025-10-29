#!/usr/bin/env tsx
/**
 * Script pour mettre à jour les plans Paystack avec les crédits
 * Usage: npx tsx scripts/update-plans-credits.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mapping des plans avec leurs crédits
const PLAN_CREDITS_MAP: Record<string, number> = {
  // Plans réels de votre système
  'PLN_tjtizq7j4ow66cx': 500,    // Plan Standard mensuel = 500 crédits
  'PLN_cvsndsncqkkcnr4': 2000,   // Plan Créateurs mensuel = 2000 crédits
  
  // Exemples pour d'autres plans (à adapter)
  'PLN_starter_monthly': 100,    
  'PLN_starter_yearly': 1200,    
  'PLN_pro_monthly': 500,        
  'PLN_pro_yearly': 6000,        
  'PLN_enterprise_monthly': 2000,
  'PLN_enterprise_yearly': 24000,
};

async function updatePlansWithCredits() {
  try {
    console.log('🚀 Début de la mise à jour des plans avec les crédits...\n');

    // Récupérer tous les plans
    const plans = await prisma.paystackPlan.findMany();

    console.log(`📋 ${plans.length} plan(s) trouvé(s)\n`);

    for (const plan of plans) {
      // Chercher les crédits correspondants
      let credits = PLAN_CREDITS_MAP[plan.paystackId];

      // Si pas trouvé, essayer de deviner selon le nom
      if (!credits) {
        const nameLower = plan.name.toLowerCase();
        if (nameLower.includes('starter')) {
          credits = plan.interval === 'yearly' ? 1200 : 100;
        } else if (nameLower.includes('pro')) {
          credits = plan.interval === 'yearly' ? 6000 : 500;
        } else if (nameLower.includes('enterprise') || nameLower.includes('premium')) {
          credits = plan.interval === 'yearly' ? 24000 : 2000;
        } else {
          credits = 0; // Plan gratuit ou inconnu
        }
      }

      // Mettre à jour le plan
      const updatedPlan = await prisma.paystackPlan.update({
        where: { id: plan.id },
        data: { credits },
      });

      console.log(`✅ Plan mis à jour: ${updatedPlan.name}`);
      console.log(`   - ID Paystack: ${updatedPlan.paystackId}`);
      console.log(`   - Crédits: ${updatedPlan.credits}`);
      console.log(`   - Prix: ${updatedPlan.amount} ${updatedPlan.currency}`);
      console.log(`   - Intervalle: ${updatedPlan.interval}\n`);
    }

    console.log('✨ Mise à jour terminée avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Fonction pour afficher les plans actuels
async function displayCurrentPlans() {
  try {
    const plans = await prisma.paystackPlan.findMany();
    
    console.log('\n📊 PLANS ACTUELS:\n');
    console.log('ID Paystack | Nom | Prix | Intervalle | Crédits');
    console.log('-'.repeat(70));
    
    plans.forEach(plan => {
      console.log(`${plan.paystackId} | ${plan.name} | ${plan.amount} ${plan.currency} | ${plan.interval} | ${plan.credits}`);
    });
    
    console.log('\n');
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Exécution
const command = process.argv[2];

if (command === 'show') {
  displayCurrentPlans().then(() => process.exit(0));
} else {
  updatePlansWithCredits().then(() => process.exit(0));
}
