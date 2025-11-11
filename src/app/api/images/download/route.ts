import { NextRequest, NextResponse } from "next/server";
import { getImagePresignedUrl } from "@/lib/s3-storage";

/**
 * API pour télécharger une image S3 en contournant CORS
 * GET /api/images/download?url=<s3_url>&filename=<filename>
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const s3Url = searchParams.get("url");
    const filename = searchParams.get("filename") || `image-${Date.now()}.png`;

    if (!s3Url) {
      return NextResponse.json(
        { error: "URL S3 requise" },
        { status: 400 }
      );
    }

    console.log("📥 [Download API] Téléchargement demandé:", {
      s3Url: s3Url.substring(0, 100) + "...",
      filename,
    });

    // Régénérer une URL présignée fraîche avec le bon header Content-Disposition
    // pour forcer le téléchargement
    const freshUrl = await getImagePresignedUrl(s3Url, 300); // 5 minutes

    // Fetch l'image depuis S3
    const response = await fetch(freshUrl);

    if (!response.ok) {
      console.error("❌ [Download API] Erreur S3:", response.status);
      return NextResponse.json(
        { error: "Erreur lors du téléchargement" },
        { status: response.status }
      );
    }

    const blob = await response.blob();

    // Retourner l'image avec les bons headers pour forcer le téléchargement
    return new NextResponse(blob, {
      status: 200,
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "image/png",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("💥 [Download API] Erreur:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors du téléchargement" },
      { status: 500 }
    );
  }
}
