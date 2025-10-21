import { useState, useEffect, useCallback } from 'react';
import { fetchBlogArticles } from '../lib/api-blog';
import { BlogArticle } from '../types/blog-api';

interface UseBlogsReturn {
  blogs: BlogArticle[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useBlogs(organizationId?: string): UseBlogsReturn {
  const [blogs, setBlogs] = useState<BlogArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchBlogArticles(organizationId);
      setBlogs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des articles');
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    blogs,
    loading,
    error,
    refetch: fetchData
  };
}
