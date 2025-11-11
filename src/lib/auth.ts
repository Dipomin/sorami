import { auth, currentUser } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Récupère l'utilisateur actuel connecté via Clerk
 * et le synchronise avec notre base de données si nécessaire
 */
export async function getCurrentUser() {
  try {
    console.log('🔐 [Auth] Tentative d\'authentification via Clerk...');
    const authResult = await auth();
    const { userId } = authResult;
    
    console.log('🔐 [Auth] Résultat auth():', { 
      userId, 
      sessionId: authResult.sessionId,
      orgId: authResult.orgId 
    });
    
    if (!userId) {
      console.log('🔐 [Auth] Aucun userId trouvé - utilisateur non connecté');
      return null;
    }
    
    console.log('🔐 [Auth] Recherche utilisateur dans la DB:', userId);
    
    // Chercher l'utilisateur dans notre base de données par clerkId
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
    
    // Si l'utilisateur n'existe pas dans notre base, le créer ou le synchroniser
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
      
      // Vérifier si un utilisateur existe déjà avec cet email
      const existingUserByEmail = await prisma.user.findUnique({
        where: { email },
        include: {
          organizationMemberships: {
            include: {
              organization: true,
            },
          },
        },
      });
      
      if (existingUserByEmail) {
        // Utilisateur existe avec cet email, mettre à jour le clerkId
        console.log(`Mise à jour du clerkId pour l'utilisateur existant: ${email}`);
        user = await prisma.user.update({
          where: { email },
          data: {
            clerkId: userId,
            // Mettre à jour les autres informations aussi
            firstName: clerkUser.firstName || existingUserByEmail.firstName,
            lastName: clerkUser.lastName || existingUserByEmail.lastName,
            name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || existingUserByEmail.name,
            avatar: clerkUser.imageUrl || existingUserByEmail.avatar,
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
        console.log('ClerkId mis à jour avec succès pour:', user.id);
      } else {
        // Créer un nouvel utilisateur
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
        console.log('Nouvel utilisateur créé avec succès:', user.id);
      }
    }
    
    return user;
  } catch (error: any) {
    console.error('Erreur lors de la récupération/synchronisation de l\'utilisateur:', error);
    
    // Si c'est une erreur Clerk spécifique, la propager
    if (error.message?.includes('signing key')) {
      console.error('Erreur de clé de signature Clerk - session invalide ou expirée');
      throw new Error('Erreur de vérification: ' + error.message);
    }
    
    // Gestion spécifique des erreurs Prisma
    if (error.code === 'P2002') {
      console.error('Contrainte unique violée - possible race condition');
    }
    
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

/**
 * Vérifie si l'utilisateur a un abonnement suffisant
 * @param requiredTier - Niveau d'abonnement requis ('free', 'pro', 'premium', 'enterprise')
 */
export async function hasSubscription(requiredTier: string): Promise<boolean> {
  const user = await getCurrentUser();
  
  if (!user) {
    return false;
  }

  const subscriptionTiers = {
    free: 0,
    pro: 1,
    premium: 2,
    enterprise: 3,
  };

  // Récupérer le tier depuis les métadonnées Clerk ou la base de données
  const clerkUser = await currentUser();
  const userSubscription = (clerkUser?.publicMetadata?.subscription as string) || 'free';
  
  const userTier = subscriptionTiers[userSubscription as keyof typeof subscriptionTiers] || 0;
  const required = subscriptionTiers[requiredTier as keyof typeof subscriptionTiers] || 0;

  return userTier >= required;
}

/**
 * Vérifie si l'utilisateur a accès à une fonctionnalité
 * @param feature - Nom de la fonctionnalité
 */
export async function hasFeatureAccess(feature: string): Promise<boolean> {
  const user = await getCurrentUser();
  
  if (!user) {
    return false;
  }

  // Vérifier les limites d'utilisation depuis la base de données
  // Cette logique peut être étendue selon vos besoins
  
  return true; // Par défaut, autoriser l'accès
}

/**
 * Interface pour les informations utilisateur formatées
 */
export interface AuthenticatedUser {
  userId: string;
  clerkId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  name: string | null;
  imageUrl: string | null;
  role: string;
  subscription?: string;
  organizationId?: string;
}

/**
 * Récupère les informations utilisateur formatées
 */
export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  const user = await getCurrentUser();
  const clerkUser = await currentUser();
  
  if (!user || !clerkUser) {
    return null;
  }

  const defaultOrg = await getUserDefaultOrganization();

  return {
    userId: user.id,
    clerkId: user.clerkId,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    name: user.name,
    imageUrl: user.avatar,
    role: user.role,
    subscription: (clerkUser.publicMetadata?.subscription as string) || 'free',
    organizationId: defaultOrg?.id,
  };
}