// Types principaux de Prisma
import type { 
  Book as PrismaBook, 
  Chapter as PrismaChapter,
  BookJob as PrismaBookJob,
  User as PrismaUser,
  Organization as PrismaOrganization,
  JobType,
  JobStatus as PrismaJobStatus,
  JobPriority,
  BookStatus
} from '@prisma/client'

// Types étendus avec relations
export interface BookWithChapters extends PrismaBook {
  chapters: PrismaChapter[]
  author: PrismaUser
  organization: PrismaOrganization
}

export interface BookJobWithDetails extends PrismaBookJob {
  book: {
    id: string
    title: string
  }
  organization: {
    id: string
    name: string
  }
}

// Réexport des types Prisma
export type { 
  PrismaBook as Book,
  PrismaChapter as Chapter,
  PrismaBookJob as BookJob,
  PrismaUser as User,
  PrismaOrganization as Organization,
  JobType,
  PrismaJobStatus as JobStatus,
  JobPriority,
  BookStatus
}

// Types pour l'API CrewAI (compatibilité ascendante)
export interface LegacyBook {
  id: string;
  title: string;
  description?: string;
  content?: string;
  chapters: LegacyChapter[];
  created_at?: string;
  completed_at?: string;
}

export interface LegacyChapter {
  id?: string;
  title: string;
  content: string;
  description?: string;
}

export interface BookRequest {
  title: string;
  topic: string;
  goal: string;
}

// Interface pour les réponses de job status (old API)
export interface JobStatusResponse {
  job_id: string;
  status: 'pending' | 'generating_outline' | 'writing_chapters' | 'finalizing' | 'completed' | 'failed';
  message: string;
  progress?: Record<string, any>;
  book_outline?: Array<{
    title: string;
    description: string;
  }>;
  chapters_completed?: number;
  total_chapters?: number;
  error?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface JobListItem {
  job_id: string;
  status: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface JobsResponse {
  jobs: JobListItem[];
}

export interface BookResult {
  job_id: string;
  title: string;
  content: string;
  chapters: PrismaChapter[];
  created_at: string;
  completed_at: string;
}

export interface ApiError {
  error: string;
  message: string;
  job_id?: string;
}

export interface HealthResponse {
  status: string;
  service: string;
}