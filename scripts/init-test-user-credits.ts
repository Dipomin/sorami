#!/usr/bin/env ts-node

/**
 * 🧪 Script d'Initialisation - Utilisateur de Test avec Crédits
 * 
 * Ce script crée un utilisateur de test avec un solde de crédits initial
 * pour faciliter les tests du système de déduction.
 * 
 * Usage:
 *   npx ts-node scripts/init-test-user-credits.ts
 * 
 * Ou depuis package.json:
 *   npm run test:init-credits
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface TestUserConfig {
  email: string;
  initialCredits: number;
  name?: string;
}

const TEST_USERS: TestUserConfig[] = [
  {
    email: 'test-insufficient@sorami.ai',
    initialCredits: 5, // Pas assez pour un ebook (10)
    name: 'Test Insuffisant',
  },
  {
    email: 'test-sufficient@sorami.ai',
    initialCredits: 100, // Suffisant pour tous les tests
    name: 'Test Suffisant',
  },
  {
    email: 'test-empty@sorami.ai',
    initialCredits: 0, // Aucun crédit
    name: 'Test Vide',
  },
];

async function createOrUpdateTestUser(config: TestUserConfig) {
  const { email, initialCredits, name } = config;

  try {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log(`📝 Utilisateur existant trouvé: ${email}`);
      
      // Mettre à jour les crédits
      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          credits: initialCredits,
          creditsUpdatedAt: new Date(),
        },
      });

      console.log(`✅ Crédits mis à jour: ${updatedUser.credits} crédits`);
      return updatedUser;
    }

    // Créer un nouvel utilisateur
    console.log(`🆕 Création d'un nouveau utilisateur: ${email}`);
    
    const newUser = await prisma.user.create({
      data: {
        email,
        name: name || email.split('@')[0],
        clerkId: `test_clerk_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        credits: initialCredits,
        totalCreditsUsed: 0,
        creditsUpdatedAt: new Date(),
      },
    });

    console.log(`✅ Utilisateur créé avec ${newUser.credits} crédits`);

    // Créer une transaction initiale pour l'historique
    await prisma.creditTransaction.create({
      data: {
        userId: newUser.id,
        amount: initialCredits,
        type: 'BONUS',
        description: `Crédits de test initiaux (${initialCredits})`,
        metadata: {
          source: 'test-script',
          purpose: 'testing',
        },
      },
    });

    console.log(`📊 Transaction initiale créée`);

    return newUser;
  } catch (error) {
    console.error(`❌ Erreur pour ${email}:`, error);
    throw error;
  }
}

async function main() {
  console.log('🚀 Initialisation des utilisateurs de test avec crédits\n');
  console.log('═'.repeat(60));

  for (const config of TEST_USERS) {
    console.log(`\n🧪 Configuration: ${config.email}`);
    console.log(`   Crédits initiaux: ${config.initialCredits}`);
    console.log('─'.repeat(60));

    await createOrUpdateTestUser(config);
  }

  console.log('\n' + '═'.repeat(60));
  console.log('✅ Initialisation terminée !');
  console.log('\n📝 Utilisateurs de test créés/mis à jour:\n');

  const users = await prisma.user.findMany({
    where: {
      email: {
        in: TEST_USERS.map((u) => u.email),
      },
    },
    select: {
      email: true,
      credits: true,
      totalCreditsUsed: true,
      _count: {
        select: {
          creditTransactions: true,
        },
      },
    },
  });

  users.forEach((user) => {
    console.log(`📧 ${user.email}`);
    console.log(`   💰 Crédits: ${user.credits}`);
    console.log(`   📊 Total utilisé: ${user.totalCreditsUsed}`);
    console.log(`   🧾 Transactions: ${user._count.creditTransactions}`);
    console.log('');
  });

  console.log('🎯 Scénarios de test recommandés:\n');
  console.log('1️⃣  Test Crédits Insuffisants:');
  console.log('    Email: test-insufficient@sorami.ai');
  console.log('    Essayer de générer un ebook (coût: 10) → Devrait échouer (402)\n');

  console.log('2️⃣  Test Crédits Suffisants:');
  console.log('    Email: test-sufficient@sorami.ai');
  console.log('    Générer images/vidéos/blogs → Devrait fonctionner\n');

  console.log('3️⃣  Test Crédits Vides:');
  console.log('    Email: test-empty@sorami.ai');
  console.log('    Essayer toute génération → Devrait échouer (402)\n');

  console.log('💡 Pour ajouter des crédits manuellement:');
  console.log('   npx prisma studio');
  console.log('   → Aller dans User → Modifier le champ "credits"\n');
}

main()
  .catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
