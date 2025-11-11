import { NextRequest, NextResponse } from "next/server";
import { getVideoPresignedUrl } from "@/lib/s3-storage";

/**
 * API pour télécharger une vidéo S3 en contournant CORS
 * POST /api/videos/download
 * Body: { url: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url: s3Url } = body;

    if (!s3Url) {
      return NextResponse.json(
        { error: "URL S3 requise" },
        { status: 400 }
      );
    }

    console.log("📥 [Video Download API] Téléchargement demandé:", {
      s3Url: s3Url.substring(0, 100) + "...",
    });

    // Régénérer une URL présignée fraîche
    const freshUrl = await getVideoPresignedUrl(s3Url, 300); // 5 minutes

    // Fetch la vidéo depuis S3
    const response = await fetch(freshUrl);

    if (!response.ok) {
      console.error("❌ [Video Download API] Erreur S3:", response.status);
      return NextResponse.json(
        { error: "Erreur lors du téléchargement" },
        { status: response.status }
      );
    }

    const blob = await response.blob();

    // Extraire le nom de fichier de l'URL S3 ou générer un nom par défaut
    const filename = s3Url.split("/").pop()?.split("?")[0] || `video-${Date.now()}.mp4`;

    // Retourner la vidéo avec les bons headers pour forcer le téléchargement
    return new NextResponse(blob, {
      status: 200,
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "video/mp4",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("❌ [Video Download API] Erreur:", error);
    return NextResponse.json(
      {
        error: "Erreur lors du téléchargement de la vidéo",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
