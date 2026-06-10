import type { LucideIcon } from 'lucide-react';

export type AspectRatio = '16:9' | '9:16' | '4:5' | '1:1';

export interface VideoCardData {
  label: string;
  category: string;
  type: string;
  duration: string;
  accent: string;
  image: string;
  videoSrc?: string;
  views?: string;
  ratio: AspectRatio;
  featured?: boolean;
}

export interface LivePreviewStat {
  icon: LucideIcon;
  value: string;
  label: string;
}
