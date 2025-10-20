import { useState, useCallback } from 'react';
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
  createBook: (bookData: BookRequest) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

export function useBookCreation(): UseBookCreationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setJobId(null);
  }, []);

  const createBook = useCallback(async (bookData: BookRequest) => {
    try {
      setIsLoading(true);
      setError(null);

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
    createBook,
    clearError,
    reset
  };
}