import { NextRequest, NextResponse } from 'next/server';
import { sendContactEmail } from '@/lib/notifications';

// Types pour la validation
interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// Validation basique des données
function validateContactData(data: any): data is ContactFormData {
  return (
    typeof data.name === 'string' &&
    data.name.trim().length > 0 &&
    typeof data.email === 'string' &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) &&
    typeof data.subject === 'string' &&
    data.subject.trim().length > 0 &&
    typeof data.message === 'string' &&
    data.message.trim().length > 10
  );
}

export async function POST(request: NextRequest) {
  try {
    // Parse le body
    const body = await request.json();

    // Validation des données
    if (!validateContactData(body)) {
      return NextResponse.json(
        { error: 'Données du formulaire invalides. Veuillez vérifier tous les champs.' },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = body;

    // Trim les données
    const sanitizedData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
    };

    // Protection contre le spam (simple vérification de longueur)
    if (sanitizedData.message.length > 5000) {
      return NextResponse.json(
        { error: 'Le message est trop long. Maximum 5000 caractères.' },
        { status: 400 }
      );
    }

    // Envoyer l'email
    const emailSent = await sendContactEmail({
      name: sanitizedData.name,
      email: sanitizedData.email,
      subject: sanitizedData.subject,
      message: sanitizedData.message,
    });

    if (!emailSent) {
      console.error('❌ Échec de l\'envoi de l\'email de contact');
      return NextResponse.json(
        { 
          error: 'Impossible d\'envoyer le message pour le moment. Veuillez réessayer plus tard ou nous contacter directement à contact@sorami.app.' 
        },
        { status: 500 }
      );
    }

    console.log('✅ Email de contact envoyé avec succès', {
      name: sanitizedData.name,
      email: sanitizedData.email,
      subject: sanitizedData.subject,
    });

    return NextResponse.json(
      { 
        success: true,
        message: 'Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.' 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Erreur lors du traitement du formulaire de contact:', error);
    return NextResponse.json(
      { error: 'Une erreur inattendue s\'est produite. Veuillez réessayer.' },
      { status: 500 }
    );
  }
}
