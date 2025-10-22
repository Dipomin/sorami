/**
 * Types pour l'API de génération de vidéos
 * Basé sur la documentation VIDEO_GENERATION_API.md
 */

export type VideoAspectRatio = '16:9' | '16:10';
export type PersonGeneration = 'ALLOW_ALL' | 'DENY_ALL';
export type VideoStatus = 'pending' | 'processing' | 'generating' | 'downloading' | 'completed' | 'failed';

/**
 * Requête de génération de vidéo
 */
export interface VideoGenerationRequest {
  prompt: string;
  aspect_ratio?: VideoAspectRatio;
  number_of_videos?: number;
  duration_seconds?: number;
  person_generation?: PersonGeneration;
  input_image_base64?: string | null;
  save_to_cloud?: boolean;
}

/**
 * Réponse initiale de création de job
 */
export interface VideoJobResponse {
  job_id: string;
  status: VideoStatus;
  message: string;
  created_at: string;
  estimated_duration?: string;
}

/**
 * Structure d'une vidéo générée
 */
export interface GeneratedVideo {
  filename: string;
  file_path: string;
  file_url: string | null;
  file_size: number;
  format: string;
  duration_seconds: number;
  aspect_ratio: VideoAspectRatio;
  dimensions: {
    width: number;
    height: number;
  };
  created_at: string;
  remote_uri?: string;
}

/**
 * Métadonnées de génération
 */
export interface VideoGenerationMetadata {
  model_name: string;
  model_version: string;
  processing_time: number;
  generation_time: number;
  download_time: number;
  prompt_used: string;
  num_videos_requested: number;
  num_videos_generated: number;
  config_used: {
    aspect_ratio: VideoAspectRatio;
    duration_seconds: number;
    person_generation: PersonGeneration;
  };
}

/**
 * Réponse de statut
 */
export interface VideoStatusResponse {
  job_id: string;
  status: VideoStatus;
  message: string;
  progress: number;
  videos: GeneratedVideo[];
  generation_metadata: VideoGenerationMetadata | null;
  error: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

/**
 * Réponse de résultat final
 */
export interface VideoResultResponse {
  job_id: string;
  status: VideoStatus;
  message: string;
  progress: number;
  videos: GeneratedVideo[];
  generation_metadata: VideoGenerationMetadata;
  error: string | null;
  created_at: string;
  completed_at: string;
}
