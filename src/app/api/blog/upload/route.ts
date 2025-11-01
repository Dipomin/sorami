/**
 * API Route: Blog Image Upload
 * Upload d'images pour le blog vers S3 avec compression
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-admin';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';

// Configuration S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'sorami-generated-content-9872';

// Configuration pour les uploads
export const runtime = 'nodejs';

/**
 * POST /api/blog/upload
 * Upload une image pour le blog (Admin uniquement)
 * Compresse l'image avec Sharp avant upload
 */
export async function POST(request: NextRequest) {
  try {
    // Vérifier que l'utilisateur est admin
    await requireAdmin();

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Vérifier le type de fichier
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF' },
        { status: 400 }
      );
    }

    // Vérifier la taille (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size: 10MB' },
        { status: 400 }
      );
    }

    // Convertir le fichier en Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Compresser l'image avec Sharp
    let processedBuffer = buffer;
    let contentType = file.type;

    if (file.type !== 'image/gif') {
      // Pour les images non-GIF, compresser et convertir en WebP
      const compressed = await sharp(buffer)
        .resize(1920, 1080, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: 85 })
        .toBuffer();

      processedBuffer = Buffer.from(compressed);
      contentType = 'image/webp';
    }

    // Générer un nom de fichier unique
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = contentType === 'image/webp' ? 'webp' : file.name.split('.').pop();
    const fileName = `blog/images/${timestamp}-${randomString}.${extension}`;

    // Upload vers S3
    const uploadCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: processedBuffer,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000', // 1 an de cache
    });

    await s3Client.send(uploadCommand);

    // Construire l'URL publique
    const publicUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'eu-north-1'}.amazonaws.com/${fileName}`;

    return NextResponse.json({
      url: publicUrl,
      fileName,
      size: processedBuffer.length,
      originalSize: buffer.length,
      contentType,
      compressed: file.type !== 'image/gif',
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error uploading blog image:', error);
    
    if (error.message.includes('Admin access required')) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to upload image', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/blog/upload
 * Supprimer une image du blog (Admin uniquement)
 */
export async function DELETE(request: NextRequest) {
  try {
    // Vérifier que l'utilisateur est admin
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('fileName');

    if (!fileName) {
      return NextResponse.json(
        { error: 'File name is required' },
        { status: 400 }
      );
    }

    // Vérifier que le fichier est dans le dossier blog/images/
    if (!fileName.startsWith('blog/images/')) {
      return NextResponse.json(
        { error: 'Invalid file path' },
        { status: 400 }
      );
    }

    // Supprimer de S3
    const deleteCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
    });

    await s3Client.send(deleteCommand);

    return NextResponse.json(
      { message: 'Image deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting blog image:', error);
    
    if (error.message.includes('Admin access required')) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete image', details: error.message },
      { status: 500 }
    );
  }
}
