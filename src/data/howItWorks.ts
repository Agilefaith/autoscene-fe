import { ImagePlus, FileText, Mic, MonitorPlay, Clock, Type, Sparkles, Download } from 'lucide-react';

const BLUE   = { accent: '#C026D3', accentDim: 'rgba(192,38,211,0.10)' } as const;
const PURPLE = { accent: '#7C3AED', accentDim: 'rgba(124,58,237,0.10)' } as const;

export const steps = [
  { n: '01', icon: FileText,    title: 'Add Your Script',          desc: 'Paste a title and let AI write the script, or paste your own. It is split into short scenes automatically. Custom scripts are locked from AI edits.', time: '~10 sec', ...BLUE   },
  { n: '02', icon: Sparkles,    title: 'Pick a Style',             desc: 'Choose Stickman, Cartoon, Ghibli, or Family Guy. Every scene is rendered in that one consistent style.',                                              time: '~5 sec',  ...PURPLE },
  { n: '03', icon: ImagePlus,   title: 'Scene Images',             desc: 'A detailed prompt is written per scene and an image is generated for each, matching exactly what the narration describes.',                          time: '~30 sec', ...BLUE   },
  { n: '04', icon: Mic,         title: 'Select Voice',             desc: 'Pick from curated ElevenLabs and Minimax voices, or paste your own Voice ID for fully custom narration.',                                            time: '~5 sec',  ...PURPLE },
  { n: '05', icon: MonitorPlay, title: 'Choose Format',            desc: 'Select your output ratio — 16:9 for YouTube or 9:16 for TikTok, Shorts and Reels.',                                                                    time: '~5 sec',  ...BLUE   },
  { n: '06', icon: Type,        title: 'Subtitle Settings',        desc: 'Configure font color, style, size, and placement for readable burned-in captions with a strong outline.',                                            time: '~10 sec', ...PURPLE },
  { n: '07', icon: Clock,       title: 'AI Renders Everything',    desc: 'Camera motion, scene transitions, voice sync, and subtitle burn-in run fully automatically — zero manual work.',                                      time: '1–5 min', ...BLUE   },
  { n: '08', icon: Download,    title: 'Download & Publish',       desc: 'Your finished MP4 lands in the dashboard, ready to post to TikTok, Reels, or YouTube.',                                                                time: 'Instant', ...PURPLE },
] as const;

export type Step = (typeof steps)[number];

export const HOW_IT_WORKS_STATS = [
  { label: 'Total setup time', value: '< 2 min' },
  { label: 'Render time',      value: '1–3 min' },
  { label: 'Manual work required', value: 'Zero' },
];
