export const PLAN_LIMITS: Record<string, number> = {
  free: 2,
  pro: 10,
  premium: 0,
};

export const STATUS_CONFIG = {
  pending: {
    label: 'Processing',
    classes: 'bg-amber-400 text-black border-amber-400 shadow-sm',
    pulse: true,
  },
  ready: {
    label: 'Ready',
    classes: 'bg-[#22C55E] text-black border-[#22C55E] shadow-sm',
    pulse: false,
  },
  failed: {
    label: 'Failed',
    classes: 'bg-[#EF4444] text-white border-[#EF4444] shadow-sm',
    pulse: false,
  },
} as const;

// Solid avatar-tier badge (engine label) shown on the persona card.
export const TIER_BADGE = {
  avatar_iii: { label: 'Avatar III', plan: 'Pro',     classes: 'bg-[#00D4FF] text-black' },
  avatar_iv:  { label: 'Avatar IV',  plan: 'Premium', classes: 'bg-[#8A2BE2] text-white' },
} as const;
