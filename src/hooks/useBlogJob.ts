import { useState, useCallback, useEffect } from 'react';
import { pollBlogJobStatus, fetchBlogJobResult } from '../lib/api-blog';
import { BlogJobStatusResponse, BlogArticleResult } from '../types/blog-api';

interface UseBlogJobReturn {
  status: BlogJobStatusResponse | null;
  result: BlogArticleResult | null;
  loading: boolean;
  error: string | null;
  pollJob: (jobId: string) => Promise<void>;
  stopPolling: () => void;
}

const POLLING_INTERVAL = 2000; // 2 secondes

export function useBlogJob(): UseBlogJobReturn {
  const [status, setStatus] = useState<BlogJobStatusResponse | null>(null);
  const [result, setResult] = useState<BlogArticleResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pollingJobId, setPollingJobId] = useState<string | null>(null);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  const stopPolling = useCallback(() => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    setPollingJobId(null);
    setLoading(false);
  }, [intervalId]);

  const fetchStatus = useCallback(async (jobId: string) => {
    try {
      const statusData = await pollBlogJobStatus(jobId);
      setStatus(statusData);

      // Si le job est terminé, récupérer le résultat
      if (statusData.status === 'completed') {
        const resultData = await fetchBlogJobResult(jobId);
        setResult(resultData);
        stopPolling();
      } else if (statusData.status === 'failed') {
        setError('La génération de l\'article a échoué');
        stopPolling();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la récupération du statut');
      stopPolling();
    }
  }, [stopPolling]);

  const pollJob = useCallback(async (jobId: string) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setPollingJobId(jobId);

    // Première récupération immédiate
    await fetchStatus(jobId);

    // Démarrer le polling
    const id = setInterval(() => {
      fetchStatus(jobId);
    }, POLLING_INTERVAL);

    setIntervalId(id);
  }, [fetchStatus]);

  // Nettoyage à la destruction du composant
  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  return {
    status,
    result,
    loading,
    error,
    pollJob,
    stopPolling
  };
}
