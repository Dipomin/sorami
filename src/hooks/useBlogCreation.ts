import { useState, useCallback } from 'react';
import { BlogRequest, BlogJobResponse } from '../types/blog-api';
import { generateBlogContent } from '../lib/api-blog';

interface UseBlogCreationReturn {
  isLoading: boolean;
  error: string | null;
  jobId: string | null;
  createBlog: (blogData: BlogRequest) => Promise<BlogJobResponse | undefined>;
  clearError: () => void;
  reset: () => void;
}

export function useBlogCreation(): UseBlogCreationReturn {
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

  const createBlog = useCallback(async (blogData: BlogRequest) => {
    try {
      setIsLoading(true);
      setError(null);

      // L'authentification se fait automatiquement côté serveur via Clerk
      const result = await generateBlogContent(blogData);

      setJobId(result.job_id);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création de l\'article';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    jobId,
    createBlog,
    clearError,
    reset
  };
}
