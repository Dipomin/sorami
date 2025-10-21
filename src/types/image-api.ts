// Types pour l'API de génération d'images

export interface ImageGenerationRequest {
  prompt: string;
  input_image_url?: string;
  num_images?: number;
  size?: '512x512' | '1024x1024' | '1792x1024';
  format?: 'PNG' | 'JPEG' | 'WEBP';
  style?: 'photorealistic' | 'artistic' | 'illustration' | '3d-render';
  quality?: 'standard' | 'high' | 'ultra';
}

export interface ImageGenerationJobResponse {
  job_id: string;
  status: ImageJobStatus;
  message: string;
}

export type ImageJobStatus = 
  | 'PENDING' 
  | 'INITIALIZING' 
  | 'GENERATING' 
  | 'SAVING' 
  | 'COMPLETED' 
  | 'FAILED';

export interface ImageStatusResponse {
  job_id: string;
  status: ImageJobStatus;
  message: string;
  progress?: number;
  created_at?: string;
  updated_at?: string;
}

export interface GeneratedImage {
  file_path: string;
  url: string;
  description: string;
  format: string;
  size_bytes: number;
  dimensions: string;
}

export interface ImageGenerationMetadata {
  model_name: string;
  version: string;
  generation_time_seconds: number;
  input_tokens: number;
  output_size_bytes: number;
  timestamp: string;
}

export interface ImageResultResponse {
  job_id: string;
  status: ImageJobStatus;
  message: string;
  images?: GeneratedImage[];
  metadata?: ImageGenerationMetadata;
  errors?: string[];
}
