export type PlanTier = 'free' | 'pro' | 'premium' | 'internal';

export type UserType = 'trial' | 'standard' | 'internal';

export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';

export type VoiceProvider = 'elevenlabs' | 'minimax' | 'custom';

export type SubtitlePlacement = 'top' | 'center' | 'bottom';

export type FontStyle = 'sans' | 'serif' | 'mono' | 'bold' | 'italic';

export type CreditTransactionType = 'purchase' | 'usage' | 'refund' | 'bonus';

export interface SubtitleSettings {
  enabled: boolean;
  fontColor: string;
  fontStyle: FontStyle;
  fontSize: number;
  placement: SubtitlePlacement;
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  type: CreditTransactionType;
  amount: number;
  balance_before: number;
  balance_after: number;
  description: string;
  job_id?: string;
  lemonsqueezy_order_id?: string;
  created_at: string;
}

export interface StatCard {
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
}


export interface NavItem {
  label: string;
  href: string;
  icon: string;
}
