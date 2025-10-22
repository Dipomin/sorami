/**
 * Hook personnalisé pour la génération de vidéos
 */

'use client';

import { useState } from 'react';
import {
  createVideoGeneration,
  pollVideoGenerationStatus,
} from '@/lib/api-client';
import type {
  VideoGenerationRequest,
  VideoStatusResponse,
  VideoResultResponse,
} from '@/types/video-api';

export function useVideoGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<VideoStatusResponse | null>(null);
  const [result, setResult] = useState<VideoResultResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const generateVideo = async (request: VideoGenerationRequest) => {
    try {
      setIsGenerating(true);
      setError(null);
      setProgress(0);
      setResult(null);
      setCurrentStatus(null);

      // Créer le job de génération
      const jobResponse = await createVideoGeneration(request);
      console.log('🎬 Job de génération créé:', jobResponse.job_id);

      // Polling avec callback de progression
      const finalResult = await pollVideoGenerationStatus(
        jobResponse.job_id,
        (status) => {
          setCurrentStatus(status);
          setProgress(status.progress);
          console.log(`📊 Statut: ${status.status} (${status.progress}%) - ${status.message}`);
        },
        40, // 40 tentatives max (40 * 5s = 200s = 3min20s)
        5000 // 5 secondes entre chaque vérification
      );

      setResult(finalResult);
      setProgress(100);
      console.log('✅ Génération terminée avec succès!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      console.error('❌ Erreur lors de la génération:', errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const reset = () => {
    setIsGenerating(false);
    setCurrentStatus(null);
    setResult(null);
    setError(null);
    setProgress(0);
  };

  return {
    generateVideo,
    isGenerating,
    currentStatus,
    result,
    error,
    progress,
    reset,
  };
}
