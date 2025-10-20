import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type WebhookEvent = {
  data: {
    id: string;
    email_addresses: { email_address: string }[];
    first_name?: string;
    last_name?: string;
    image_url?: string;
  };
  type: string;
};

export async function POST(req: NextRequest) {
  // Vérifier les headers du webhook
  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'Erreur: headers manquants' }, { status: 400 });
  }

  const payload = await req.text();
  const body = JSON.parse(payload);

  // Vérifier la signature du webhook
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');

  let evt: WebhookEvent;

  try {
    evt = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Erreur de vérification du webhook:', err);
    return NextResponse.json({ error: 'Erreur de vérification' }, { status: 400 });
  }

  const { id } = evt.data;
  const eventType = evt.type;

  console.log(`Webhook avec ID ${id} et type ${eventType}`);
  console.log('Body du webhook:', body);

  try {
    switch (eventType) {
      case 'user.created':
        await handleUserCreated(evt.data);
        break;
      case 'user.updated':
        await handleUserUpdated(evt.data);
        break;
      case 'user.deleted':
        await handleUserDeleted(evt.data);
        break;
      default:
        console.log(`Type d'événement non géré: ${eventType}`);
    }

    return NextResponse.json({ message: 'Succès' }, { status: 200 });
  } catch (error) {
    console.error('Erreur lors du traitement du webhook:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

async function handleUserCreated(userData: WebhookEvent['data']) {
  const { id, email_addresses, first_name, last_name } = userData;
  const email = email_addresses[0]?.email_address;

  if (!email) {
    throw new Error('Email manquant dans les données utilisateur');
  }

  try {
    // Créer l'utilisateur dans notre base de données
    const user = await prisma.user.create({
      data: {
        clerkId: id,
        email,
        firstName: first_name || '',
        lastName: last_name || '',
        role: 'USER',
        status: 'ACTIVE',
      },
    });

    console.log('Utilisateur créé:', user);
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    throw error;
  }
}

async function handleUserUpdated(userData: WebhookEvent['data']) {
  const { id, email_addresses, first_name, last_name } = userData;
  const email = email_addresses[0]?.email_address;

  try {
    // Mettre à jour l'utilisateur dans notre base de données
    const user = await prisma.user.update({
      where: { clerkId: id },
      data: {
        email: email || undefined,
        firstName: first_name || undefined,
        lastName: last_name || undefined,
      },
    });

    console.log('Utilisateur mis à jour:', user);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    throw error;
  }
}

async function handleUserDeleted(userData: WebhookEvent['data']) {
  const { id } = userData;

  try {
    // Soft delete ou hard delete selon vos besoins
    const user = await prisma.user.update({
      where: { clerkId: id },
      data: {
        status: 'DELETED',
      },
    });

    console.log('Utilisateur supprimé (soft delete):', user);
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    throw error;
  }
}