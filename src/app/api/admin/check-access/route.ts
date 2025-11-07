import { NextResponse } from 'next/server';
import { requireAdmin, isAdmin } from '@/lib/auth-admin';

/**
 * Route API pour vérifier si l'utilisateur a accès à l'espace admin
 * GET /api/admin/check-access
 */
export async function GET() {
  try {
    // Utiliser requireAdmin qui throw une erreur si pas admin
    const user = await requireAdmin();

    return NextResponse.json({
      authorized: true,
      role: user.role,
      userId: user.id,
      email: user.email,
    });
  } catch (error) {
    console.error('Accès admin refusé:', error);

    // Déterminer le type d'erreur
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMessage.includes('Unauthorized')) {
      return NextResponse.json(
        { 
          authorized: false, 
          error: 'Non authentifié',
          message: 'Vous devez être connecté pour accéder à cette section.'
        },
        { status: 401 }
      );
    }

    if (errorMessage.includes('Forbidden')) {
      return NextResponse.json(
        { 
          authorized: false, 
          error: 'Accès interdit',
          message: 'Vous n\'avez pas les permissions nécessaires pour accéder à cette section.'
        },
        { status: 403 }
      );
    }

    // Erreur générique
    return NextResponse.json(
      { 
        authorized: false, 
        error: 'Erreur serveur',
        message: 'Une erreur s\'est produite lors de la vérification des permissions.'
      },
      { status: 500 }
    );
  }
}
