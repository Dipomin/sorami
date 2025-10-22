/**
 * API Route: GET /api/files/presigned-url
 * 
 * Génère une URL présignée pour télécharger un fichier depuis S3.
 * Vérifie que l'utilisateur est propriétaire du fichier.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:9006';

export async function POST(request: NextRequest) {
  try {
    // Vérifier authentification
    const user = await requireAuth();

    // Parser le body
    const body = await request.json();
    const { s3Key, expiresIn = 3600 } = body;

    if (!s3Key) {
      return NextResponse.json(
        { error: 'Missing s3Key parameter' },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur est propriétaire du fichier
    const keyUserId = extractUserIdFromS3Key(s3Key);
    if (keyUserId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized: You can only access your own files' },
        { status: 403 }
      );
    }

    // Appeler le backend Flask pour générer l'URL présignée
    const response = await fetch(`${BACKEND_API_URL}/api/s3/presigned-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${request.headers.get('Authorization')?.replace('Bearer ', '')}`,
      },
      body: JSON.stringify({
        s3_key: s3Key,
        expires_in: expiresIn,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to generate presigned URL' }));
      return NextResponse.json(
        { error: error.message || 'Failed to generate presigned URL' },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      url: data.url,
      expiresIn: data.expires_in || expiresIn,
      expiresAt: data.expires_at || new Date(Date.now() + expiresIn * 1000).toISOString(),
    });

  } catch (error: any) {
    console.error('Error generating presigned URL:', error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Extrait le userId depuis une clé S3
 * Format: user_{userId}/...
 */
function extractUserIdFromS3Key(s3Key: string): string | null {
  const match = s3Key.match(/^user_([^/]+)\//);
  return match ? match[1] : null;
}
