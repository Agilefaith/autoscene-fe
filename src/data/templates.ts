// Curated starter templates — one-click preconfigured projects (no backend).
// Each bundles the Configure-step settings; the wizard reads ?template=<id>.

export type SubtitleStyleOption = 'sans' | 'serif' | 'mono' | 'bold' | 'italic';
export type SubtitlePlacement = 'top' | 'center' | 'bottom';

export interface TemplateConfig {
  render_mode: 'mode_1' | 'mode_2';
  format: '16:9' | '9:16';
  style: string;
  niche: string; // must match a backend niche label exactly
  subtitle: {
    enabled: boolean;
    font_color: string;
    font_style: SubtitleStyleOption;
    font_size: number;
    placement: SubtitlePlacement;
  };
}

export interface Template {
  id: string;
  name: string;
  description: string;
  tag: string;
  config: TemplateConfig;
}

// Themed cover per template (prompt matched to the template's topic).
const COVER_BASE = 'https://s3.us-west-004.backblazeb2.com/ai-influencer-app/template-covers';
export const templateCover = (t: Template) => `${COVER_BASE}/${t.id}.png`;

const sub = (over: Partial<Template['config']['subtitle']> = {}) => ({
  enabled: true, font_color: '#FFFFFF', font_style: 'bold' as SubtitleStyleOption,
  font_size: 84, placement: 'bottom' as SubtitlePlacement, ...over,
});

export const TEMPLATES: Template[] = [
  {
    id: 'bible-short', name: 'Bible Storytelling Short', tag: 'Shorts',
    description: 'Vertical cinematic scenes for faceless Bible storytelling.',
    config: { render_mode: 'mode_1', format: '9:16', style: 'ghibli', niche: 'Bible storytelling', subtitle: sub() },
  },
  {
    id: 'finance-explainer', name: 'Finance Explainer', tag: 'YouTube',
    description: 'Wide, clean illustrated look for finance narratives.',
    config: { render_mode: 'mode_1', format: '16:9', style: 'cartoon', niche: 'Finance storytelling', subtitle: sub() },
  },
  {
    id: 'motivational-reel', name: 'Motivational Reel', tag: 'Shorts',
    description: 'Punchy vertical quote shorts with enhanced motion.',
    config: { render_mode: 'mode_2', format: '9:16', style: 'cartoon', niche: 'Motivational & Quote Shorts', subtitle: sub({ font_color: '#FBBF24', placement: 'center' }) },
  },
  {
    id: 'history-doc', name: 'History Documentary', tag: 'YouTube',
    description: 'Realistic, documentary-style history videos.',
    config: { render_mode: 'mode_1', format: '16:9', style: 'ghibli', niche: 'History', subtitle: sub() },
  },
  {
    id: 'dark-truths', name: 'Dark Truths Short', tag: 'Shorts',
    description: 'Moody vertical scenes for dark-reality storytelling.',
    config: { render_mode: 'mode_1', format: '9:16', style: 'cartoon', niche: 'Dark Truths / Reality', subtitle: sub() },
  },
  {
    id: 'self-improvement', name: 'Self-Improvement Short', tag: 'Shorts',
    description: 'Discipline & growth shorts with semi-animated scenes.',
    config: { render_mode: 'mode_2', format: '9:16', style: 'cartoon', niche: 'Self-Improvement & Discipline', subtitle: sub() },
  },
];
