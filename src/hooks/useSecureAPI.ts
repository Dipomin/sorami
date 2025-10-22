/**
 * Hook personnalisé pour les appels API sécurisés avec Clerk
 * Gère automatiquement l'authentification et l'envoi du token JWT
 */

'use client';

import { useAuth } from '@clerk/nextjs';
import { useState, useCallback } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9006';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
  metadata?: any;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

export function useSecureAPI() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Effectue une requête HTTP authentifiée
   */
  const request = useCallback(
    async <T = any>(
      endpoint: string,
      options: RequestOptions = {}
    ): Promise<T> => {
      if (!isLoaded) {
        throw new Error('Authentification non chargée');
      }

      if (!isSignedIn) {
        throw new Error('Utilisateur non connecté');
      }

      setLoading(true);
      setError(null);

      try {
        // Récupération du token Clerk
        const token = await getToken();

        if (!token) {
          throw new Error('Token d\'authentification non disponible');
        }

        // Construction de l'URL avec paramètres de requête
        let url = `${API_URL}${endpoint}`;
        if (options.params) {
          const searchParams = new URLSearchParams();
          Object.entries(options.params).forEach(([key, value]) => {
            searchParams.append(key, String(value));
          });
          url += `?${searchParams.toString()}`;
        }

        // Configuration de la requête
        const config: RequestInit = {
          ...options,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...options.headers,
          },
        };

        // Exécution de la requête
        const response = await fetch(url, config);

        // Gestion des réponses
        if (!response.ok) {
          const errorData: ApiError = await response.json().catch(() => ({
            success: false,
            error: {
              code: 'UNKNOWN_ERROR',
              message: `Erreur HTTP ${response.status}`,
            },
            timestamp: new Date().toISOString(),
          }));

          throw new Error(errorData.error.message);
        }

        // Réponse vide (204 No Content)
        if (response.status === 204) {
          return null as T;
        }

        const data: ApiResponse<T> = await response.json();
        return data.data;
      } catch (err: any) {
        const errorMessage =
          err.message || 'Une erreur est survenue';

        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [getToken, isLoaded, isSignedIn]
  );

  /**
   * Effectue une requête GET
   */
  const get = useCallback(
    async <T = any>(endpoint: string, params?: Record<string, string | number | boolean>): Promise<T> => {
      return request<T>(endpoint, { method: 'GET', params });
    },
    [request]
  );

  /**
   * Effectue une requête POST
   */
  const post = useCallback(
    async <T = any>(endpoint: string, data?: any): Promise<T> => {
      return request<T>(endpoint, {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      });
    },
    [request]
  );

  /**
   * Effectue une requête PUT
   */
  const put = useCallback(
    async <T = any>(endpoint: string, data?: any): Promise<T> => {
      return request<T>(endpoint, {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
      });
    },
    [request]
  );

  /**
   * Effectue une requête PATCH
   */
  const patch = useCallback(
    async <T = any>(endpoint: string, data?: any): Promise<T> => {
      return request<T>(endpoint, {
        method: 'PATCH',
        body: data ? JSON.stringify(data) : undefined,
      });
    },
    [request]
  );

  /**
   * Effectue une requête DELETE
   */
  const del = useCallback(
    async <T = any>(endpoint: string): Promise<T> => {
      return request<T>(endpoint, { method: 'DELETE' });
    },
    [request]
  );

  /**
   * Upload un fichier
   */
  const uploadFile = useCallback(
    async <T = any>(endpoint: string, file: File, additionalData?: Record<string, any>): Promise<T> => {
      if (!isLoaded || !isSignedIn) {
        throw new Error('Utilisateur non connecté');
      }

      setLoading(true);
      setError(null);

      try {
        const token = await getToken();

        if (!token) {
          throw new Error('Token non disponible');
        }

        // Construction du FormData
        const formData = new FormData();
        formData.append('file', file);

        if (additionalData) {
          Object.entries(additionalData).forEach(([key, value]) => {
            formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
          });
        }

        const response = await fetch(`${API_URL}${endpoint}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error?.message || `Erreur HTTP ${response.status}`);
        }

        const data: ApiResponse<T> = await response.json();
        return data.data;
      } catch (err: any) {
        const errorMessage = err.message || 'Erreur lors de l\'upload';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [getToken, isLoaded, isSignedIn]
  );

  return {
    request,
    get,
    post,
    put,
    patch,
    delete: del,
    uploadFile,
    loading,
    error,
    isReady: isLoaded && isSignedIn,
    clearError: () => setError(null),
  };
}

/**
 * Hook pour vérifier l'accès à une fonctionnalité
 * Note: Importer useUser depuis @clerk/nextjs dans le composant qui utilise ce hook
 */
export function useFeatureAccess(user: any, requiredSubscription: string = 'free') {
  if (!user) {
    return {
      hasAccess: false,
      loading: true,
      subscription: null,
    };
  }

  const subscriptionTiers = {
    free: 0,
    pro: 1,
    premium: 2,
    enterprise: 3,
  };

  const userSubscription = (user.publicMetadata?.subscription as string) || 'free';
  const userTier = subscriptionTiers[userSubscription as keyof typeof subscriptionTiers] || 0;
  const requiredTier = subscriptionTiers[requiredSubscription as keyof typeof subscriptionTiers] || 0;

  return {
    hasAccess: userTier >= requiredTier,
    loading: false,
    subscription: userSubscription,
    currentTier: userTier,
    requiredTier,
  };
}
