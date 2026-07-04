export type ScriptMode = 'ai' | 'custom';
export type FilterMode = 'all' | 'ai' | 'custom';

export interface Script {
  id: string;
  title: string;
  content: string;
  generation_mode: ScriptMode;
  is_locked: boolean;
  product_name?: string;
  tone?: string;
  target_audience?: string;
  goal?: string;
  style?: string;
  created_at: string;
}

export interface GeneratePreview {
  content: string;
  word_count: number;
  estimated_duration_seconds: number;
}
