/**
 * API Route: GET /api/videos/[id]/download
 * Téléchargement d'une vidéo (fallback si S3 URL non disponible)
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: videoId } = await params;
  try {
    // Vérifier l'authentification
    const user = await requireAuth();

    console.log(
      "📥 Demande de téléchargement vidéo:",
      videoId,
      "par utilisateur:",
      user.id
    );

    // Récupérer la vidéo avec vérification de propriété
    const videoGeneration = await prisma.videoGeneration.findUnique({
      where: {
        id: videoId,
      },
      include: {
        videos: true,
      },
    });

    if (!videoGeneration) {
      return NextResponse.json(
        { success: false, error: "Vidéo non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur est bien le propriétaire
    if (videoGeneration.authorId !== user.id) {
      return NextResponse.json(
        { success: false, error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    // Vérifier qu'il y a au moins une vidéo
    const videoFile = videoGeneration.videos[0];
    if (!videoFile) {
      return NextResponse.json(
        { success: false, error: "Aucun fichier vidéo disponible" },
        { status: 404 }
      );
    }

    // Si on a une URL S3, rediriger vers celle-ci
    if (videoFile.fileUrl) {
      console.log("↗️ Redirection vers URL S3:", videoFile.fileUrl);
      return NextResponse.redirect(videoFile.fileUrl);
    }

    // Sinon, essayer de charger depuis le backend Flask
    console.log("🔄 Tentative de récupération depuis le backend Flask");
    
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
    const token = request.headers.get("authorization")?.split(" ")[1];

    const response = await fetch(
      `${backendUrl}/api/videos/${videoId}/download`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Erreur backend lors du téléchargement");
    }

    // Transférer le stream de la vidéo
    const videoBlob = await response.blob();
    
    return new NextResponse(videoBlob, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="${videoFile.filename}"`,
      },
    });
  } catch (error) {
    console.error("❌ Erreur téléchargement vidéo:", error);

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors du téléchargement de la vidéo",
      },
      { status: 500 }
    );
  }
}
