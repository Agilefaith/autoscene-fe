import { FileText, Cpu, Film, Mic, Calendar } from 'lucide-react';

const BLUE   = { accent: '#00D4FF', accentDim: 'rgba(0,212,255,0.08)'   } as const;
const PURPLE = { accent: '#8A2BE2', accentDim: 'rgba(138,43,226,0.08)'  } as const;

export const features = [
  {
    ...BLUE,
    icon: FileText,
    title: 'AI Script Engine',
    description: 'GPT writes conversion-focused scripts from your topic, or lock in your own.',
  },
  {
    ...PURPLE,
    icon: Cpu,
    title: 'Motion Prompt Engine',
    description: 'Tone-aware gesture instructions perfectly synced to your script energy.',
  },
  {
    ...BLUE,
    icon: Mic,
    title: 'Voice Engine',
    description: 'ElevenLabs and Minimax voices out of the box, or paste any custom Voice ID.',
  },
  {
    ...PURPLE,
    icon: Film,
    title: 'Editing Engine',
    description: 'Auto-applied zooms, jump cuts, and pacing make every output feel professionally edited.',
  },
  {
    ...BLUE,
    icon: Calendar,
    title: 'Campaign Automation',
    description: 'Schedule recurring video runs on any cadence and let Vidora produce on autopilot.',
  },
] as const;

export type Feature = (typeof features)[number];
