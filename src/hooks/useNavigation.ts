import { useUser } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export interface NavItem {
  href: string;
  icon?: any;
  label: string;
  description?: string;
  requiresAuth?: boolean;
  adminOnly?: boolean;
}

export const useNavigation = () => {
  const { isSignedIn, user, isLoaded } = useUser();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Vérifier si l'utilisateur est admin
  const isAdmin = user?.publicMetadata?.role === 'admin';

  // Navigation items avec permissions
  const getFilteredNavItems = (items: NavItem[]) => {
    if (!mounted || !isLoaded) return [];

    return items.filter(item => {
      // Si l'item nécessite une authentification
      if (item.requiresAuth && !isSignedIn) return false;
      
      // Si l'item nécessite les droits admin
      if (item.adminOnly && !isAdmin) return false;
      
      return true;
    });
  };

  // Vérifier si une route est active
  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(href);
  };

  // Vérifier si l'utilisateur peut accéder à une route
  const canAccessRoute = (item: NavItem) => {
    if (item.requiresAuth && !isSignedIn) return false;
    if (item.adminOnly && !isAdmin) return false;
    return true;
  };

  // Obtenir le nombre de crédits de l'utilisateur
  const getUserCredits = () => {
    return user?.publicMetadata?.credits || 0;
  };

  // Vérifier si l'utilisateur a un abonnement actif
  const hasActiveSubscription = () => {
    return user?.publicMetadata?.subscription === 'active';
  };

  return {
    isSignedIn,
    user,
    isLoaded,
    mounted,
    isAdmin,
    pathname,
    getFilteredNavItems,
    isActiveRoute,
    canAccessRoute,
    getUserCredits,
    hasActiveSubscription,
  };
};