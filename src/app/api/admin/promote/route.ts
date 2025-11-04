/**
 * API Route: Promote User to Admin (Development Only)
 * POST /api/admin/promote
 * 
 * ⚠️ ATTENTION: Cette route est uniquement pour le développement
 * Elle doit être supprimée ou sécurisée en production
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  // ⚠️ Vérification environnement de développement
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Cette route n\'est disponible qu\'en développement' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { email, action } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur est connecté
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      );
    }

    let updatedUser;

    if (action === 'promote') {
      // Promouvoir au rôle ADMIN
      updatedUser = await prisma.user.update({
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

      console.log(`✅ Utilisateur ${email} promu au rôle ADMIN par ${currentUser.email}`);
    } else if (action === 'demote') {
      // Rétrograder au rôle USER
      updatedUser = await prisma.user.update({
        where: { email },
        data: { role: 'USER' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          clerkId: true,
        },
      });

      console.log(`✅ Utilisateur ${email} rétrogradé au rôle USER par ${currentUser.email}`);
    } else {
      return NextResponse.json(
        { error: 'Action invalide. Utilisez "promote" ou "demote"' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: `Utilisateur ${action === 'promote' ? 'promu' : 'rétrogradé'} avec succès`,
      user: updatedUser,
    });

  } catch (error: any) {
    console.error('Erreur lors de la modification du rôle:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé. Assurez-vous qu\'il s\'est connecté au moins une fois.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Erreur lors de la modification du rôle', details: error.message },
      { status: 500 }
    );
  }
}