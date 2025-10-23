import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ImageGenerationRequest } from '@/types/image-api';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9006';

export async function POST(request: Request) {
  try {
    console.log('🎨 [Image Generate API] Réception d\'une requête de génération d\'images...');

    // 1️⃣ Authentification
    const user = await requireAuth();

    // Récupérer l'organisation par défaut de l'utilisateur
    const organizationMember = await prisma.organizationMember.findFirst({
      where: { userId: user.id },
      orderBy: { joinedAt: 'asc' },
      select: { organizationId: true }
    });

    const organizationId = organizationMember?.organizationId || null;

    // 2️⃣ Parser la requête
    const data: ImageGenerationRequest = await request.json();
    console.log('📦 [Image Generate API] Données reçues:', {
      prompt: data.prompt?.substring(0, 50),
      size: data.size,
      style: data.style,
    });

    // 3️⃣ Créer l'entrée ImageGeneration dans Prisma AVANT d'appeler le backend
    const imageGeneration = await prisma.imageGeneration.create({
      data: {
        authorId: user.id,
        organizationId: organizationId,
        prompt: data.prompt,
        inputImageUrl: data.input_image_url || null,
        numImages: data.num_images || 1,
        size: data.size || '1024x1024',
        format: data.format || 'PNG',
        style: data.style || 'photorealistic',
        quality: data.quality || 'standard',
        model: 'gemini-2.5-flash-image', // Modèle par défaut
        status: 'PENDING',
        progress: 0,
        message: 'Initialisation de la génération...',
      },
    });

    console.log('✅ [Image Generate API] ImageGeneration créée:', {
      id: imageGeneration.id,
      authorId: imageGeneration.authorId,
    });

    // 4️⃣ Appeler le backend Flask avec le job_id de Prisma
    const backendPayload = {
      ...data,
      job_id: imageGeneration.id, // ✨ Utiliser l'ID Prisma
      user_id: user.id,
    };

    console.log('🚀 [Image Generate API] Envoi au backend Flask...', {
      url: `${BACKEND_API_URL}/api/images/generate`,
      job_id: imageGeneration.id,
    });

    const backendResponse = await fetch(`${BACKEND_API_URL}/api/images/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
      },
      body: JSON.stringify(backendPayload),
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}));
      console.error('❌ [Image Generate API] Erreur backend:', errorData);

      // Mettre à jour le statut en cas d'erreur
      await prisma.imageGeneration.update({
        where: { id: imageGeneration.id },
        data: {
          status: 'FAILED',
          error: errorData.message || 'Erreur lors de la communication avec le backend',
          message: errorData.message,
        },
      });

      throw new Error(errorData.message || 'Erreur lors de la génération d\'images');
    }

    const backendResult = await backendResponse.json();
    console.log('✅ [Image Generate API] Réponse du backend:', backendResult);

    // 5️⃣ Retourner la réponse avec le job_id Prisma
    return NextResponse.json({
      job_id: imageGeneration.id,
      status: imageGeneration.status,
      message: 'Génération d\'images démarrée',
      created_at: imageGeneration.createdAt.toISOString(),
    });

  } catch (error) {
    console.error('❌ [Image Generate API] Erreur:', error);
    
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
