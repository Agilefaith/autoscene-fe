import type { PlanId } from '@/data/plans';

export interface BillingUsage {
  credit_balance: number;   // videos remaining this period
  monthly_quota: number | null;
  plan_tier: PlanId;
  user_type: 'trial' | 'standard' | 'internal';
  videos_generated: number;
  reset_date: string | null;
}

export interface CreditTransaction {
  id: string;
  amount: number;
  type: string;
  video_job_id: string | null;
  created_at: string;
}
