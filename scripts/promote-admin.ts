/**
 * Script pour promouvoir un utilisateur au rôle ADMIN
 * Usage: npm run promote-admin <email>
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function promoteToAdmin(email: string) {
  try {
    console.log(`Promotion de l'utilisateur ${email} au rôle ADMIN...`);
    
    const user = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        clerkId: true,
      },
    });
    
    console.log('✅ Utilisateur promu avec succès:');
    console.log(`  - ID: ${user.id}`);
    console.log(`  - Email: ${user.email}`);
    console.log(`  - Nom: ${user.name}`);
    console.log(`  - Rôle: ${user.role}`);
    console.log(`  - Clerk ID: ${user.clerkId}`);
    
  } catch (error: any) {
    console.error('❌ Erreur lors de la promotion:', error);
    
    if (error.code === 'P2025') {
      console.error(`Utilisateur avec l'email ${email} non trouvé.`);
      console.log('Assurez-vous que l\'utilisateur s\'est connecté au moins une fois.');
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Récupérer l'email depuis les arguments de ligne de commande
const email = process.argv[2];

if (!email) {
  console.error('❌ Veuillez fournir un email:');
  console.log('Usage: npm run promote-admin <email>');
  process.exit(1);
}

// Validation email basique
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  console.error('❌ Format d\'email invalide');
  process.exit(1);
}

promoteToAdmin(email);