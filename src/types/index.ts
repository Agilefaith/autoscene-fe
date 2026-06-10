export type PlanTier = 'free' | 'pro' | 'premium' | 'internal';

export type UserType = 'trial' | 'standard' | 'internal';

export type AvatarTier = 'iii' | 'iv';

export type VideoFormat = '16:9' | '9:16' | '1:1' | '4:5';

export type MotionIntensity = 'subtle' | 'moderate' | 'expressive' | 'engaging';

export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';

export type PipelineStageName =
  | 'script_processing'
  | 'motion_generation'
  | 'applying_edits'
  | 'avatar_rendering'
  | 'voice_sync'
  | 'subtitle_generation'
  | 'final_render';

export type PipelineStageStatus = 'pending' | 'active' | 'complete' | 'failed';

export type VoiceProvider = 'elevenlabs' | 'minimax' | 'custom';

export type ScriptMode = 'ai' | 'custom';

export type VideoLength =
  | '15s'
  | '30s'
  | '45s'
  | '60s'
  | '90s'
  | '2m'
  | '3m'
  | '5m'
  | '8m'
  | '10m'
  | '15m'
  | '20m';

export type SubtitlePlacement = 'top' | 'center' | 'bottom';

export type FontStyle = 'sans' | 'serif' | 'mono' | 'bold' | 'italic';

export type CreditTransactionType = 'purchase' | 'usage' | 'refund' | 'bonus';

export type CampaignStatus = 'active' | 'paused' | 'completed';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  planTier: PlanTier;
  userType: UserType;
  credits: number;
  totalVideosGenerated: number;
  personaCount: number;
  personaLimit: number;
  createdAt: string;
  updatedAt: string;
}

export interface Persona {
  id: string;
  userId: string;
  name: string;
  imageUrl?: string;
  avatarTier: AvatarTier;
  heygenAvatarId?: string;
  isDefault: boolean;
  createdAt: string;
}

export interface Script {
  id: string;
  userId: string;
  title: string;
  content: string;
  mode: ScriptMode;
  productName?: string;
  targetAudience?: string;
  tone?: string;
  goal?: string;
  style?: string;
  wordCount: number;
  estimatedDurationSeconds: number;
  createdAt: string;
}

export interface VoiceConfig {
  id: string;
  name: string;
  provider: VoiceProvider;
  voiceId: string;
  previewUrl?: string;
  language: string;
  gender: 'male' | 'female' | 'neutral';
  isCustom: boolean;
}

export interface SubtitleSettings {
  enabled: boolean;
  fontColor: string;
  fontStyle: FontStyle;
  fontSize: number;
  placement: SubtitlePlacement;
}

export interface PipelineStage {
  name: PipelineStageName;
  status: PipelineStageStatus;
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
  errorMessage?: string;
}

export interface VideoJob {
  id: string;
  userId: string;
  personaId: string;
  scriptId: string;
  requestUuid: string;
  title: string;
  status: JobStatus;
  format: VideoFormat;
  motionIntensity: MotionIntensity;
  videoLength: VideoLength;
  durationSeconds: number;
  avatarTier: AvatarTier;
  creditsUsed: number;
  voiceConfig: VoiceConfig;
  subtitleSettings: SubtitleSettings;
  pipeline: PipelineStage[];
  videoUrl?: string;
  thumbnailUrl?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  type: CreditTransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  jobId?: string;
  stripePaymentIntentId?: string;
  createdAt: string;
}

export interface Campaign {
  id: string;
  userId: string;
  name: string;
  personaId: string;
  scheduleExpression: string;
  scriptTemplate: Partial<Script>;
  voiceConfigId: string;
  format: VideoFormat;
  motionIntensity: MotionIntensity;
  videoLength: VideoLength;
  status: CampaignStatus;
  totalJobsCreated: number;
  lastRunAt?: string;
  nextRunAt?: string;
  createdAt: string;
}

export interface StatCard {
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export interface PricingPlan {
  name: string;
  price: number;
  highlighted?: boolean;
  features: string[];
  creditPacks: Array<{ price: number; credits: number; videoMinutes: number }>;
  cta: string;
  personaLimit: number;
  avatarTier: AvatarTier;
}

export interface NavItem {
  label: string;
  href: string;
  icon: string;
}
