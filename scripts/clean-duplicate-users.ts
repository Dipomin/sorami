/**
 * Script de nettoyage des utilisateurs dupliqués
 * Usage: npm run clean-duplicate-users
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanDuplicateUsers() {
  try {
    console.log('🔍 Recherche des utilisateurs dupliqués...');
    
    // Trouver les emails dupliqués
    const duplicateEmails = await prisma.user.groupBy({
      by: ['email'],
      having: {
        email: {
          _count: {
            gt: 1
          }
        }
      },
      _count: {
        email: true
      }
    });
    
    if (duplicateEmails.length === 0) {
      console.log('✅ Aucun utilisateur dupliqué trouvé');
      return;
    }
    
    console.log(`📋 ${duplicateEmails.length} emails avec des doublons trouvés:`);
    
    for (const duplicateEmail of duplicateEmails) {
      console.log(`\n📧 Email: ${duplicateEmail.email} (${duplicateEmail._count.email} doublons)`);
      
      // Récupérer tous les utilisateurs avec cet email
      const usersWithEmail = await prisma.user.findMany({
        where: { email: duplicateEmail.email },
        orderBy: { createdAt: 'asc' }, // Le plus ancien en premier
      });
      
      console.log('Utilisateurs trouvés:');
      usersWithEmail.forEach((user, index) => {
        console.log(`  ${index + 1}. ID: ${user.id}, ClerkId: ${user.clerkId}, Créé: ${user.createdAt}, Rôle: ${user.role}`);
      });
      
      // Garder le premier utilisateur (le plus ancien) et supprimer les autres
      const [keepUser, ...duplicateUsers] = usersWithEmail;
      
      if (duplicateUsers.length > 0) {
        console.log(`🗑️ Suppression de ${duplicateUsers.length} doublons pour garder l'utilisateur ${keepUser.id}...`);
        
        for (const duplicateUser of duplicateUsers) {
          // Transférer les données importantes si nécessaire
          if (duplicateUser.role === 'ADMIN' && keepUser.role !== 'ADMIN') {
            console.log(`⬆️ Promotion du rôle ADMIN pour l'utilisateur conservé`);
            await prisma.user.update({
              where: { id: keepUser.id },
              data: { role: 'ADMIN' }
            });
          }
          
          // Supprimer l'utilisateur dupliqué
          await prisma.user.delete({
            where: { id: duplicateUser.id }
          });
          
          console.log(`   ✅ Utilisateur ${duplicateUser.id} supprimé`);
        }
      }
    }
    
    console.log('\n🎉 Nettoyage terminé avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Demander confirmation avant de continuer
console.log('⚠️  ATTENTION: Ce script va supprimer les utilisateurs dupliqués');
console.log('Assurez-vous d\'avoir une sauvegarde de votre base de données');
console.log('Appuyez sur Ctrl+C pour annuler ou attendez 5 secondes...');

setTimeout(() => {
  cleanDuplicateUsers();
}, 5000);