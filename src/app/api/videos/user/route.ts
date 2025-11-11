/**
 * API Route: GET /api/videos/user
 * Récupère toutes les vidéos générées par l'utilisateur connecté avec pagination
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getVideoPresignedUrl } from "@/lib/s3-storage";

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const user = await requireAuth();

    // Pagination
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const skip = (page - 1) * limit;

    console.log(`📹 Récupération des vidéos pour l'utilisateur ${user.id}, page ${page}`);

    // Récupérer les vidéos de l'utilisateur avec leurs fichiers
    const videoGenerations = await prisma.videoGeneration.findMany({
      where: {
        authorId: user.id,
        status: "COMPLETED", // Uniquement les vidéos terminées
      },
      include: {
        videos: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: {
        completedAt: "desc",
      },
      skip,
      take: limit,
    });

    console.log(
      `✅ ${videoGenerations.length} génération(s) trouvée(s) pour l'utilisateur ${user.id}`
    );

    // Régénérer les URLs présignées pour toutes les vidéos
    const generationsWithFreshUrls = await Promise.all(
      videoGenerations.map(async (gen) => {
        const videosWithFreshUrls = await Promise.all(
          gen.videos
            .filter((vid) => vid.fileUrl) // Filtrer les vidéos sans URL
            .map(async (vid) => {
              try {
                // Régénérer l'URL présignée (expire dans 1h)
                const freshUrl = await getVideoPresignedUrl(vid.fileUrl!, 3600);

                return {
                  id: vid.id,
                  filename: vid.filename,
                  fileUrl: freshUrl,
                  width: vid.width,
                  height: vid.height,
                  durationSeconds: vid.durationSeconds,
                  format: vid.format,
                  createdAt: vid.createdAt.toISOString(),
                };
              } catch (error) {
                console.error(`❌ Erreur génération URL pour vidéo ${vid.id}:`, error);
                return null;
              }
            })
        );

        return {
          id: gen.id,
          prompt: gen.prompt,
          createdAt: gen.createdAt.toISOString(),
          completedAt: gen.completedAt?.toISOString() || null,
          videos: videosWithFreshUrls.filter((v) => v !== null),
        };
      })
    );

    return NextResponse.json({
      generations: generationsWithFreshUrls,
      page,
      limit,
    });
  } catch (error) {
    console.error("❌ Erreur récupération vidéos utilisateur:", error);

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error: "Erreur lors de la récupération des vidéos",
      },
      { status: 500 }
    );
  }
}

