// Mode 2 was removed on Faith's instruction (2026-08-05): Mode 1 is the only
// way to create a video.
export type RenderMode = 'mode_1';
export type ProjectFormat = '16:9' | '9:16';

// Mirrors backend project status machine (see projects pipeline).
export type ProjectStatus =
  | 'draft' | 'scene_breakdown' | 'scenes_ready' | 'pending'
  | 'generating_images' | 'voiceover' | 'rendering_scenes' | 'assembling'
  | 'completed' | 'cancelled' | 'timed_out'
  | 'failed_at_breakdown' | 'failed_at_images' | 'failed_at_voiceover'
  | 'failed_at_render' | 'failed_at_assembly';

export interface Scene {
  id: string;
  project_id: string;
  idx: number;
  scene_text?: string | null;
  emotion?: string | null;
  action?: string | null;
  environment?: string | null;
  image_prompt?: string | null;
  image_prompts?: string[] | null;
  motion_type?: string | null;
  image_urls?: string[] | null;
  clip_url?: string | null;
  duration_seconds: number;
  status: string;
  error_message?: string | null;
}

export interface Project {
  id: string;
  name: string;
  status: ProjectStatus | string;
  voice_config_id?: string | null;
  render_mode: string;
  format: string;
  niche?: string | null;
  style?: string | null;
  reference_image_url?: string | null;
  duration_seconds: number;
  credits_used: number;
  final_video_url?: string | null;
  error_message?: string | null;
  processing_time_ms?: number | null;
  created_at: string;
  completed_at?: string | null;
  scenes?: Scene[];
}
