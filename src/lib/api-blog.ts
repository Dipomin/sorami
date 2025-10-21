// API client-side pour les articles de blog
import { BlogRequest, BlogJobResponse, BlogJobStatusResponse, BlogArticleResult } from '../types/blog-api';

// ============================================================================
// API BLOG ARTICLES côté client
// ============================================================================

export async function fetchBlogArticles(organizationId?: string) {
  try {
    const url = organizationId ? `/api/blog?organizationId=${organizationId}` : '/api/blog'
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des articles')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Erreur lors de la récupération des articles:', error)
    throw new Error('Impossible de récupérer les articles')
  }
}

export async function fetchBlogArticleById(id: string) {
  try {
    const response = await fetch(`/api/blog/${id}`)
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération de l\'article')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'article:', error)
    throw new Error('Impossible de récupérer l\'article')
  }
}

export async function generateBlogContent(data: BlogRequest): Promise<BlogJobResponse> {
  try {
    const response = await fetch('/api/blog/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      let errorMessage = 'Erreur lors de la génération de l\'article'
      try {
        const errorData = await response.json()
        if (errorData.error) {
          errorMessage = errorData.error
        }
        if (errorData.details) {
          errorMessage += ` (${errorData.details})`
        }
      } catch (parseError) {
        console.warn('Impossible de parser l\'erreur du serveur:', parseError)
      }
      throw new Error(errorMessage)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Erreur lors de la génération de l\'article:', error)
    throw error
  }
}

export async function pollBlogJobStatus(jobId: string): Promise<BlogJobStatusResponse> {
  try {
    const response = await fetch(`/api/blog/jobs/${jobId}/status`)
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération du statut du job')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Erreur lors de la récupération du statut du job:', error)
    throw new Error('Impossible de récupérer le statut du job')
  }
}

export async function fetchBlogJobResult(jobId: string): Promise<BlogArticleResult> {
  try {
    const response = await fetch(`/api/blog/jobs/${jobId}/result`)
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération du résultat')
    }
    
    const data = await response.json()
    
    // L'API retourne { success: true, blog_article: {...} }
    // On extrait blog_article pour correspondre au type BlogArticleResult
    if (data.blog_article) {
      return data.blog_article
    }
    
    // Si la réponse est déjà au bon format (ancien format ou backend direct)
    return data
  } catch (error) {
    console.error('Erreur lors de la récupération du résultat:', error)
    throw new Error('Impossible de récupérer le résultat')
  }
}

export async function updateBlogArticle(id: string, data: {
  title?: string
  metaDescription?: string
  introduction?: string
  conclusion?: string
  fullContent?: string
  status?: 'DRAFT' | 'GENERATING' | 'REVIEW' | 'PUBLISHED'
  visibility?: 'PRIVATE' | 'PUBLIC' | 'UNLISTED'
}) {
  try {
    const response = await fetch(`/api/blog/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      throw new Error('Erreur lors de la mise à jour de l\'article')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'article:', error)
    throw new Error('Impossible de mettre à jour l\'article')
  }
}

export async function deleteBlogArticle(id: string) {
  try {
    const response = await fetch(`/api/blog/${id}`, {
      method: 'DELETE',
    })
    
    if (!response.ok) {
      throw new Error('Erreur lors de la suppression de l\'article')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'article:', error)
    throw new Error('Impossible de supprimer l\'article')
  }
}

export async function publishBlogArticle(id: string) {
  try {
    const response = await fetch(`/api/blog/${id}/publish`, {
      method: 'POST',
    })
    
    if (!response.ok) {
      throw new Error('Erreur lors de la publication de l\'article')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Erreur lors de la publication de l\'article:', error)
    throw new Error('Impossible de publier l\'article')
  }
}
