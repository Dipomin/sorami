/**
 * React Hook: useBlogPosts
 * Hook pour gérer les articles de blog (CRUD, pagination, filtres)
 */

import { useState, useEffect, useCallback } from 'react';

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  authorId: string;
  author: {
    id: string;
    name: string | null;
    email: string;
    avatar: string | null;
  };
  category?: string;
  tags?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'SCHEDULED';
  published: boolean;
  publishedAt?: Date | null;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  readingTime?: number;
  viewsCount: number;
  _count?: {
    comments: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface BlogPostsResponse {
  posts: BlogPost[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface BlogPostFilters {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
  authorId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export function useBlogPosts(initialFilters?: BlogPostFilters) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [pagination, setPagination] = useState<BlogPostsResponse['pagination'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<BlogPostFilters>(initialFilters || {});

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      
      if (filters.page) params.set('page', filters.page.toString());
      if (filters.limit) params.set('limit', filters.limit.toString());
      if (filters.status) params.set('status', filters.status);
      if (filters.category) params.set('category', filters.category);
      if (filters.authorId) params.set('authorId', filters.authorId);
      if (filters.search) params.set('search', filters.search);
      if (filters.sortBy) params.set('sortBy', filters.sortBy);
      if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);

      const response = await fetch(`/api/blog/posts?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.statusText}`);
      }

      const data: BlogPostsResponse = await response.json();
      setPosts(data.posts);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const createPost = async (postData: Partial<BlogPost>) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/blog/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create post');
      }

      const newPost = await response.json();
      
      // Recharger la liste
      await fetchPosts();
      
      return newPost;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePost = async (id: string, postData: Partial<BlogPost>) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/blog/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update post');
      }

      const updatedPost = await response.json();
      
      // Mettre à jour la liste locale
      setPosts(posts.map(p => p.id === id ? updatedPost : p));
      
      return updatedPost;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deletePost = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/blog/posts/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete post');
      }

      // Retirer de la liste locale
      setPosts(posts.filter(p => p.id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadImage = async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/blog/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload image');
      }

      const result = await response.json();
      return result.url;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    posts,
    pagination,
    isLoading,
    error,
    filters,
    setFilters,
    fetchPosts,
    createPost,
    updatePost,
    deletePost,
    uploadImage,
  };
}
