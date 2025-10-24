/**
 * Script pour trouver l'ID réel de l'utilisateur dans la base
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function findUser() {
  try {
    const email = 'k.dipomin@gmail.com';
    
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        clerkId: true,
        email: true,
        firstName: true,
        lastName: true,
        _count: {
          select: {
            imageGenerations: true
          }
        }
      }
    });

    if (user) {
      console.log('👤 Utilisateur trouvé:');
      console.log('   ID Prisma:', user.id);
      console.log('   Clerk ID:', user.clerkId);
      console.log('   Email:', user.email);
      console.log('   Nom:', user.firstName, user.lastName);
      console.log('   Images générées:', user._count.imageGenerations);
    } else {
      console.log('❌ Utilisateur non trouvé');
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

findUser();
