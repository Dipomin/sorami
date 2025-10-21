// Types API pour les articles de blog
// Structure basée sur l'API CrewAI backend

export interface BlogRequest {
  topic: string;
  goal?: string;
  target_word_count?: number;
}

export interface BlogSection {
  heading: string;
  content: string;
}

export interface BlogJobResponse {
  job_id: string;
  status: BlogJobStatus;
  message: string;
  created_at: string;
}

export interface BlogJobStatusResponse {
  job_id: string;
  status: BlogJobStatus;
  message: string;
  progress: number;
  result?: any;
  content_type: 'blog';
  updated_at: string;
}

export interface BlogArticleResult {
  job_id: string;
  title: string;
  meta_description: string;
  introduction: string;
  sections: BlogSection[];
  conclusion: string;
  tags: string[];
  main_keywords: string[];
  seo_score: number;
  word_count: number;
  readability_score: string;
  full_content: string;
  generated_at: string;
  completed_at: string;
}

export interface BlogErrorResponse {
  error: string;
  message: string;
  job_id?: string;
}

export type BlogJobStatus = 
  | 'pending'
  | 'generating_outline'
  | 'writing_chapters'
  | 'finalizing'
  | 'completed'
  | 'failed';

export interface BlogArticle {
  id: string;
  title: string;
  topic: string;
  goal?: string;
  metaDescription?: string;
  introduction?: string;
  conclusion?: string;
  fullContent?: string;
  seoScore?: number;
  wordCount?: number;
  readabilityScore?: string;
  targetWordCount: number;
  tags?: string[];
  mainKeywords?: string[];
  sections?: BlogSection[];
  status: 'DRAFT' | 'GENERATING' | 'REVIEW' | 'PUBLISHED';
  visibility: 'PRIVATE' | 'PUBLIC' | 'UNLISTED';
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  organizationId?: string;
}

export interface CreateBlogArticleInput {
  topic: string;
  goal?: string;
  targetWordCount?: number;
}
