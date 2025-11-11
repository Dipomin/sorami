import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { deductCredits } from '@/lib/credits';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9006';

interface ReferenceImage {
  source: 'url' | 'base64';
  data: string;
  type: 'subject' | 'style' | 'asset';
}

interface VideoGenerationCustomRequest {
  prompt: string;
  reference_images?: ReferenceImage[];
  aspect_ratio?: '16:9' | '16:10';
  duration_seconds?: 5 | 6 | 7 | 8;
  number_of_videos?: number;
  save_to_cloud?: boolean;
}

export async function POST(request: Request) {
  try {
    console.log('🎬 [Custom Video Generate API] Réception d\'une requête de génération de vidéo personnalisée...');

    // 1️⃣ Authentification
    let user;
    try {
      user = await requireAuth();
    } catch (authError) {
      console.error('❌ [Custom Video Generate API] Erreur d\'authentification:', authError);
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: authError instanceof Error ? authError.message : 'Erreur de vérification',
        },
        { status: 401 }
      );
    }

    // 2️⃣ Parser la requête
    const data: VideoGenerationCustomRequest = await request.json();
    
    // 🪙 Déduction des crédits AVANT la génération (vidéos personnalisées = 8 crédits)
    const numVideos = data.number_of_videos || 1;
    const creditResult = await deductCredits({
      userId: user.id,
      contentType: 'VIDEO_CUSTOM',
      quantity: numVideos,
      metadata: {
        prompt: data.prompt?.substring(0, 100),
        aspect_ratio: data.aspect_ratio,
        duration: data.duration_seconds,
        hasReferenceImages: (data.reference_images?.length || 0) > 0,
      },
    });

    if (!creditResult.success) {
      console.error('❌ [Custom Video Generate API] Crédits insuffisants:', creditResult.error);
      return NextResponse.json(
        {
          error: 'Insufficient credits',
          message: creditResult.error,
          creditsAvailable: creditResult.creditsRemaining,
          creditsRequired: numVideos * 8, // 8 crédits par vidéo personnalisée
        },
        { status: 402 } // Payment Required
      );
    }

    console.log('✅ [Custom Video Generate API] Crédits déduits:', {
      deducted: creditResult.creditsDeducted,
      remaining: creditResult.creditsRemaining,
    });
    console.log('📦 [Custom Video Generate API] Données reçues:', {
      prompt: data.prompt?.substring(0, 50),
      aspect_ratio: data.aspect_ratio,
      duration: data.duration_seconds,
      num_videos: data.number_of_videos,
      reference_images_count: data.reference_images?.length || 0,
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
        personGeneration: 'ALLOW_ALL',
        inputImageBase64: null, // Les images sont envoyées en reference_images
        model: 'veo-3.1-generate-preview',
        status: 'PENDING',
        progress: 0,
        message: 'Initialisation de la génération...',
      },
    });

    console.log('✅ [Custom Video Generate API] VideoGeneration créée:', {
      id: videoGeneration.id,
      authorId: videoGeneration.authorId,
    });

    // 4️⃣ Appeler le backend Flask avec le job_id de Prisma
    const backendPayload = {
      ...data,
      job_id: videoGeneration.id, // ✨ Utiliser l'ID Prisma comme job_id
      user_id: user.id,
    };

    console.log('🚀 [Custom Video Generate API] Envoi au backend Flask...', {
      url: `${BACKEND_API_URL}/api/secure/videos/generate-with-images`,
      job_id: videoGeneration.id,
    });

    const backendResponse = await fetch(`${BACKEND_API_URL}/api/secure/videos/generate-with-images`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
      },
      body: JSON.stringify(backendPayload),
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('❌ [Custom Video Generate API] Erreur backend:', {
        status: backendResponse.status,
        error: errorText,
      });

      // Mettre à jour le statut en FAILED
      await prisma.videoGeneration.update({
        where: { id: videoGeneration.id },
        data: {
          status: 'FAILED',
          error: `Erreur backend: ${errorText}`,
        },
      });

      return NextResponse.json(
        {
          error: 'Backend error',
          message: errorText,
        },
        { status: backendResponse.status }
      );
    }

    const backendData = await backendResponse.json();
    console.log('✅ [Custom Video Generate API] Réponse backend:', backendData);

    // 5️⃣ Mettre à jour le statut avec les infos du backend
    await prisma.videoGeneration.update({
      where: { id: videoGeneration.id },
      data: {
        status: 'PROCESSING',
        progress: 10,
        message: 'Génération en cours...',
      },
    });

    // 6️⃣ Retourner la réponse au frontend
    return NextResponse.json({
      success: true,
      job_id: videoGeneration.id,
      message: 'Génération démarrée avec succès',
      creditsRemaining: creditResult.creditsRemaining,
    });
  } catch (error) {
    console.error('❌ [Custom Video Generate API] Erreur:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
