export interface BookRequest {
  title: string;
  topic: string;
  goal: string;
}

export interface JobResponse {
  job_id: string;
  status: JobStatus;
  message: string;
  created_at: string;
}

export interface JobStatusResponse {
  job_id: string;
  status: JobStatus;
  message: string;
  progress: Record<string, any>;
  book_outline?: Array<{title: string, description: string}>;
  chapters_completed: number;
  total_chapters: number;
  error?: string;
  title?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BookResult {
  job_id: string;
  title: string;
  content: string;
  chapters: Array<{title: string, content: string}>;
  created_at: string;
  completed_at: string;
}

export interface ErrorResponse {
  error: string;
  message: string;
  job_id?: string;
}

export type JobStatus = 
  | 'pending'
  | 'generating_outline'
  | 'writing_chapters'
  | 'finalizing'
  | 'completed'
  | 'failed';