/**
 * Admin Authentication Helper
 * Vérifie que l'utilisateur est authentifié ET a le rôle ADMIN
 */

import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

/**
 * Vérifie que l'utilisateur est authentifié et a le rôle ADMIN
 * @throws Error si non authentifié ou pas admin
 * @returns User avec ses informations
 */
export async function requireAdmin() {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Unauthorized - Authentication required');
  }

  // Récupérer l'utilisateur avec son rôle
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });

  if (!user) {
    throw new Error('User not found in database');
  }

  // Vérifier le rôle ADMIN
  if (user.role !== 'ADMIN') {
    throw new Error('Forbidden - Admin access required');
  }

  return user;
}

/**
 * Vérifie si l'utilisateur connecté est admin (sans throw)
 * @returns boolean
 */
export async function isAdmin(): Promise<boolean> {
  try {
    await requireAdmin();
    return true;
  } catch {
    return false;
  }
}
