import { auth, currentUser } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Récupère l'utilisateur actuel connecté via Clerk
 * et le synchronise avec notre base de données si nécessaire
 */
export async function getCurrentUser() {
  const { userId } = await auth();
  
  if (!userId) {
    return null;
  }
  
  try {
    // Chercher l'utilisateur dans notre base de données
    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        organizationMemberships: {
          include: {
            organization: true,
          },
        },
      },
    });
    
    // Si l'utilisateur n'existe pas dans notre base, le créer automatiquement
    if (!user) {
      console.log('Utilisateur Clerk trouvé mais pas en base, synchronisation...');
      
      // Récupérer les données de l'utilisateur depuis Clerk
      const clerkUser = await currentUser();
      
      if (!clerkUser) {
        console.error('Impossible de récupérer les données utilisateur de Clerk');
        return null;
      }
      
      const email = clerkUser.emailAddresses[0]?.emailAddress;
      
      if (!email) {
        console.error('Email manquant dans les données Clerk');
        return null;
      }
      
      // Créer l'utilisateur dans notre base de données
      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email,
          firstName: clerkUser.firstName || '',
          lastName: clerkUser.lastName || '',
          name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || email,
          avatar: clerkUser.imageUrl || null,
          role: 'USER',
          status: 'ACTIVE',
          isEmailVerified: clerkUser.emailAddresses[0]?.verification?.status === 'verified',
        },
        include: {
          organizationMemberships: {
            include: {
              organization: true,
            },
          },
        },
      });
      
      console.log('Utilisateur synchronisé avec succès:', user.id);
    }
    
    return user;
  } catch (error) {
    console.error('Erreur lors de la récupération/synchronisation de l\'utilisateur:', error);
    return null;
  }
}

/**
 * Vérifie si l'utilisateur est authentifié
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Utilisateur non authentifié');
  }
  
  return user;
}

/**
 * Vérifie si l'utilisateur a un rôle spécifique
 */
export async function requireRole(requiredRole: string) {
  const user = await requireAuth();
  
  if (user.role !== requiredRole && user.role !== 'ADMIN') {
    throw new Error('Permissions insuffisantes');
  }
  
  return user;
}

/**
 * Récupère l'organisation par défaut de l'utilisateur
 */
export async function getUserDefaultOrganization() {
  const user = await getCurrentUser();
  
  if (!user) {
    return null;
  }
  
  // Retourner la première organisation de l'utilisateur
  // ou créer une organisation personnelle si aucune n'existe
  const membership = user.organizationMemberships[0];
  
  if (membership) {
    return membership.organization;
  }
  
  return null;
}