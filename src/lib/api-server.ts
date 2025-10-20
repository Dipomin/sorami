// API pour l'application avec Prisma et CrewAI

import { prisma } from './prisma'

// ============================================================================
// API BOOKS avec Prisma
// ============================================================================

export async function fetchBooks(organizationId?: string) {
  try {
    const books = await prisma.book.findMany({
      where: organizationId ? { organizationId } : {},
      include: {
        chapters: {
          orderBy: { order: 'asc' }
        },
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        organization: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return books
  } catch (error) {
    console.error('Erreur lors de la récupération des livres:', error)
    throw new Error('Impossible de récupérer les livres')
  }
}

export async function fetchBookById(id: string) {
  try {
    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        chapters: {
          orderBy: { order: 'asc' }
        },
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        organization: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })
    
    return book
  } catch (error) {
    console.error('Erreur lors de la récupération du livre:', error)
    throw new Error('Impossible de récupérer le livre')
  }
}

export async function createBook(data: {
  title: string
  subtitle?: string
  description?: string
  topic: string
  goal: string
  language?: string
  authorId: string
  organizationId: string
  chapters?: Array<{ title: string; description?: string }>
}) {
  try {
    const book = await prisma.book.create({
      data: {
        ...data,
        language: data.language || 'fr',
        status: 'DRAFT',
        chapters: {
          create: data.chapters?.map((chapter, index) => ({
            title: chapter.title,
            description: chapter.description,
            content: '',
            order: index + 1
          })) || []
        }
      },
      include: {
        chapters: {
          orderBy: { order: 'asc' }
        },
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        organization: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })
    
    return book
  } catch (error) {
    console.error('Erreur lors de la création du livre:', error)
    throw new Error('Impossible de créer le livre')
  }
}

// ============================================================================
// API BOOK JOBS avec Prisma
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
    const job = await prisma.bookJob.create({
      data: {
        bookId: data.bookId,
        organizationId: data.organizationId,
        userId: data.userId,
        jobType: data.jobType,
        priority: data.priority || 'NORMAL',
        inputData: data.inputData,
        status: 'PENDING'
      },
      include: {
        book: {
          select: {
            id: true,
            title: true
          }
        },
        organization: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })
    
    return job
  } catch (error) {
    console.error('Erreur lors de la création du job:', error)
    throw new Error('Impossible de créer le job')
  }
}

export async function updateBookJobStatus(
  jobId: string, 
  status: 'PENDING' | 'RUNNING' | 'GENERATING_OUTLINE' | 'WRITING_CHAPTERS' | 'FINALIZING' | 'COMPLETED' | 'FAILED' | 'CANCELLED', 
  updates: {
    externalJobId?: string
    progress?: any
    currentStep?: string
    result?: any
    error?: string
    logs?: string
  } = {}
) {
  try {
    const updateData: any = { status, ...updates }
    
    if (status === 'RUNNING' && !updateData.startedAt) {
      updateData.startedAt = new Date()
    }
    
    if (status === 'COMPLETED' || status === 'FAILED') {
      updateData.completedAt = new Date()
    }
    
    const job = await prisma.bookJob.update({
      where: { id: jobId },
      data: updateData,
      include: {
        book: {
          select: {
            id: true,
            title: true
          }
        },
        organization: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })
    
    return job
  } catch (error) {
    console.error('Erreur lors de la mise à jour du job:', error)
    throw new Error('Impossible de mettre à jour le job')
  }
}

export async function fetchBookJob(jobId: string) {
  try {
    const job = await prisma.bookJob.findUnique({
      where: { id: jobId },
      include: {
        book: {
          select: {
            id: true,
            title: true
          }
        },
        organization: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })
    
    return job
  } catch (error) {
    console.error('Erreur lors de la récupération du job:', error)
    throw new Error('Impossible de récupérer le job')
  }
}

// ============================================================================
// API CrewAI (intégration avec les nouveaux modèles)
// ============================================================================

export async function generateBookContent(
  bookId: string,
  organizationId: string,
  userId: string,
  request: {
    topic: string
    goal: string
    chapters: Array<{ title: string; description?: string }>
  }
): Promise<{ jobId: string }> {
  try {
    // 1. Créer un BookJob dans la base de données
    const bookJob = await createBookJob({
      bookId,
      organizationId,
      userId,
      jobType: 'BOOK_GENERATION',
      inputData: request
    })
    
    // 2. Appeler l'API CrewAI
    const crewaiResponse = await fetch(`${process.env.CREWAI_API_URL}/api/books/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CREWAI_API_KEY}`
      },
      body: JSON.stringify(request)
    })
    
    if (!crewaiResponse.ok) {
      await updateBookJobStatus(bookJob.id, 'FAILED', {
        error: `CrewAI API Error: ${crewaiResponse.status}`
      })
      throw new Error('Erreur lors de l\'appel à l\'API CrewAI')
    }
    
    const crewaiData = await crewaiResponse.json()
    
    // 3. Mettre à jour le job avec l'ID externe
    await updateBookJobStatus(bookJob.id, 'RUNNING', {
      externalJobId: crewaiData.job_id,
      currentStep: 'Génération en cours...'
    })
    
    return { jobId: bookJob.id }
  } catch (error) {
    console.error('Erreur lors de la génération:', error)
    throw error
  }
}

export async function pollBookJobStatus(jobId: string) {
  try {
    const job = await prisma.bookJob.findUnique({
      where: { id: jobId }
    })
    
    if (!job) {
      throw new Error('Job non trouvé')
    }
    
    // Si le job est terminé, retourner directement
    if (job.status === 'COMPLETED' || job.status === 'FAILED') {
      return {
        status: job.status,
        progress: job.progress,
        result: job.result,
        error: job.error || undefined
      }
    }
    
    // Si le job a un ID externe, interroger CrewAI
    if (job.externalJobId) {
      const crewaiResponse = await fetch(
        `${process.env.CREWAI_API_URL}/job-status/${job.externalJobId}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.CREWAI_API_KEY}`
          }
        }
      )
      
      if (crewaiResponse.ok) {
        const crewaiData = await crewaiResponse.json()
        
        // Mettre à jour le job local avec les données de CrewAI
        const updatedJob = await updateBookJobStatus(jobId, mapCrewAIStatus(crewaiData.status), {
          progress: crewaiData.progress,
          currentStep: crewaiData.current_step,
          result: crewaiData.result,
          error: crewaiData.error
        })
        
        return {
          status: updatedJob.status,
          progress: updatedJob.progress,
          result: updatedJob.result,
          error: updatedJob.error || undefined
        }
      }
    }
    
    // Retourner l'état actuel
    return {
      status: job.status,
      progress: job.progress,
      result: job.result,
      error: job.error || undefined
    }
  } catch (error) {
    console.error('Erreur lors du polling du job:', error)
    throw error
  }
}

// Fonction utilitaire pour mapper les statuts CrewAI vers nos statuts
function mapCrewAIStatus(crewaiStatus: string) {
  switch (crewaiStatus) {
    case 'pending': return 'PENDING'
    case 'running': return 'RUNNING'
    case 'generating_outline': return 'GENERATING_OUTLINE'
    case 'writing_chapters': return 'WRITING_CHAPTERS'
    case 'finalizing': return 'FINALIZING'
    case 'completed': return 'COMPLETED'
    case 'failed': return 'FAILED'
    case 'cancelled': return 'CANCELLED'
    default: return 'PENDING'
  }
}