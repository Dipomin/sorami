/**
 * Admin Authentication Helper
 * Vérifie que l'utilisateur est authentifié ET a le rôle ADMIN
 */

import { getCurrentUser } from '@/lib/auth';

/**
 * Vérifie que l'utilisateur est authentifié et a le rôle ADMIN
 * @throws Error si non authentifié ou pas admin
 * @returns User avec ses informations
 */
export async function requireAdmin() {
  // Utiliser getCurrentUser qui gère la synchronisation automatique
  
  const user = await getCurrentUser();

  console.log('requireAdmin - user:', user?.clerkId, user?.role);
  
  if (!user) {
    throw new Error('Unauthorized - Authentication required');
  }

  console.log('requireAdmin - user role:', user.role);

  // Vérifier le rôle ADMIN ou SUPER_ADMIN
  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
    throw new Error('Forbidden - Admin access required');
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
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
