export interface CreditPack {
  price: number;
  credits: number;
  approxMinutes: number;
}

export interface Plan {
  name: string;
  price: number;
  period: string;
  highlighted: boolean;
  badge?: string;
  avatarTier: string;
  personaLimit: number | 'unlimited';
  features: string[];
  creditPacks: CreditPack[];
  cta: string;
  ctaHref: string;
}
