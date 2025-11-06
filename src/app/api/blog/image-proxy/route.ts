import { NextRequest, NextResponse } from 'next/server';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { s3BlogClient } from '@/lib/s3-storage';

/**
 * Proxy pour les images S3 avec CORS
 * Permet de contourner les erreurs CORS en chargeant les images côté serveur
 * et en les servant avec les bons en-têtes
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageKey = searchParams.get('key');

    if (!imageKey) {
      return NextResponse.json(
        { error: 'Image key is required' },
        { status: 400 }
      );
    }

    // Récupérer l'image depuis S3
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BLOG_BUCKET_NAME || 'sorami-blog',
      Key: imageKey,
    });

    const response = await s3BlogClient.send(command);

    if (!response.Body) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    // Convertir le stream en buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of response.Body as any) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Déterminer le content type
    const contentType = response.ContentType || 'image/webp';

    // Retourner l'image avec les bons en-têtes CORS
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Image proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to load image' },
      { status: 500 }
    );
  }
}

// Support des requêtes OPTIONS pour CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
