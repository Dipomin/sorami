"use client";

import { useState, useCallback } from 'react';
import { 
  createImageGeneration, 
  pollImageGenerationStatus 
} from '../lib/api-client';
import type { 
  ImageGenerationRequest,
  ImageStatusResponse,
  ImageResultResponse 
} from '../types/image-api';

interface UseImageGenerationReturn {
  generateImage: (request: ImageGenerationRequest) => Promise<ImageResultResponse>;
  isGenerating: boolean;
  currentStatus: ImageStatusResponse | null;
  error: string | null;
  progress: number;
  reset: () => void;
}

/**
 * Hook pour gérer la génération d'images
 */
export function useImageGeneration(): UseImageGenerationReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<ImageStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const generateImage = useCallback(async (request: ImageGenerationRequest): Promise<ImageResultResponse> => {
    setIsGenerating(true);
    setError(null);
    setProgress(0);
    setCurrentStatus(null);

    try {
      // Créer la tâche de génération
      const jobResponse = await createImageGeneration(request);
      
      setCurrentStatus({
        job_id: jobResponse.job_id,
        status: jobResponse.status,
        message: jobResponse.message,
      });

      // Polling du statut avec callback de progression
      const result = await pollImageGenerationStatus(
        jobResponse.job_id,
        (status) => {
          setCurrentStatus(status);
          setProgress(status.progress || 0);
        }
      );

      setProgress(100);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la génération';
      setError(errorMessage);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsGenerating(false);
    setCurrentStatus(null);
    setError(null);
    setProgress(0);
  }, []);

  return {
    generateImage,
    isGenerating,
    currentStatus,
    error,
    progress,
    reset,
  };
}
