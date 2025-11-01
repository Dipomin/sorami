/**
 * React Hook: useBlogCategories
 * Hook pour gérer les catégories de blog
 */

import { useState, useEffect, useCallback } from 'react';

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  postsCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export function useBlogCategories(includeCount = false) {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (includeCount) params.set('includeCount', 'true');

      const response = await fetch(`/api/blog/categories?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.statusText}`);
      }

      const data: BlogCategory[] = await response.json();
      setCategories(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [includeCount]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const createCategory = async (categoryData: Partial<BlogCategory>) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/blog/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create category');
      }

      const newCategory = await response.json();
      
      // Ajouter à la liste locale
      setCategories([...categories, newCategory]);
      
      return newCategory;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCategory = async (id: string, categoryData: Partial<BlogCategory>) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/blog/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...categoryData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update category');
      }

      const updatedCategory = await response.json();
      
      // Mettre à jour la liste locale
      setCategories(categories.map(c => c.id === id ? updatedCategory : c));
      
      return updatedCategory;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCategory = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/blog/categories?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete category');
      }

      // Retirer de la liste locale
      setCategories(categories.filter(c => c.id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    categories,
    isLoading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}
