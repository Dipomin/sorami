/**
 * API pour lister les images du blog depuis S3
 */

import { NextRequest, NextResponse } from "next/server";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { s3BlogClient } from "@/lib/s3-storage";

const BLOG_BUCKET_NAME = process.env.AWS_S3_BLOG_BUCKET_NAME || "sorami-blog";
const AWS_REGION = process.env.AWS_REGION || "eu-north-1";

export async function GET(request: NextRequest) {
  try {
    // Lister tous les objets dans le bucket blog
    const listCommand = new ListObjectsV2Command({
      Bucket: BLOG_BUCKET_NAME,
      Prefix: "blog/images/", // Filtrer uniquement les images de blog
    });

    const listResponse = await s3BlogClient.send(listCommand);

    if (!listResponse.Contents) {
      return NextResponse.json({ images: [] });
    }

    // Transformer les objets S3 en format utilisable
    const images = listResponse.Contents.filter(
      (obj: any) => obj.Key && !obj.Key.endsWith("/") // Exclure les "dossiers"
    ).map((obj: any) => {
      const key = obj.Key!;
      const name = key.split("/").pop() || key;
      const url = `https://${BLOG_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${key}`;

      return {
        url,
        key,
        name,
        size: obj.Size || 0,
        uploadedAt: obj.LastModified || new Date(),
      };
    });

    // Trier par date (plus récentes d'abord)
    images.sort(
      (a: any, b: any) =>
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );

    return NextResponse.json({ images });
  } catch (error) {
    console.error("Error listing blog images:", error);
    return NextResponse.json(
      { error: "Failed to list images", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
