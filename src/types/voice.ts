export interface PresetVoice {
  id: string;
  name: string;
  accent: string;
  gender: 'male' | 'female' | 'non-binary';
  provider?: 'elevenlabs' | 'minimax';
  preview_url?: string | null;
}

export interface SavedVoice {
  id: string;
  name: string;
  provider: string;
  voice_id: string;
  is_custom: boolean;
  validated: boolean;
  created_at: string;
}

export interface ValidateResult {
  valid: boolean;
  voice_id: string;
  name: string | null;
  provider: string;
}
