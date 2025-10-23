// API client-side pour l'application sorami
// Toutes les fonctions ici font des appels HTTP aux routes API

/**
 * Helper pour obtenir le token d'authentification côté client
 * Note: Pour les appels backend, utilisez useSecureAPI hook ou passez le token manuellement
 */
async function getAuthToken(): Promise<string | null> {
  // Côté client, le token sera géré par le navigateur via cookies
  // Pour les appels backend depuis le client, on doit utiliser un hook
  return null;
}

/**
 * Helper pour créer les headers avec authentification
 */
function createAuthHeaders(token?: string): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

// ============================================================================
// API BOOKS côté client
// ============================================================================

export async function fetchBooks(organizationId?: string) {
  try {
    const url = organizationId ? `/api/books?organizationId=${organizationId}` : '/api/books'
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des livres')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Erreur lors de la récupération des livres:', error)
    throw new Error('Impossible de récupérer les livres')
  }
}

export async function fetchBookById(id: string) {
  try {
    const response = await fetch(`/api/books/${id}`)
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération du livre')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Erreur lors de la récupération du livre:', error)
    throw new Error('Impossible de récupérer le livre')
  }
}

export async function createBook(data: {
  title: string
  description?: string
  organizationId: string
  authorId: string
  genre?: string
  targetAudience?: string
  chapters?: Array<{
    title: string
    content: string
    order: number
  }>
}) {
  try {
    const response = await fetch('/api/books', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      throw new Error('Erreur lors de la création du livre')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Erreur lors de la création du livre:', error)
    throw new Error('Impossible de créer le livre')
  }
}

export async function updateBook(id: string, data: {
  title?: string
  description?: string
  genre?: string
  targetAudience?: string
  status?: string
}) {
  try {
    const response = await fetch(`/api/books/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      throw new Error('Erreur lors de la mise à jour du livre')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Erreur lors de la mise à jour du livre:', error)
    throw new Error('Impossible de mettre à jour le livre')
  }
}

export async function deleteBook(id: string) {
  try {
    const response = await fetch(`/api/books/${id}`, {
      method: 'DELETE',
    })
    
    if (!response.ok) {
      throw new Error('Erreur lors de la suppression du livre')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Erreur lors de la suppression du livre:', error)
    throw new Error('Impossible de supprimer le livre')
  }
}

// ============================================================================
// API BOOK JOBS côté client
// ============================================================================

export async function createBookJob(data: {
  bookId: string
  organizationId: string
  userId: string
  jobType: 'BOOK_GENERATION' | 'FORMAT_CONVERSION' | 'CONTENT_CORRECTION' | 'TRANSLATION'
  inputData: any
  priority?: 'LOW' | 'NORMAL' | 'HIGH'
}) {
  try {
    const response = await fetch('/api/jobs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      throw new Error('Erreur lors de la création du job')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Erreur lors de la création du job:', error)
    throw new Error('Impossible de créer le job')
  }
}

export async function fetchBookJobs(bookId?: string, userId?: string) {
  try {
    const params = new URLSearchParams()
    if (bookId) params.append('bookId', bookId)
    if (userId) params.append('userId', userId)
    
    const url = `/api/jobs${params.toString() ? `?${params.toString()}` : ''}`
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des jobs')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Erreur lors de la récupération des jobs:', error)
    throw new Error('Impossible de récupérer les jobs')
  }
}

export async function fetchJobById(id: string) {
  try {
    const response = await fetch(`/api/jobs/${id}`)
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération du job')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Erreur lors de la récupération du job:', error)
    throw new Error('Impossible de récupérer le job')
  }
}

export async function updateJobStatus(id: string, status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED', result?: any) {
  try {
    const response = await fetch(`/api/jobs/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status, result }),
    })
    
    if (!response.ok) {
      throw new Error('Erreur lors de la mise à jour du job')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Erreur lors de la mise à jour du job:', error)
    throw new Error('Impossible de mettre à jour le job')
  }
}

// ============================================================================
// API CHAPTERS côté client
// ============================================================================

export async function createChapter(data: {
  bookId: string
  title: string
  content: string
  order: number
}) {
  try {
    const response = await fetch('/api/chapters', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      throw new Error('Erreur lors de la création du chapitre')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Erreur lors de la création du chapitre:', error)
    throw new Error('Impossible de créer le chapitre')
  }
}

export async function updateChapter(id: string, data: {
  title?: string
  content?: string
  order?: number
}) {
  try {
    const response = await fetch(`/api/chapters/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      throw new Error('Erreur lors de la mise à jour du chapitre')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Erreur lors de la mise à jour du chapitre:', error)
    throw new Error('Impossible de mettre à jour le chapitre')
  }
}

// ============================================================================
// API GENERATE côté client
// ============================================================================

export async function generateBookContent(data: {
  title: string
  topic: string
  goal: string
  chapters: Array<{ title: string; description?: string }>
  organizationId?: string
  userId?: string
}) {
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      // Essayer de récupérer les détails de l'erreur du serveur
      let errorMessage = 'Erreur lors de la génération du contenu'
      try {
        const errorData = await response.json()
        if (errorData.error) {
          errorMessage = errorData.error
        }
        if (errorData.details) {
          errorMessage += ` (${errorData.details})`
        }
      } catch (parseError) {
        // Si on ne peut pas parser la réponse, garder le message par défaut
        console.warn('Impossible de parser l\'erreur du serveur:', parseError)
      }
      throw new Error(errorMessage)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Erreur lors de la génération du contenu:', error)
    // Relancer l'erreur avec le message original pour que l'UI puisse l'afficher
    throw error
  }
}

// ============================================================================
// API FILE UPLOAD côté client
// ============================================================================

export async function uploadFile(file: File, organizationId: string) {
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('organizationId', organizationId)
    
    const response = await fetch('/api/files', {
      method: 'POST',
      body: formData,
    })
    
    if (!response.ok) {
      throw new Error('Erreur lors de l\'upload du fichier')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Erreur lors de l\'upload du fichier:', error)
    throw new Error('Impossible d\'uploader le fichier')
  }
}

// ============================================================================
// API SUBSCRIPTIONS côté client
// ============================================================================

export async function createSubscription(data: {
  userId: string
  organizationId: string
  planType: 'FREE' | 'PREMIUM' | 'ENTERPRISE'
}) {
  try {
    const response = await fetch('/api/subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      throw new Error('Erreur lors de la création de l\'abonnement')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Erreur lors de la création de l\'abonnement:', error)
    throw new Error('Impossible de créer l\'abonnement')
  }
}

export async function fetchUserSubscription(userId: string) {
  try {
    const response = await fetch(`/api/subscriptions?userId=${userId}`)
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération de l\'abonnement')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'abonnement:', error)
    throw new Error('Impossible de récupérer l\'abonnement')
  }
}

// ============================================================================
// API JOB POLLING côté client
// ============================================================================

export async function pollBookJobStatus(jobId: string) {
  try {
    const response = await fetch(`/api/jobs/${jobId}/status`)
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération du statut du job')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Erreur lors de la récupération du statut du job:', error)
    throw new Error('Impossible de récupérer le statut du job')
  }
}

// ============================================================================
// API IMAGE GENERATION côté client
// ============================================================================

import type { 
  ImageGenerationRequest, 
  ImageGenerationJobResponse,
  ImageStatusResponse,
  ImageResultResponse 
} from '../types/image-api';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9006';

/**
 * Créer une tâche de génération d'images
 * @param data Données de la requête
 * @param token Token d'authentification Clerk (obligatoire)
 */
export async function createImageGeneration(
  data: ImageGenerationRequest, 
  token: string
): Promise<ImageGenerationJobResponse> {
  if (!token) {
    throw new Error('Token d\'authentification manquant');
  }

  try {
    // Utiliser l'API Next.js qui créera l'entrée Prisma avant d'appeler le backend
    const response = await fetch('/api/images/generate', {
      method: 'POST',
      headers: createAuthHeaders(token),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erreur inconnue' }));
      throw new Error(error.message || 'Erreur lors de la création de la génération d\'images');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la création de la génération d\'images:', error);
    throw error instanceof Error ? error : new Error('Impossible de créer la génération d\'images');
  }
}

/**
 * Vérifier le statut d'une génération d'images (depuis la base de données Next.js)
 * @param jobId ID du job
 * @param token Token d'authentification Clerk (ignoré pour les routes Next.js)
 */
export async function fetchImageStatus(jobId: string, token: string): Promise<ImageStatusResponse> {
  try {
    // Les routes Next.js utilisent les cookies Clerk automatiquement
    const response = await fetch(`/api/images/${jobId}/status`, {
      credentials: 'include', // Important pour envoyer les cookies
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération du statut');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération du statut:', error);
    throw new Error('Impossible de récupérer le statut de la génération');
  }
}

/**
 * Récupérer les résultats d'une génération d'images (depuis la base de données Next.js)
 * @param jobId ID du job
 * @param token Token d'authentification Clerk (ignoré pour les routes Next.js)
 */
export async function fetchImageResult(jobId: string, token: string): Promise<ImageResultResponse> {
  try {
    // Les routes Next.js utilisent les cookies Clerk automatiquement
    const response = await fetch(`/api/images/${jobId}/result`, {
      credentials: 'include', // Important pour envoyer les cookies
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des résultats');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération des résultats:', error);
    throw new Error('Impossible de récupérer les résultats de la génération');
  }
}

/**
 * Polling du statut jusqu'à complétion
 * @param jobId ID du job
 * @param token Token d'authentification Clerk (obligatoire)
 * @param onProgress Callback appelé à chaque mise à jour du statut
 * @param maxAttempts Nombre maximum de tentatives (défaut: 60 = 2 minutes)
 * @param intervalMs Intervalle entre les vérifications en ms (défaut: 2000)
 */
export async function pollImageGenerationStatus(
  jobId: string,
  token: string,
  onProgress?: (status: ImageStatusResponse) => void,
  maxAttempts: number = 60,
  intervalMs: number = 2000
): Promise<ImageResultResponse> {
  if (!token) {
    throw new Error('Token d\'authentification manquant');
  }

  let attempts = 0;
  
  while (attempts < maxAttempts) {
    const statusData = await fetchImageStatus(jobId, token);
    
    console.log(`[Polling Image ${jobId}] Tentative ${attempts + 1}/${maxAttempts} - Statut: ${statusData.status} - Progrès: ${statusData.progress}%`);
    
    if (onProgress) {
      onProgress(statusData);
    }
    
    if (statusData.status === 'COMPLETED') {
      console.log(`[Polling Image ${jobId}] ✅ Génération terminée, récupération des résultats...`);
      return await fetchImageResult(jobId, token);
    }
    
    if (statusData.status === 'FAILED') {
      console.error(`[Polling Image ${jobId}] ❌ Génération échouée:`, statusData.message);
      throw new Error(statusData.message || 'La génération a échoué');
    }
    
    attempts++;
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }
  
  console.error(`[Polling Image ${jobId}] ⏰ Timeout après ${maxAttempts} tentatives`);
  throw new Error('Timeout: La génération prend trop de temps');
}

// ============================================================================
// API VIDEOS côté client
// ============================================================================

import type {
  VideoGenerationRequest,
  VideoJobResponse,
  VideoStatusResponse,
  VideoResultResponse
} from '@/types/video-api';

/**
 * Créer une génération de vidéo
 * @param request Données de la requête
 * @param token Token d'authentification Clerk (obligatoire)
 */
export async function createVideoGeneration(
  request: VideoGenerationRequest,
  token: string
): Promise<VideoJobResponse> {
  if (!token) {
    throw new Error('Token d\'authentification manquant');
  }

  try {
    // Utiliser l'API Next.js qui créera l'entrée Prisma avant d'appeler le backend
    const response = await fetch('/api/videos/generate', {
      method: 'POST',
      headers: createAuthHeaders(token),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erreur lors de la création de la génération de vidéo');
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la création de la génération de vidéo:', error);
    throw error instanceof Error ? error : new Error('Impossible de créer la génération de vidéo');
  }
}

/**
 * Récupérer le statut d'une génération de vidéo
 * @param jobId ID du job
 * @param token Token d'authentification Clerk (ignoré pour les routes Next.js)
 */
export async function fetchVideoStatus(jobId: string, token: string): Promise<VideoStatusResponse> {
  try {
    // Les routes Next.js utilisent les cookies Clerk automatiquement
    const response = await fetch(`/api/videos/${jobId}/status`, {
      credentials: 'include', // Important pour envoyer les cookies
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération du statut');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération du statut:', error);
    throw new Error('Impossible de récupérer le statut de la génération');
  }
}

/**
 * Récupérer les résultats d'une génération de vidéo
 * @param jobId ID du job
 * @param token Token d'authentification Clerk (ignoré pour les routes Next.js)
 */
export async function fetchVideoResult(jobId: string, token: string): Promise<VideoResultResponse> {
  try {
    // Les routes Next.js utilisent les cookies Clerk automatiquement
    const response = await fetch(`/api/videos/${jobId}/result`, {
      credentials: 'include', // Important pour envoyer les cookies
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des résultats');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération des résultats:', error);
    throw new Error('Impossible de récupérer les résultats de la génération');
  }
}

/**
 * Polling du statut jusqu'à complétion
 * @param jobId ID du job
 * @param token Token d'authentification Clerk (obligatoire)
 * @param onProgress Callback appelé à chaque mise à jour du statut
 * @param maxAttempts Nombre maximum de tentatives (défaut: 40 pour vidéos plus longues)
 * @param intervalMs Intervalle entre les vérifications en ms (défaut: 5000)
 */
export async function pollVideoGenerationStatus(
  jobId: string,
  token: string,
  onProgress?: (status: VideoStatusResponse) => void,
  maxAttempts: number = 40,
  intervalMs: number = 5000
): Promise<VideoResultResponse> {
  if (!token) {
    throw new Error('Token d\'authentification manquant');
  }

  let attempts = 0;
  
  while (attempts < maxAttempts) {
    const statusData = await fetchVideoStatus(jobId, token);
    
    if (onProgress) {
      onProgress(statusData);
    }
    
    if (statusData.status === 'completed') {
      return await fetchVideoResult(jobId, token);
    }
    
    if (statusData.status === 'failed') {
      throw new Error(statusData.error || 'La génération a échoué');
    }
    
    attempts++;
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }
  
  throw new Error('Timeout: La génération prend trop de temps (>3 minutes)');
}