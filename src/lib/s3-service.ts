/**
 * AWS S3 Storage Service
 * 
 * Service pour gérer les opérations S3 côté client Next.js.
 * Utilise l'API backend Flask pour les opérations S3 sécurisées.
 * 
 * Architecture:
 * - Frontend (Next.js) → API Routes → Backend Flask → AWS S3
 * - Presigned URLs générées par le backend pour sécurité
 * - Structure hiérarchique: user_{userId}/{contentType}s/{filename}
 */

import { getCurrentUser } from './auth';

// ============================================================================
// TYPES
// ============================================================================

export interface S3FileMetadata {
  key: string;
  bucket: string;
  filename: string;
  size: number;
  contentType: string;
  url?: string;
  lastModified?: Date;
}

export interface PresignedUrlResponse {
  url: string;
  expiresIn: number; // Secondes
  expiresAt: string; // ISO timestamp
}

export interface UploadToS3Options {
  file: File;
  userId: string;
  contentType: 'book' | 'blog' | 'image' | 'video';
  filename?: string; // Optionnel, généré automatiquement si absent
  metadata?: Record<string, string>;
}

export interface ListFilesOptions {
  userId: string;
  contentType?: 'book' | 'blog' | 'image' | 'video';
  limit?: number;
  prefix?: string;
}

export interface DeleteFileOptions {
  s3Key: string;
  userId: string;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:9006';
const S3_BUCKET = process.env.NEXT_PUBLIC_S3_BUCKET || 'sorami-content';

// ============================================================================
// UTILITAIRES
// ============================================================================

/**
 * Construit le chemin S3 hiérarchique
 */
export function buildS3Path(
  userId: string,
  contentType: 'book' | 'blog' | 'image' | 'video',
  filename: string
): string {
  return `user_${userId}/${contentType}s/${filename}`;
}

/**
 * Génère un nom de fichier unique avec timestamp
 */
export function generateUniqueFilename(originalFilename: string): string {
  const timestamp = Date.now();
  const extension = originalFilename.split('.').pop();
  const nameWithoutExt = originalFilename.replace(/\.[^/.]+$/, '');
  const sanitized = nameWithoutExt.replace(/[^a-zA-Z0-9-_]/g, '_');
  return `${sanitized}_${timestamp}.${extension}`;
}

/**
 * Extrait le userId depuis une clé S3
 * Format: user_{userId}/...
 */
export function extractUserIdFromS3Key(s3Key: string): string | null {
  const match = s3Key.match(/^user_([^/]+)\//);
  return match ? match[1] : null;
}

// ============================================================================
// OPÉRATIONS S3 (via Backend API)
// ============================================================================

/**
 * Upload un fichier vers S3 via l'API backend
 * 
 * @example
 * const result = await uploadToS3({
 *   file: selectedFile,
 *   userId: 'user_123',
 *   contentType: 'book'
 * });
 */
export async function uploadToS3(
  options: UploadToS3Options,
  authToken?: string
): Promise<S3FileMetadata> {
  const { file, userId, contentType, filename, metadata } = options;

  // Générer le nom de fichier si absent
  const finalFilename = filename || generateUniqueFilename(file.name);
  const s3Key = buildS3Path(userId, contentType, finalFilename);

  // Préparer FormData pour upload multipart
  const formData = new FormData();
  formData.append('file', file);
  formData.append('s3_key', s3Key);
  formData.append('content_type', file.type);
  
  if (metadata) {
    formData.append('metadata', JSON.stringify(metadata));
  }

  // Headers avec authentification
  const headers: HeadersInit = {};
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  // Appel API backend
  const response = await fetch(`${BACKEND_API_URL}/api/s3/upload`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Upload failed' }));
    throw new Error(error.message || `Upload failed with status ${response.status}`);
  }

  const data = await response.json();
  
  return {
    key: data.s3_key,
    bucket: data.bucket || S3_BUCKET,
    filename: finalFilename,
    size: file.size,
    contentType: file.type,
    url: data.url,
  };
}

/**
 * Génère une URL présignée pour télécharger un fichier
 * 
 * @example
 * const { url, expiresIn } = await getPresignedUrl('user_123/books/book.pdf', 'user_123');
 * window.open(url, '_blank');
 */
export async function getPresignedUrl(
  s3Key: string,
  userId: string,
  authToken?: string,
  expiresIn: number = 3600 // 1 heure par défaut
): Promise<PresignedUrlResponse> {
  // Vérifier que l'utilisateur est propriétaire
  const keyUserId = extractUserIdFromS3Key(s3Key);
  if (keyUserId !== userId) {
    throw new Error('Unauthorized: You can only access your own files');
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${BACKEND_API_URL}/api/s3/presigned-url`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      s3_key: s3Key,
      expires_in: expiresIn,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to generate presigned URL' }));
    throw new Error(error.message || 'Failed to generate presigned URL');
  }

  const data = await response.json();
  
  return {
    url: data.url,
    expiresIn: data.expires_in || expiresIn,
    expiresAt: data.expires_at || new Date(Date.now() + expiresIn * 1000).toISOString(),
  };
}

/**
 * Supprime un fichier de S3
 * 
 * @example
 * await deleteFromS3({ s3Key: 'user_123/books/book.pdf', userId: 'user_123' });
 */
export async function deleteFromS3(
  options: DeleteFileOptions,
  authToken?: string
): Promise<void> {
  const { s3Key, userId } = options;

  // Vérifier propriété
  const keyUserId = extractUserIdFromS3Key(s3Key);
  if (keyUserId !== userId) {
    throw new Error('Unauthorized: You can only delete your own files');
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${BACKEND_API_URL}/api/s3/delete`, {
    method: 'DELETE',
    headers,
    body: JSON.stringify({ s3_key: s3Key }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Delete failed' }));
    throw new Error(error.message || 'Delete failed');
  }
}

/**
 * Liste les fichiers d'un utilisateur avec filtres optionnels
 * 
 * @example
 * const files = await listUserFiles({ userId: 'user_123', contentType: 'book', limit: 10 });
 */
export async function listUserFiles(
  options: ListFilesOptions,
  authToken?: string
): Promise<S3FileMetadata[]> {
  const { userId, contentType, limit = 100, prefix } = options;

  const queryParams = new URLSearchParams({
    user_id: userId,
    limit: limit.toString(),
  });

  if (contentType) {
    queryParams.append('content_type', contentType);
  }

  if (prefix) {
    queryParams.append('prefix', prefix);
  }

  const headers: HeadersInit = {};
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(
    `${BACKEND_API_URL}/api/s3/list?${queryParams.toString()}`,
    { headers }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to list files' }));
    throw new Error(error.message || 'Failed to list files');
  }

  const data = await response.json();
  
  return (data.files || []).map((file: any) => ({
    key: file.key,
    bucket: file.bucket || S3_BUCKET,
    filename: file.filename || file.key.split('/').pop(),
    size: file.size || 0,
    contentType: file.content_type || 'application/octet-stream',
    lastModified: file.last_modified ? new Date(file.last_modified) : undefined,
  }));
}

// ============================================================================
// HELPERS POUR COMPOSANTS
// ============================================================================

/**
 * Télécharge un fichier depuis une presigned URL
 */
export async function downloadFile(presignedUrl: string, filename: string): Promise<void> {
  const response = await fetch(presignedUrl);
  
  if (!response.ok) {
    throw new Error('Download failed');
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Obtient une URL de téléchargement et lance le téléchargement
 */
export async function downloadFileFromS3(
  s3Key: string,
  userId: string,
  filename: string,
  authToken?: string
): Promise<void> {
  const { url } = await getPresignedUrl(s3Key, userId, authToken);
  await downloadFile(url, filename);
}

/**
 * Valide le type de fichier
 */
export function validateFileType(
  file: File,
  allowedTypes: string[]
): boolean {
  return allowedTypes.some(type => {
    if (type.endsWith('/*')) {
      return file.type.startsWith(type.slice(0, -2));
    }
    return file.type === type;
  });
}

/**
 * Valide la taille du fichier
 */
export function validateFileSize(
  file: File,
  maxSizeMB: number
): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

/**
 * Formate la taille d'un fichier
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
