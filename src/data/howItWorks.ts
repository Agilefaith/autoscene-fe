import { ImagePlus, FileText, Mic, MonitorPlay, Clock, Type, Sparkles, Download } from 'lucide-react';

const BLUE   = { accent: '#00D4FF', accentDim: 'rgba(0,212,255,0.10)'  } as const;
const PURPLE = { accent: '#8A2BE2', accentDim: 'rgba(138,43,226,0.10)' } as const;

export const steps = [
  { n: '01', icon: ImagePlus,   title: 'Upload Your Image',       desc: 'Upload a high-res photo of your AI influencer. We create a reusable avatar saved directly to your library.',                                              time: '~30 sec', ...BLUE   },
  { n: '02', icon: FileText,    title: 'Generate Script',          desc: 'Paste a title and let GPT write a conversion-focused script — or paste your own. Custom scripts are locked from any AI edits.',                          time: '~10 sec', ...PURPLE },
  { n: '03', icon: Mic,         title: 'Select Voice',             desc: 'Pick from curated ElevenLabs and Minimax voices, or paste your own Voice ID for a fully custom audio experience.',                                        time: '~5 sec',  ...BLUE   },
  { n: '04', icon: MonitorPlay, title: 'Choose Format',            desc: 'Select your output ratio — 16:9 for YouTube, 9:16 for TikTok & Reels, 1:1 or 4:5 for Instagram feeds.',                                                  time: '~5 sec',  ...PURPLE },
  { n: '05', icon: Clock,       title: 'Set Video Length',         desc: 'Choose from 15 seconds all the way up to 20 minutes. Credits scale automatically with duration.',                                                         time: '~5 sec',  ...BLUE   },
  { n: '06', icon: Type,        title: 'Subtitle Settings',        desc: 'Configure font color, style, size, and placement (top / center / bottom) for AI-generated burned-in subtitles.',                                          time: '~10 sec', ...PURPLE },
  { n: '07', icon: Sparkles,    title: 'AI Renders Everything',    desc: 'Motion prompts, voice sync, camera zooms, cuts, and subtitle burn-in run fully automatically — zero manual work.',                                        time: '1–3 min', ...BLUE   },
  { n: '08', icon: Download,    title: 'Download & Publish',       desc: 'Your finished MP4 lands in the dashboard. Post to TikTok, Reels, or YouTube — or schedule with Campaigns.',                                              time: 'Instant', ...PURPLE },
] as const;

export type Step = (typeof steps)[number];

export const HOW_IT_WORKS_STATS = [
  { label: 'Total setup time', value: '< 2 min' },
  { label: 'Render time',      value: '1–3 min' },
  { label: 'Manual work required', value: 'Zero' },
];
