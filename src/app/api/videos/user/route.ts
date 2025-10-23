/**
 * API Route: GET /api/videos/user
 * Récupère toutes les vidéos générées par l'utilisateur connecté
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const user = await requireAuth();

    console.log("📹 Récupération des vidéos pour l'utilisateur:", user.id);

    // Récupérer les vidéos de l'utilisateur avec leurs fichiers
    const videoGenerations = await prisma.videoGeneration.findMany({
      where: {
        authorId: user.id,
        status: "COMPLETED", // Uniquement les vidéos terminées
      },
      include: {
        videos: true, // Relation videos (VideoFile[])
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log(
      `✅ ${videoGenerations.length} vidéo(s) trouvée(s) pour l'utilisateur ${user.id}`
    );

    // Formater les données pour le frontend
    const videos = videoGenerations.map((gen) => {
      const firstVideo = gen.videos[0]; // Prendre la première vidéo générée
      
      return {
        id: gen.id,
        prompt: gen.prompt,
        duration: gen.durationSeconds,
        status: gen.status.toLowerCase(),
        created_at: gen.createdAt.toISOString(),
        completed_at: gen.completedAt?.toISOString(),
        video_file: firstVideo
          ? {
              id: firstVideo.id,
              file_url: firstVideo.fileUrl,
              file_path: firstVideo.filePath,
              file_size: firstVideo.fileSize,
              duration_seconds: firstVideo.durationSeconds,
              dimensions: {
                width: firstVideo.width,
                height: firstVideo.height,
              },
              created_at: firstVideo.createdAt.toISOString(),
            }
          : undefined,
      };
    });

    return NextResponse.json({
      success: true,
      videos,
      count: videos.length,
    });
  } catch (error) {
    console.error("❌ Erreur récupération vidéos utilisateur:", error);

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la récupération des vidéos",
      },
      { status: 500 }
    );
  }
}
