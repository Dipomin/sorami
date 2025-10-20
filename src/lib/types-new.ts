// Types principaux pour l'application avec Prisma
import type {
  Book,
  Chapter,
  BookJob,
  User,
  Organization,
  JobType,
  JobStatus,
  JobPriority,
  BookStatus
} from '@prisma/client'

// Types étendus avec relations
export type BookWithChapters = {
  id: string
  title: string
  subtitle?: string | null
  description?: string | null
  topic: string
  goal: string
  content?: string | null
  language: string
  status: BookStatus
  metadata?: any
  authorId: string
  organizationId: string
  createdAt: Date
  updatedAt: Date
  completedAt?: Date | null
  publishedAt?: Date | null
  chapters: Chapter[]
  author: User
  organization: Organization
}

export type BookJobWithDetails = {
  id: string
  externalJobId?: string | null
  jobType: JobType
  priority: JobPriority
  inputData: any
  status: JobStatus
  progress?: any | null
  currentStep?: string | null
  totalSteps?: number | null
  completedSteps?: number | null
  result?: any | null
  error?: string | null
  logs?: string | null
  startedAt?: Date | null
  completedAt?: Date | null
  bookId: string
  organizationId: string
  createdAt: Date
  updatedAt: Date
  book: {
    id: string
    title: string
  }
  organization: {
    id: string
    name: string
  }
}

// Types pour l'API CrewAI (rétrocompatibilité)
export interface CrewAIBookRequest {
  topic: string
  goal: string
  chapters: Array<{
    title: string
    description?: string
  }>
}

export interface CrewAIBookResponse {
  id: string
  title: string
  description?: string
  chapters: Array<{
    title: string
    content: string
    description?: string
  }>
  created_at: string
  completed_at?: string
}

// Types pour les hooks
export interface UseBookGenerationState {
  loading: boolean
  error: string | null
  progress: number
  currentStep: string | null
  jobId: string | null
}

export interface UseBooksState {
  books: BookWithChapters[]
  loading: boolean
  error: string | null
}