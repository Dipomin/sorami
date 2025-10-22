/**
 * API Route: GET /api/files/list
 * 
 * Liste les fichiers S3 d'un utilisateur avec filtres optionnels.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:9006';

export async function GET(request: NextRequest) {
  try {
    // Vérifier authentification
    const user = await requireAuth();

    // Extraire les paramètres de requête
    const searchParams = request.nextUrl.searchParams;
    const contentType = searchParams.get('contentType');
    const limit = searchParams.get('limit') || '100';
    const prefix = searchParams.get('prefix');

    // Construire les query params pour le backend
    const backendParams = new URLSearchParams({
      user_id: user.id,
      limit,
    });

    if (contentType) {
      backendParams.append('content_type', contentType);
    }

    if (prefix) {
      backendParams.append('prefix', prefix);
    }

    // Appeler le backend Flask
    const authHeader = request.headers.get('Authorization');
    const response = await fetch(
      `${BACKEND_API_URL}/api/s3/list?${backendParams.toString()}`,
      {
        headers: authHeader ? { 'Authorization': authHeader } : {},
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to list files' }));
      return NextResponse.json(
        { error: error.message || 'Failed to list files' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Formater la réponse
    const files = (data.files || []).map((file: any) => ({
      key: file.key,
      bucket: file.bucket,
      filename: file.filename || file.key.split('/').pop(),
      size: file.size || 0,
      contentType: file.content_type || 'application/octet-stream',
      lastModified: file.last_modified ? new Date(file.last_modified).toISOString() : null,
    }));

    return NextResponse.json({
      files,
      total: files.length,
      userId: user.id,
    });

  } catch (error: any) {
    console.error('Error listing files:', error);
    
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
