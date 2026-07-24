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
  /** True when the user attached their own provider API key (never exposed). */
  has_api_key?: boolean;
}

export interface ValidateResult {
  valid: boolean;
  voice_id: string;
  name: string | null;
  provider: string;
  /** Why validation failed: "not_accessible" (needs the user's own key),
   *  "invalid_key" (their key was rejected), or "invalid". */
  reason?: string | null;
}
