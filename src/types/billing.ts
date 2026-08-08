export interface BillingUsage {
  credit_balance: number;   // plan_credits + topup_credits (what is spendable)
  plan_credits: number;     // monthly allowance left; resets, no rollover
  topup_credits: number;    // purchased Pay-As-You-Go credits; never expire
  monthly_quota: number | null;
  // Empty when the account has no live subscription (there is no free tier).
  plan_tier: string;
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
