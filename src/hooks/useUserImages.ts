"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';

interface ImageFile {
  id: string;
  filename: string;
  fileUrl: string;
  fileSize: number;
  format: string;
  width: number;
  height: number;
  aspectRatio: string;
  createdAt: string;
}

interface ImageGeneration {
  id: string;
  prompt: string;
  status: string;
  numImages: number;
  createdAt: string;
  completedAt: string | null;
  model: string;
  processingTime: number | null;
  images: ImageFile[];
}

interface UseUserImagesReturn {
  generations: ImageGeneration[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Hook pour récupérer toutes les générations d'images de l'utilisateur
 */
export function useUserImages(): UseUserImagesReturn {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [generations, setGenerations] = useState<ImageGeneration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGenerations = useCallback(async () => {
    if (!isLoaded || !isSignedIn) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = await getToken();
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const response = await fetch('/api/images/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des générations');
      }

      const data = await response.json();
      setGenerations(data.generations || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      console.error('Erreur lors de la récupération des générations:', err);
    } finally {
      setLoading(false);
    }
  }, [getToken, isLoaded, isSignedIn]);

  // Charger les générations au montage du composant
  useEffect(() => {
    fetchGenerations();
  }, [fetchGenerations]);

  return {
    generations,
    loading,
    error,
    refresh: fetchGenerations,
  };
}
