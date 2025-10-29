import { useState, useCallback, useEffect, useRef } from 'react';
import { generateBookContent, pollBookJobStatus } from '../lib/api';

interface BookRequest {
  title: string
  topic: string
  goal: string
  chapters: Array<{ title: string; description?: string }>
}

interface UseBookCreationReturn {
  isLoading: boolean;
  error: string | null;
  jobId: string | null;
  bookId: string | null;
  isCompleted: boolean;
  progress: number;
  status: string | null;
  createBook: (bookData: BookRequest) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

export function useBookCreation(): UseBookCreationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [bookId, setBookId] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setJobId(null);
    setBookId(null);
    setIsCompleted(false);
    setProgress(0);
    setStatus(null);
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  // Polling du statut du job
  useEffect(() => {
    if (!jobId || isCompleted) {
      return;
    }

    const checkJobStatus = async () => {
      try {
        const statusData = await pollBookJobStatus(jobId);
        
        console.log('📊 [useBookCreation] Status du job:', {
          jobId,
          status: statusData.status,
          progress: statusData.progress,
          bookId: statusData.bookId,
        });

        setStatus(statusData.status);
        setProgress(statusData.progress || 0);

        // Si le job est terminé
        if (statusData.status === 'COMPLETED') {
          console.log('✅ [useBookCreation] Livre terminé !', {
            bookId: statusData.bookId,
            jobId,
          });
          setIsCompleted(true);
          setBookId(statusData.bookId);
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
        }

        // Si le job a échoué
        if (statusData.status === 'FAILED') {
          console.error('❌ [useBookCreation] Échec de la génération:', statusData);
          setError(statusData.message || 'La génération du livre a échoué');
          setIsCompleted(false);
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
        }
      } catch (err) {
        console.error('Erreur lors de la vérification du statut:', err);
        // Ne pas stopper le polling en cas d'erreur réseau temporaire
      }
    };

    // Vérifier immédiatement
    checkJobStatus();

    // Puis vérifier toutes les 3 secondes
    pollingIntervalRef.current = setInterval(checkJobStatus, 3000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [jobId, isCompleted]);

  const createBook = useCallback(async (bookData: BookRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      setIsCompleted(false);
      setProgress(0);
      setBookId(null);

      // Les organizationId et userId ne sont plus nécessaires côté client
      // car l'authentification se fait automatiquement côté serveur
      const result = await generateBookContent(bookData);

      setJobId(result.jobId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création du livre');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    jobId,
    bookId,
    isCompleted,
    progress,
    status,
    createBook,
    clearError,
    reset
  };
}