/**
 * Hook pour gérer les URLs présignées S3
 */

import { useState, useEffect } from 'react';

interface PresignedUrlResponse {
  url: string;
  expiresIn: number;
}

interface PresignedUrlCache {
  [key: string]: {
    url: string;
    expiresAt: number;
  };
}

// Cache des URLs présignées
const urlCache: PresignedUrlCache = {};

export function usePresignedUrl(s3Key: string | null | undefined) {
  const [presignedUrl, setPresignedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!s3Key) {
      setPresignedUrl(null);
      return;
    }

    // Vérifier le cache
    const cached = urlCache[s3Key];
    if (cached && cached.expiresAt > Date.now()) {
      setPresignedUrl(cached.url);
      return;
    }

    // Générer nouvelle URL présignée
    const fetchPresignedUrl = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/s3/presigned-url?key=${encodeURIComponent(s3Key)}`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data: PresignedUrlResponse = await response.json();
        
        // Mettre en cache avec marge de sécurité (90% de la durée)
        const expiresAt = Date.now() + (data.expiresIn * 1000 * 0.9);
        urlCache[s3Key] = {
          url: data.url,
          expiresAt,
        };

        setPresignedUrl(data.url);
      } catch (err: any) {
        console.error('Error fetching presigned URL:', err);
        setError(err.message);
        setPresignedUrl(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPresignedUrl();
  }, [s3Key]);

  return { presignedUrl, isLoading, error };
}

/**
 * Hook pour gérer plusieurs URLs présignées
 */
export function useMultiplePresignedUrls(s3Keys: (string | null | undefined)[]) {
  const [presignedUrls, setPresignedUrls] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const validKeys = s3Keys.filter(Boolean) as string[];
    
    if (validKeys.length === 0) {
      setPresignedUrls({});
      return;
    }

    const fetchMultipleUrls = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const results: { [key: string]: string } = {};

        // Traiter les clés en parallèle
        await Promise.all(
          validKeys.map(async (key) => {
            // Vérifier le cache
            const cached = urlCache[key];
            if (cached && cached.expiresAt > Date.now()) {
              results[key] = cached.url;
              return;
            }

            // Récupérer nouvelle URL
            try {
              const response = await fetch(`/api/s3/presigned-url?key=${encodeURIComponent(key)}`);
              
              if (response.ok) {
                const data: PresignedUrlResponse = await response.json();
                
                // Mettre en cache
                const expiresAt = Date.now() + (data.expiresIn * 1000 * 0.9);
                urlCache[key] = {
                  url: data.url,
                  expiresAt,
                };
                
                results[key] = data.url;
              }
            } catch (err) {
              console.error(`Error fetching presigned URL for ${key}:`, err);
            }
          })
        );

        setPresignedUrls(results);
      } catch (err: any) {
        console.error('Error fetching multiple presigned URLs:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMultipleUrls();
  }, [JSON.stringify(s3Keys)]);

  return { presignedUrls, isLoading, error };
}

/**
 * Fonction utilitaire pour extraire la clé S3 d'une URL
 */
export function extractS3Key(url: string | null | undefined): string | null {
  if (!url) return null;

  try {
    // Format: https://bucket.s3.region.amazonaws.com/key
    const urlObj = new URL(url);
    
    if (urlObj.hostname.includes('amazonaws.com')) {
      // Supprimer le premier slash
      return urlObj.pathname.substring(1);
    }
    
    // Si ce n'est pas une URL S3, retourner la valeur telle quelle
    // (pourrait être déjà une clé S3)
    return url;
  } catch {
    // Si ce n'est pas une URL valide, traiter comme une clé S3
    return url;
  }
}