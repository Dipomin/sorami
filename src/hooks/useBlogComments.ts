/**
 * React Hook: useBlogComments
 * Hook pour gérer les commentaires de blog
 */

import { useState, useEffect, useCallback } from 'react';

export interface BlogComment {
  id: string;
  postId: string;
  authorId: string;
  author: {
    id: string;
    name: string | null;
    email?: string;
    avatar: string | null;
  };
  post?: {
    id: string;
    title: string;
    slug: string;
  };
  content: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SPAM';
  createdAt: Date;
  updatedAt: Date;
}

export interface BlogCommentsResponse {
  comments: BlogComment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface BlogCommentsFilters {
  postId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export function useBlogComments(initialFilters?: BlogCommentsFilters) {
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [pagination, setPagination] = useState<BlogCommentsResponse['pagination'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<BlogCommentsFilters>(initialFilters || {});

  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      
      if (filters.postId) params.set('postId', filters.postId);
      if (filters.status) params.set('status', filters.status);
      if (filters.page) params.set('page', filters.page.toString());
      if (filters.limit) params.set('limit', filters.limit.toString());

      const response = await fetch(`/api/blog/comments?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch comments: ${response.statusText}`);
      }

      const data: BlogCommentsResponse = await response.json();
      setComments(data.comments);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const createComment = async (commentData: { postId: string; content: string }) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/blog/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create comment');
      }

      const newComment = await response.json();
      
      // Recharger la liste
      await fetchComments();
      
      return newComment;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateComment = async (id: string, commentData: { content?: string; status?: string }) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/blog/comments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...commentData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update comment');
      }

      const updatedComment = await response.json();
      
      // Mettre à jour la liste locale
      setComments(comments.map(c => c.id === id ? updatedComment : c));
      
      return updatedComment;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteComment = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/blog/comments?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete comment');
      }

      // Retirer de la liste locale
      setComments(comments.filter(c => c.id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const approveComment = async (id: string) => {
    return updateComment(id, { status: 'APPROVED' });
  };

  const rejectComment = async (id: string) => {
    return updateComment(id, { status: 'REJECTED' });
  };

  const markAsSpam = async (id: string) => {
    return updateComment(id, { status: 'SPAM' });
  };

  return {
    comments,
    pagination,
    isLoading,
    error,
    filters,
    setFilters,
    fetchComments,
    createComment,
    updateComment,
    deleteComment,
    approveComment,
    rejectComment,
    markAsSpam,
  };
}
