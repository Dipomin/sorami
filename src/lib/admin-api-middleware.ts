/**
 * Middleware utilitaire pour protéger les routes API admin
 * Utilise requireAdmin() pour vérifier les permissions
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-admin';

export interface AdminApiHandler {
  (request: NextRequest, context?: any): Promise<NextResponse>;
}

/**
 * Wrapper pour protéger une route API avec vérification admin
 * @param handler La fonction handler de la route API
 * @returns Handler protégé
 */
export function withAdminAuth(handler: AdminApiHandler) {
  return async (request: NextRequest, context?: any) => {
    try {
      // Vérifier les permissions admin
      const adminUser = await requireAdmin();

      // Logger pour debugging
      console.log(`[Admin API] Accès autorisé pour ${adminUser.email} (${adminUser.role})`);

      // Ajouter les informations admin au contexte de la requête
      // @ts-ignore - Ajout de propriété personnalisée
      request.adminUser = adminUser;

      // Exécuter le handler protégé
      return await handler(request, context);
    } catch (error) {
      console.error('[Admin API] Accès refusé:', error);

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      if (errorMessage.includes('Unauthorized')) {
        return NextResponse.json(
          {
            error: 'Authentification requise',
            message: 'Vous devez être connecté pour accéder à cette ressource.',
          },
          { status: 401 }
        );
      }

      if (errorMessage.includes('Forbidden')) {
        return NextResponse.json(
          {
            error: 'Accès interdit',
            message: 'Vous n\'avez pas les permissions nécessaires. Rôle ADMIN requis.',
          },
          { status: 403 }
        );
      }

      // Erreur générique
      return NextResponse.json(
        {
          error: 'Erreur serveur',
          message: 'Une erreur s\'est produite lors de la vérification des permissions.',
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Vérifie les permissions admin et retourne l'utilisateur ou une réponse d'erreur
 * Utile pour les routes qui ont besoin de plus de contrôle
 */
export async function checkAdminPermissions(): Promise<
  { success: true; user: any } | { success: false; response: NextResponse }
> {
  try {
    const adminUser = await requireAdmin();
    console.log(`[Admin Check] Permissions OK pour ${adminUser.email}`);
    return { success: true, user: adminUser };
  } catch (error) {
    console.error('[Admin Check] Permissions refusées:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    if (errorMessage.includes('Unauthorized')) {
      return {
        success: false,
        response: NextResponse.json(
          { error: 'Authentification requise' },
          { status: 401 }
        ),
      };
    }

    return {
      success: false,
      response: NextResponse.json(
        { error: 'Accès interdit - Rôle ADMIN requis' },
        { status: 403 }
      ),
    };
  }
}
