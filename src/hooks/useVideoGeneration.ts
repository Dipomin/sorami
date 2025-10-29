/**
 * Hook personnalisé pour la génération de vidéos avec authentification Clerk
 */

'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
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
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<VideoStatusResponse | null>(null);
  const [result, setResult] = useState<VideoResultResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const generateVideo = async (request: VideoGenerationRequest) => {
    try {
      // Vérifications d'authentification
      if (!isLoaded) {
        throw new Error('Authentification non chargée');
      }
      
      if (!isSignedIn) {
        throw new Error('Vous devez être connecté pour générer des vidéos');
      }

      setIsGenerating(true);
      setError(null);
      setProgress(0);
      setResult(null);
      setCurrentStatus(null);

      // Obtenir le token d'authentification initial
      const token = await getToken();
      
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      // Créer le job de génération avec le token
      const jobResponse = await createVideoGeneration(request, token);
      console.log('🎬 Job de génération créé:', jobResponse.job_id);

      // Polling avec callback de progression
      // ✅ Passer la fonction getToken pour rafraîchir le token automatiquement
      const finalResult = await pollVideoGenerationStatus(
        jobResponse.job_id,
        getToken, // Passer la fonction, pas le token
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
