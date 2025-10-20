// Types générés à partir du schéma Prisma pour l'application sorami
// Ces types complètent les types Prisma existants avec des interfaces spécifiques

import type { 
  User,
  Organization,
  Book,
  Chapter,
  BookJob,
  BookFormat,
  Subscription,
  ApiKey,
  UsageMetric,
  ActivityLog,
  JobStatus as PrismaJobStatus,
  BookStatus as PrismaBookStatus,
  FormatType,
  PlanType,
  UserRole,
  OrganizationRole
} from '@prisma/client'

// ============================================================================
// INTERFACES ÉTENDUES POUR L'APPLICATION
// ============================================================================

export interface UserWithOrganizations extends User {
  organizationMemberships: Array<{
    organization: Organization
    role: OrganizationRole
    status: string
  }>
  _count?: {
    books: number
    jobs: number
  }
}

export interface OrganizationWithMembers extends Organization {
  members: Array<{
    user: User
    role: OrganizationRole
    joinedAt: Date
  }>
  _count?: {
    books: number
    members: number
  }
}

export interface BookWithDetails extends Book {
  author: User
  organization?: Organization
  chapters: Chapter[]
  formats: BookFormat[]
  _count?: {
    chapters: number
    formats: number
    downloads: number
  }
}

export interface JobWithProgress extends BookJob {
  user: User
  organization?: Organization
  book?: Book
  progressDetails?: {
    percentage: number
    currentStep: string
    timeRemaining?: number
    chaptersCompleted: number
    totalChapters: number
  }
}

// ============================================================================
// TYPES POUR LES API RESPONSES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  meta?: {
    total?: number
    page?: number
    limit?: number
    hasMore?: boolean
  }
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasMore: boolean
  }
}

// ============================================================================
// TYPES POUR LES FORMULAIRES ET INPUTS
// ============================================================================

export interface CreateBookRequest {
  title: string
  subtitle?: string
  description?: string
  topic: string
  goal: string
  language?: string
  targetAudience?: string
  difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'
  organizationId?: string
}

export interface UpdateBookRequest {
  title?: string
  subtitle?: string
  description?: string
  status?: PrismaBookStatus
  visibility?: 'PRIVATE' | 'INTERNAL' | 'PUBLIC'
}

export interface CreateChapterRequest {
  title: string
  content: string
  description?: string
  order: number
}

export interface CreateOrganizationRequest {
  name: string
  slug: string
  description?: string
  website?: string
}

export interface InviteUserRequest {
  email: string
  role: OrganizationRole
  permissions?: string[]
}

// ============================================================================
// TYPES POUR LES JOBS ET WORKFLOW
// ============================================================================

export type JobStatusExtended = 
  | 'pending'
  | 'running'
  | 'generating_outline'
  | 'writing_chapters'
  | 'finalizing'
  | 'completed'
  | 'failed'
  | 'cancelled'

export interface JobProgressData {
  step: string
  percentage: number
  message: string
  details?: {
    currentChapter?: string
    chaptersCompleted: number
    totalChapters: number
    estimatedTimeRemaining?: number
    bookOutline?: Array<{
      title: string
      description: string
    }>
  }
}

export interface BookGenerationResult {
  bookId: string
  title: string
  content: string
  chapters: Array<{
    title: string
    content: string
    order: number
  }>
  wordCount: number
  totalPages?: number
  formats?: FormatType[]
}

// ============================================================================
// TYPES POUR LA FACTURATION (Corrigés pour compatibilité Prisma)
// ============================================================================

export interface SubscriptionWithDetails extends Omit<Subscription, 'plan'> {
  planType: PlanType // Utilise le type enum Prisma au lieu de redéfinir 'plan'
  planDetails: {
    name: string
    features: string[]
    limits: {
      maxBooks: number
      maxUsers: number
      maxStorageGB: number
      apiCallsPerMonth: number
    }
  }
  usage: {
    books: number
    storage: number
    apiCalls: number
  }
}

export interface UsageStats {
  current: {
    books: number
    storage: number // en GB
    apiCalls: number
    tokens: number
  }
  limits: {
    books: number
    storage: number
    apiCalls: number
  }
  period: {
    start: Date
    end: Date
  }
}

// ============================================================================
// TYPES POUR LE STOCKAGE ET FICHIERS
// ============================================================================

export interface FileUploadResult {
  success: boolean
  url?: string
  key?: string
  bucket?: string
  size: number
  mimeType: string
  error?: string
}

export interface BookExportOptions {
  format: FormatType
  includeImages: boolean
  includeTableOfContents: boolean
  customStyling?: {
    font?: string
    fontSize?: number
    margins?: {
      top: number
      bottom: number
      left: number
      right: number
    }
  }
}

// ============================================================================
// TYPES POUR LES MÉTRIQUES ET ANALYTICS
// ============================================================================

export interface DashboardMetrics {
  books: {
    total: number
    published: number
    drafts: number
    generating: number
    thisMonth: number
  }
  usage: {
    storage: {
      used: number // GB
      limit: number // GB
      percentage: number
    }
    apiCalls: {
      used: number
      limit: number
      percentage: number
    }
  }
  activity: {
    recentBooks: BookWithDetails[]
    recentJobs: JobWithProgress[]
    recentDownloads: number
  }
}

export interface AnalyticsData {
  period: {
    start: Date
    end: Date
  }
  metrics: {
    booksCreated: { value: number; change: number }
    booksDownloaded: { value: number; change: number }
    apiCalls: { value: number; change: number }
    storageUsed: { value: number; change: number }
  }
  charts: {
    booksOverTime: Array<{ date: string; count: number }>
    downloadsByFormat: Array<{ format: string; count: number }>
    usageByDay: Array<{ date: string; books: number; api: number }>
  }
}

// ============================================================================
// TYPES POUR LES CORRECTIONS ET RÉVISIONS
// ============================================================================

export interface CorrectionSuggestion {
  type: 'SPELLING' | 'GRAMMAR' | 'STYLE' | 'COHERENCE' | 'STRUCTURE'
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL'
  position: {
    start: number
    end: number
    line?: number
  }
  original: string
  suggestion: string
  explanation: string
  confidence: number // 0-1
}

export interface BookRevisionSummary {
  version: string
  changes: {
    added: number
    removed: number
    modified: number
  }
  summary: string
  timestamp: Date
}

// ============================================================================
// TYPES POUR LA CONFIGURATION
// ============================================================================

export interface AppConfig {
  features: {
    aiGeneration: boolean
    collaboration: boolean
    apiAccess: boolean
    customBranding: boolean
    analytics: boolean
  }
  limits: {
    maxBooks: number
    maxChaptersPerBook: number
    maxWordCountPerBook: number
    maxFileSizeMB: number
    rateLimit: number
  }
  integrations: {
    paystack: boolean
    aws: boolean
    openai: boolean
    crewai: boolean
  }
}

// ============================================================================
// TYPES POUR L'AUTHENTIFICATION ET SÉCURITÉ
// ============================================================================

export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
  organizations: Array<{
    id: string
    name: string
    role: OrganizationRole
    slug: string
  }>
  currentOrganization?: string
  preferences: {
    language: string
    timezone: string
    theme: 'light' | 'dark'
  }
}

export interface ApiKeyWithStats extends ApiKey {
  stats: {
    totalCalls: number
    lastUsed?: Date
    callsThisMonth: number
  }
}

// ============================================================================
// TYPES UTILITAIRES
// ============================================================================

export type SortOrder = 'asc' | 'desc'

export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: SortOrder
  search?: string
  filters?: Record<string, any>
}

export interface DatabaseHealth {
  status: 'healthy' | 'degraded' | 'down'
  responseTime: number
  connections: {
    active: number
    idle: number
    total: number
  }
  lastCheck: Date
}

// ============================================================================
// TYPES POUR LES WEBHOOKS ET ÉVÉNEMENTS
// ============================================================================

export interface WebhookEvent {
  id: string
  type: string
  data: any
  timestamp: Date
  source: 'paystack' | 'crewai' | 'internal'
  processed: boolean
}

export type BookEventType = 
  | 'book.created'
  | 'book.updated'
  | 'book.published'
  | 'book.deleted'
  | 'chapter.created'
  | 'chapter.updated'
  | 'job.started'
  | 'job.completed'
  | 'job.failed'

export interface BookEvent {
  type: BookEventType
  bookId: string
  userId: string
  organizationId?: string
  data: any
  timestamp: Date
}

// ============================================================================
// EXPORTS PRINCIPAUX
// ============================================================================

export type {
  User,
  Organization,
  Book,
  Chapter,
  BookJob,
  BookFormat,
  Subscription,
  PrismaJobStatus,
  PrismaBookStatus,
  FormatType,
  PlanType,
  UserRole,
  OrganizationRole
}

// Types courants pour l'application
export type BookStatus = PrismaBookStatus
export type JobStatus = JobStatusExtended