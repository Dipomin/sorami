import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

const subscribeSchema = z.object({
  email: z.string().email('Adresse email invalide'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = subscribeSchema.parse(body);
    const { email } = validatedData;

    // Vérifier si l'email existe déjà
    const existingSubscription = await prisma.newsletterSubscription.findUnique({
      where: { email },
    });

    if (existingSubscription) {
      if (existingSubscription.isActive) {
        return NextResponse.json(
          { message: 'Cette adresse email est déjà inscrite à notre newsletter.' },
          { status: 400 }
        );
      } else {
        // Réactiver l'abonnement s'il était désactivé
        await prisma.newsletterSubscription.update({
          where: { email },
          data: {
            isActive: true,
            subscribedAt: new Date(),
          },
        });

        return NextResponse.json({
          message: 'Votre abonnement à la newsletter a été réactivé avec succès !',
        });
      }
    }

    // Créer un nouvel abonnement
    await prisma.newsletterSubscription.create({
      data: {
        email,
        isActive: true,
        subscribedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: 'Merci ! Vous êtes maintenant inscrit à notre newsletter.',
    });

  } catch (error) {
    console.error('Erreur lors de l\'inscription à la newsletter:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Une erreur est survenue. Veuillez réessayer.' },
      { status: 500 }
    );
  }
}

// Route pour se désabonner
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { message: 'Adresse email requise' },
        { status: 400 }
      );
    }

    await prisma.newsletterSubscription.updateMany({
      where: { email, isActive: true },
      data: { isActive: false },
    });

    return NextResponse.json({
      message: 'Vous avez été désabonné avec succès.',
    });

  } catch (error) {
    console.error('Erreur lors de la désinscription:', error);
    return NextResponse.json(
      { message: 'Une erreur est survenue. Veuillez réessayer.' },
      { status: 500 }
    );
  }
}