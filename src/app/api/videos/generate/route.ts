import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { deductCredits } from '@/lib/credits';
import type { VideoGenerationRequest } from '@/types/video-api';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9006';

export async function POST(request: Request) {
  try {
    console.log('🎬 [Video Generate API] Réception d\'une requête de génération de vidéo...');

    // 1️⃣ Authentification
    const user = await requireAuth();

    // 2️⃣ Parser la requête
    const data: VideoGenerationRequest = await request.json();
    
    // 🪙 Déduction des crédits AVANT la génération
    const numVideos = data.number_of_videos || 1;
    const creditResult = await deductCredits({
      userId: user.id,
      contentType: 'VIDEO',
      quantity: numVideos,
      metadata: {
        prompt: data.prompt?.substring(0, 100),
        aspect_ratio: data.aspect_ratio,
        duration: data.duration_seconds,
      },
    });

    if (!creditResult.success) {
      console.error('❌ [Video Generate API] Crédits insuffisants:', creditResult.error);
      return NextResponse.json(
        {
          error: 'Insufficient credits',
          message: creditResult.error,
          creditsAvailable: creditResult.creditsRemaining,
          creditsRequired: numVideos * 5, // 5 crédits par vidéo
        },
        { status: 402 } // Payment Required
      );
    }

    console.log('✅ [Video Generate API] Crédits déduits:', {
      deducted: creditResult.creditsDeducted,
      remaining: creditResult.creditsRemaining,
    });
    console.log('📦 [Video Generate API] Données reçues:', {
      prompt: data.prompt?.substring(0, 50),
      aspect_ratio: data.aspect_ratio,
      duration: data.duration_seconds,
      num_videos: data.number_of_videos,
    });

    // Récupérer l'organisation par défaut de l'utilisateur
    const organizationMember = await prisma.organizationMember.findFirst({
      where: { userId: user.id },
      orderBy: { joinedAt: 'asc' },
      select: { organizationId: true }
    });

    const organizationId = organizationMember?.organizationId || null;

    // 3️⃣ Créer l'entrée VideoGeneration dans Prisma AVANT d'appeler le backend
    const videoGeneration = await prisma.videoGeneration.create({
      data: {
        authorId: user.id,
        organizationId: organizationId,
        prompt: data.prompt,
        aspectRatio: data.aspect_ratio || '16:9',
        durationSeconds: data.duration_seconds || 8,
        numberOfVideos: data.number_of_videos || 1,
        personGeneration: data.person_generation || 'ALLOW_ALL',
        inputImageBase64: data.input_image_base64 || null,
        model: 'gemini-veo-2.0', // Modèle par défaut
        status: 'PENDING',
        progress: 0,
        message: 'Initialisation de la génération...',
      },
    });

    console.log('✅ [Video Generate API] VideoGeneration créée:', {
      id: videoGeneration.id,
      authorId: videoGeneration.authorId,
    });

    // 4️⃣ Appeler le backend Flask avec le job_id de Prisma
    const backendPayload = {
      ...data,
      job_id: videoGeneration.id, // ✨ Utiliser l'ID Prisma
      user_id: user.id,
    };

    console.log('🚀 [Video Generate API] Envoi au backend Flask...', {
      url: `${BACKEND_API_URL}/api/videos/generate`,
      job_id: videoGeneration.id,
    });

    const backendResponse = await fetch(`${BACKEND_API_URL}/api/videos/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
      },
      body: JSON.stringify(backendPayload),
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}));
      console.error('❌ [Video Generate API] Erreur backend:', errorData);

      // Mettre à jour le statut en cas d'erreur
      await prisma.videoGeneration.update({
        where: { id: videoGeneration.id },
        data: {
          status: 'FAILED',
          error: errorData.message || 'Erreur lors de la communication avec le backend',
          message: errorData.message,
        },
      });

      // Retourner une réponse avec le statut failed au lieu de lancer une erreur
      return NextResponse.json(
        {
          job_id: videoGeneration.id,
          status: 'FAILED',
          error: errorData.error || 'Backend error',
          message: errorData.message || 'Erreur lors de la génération de vidéo',
        },
        { status: 400 } // 400 au lieu de 500 car c'est une erreur de configuration backend
      );
    }

    const backendResult = await backendResponse.json();
    console.log('✅ [Video Generate API] Réponse du backend:', backendResult);

    // 5️⃣ Retourner la réponse avec le job_id Prisma
    return NextResponse.json({
      job_id: videoGeneration.id,
      status: videoGeneration.status,
      message: 'Génération de vidéo démarrée',
      created_at: videoGeneration.createdAt.toISOString(),
    });

  } catch (error) {
    console.error('❌ [Video Generate API] Erreur:', error);
    
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
