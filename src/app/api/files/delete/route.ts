/**
 * API Route: DELETE /api/files/delete
 * 
 * Supprime un fichier S3 après vérification de propriété.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:9006';

export async function DELETE(request: NextRequest) {
  try {
    // Vérifier authentification
    const user = await requireAuth();

    // Parser le body
    const body = await request.json();
    const { s3Key } = body;

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
        { error: 'Unauthorized: You can only delete your own files' },
        { status: 403 }
      );
    }

    // Appeler le backend Flask pour supprimer le fichier
    const authHeader = request.headers.get('Authorization');
    const response = await fetch(`${BACKEND_API_URL}/api/s3/delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader }),
      },
      body: JSON.stringify({ s3_key: s3Key }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Delete failed' }));
      return NextResponse.json(
        { error: error.message || 'Delete failed' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
      s3Key,
    });

  } catch (error: any) {
    console.error('Error deleting file:', error);
    
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
