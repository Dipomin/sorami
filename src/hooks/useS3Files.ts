/**
 * Hook: useS3Files
 * 
 * Hook personnalisé pour gérer les fichiers S3 avec authentification Clerk.
 * 
 * Fonctionnalités:
 * - Liste les fichiers utilisateur
 * - Upload vers S3 avec progression
 * - Génération presigned URLs
 * - Suppression sécurisée
 * - Téléchargement direct
 */

'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import {
  uploadToS3,
  getPresignedUrl,
  deleteFromS3,
  listUserFiles,
  downloadFileFromS3,
  type S3FileMetadata,
  type UploadToS3Options,
  type ListFilesOptions,
} from '@/lib/s3-service';

interface UseS3FilesOptions {
  contentType?: 'book' | 'blog' | 'image' | 'video';
  autoRefresh?: boolean;
}

interface UseS3FilesReturn {
  // State
  files: S3FileMetadata[];
  loading: boolean;
  error: string | null;
  uploading: boolean;
  uploadProgress: number;
  
  // Actions
  listFiles: (options?: Partial<ListFilesOptions>) => Promise<void>;
  uploadFile: (file: File, options?: Partial<UploadToS3Options>) => Promise<S3FileMetadata>;
  deleteFile: (s3Key: string) => Promise<void>;
  downloadFile: (s3Key: string, filename: string) => Promise<void>;
  getDownloadUrl: (s3Key: string, expiresIn?: number) => Promise<string>;
  clearError: () => void;
}

/**
 * Hook personnalisé pour gérer les fichiers S3
 * 
 * @example
 * const { files, uploadFile, deleteFile, loading } = useS3Files({ contentType: 'book' });
 * 
 * // Upload
 * await uploadFile(selectedFile);
 * 
 * // Delete
 * await deleteFile('user_123/books/book.pdf');
 */
export function useS3Files(options: UseS3FilesOptions = {}): UseS3FilesReturn {
  const { contentType, autoRefresh = true } = options;
  const { getToken, userId } = useAuth();

  // State
  const [files, setFiles] = useState<S3FileMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  /**
   * Liste les fichiers de l'utilisateur
   */
  const listFiles = useCallback(async (listOptions: Partial<ListFilesOptions> = {}) => {
    if (!userId) {
      setError('User not authenticated');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      
      const result = await listUserFiles(
        {
          userId,
          contentType,
          ...listOptions,
        },
        token || undefined
      );

      setFiles(result);
    } catch (err: any) {
      console.error('Error listing files:', err);
      setError(err.message || 'Failed to list files');
    } finally {
      setLoading(false);
    }
  }, [userId, contentType, getToken]);

  /**
   * Upload un fichier vers S3
   */
  const uploadFile = useCallback(async (
    file: File,
    uploadOptions: Partial<UploadToS3Options> = {}
  ): Promise<S3FileMetadata> => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const token = await getToken();

      // Simuler progression (à améliorer avec vraie progression)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const result = await uploadToS3(
        {
          file,
          userId,
          contentType: contentType || 'book',
          ...uploadOptions,
        },
        token || undefined
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Rafraîchir la liste si autoRefresh
      if (autoRefresh) {
        await listFiles();
      }

      return result;
    } catch (err: any) {
      console.error('Error uploading file:', err);
      setError(err.message || 'Failed to upload file');
      throw err;
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  }, [userId, contentType, getToken, autoRefresh, listFiles]);

  /**
   * Supprime un fichier de S3
   */
  const deleteFile = useCallback(async (s3Key: string) => {
    if (!userId) {
      setError('User not authenticated');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      
      await deleteFromS3(
        { s3Key, userId },
        token || undefined
      );

      // Rafraîchir la liste si autoRefresh
      if (autoRefresh) {
        await listFiles();
      }
    } catch (err: any) {
      console.error('Error deleting file:', err);
      setError(err.message || 'Failed to delete file');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId, getToken, autoRefresh, listFiles]);

  /**
   * Télécharge un fichier depuis S3
   */
  const downloadFile = useCallback(async (s3Key: string, filename: string) => {
    if (!userId) {
      setError('User not authenticated');
      return;
    }

    setError(null);

    try {
      const token = await getToken();
      
      await downloadFileFromS3(
        s3Key,
        userId,
        filename,
        token || undefined
      );
    } catch (err: any) {
      console.error('Error downloading file:', err);
      setError(err.message || 'Failed to download file');
      throw err;
    }
  }, [userId, getToken]);

  /**
   * Obtient une URL de téléchargement présignée
   */
  const getDownloadUrl = useCallback(async (
    s3Key: string,
    expiresIn: number = 3600
  ): Promise<string> => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    try {
      const token = await getToken();
      
      const result = await getPresignedUrl(
        s3Key,
        userId,
        token || undefined,
        expiresIn
      );

      return result.url;
    } catch (err: any) {
      console.error('Error getting download URL:', err);
      setError(err.message || 'Failed to get download URL');
      throw err;
    }
  }, [userId, getToken]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    files,
    loading,
    error,
    uploading,
    uploadProgress,
    listFiles,
    uploadFile,
    deleteFile,
    downloadFile,
    getDownloadUrl,
    clearError,
  };
}
