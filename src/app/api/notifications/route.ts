import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    
    // Pour l'instant, retourner des notifications simulées
    // En attendant l'ajout du modèle Notification au schema Prisma
    const mockNotifications = [
      {
        id: '1',
        type: 'BOOK_COMPLETED',
        title: 'Livre terminé !',
        message: 'Votre livre a été généré avec succès !',
        isRead: false,
        createdAt: new Date().toISOString(),
        metadata: {}
      }
    ];

    return NextResponse.json({
      notifications: mockNotifications,
      unreadCount: mockNotifications.filter(n => !n.isRead).length
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error);
    
    if (error instanceof Error && error.message === 'Utilisateur non authentifié') {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { notificationId, isRead } = await request.json();
    
    // Marquer une notification comme lue/non lue
    // À implémenter avec Prisma quand le modèle Notification sera ajouté
    
    console.log(`Notification ${notificationId} marquée comme ${isRead ? 'lue' : 'non lue'} pour l'utilisateur ${user.id}`);
    
    return NextResponse.json({
      success: true,
      message: 'Statut de notification mis à jour'
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de la notification:', error);
    
    if (error instanceof Error && error.message === 'Utilisateur non authentifié') {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}