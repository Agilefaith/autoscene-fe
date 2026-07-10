'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight, ChevronLeft, AlertTriangle, Check, Zap, Sparkles,
  ArrowRight, Download, RefreshCw, FileText, Film, Settings2, Rocket,
  Loader2, Play, X, Camera, Image as ImageIcon, Clapperboard, Clock,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { authedFetch, authedJson } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { inputClass } from '@/lib/styles';
import { useConfirm, useToast } from '@/components/ui/ConfirmProvider';
import { useAuth } from '@/context/AuthContext';
import { resolvePlan, formatDuration } from '@/data/plans';
import { TEMPLATES } from '@/data/templates';
import JobProgress, { PIPELINE_STAGES, type PipelineStageItem } from '@/components/jobs/JobProgress';
import type { Script } from '@/types/script';
import type { SavedVoice, PresetVoice } from '@/types/voice';

// ─── Types ────────────────────────────────────────────────────────────────────

type RenderMode = 'mode_1' | 'mode_2';
type Format = '16:9' | '9:16';
type SubtitleStyleOption = 'sans' | 'serif' | 'mono' | 'bold' | 'italic';
type SubtitlePlacement = 'top' | 'center' | 'bottom';

interface SubtitleSettingsState {
  enabled: boolean;
  font_color: string;
  font_style: SubtitleStyleOption;
  font_size: number;
  placement: SubtitlePlacement;
}

interface Scene {
  id: string;
  idx: number;
  scene_text?: string | null;
  motion_type?: string | null;
  image_prompt?: string | null;
  image_urls?: string[] | null;
  status: string;
}

interface Project {
  id: string;
  name?: string;
  status: string;
  render_mode?: string;
  format?: string;
  niche?: string | null;
  style?: string | null;
  reference_image_url?: string | null;
  duration_seconds?: number;
  subtitle_enabled?: boolean;
  subtitle_font?: string | null;
  subtitle_size?: number | null;
  subtitle_color?: string | null;
  subtitle_position?: string | null;
  final_video_url?: string | null;
  error_message?: string | null;
  processing_time_ms?: number | null;
  scenes?: Scene[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS = ['Script', 'Configure', 'Scenes', 'Generate'];

const RENDER_MODES: {
  value: RenderMode | 'mode_3'; label: string; tag: string; desc: string;
  bullets: string[]; disabled?: boolean;
}[] = [
  {
    value: 'mode_1', label: 'Cinematic Motion', tag: 'Fast & Cheap',
    desc: '1 image per scene with cinematic camera effects.',
    bullets: ['Zoom / Pan', 'Micro Motion', 'Parallax'],
  },
  {
    value: 'mode_2', label: 'Enhanced Motion', tag: 'Balanced',
    desc: '3 images per scene with smooth transitions.',
    bullets: ['Crossfade Transitions', 'Zoom / Pan per image', 'Progressive Prompts'],
  },
  {
    value: 'mode_3', label: 'Real Animation', tag: 'Coming Soon',
    desc: 'Real animated video with character movement.',
    bullets: ['Real Motion', 'Expressions', 'Premium Quality'], disabled: true,
  },
];

const FORMAT_OPTIONS: { value: Format; label: string; sub: string; w: number; h: number }[] = [
  { value: '16:9', label: '16:9', sub: 'YouTube',       w: 40, h: 24 },
  { value: '9:16', label: '9:16', sub: 'Shorts / Reels', w: 24, h: 40 },
];

const LENGTH_OPTIONS: { seconds: number; label: string }[] = [
  { seconds: 15, label: '15 sec' }, { seconds: 30, label: '30 sec' },
  { seconds: 45, label: '45 sec' }, { seconds: 60, label: '1 min' },
  { seconds: 90, label: '90 sec' }, { seconds: 120, label: '2 min' },
  { seconds: 300, label: '5 min' }, { seconds: 480, label: '8 min' },
  { seconds: 600, label: '10 min' }, { seconds: 900, label: '15 min' },
  { seconds: 1200, label: '20 min' }, { seconds: 1500, label: '25 min' },
  { seconds: 1800, label: '30 min' }, { seconds: 2100, label: '35 min' },
  { seconds: 2400, label: '40 min' },
];

const STYLE_OPTIONS = [
  { value: 'stickman', label: 'Stickman' },
  { value: 'cartoon', label: 'Cartoon' },
  { value: 'ghibli', label: 'Ghibli' },
  { value: 'family_guy', label: 'Family Guy Style' },
];

const GOAL_OPTIONS = [
  { value: 'engagement', label: 'Engagement' }, { value: 'sales', label: 'Sales' },
  { value: 'education', label: 'Education' }, { value: 'storytelling', label: 'Storytelling' },
];
const SCRIPT_STYLE_OPTIONS = [
  { value: 'storytelling', label: 'Storytelling' }, { value: 'educational', label: 'Educational' },
  { value: 'documentary', label: 'Documentary' }, { value: 'punchy', label: 'Punchy Hook' },
  { value: 'conversational', label: 'Conversational' },
];
const TONE_OPTIONS = [
  { value: 'friendly', label: 'Friendly' }, { value: 'professional', label: 'Professional' },
  { value: 'energetic', label: 'Energetic' }, { value: 'authoritative', label: 'Authoritative' },
  { value: 'casual', label: 'Casual' }, { value: 'inspiring', label: 'Inspiring' },
];

// Common subtitle/caption colors (YouTube, broadcast/EBU caption conventions).
const SUBTITLE_COLORS = [
  { label: 'White', value: '#FFFFFF' }, { label: 'Black', value: '#111111' },
  { label: 'Yellow', value: '#FBBF24' }, { label: 'Cyan', value: '#22D3EE' },
  { label: 'Green', value: '#22C55E' }, { label: 'Red', value: '#EF4444' },
  { label: 'Blue', value: '#3B82F6' }, { label: 'Orange', value: '#F97316' },
  { label: 'Magenta', value: '#EC4899' },
];
const SUBTITLE_STYLES: { value: SubtitleStyleOption; label: string }[] = [
  { value: 'bold', label: 'Bold' }, { value: 'sans', label: 'Sans' },
  { value: 'serif', label: 'Serif' }, { value: 'italic', label: 'Italic' }, { value: 'mono', label: 'Mono' },
];
const SUBTITLE_SIZES = [
  { value: 16, label: 'S' }, { value: 20, label: 'M' }, { value: 24, label: 'L' }, { value: 32, label: 'XL' },
];

// Mirrors ffmpeg_subs.py's font_style → FontName mapping so the preview matches the burned-in look.
const SUBTITLE_FONT_FAMILY: Record<SubtitleStyleOption, string> = {
  serif: 'Georgia, serif', mono: '"Courier New", monospace',
  sans: 'Arial, sans-serif', bold: 'Arial, sans-serif', italic: 'Arial, sans-serif',
};

const EVENT_STAGE_TO_IDX: Record<string, number> = {
  breakdown: 0, images: 1, voiceover: 2, render: 3, assembly: 4,
};
const STATUS_COMPLETE_COUNT: Record<string, number> = {
  scene_breakdown: 0, pending: 1, generating_images: 1, voiceover: 2,
  rendering_scenes: 3, assembling: 4, completed: 5,
};
const FAILED_STAGE_IDX: Record<string, number> = {
  failed_at_breakdown: 0, failed_at_images: 1, failed_at_voiceover: 2,
  failed_at_render: 3, failed_at_assembly: 4,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const creditCost = (seconds: number, mode: RenderMode) =>
  Math.ceil(seconds / 30) * (mode === 'mode_2' ? 2 : 1);

const estimateScriptSeconds = (text: string): number => {
  const words = (text || '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round((words / 130) * 60));
};

const fmtDuration = (ms: number): string => {
  const s = Math.round(ms / 1000);
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`;
};

const isTerminal = (s: string) =>
  s === 'completed' || s === 'cancelled' || s === 'timed_out' || s.startsWith('failed');

function stagesToDisplay(status: string, durations: Record<number, number>): PipelineStageItem[] {
  const stages = PIPELINE_STAGES.map((s) => ({ ...s }));
  if (status.startsWith('failed')) {
    const failedIdx = FAILED_STAGE_IDX[status] ?? 0;
    stages.forEach((s, i) => {
      s.status = i < failedIdx ? 'complete' : i === failedIdx ? 'failed' : 'pending';
      if (i < failedIdx && durations[i]) s.duration = fmtDuration(durations[i]);
    });
    return stages;
  }
  const complete = STATUS_COMPLETE_COUNT[status] ?? 0;
  const done = status === 'completed';
  stages.forEach((s, i) => {
    if (i < complete) { s.status = 'complete'; if (durations[i]) s.duration = fmtDuration(durations[i]); }
    else if (i === complete && !done) s.status = 'active';
    else s.status = 'pending';
  });
  return stages;
}

// Light-theme portal select
function CustomSelect({ value, onChange, options, placeholder = 'Select…', disabled = false }: {
  value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; placeholder?: string; disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<{ left: number; width: number; top?: number; bottom?: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  const toggle = () => {
    if (disabled) return;
    if (!open && buttonRef.current) {
      const r = buttonRef.current.getBoundingClientRect();
      // Flip up when there isn't enough room below (dropdown max-height 220px).
      const estH = Math.min(options.length * 44 + 8, 220);
      const spaceBelow = window.innerHeight - r.bottom;
      const openUp = spaceBelow < estH + 8 && r.top > spaceBelow;
      setRect({
        left: r.left, width: r.width,
        top: openUp ? undefined : r.bottom + 4,
        bottom: openUp ? window.innerHeight - r.top + 4 : undefined,
      });
    }
    setOpen((o) => !o);
  };

  useEffect(() => {
    if (!open) return;
    const close = (e: Event) => {
      const t = e.target as Node;
      if (buttonRef.current?.contains(t) || dropdownRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', close);
    window.addEventListener('scroll', close, true);
    return () => { document.removeEventListener('mousedown', close); window.removeEventListener('scroll', close, true); };
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={buttonRef} type="button" onClick={toggle} disabled={disabled}
        className={cn(
          'w-full flex items-center justify-between pl-3 pr-2.5 py-2.5 rounded-xl border text-sm transition-colors text-left bg-white',
          disabled ? 'opacity-60 cursor-not-allowed border-border-strong' : open ? 'border-primary' : 'border-border-strong hover:border-primary/40'
        )}
      >
        <span className={selected ? 'text-text' : 'text-text-muted'}>{selected?.label ?? placeholder}</span>
        <ChevronRight className={cn('w-3.5 h-3.5 text-text-muted shrink-0 transition-transform', open ? '-rotate-90' : 'rotate-90')} />
      </button>
      {open && rect && createPortal(
        <motion.div
          initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.12 }}
          ref={dropdownRef}
          style={{ position: 'fixed', top: rect.top, bottom: rect.bottom, left: rect.left, width: rect.width, zIndex: 9999 }}
          className="bg-white border border-border rounded-xl overflow-y-auto shadow-panel max-h-[220px]"
        >
          {options.map((opt) => (
            <button
              key={opt.value} type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2.5 text-sm transition-colors',
                value === opt.value ? 'bg-primary-50 text-primary font-medium' : 'text-text-secondary hover:bg-surface-muted'
              )}
            >
              <Check className={cn('w-3.5 h-3.5 shrink-0', value === opt.value ? 'text-primary' : 'opacity-0')} />
              {opt.label}
            </button>
          ))}
        </motion.div>,
        document.body,
      )}
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

function CreateWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const confirm = useConfirm();
  const toast = useToast();
  const { profile } = useAuth();

  // The signed-in plan caps how long a video can be (quota model). AI target
  // lengths and the duration shown are limited to this.
  const plan = resolvePlan(profile?.user_type, profile?.plan_tier);
  const planCap = plan.maxSeconds;
  const lengthOptions = LENGTH_OPTIONS.filter((o) => o.seconds <= planCap);

  const uploadReference = async (file: File) => {
    setRefUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await authedFetch('/api/uploads/reference', { method: 'POST', body: fd });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.url) setReferenceImageUrl(data.url);
      else toast(data?.detail ?? 'Could not upload reference image');
    } catch { toast('Could not upload reference image'); }
    finally { setRefUploading(false); }
  };

  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  // When opening an existing project (?project=), hold the UI on a loader until the
  // project is fetched so we jump straight to the right step (no flash of step 1).
  const [loadingProject, setLoadingProject] = useState(() => Boolean(searchParams.get('project')));

  // Step 1 — Script
  const [scriptMode, setScriptMode] = useState<'ai' | 'custom'>('ai');
  const [savedScripts, setSavedScripts] = useState<Script[]>([]);
  const [scriptId, setScriptId] = useState<string | null>(null);
  const [aiTitle, setAiTitle] = useState('');
  const [aiProduct, setAiProduct] = useState('');
  const [aiAudience, setAiAudience] = useState('');
  const [aiGoal, setAiGoal] = useState('engagement');
  const [aiStyle, setAiStyle] = useState('storytelling');
  const [aiTone, setAiTone] = useState('friendly');
  const [aiSeconds, setAiSeconds] = useState(30);
  const [referenceImageUrl, setReferenceImageUrl] = useState<string | null>(null);
  const [refUploading, setRefUploading] = useState(false);
  const [customScript, setCustomScript] = useState('');
  const [generated, setGenerated] = useState('');
  const [genLoading, setGenLoading] = useState(false);

  // Step 2 — Scenes / project
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState('');
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [previewScene, setPreviewScene] = useState<Scene | null>(null);
  const [breakdownStatus, setBreakdownStatus] = useState<'idle' | 'running' | 'ready' | 'failed'>('idle');
  const breakdownKeyRef = useRef<string>('');

  // Step 3 — Configure
  const [renderMode, setRenderMode] = useState<RenderMode>('mode_1');
  const [format, setFormat] = useState<Format>('9:16');
  const [durationSeconds, setDurationSeconds] = useState(60);
  const [style, setStyle] = useState(() => {
    const s = searchParams.get('style');
    return STYLE_OPTIONS.some((o) => o.value === s) ? s! : 'cartoon';
  });
  const [niche, setNiche] = useState('');
  const [niches, setNiches] = useState<string[]>([]);
  const [presetVoices, setPresetVoices] = useState<PresetVoice[]>([]);
  const [savedVoices, setSavedVoices] = useState<SavedVoice[]>([]);
  const [voiceTab, setVoiceTab] = useState<'preset' | 'custom'>('preset');
  const [selectedPreset, setSelectedPreset] = useState<PresetVoice | null>(null);
  const [selectedSavedId, setSelectedSavedId] = useState('');
  const [customVoiceId, setCustomVoiceId] = useState('');
  const [customProvider, setCustomProvider] = useState<'elevenlabs' | 'minimax'>('elevenlabs');
  const [subtitle, setSubtitle] = useState<SubtitleSettingsState>({
    enabled: true, font_color: '#FFFFFF', font_style: 'bold', font_size: 24, placement: 'bottom',
  });

  // Step 4 — Generate
  const [projectStatus, setProjectStatus] = useState('');
  const [finalUrl, setFinalUrl] = useState<string | null>(null);
  const [durations, setDurations] = useState<Record<number, number>>({});
  const [processingTime, setProcessingTime] = useState('');
  const cleanupRef = useRef<(() => void) | null>(null);
  const durationsRef = useRef<Record<number, number>>({});

  // ── Data fetch ──
  useEffect(() => {
    authedJson<Script[]>('/api/scripts').then(setSavedScripts).catch(() => {});
    authedJson<string[]>('/api/projects/options/niches').then((n) => { setNiches(n); if (n[0] && !searchParams.get('template')) setNiche(n[0]); }).catch(() => {});
    authedJson<PresetVoice[]>('/api/voices/preset').then(setPresetVoices).catch(() => {});
    authedJson<SavedVoice[]>('/api/voices').then(setSavedVoices).catch(() => {});
  }, []);

  // Apply a starter template from ?template=
  useEffect(() => {
    const t = TEMPLATES.find((x) => x.id === searchParams.get('template'));
    if (!t) return;
    setRenderMode(t.config.render_mode);
    setFormat(t.config.format);
    setStyle(t.config.style);
    setNiche(t.config.niche);
    setSubtitle(t.config.subtitle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Open an existing project from ?project= — route to the right step by status
  // (completed → result, in-progress → live progress, scenes_ready → Scenes, draft → start).
  useEffect(() => {
    const pid = searchParams.get('project');
    if (!pid) return () => cleanupRef.current?.();
    setProjectId(pid);
    authedJson<Project>(`/api/projects/${pid}`).then((p) => {
      setProjectName(p.name ?? 'Project');
      setScenes(p.scenes ?? []);
      // hydrate configuration so Configure/summary reflect the real project
      if (p.render_mode === 'mode_1' || p.render_mode === 'mode_2') setRenderMode(p.render_mode);
      if (p.format === '16:9' || p.format === '9:16') setFormat(p.format);
      if (p.duration_seconds) setDurationSeconds(p.duration_seconds);
      if (p.niche) setNiche(p.niche);
      if (p.style) setStyle(p.style);
      if (p.reference_image_url) setReferenceImageUrl(p.reference_image_url);
      if (p.subtitle_font) setSubtitle({
        enabled: p.subtitle_enabled ?? true,
        font_color: p.subtitle_color ?? '#FFFFFF',
        font_style: (p.subtitle_font as SubtitleStyleOption) ?? 'bold',
        font_size: p.subtitle_size ?? 24,
        placement: (p.subtitle_position as SubtitlePlacement) ?? 'bottom',
      });
      breakdownKeyRef.current = `${p.render_mode}:${p.format}:${p.style ?? ''}:${p.niche ?? ''}:${p.duration_seconds}:${p.reference_image_url ?? ''}`;

      if (p.status === 'scenes_ready') {
        setBreakdownStatus('ready'); setStep(2); // Scenes step
      } else if (p.status === 'draft') {
        setStep(1); // Configure step
      } else {
        // pending / generating_images / voiceover / rendering_scenes / assembling / completed / failed / timed_out
        setProjectStatus(p.status);
        if (p.final_video_url) setFinalUrl(p.final_video_url);
        if (p.processing_time_ms) setProcessingTime(fmtDuration(p.processing_time_ms));
        setStep(3);
        if (!isTerminal(p.status)) trackProject(pid); else loadDurations(pid);
      }
    }).catch(() => {}).finally(() => setLoadingProject(false));
    return () => cleanupRef.current?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scriptSeconds = scriptMode === 'custom'
    ? estimateScriptSeconds(customScript)
    : estimateScriptSeconds(generated);

  // ── Step 1 handlers ──
  const handleAiGenerate = async () => {
    if (!aiTitle.trim()) return;
    setGenLoading(true); setGenerated(''); setError('');
    try {
      const data = await authedJson<{ content: string; estimated_duration_seconds: number }>(
        '/api/scripts/generate',
        { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: aiTitle.trim(), product_name: aiProduct.trim() || aiTitle.trim(),
            target_audience: aiAudience.trim() || 'general audience', tone: aiTone,
            goal: aiGoal, style: aiStyle, niche, target_duration_seconds: aiSeconds,
          }) },
      );
      setGenerated(data.content);
      setScriptId(null); // regenerated → must re-save
    } catch (e) { setError((e as Error).message); } finally { setGenLoading(false); }
  };

  const saveScript = async (durationOverride?: number): Promise<string | null> => {
    if (scriptId) return scriptId;
    const content = scriptMode === 'custom' ? customScript.trim() : generated.trim();
    if (!content) { setError('Please provide a script first.'); return null; }
    try {
      const s = await authedJson<Script>('/api/scripts', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: aiTitle.trim() || 'Untitled Script', content, mode: scriptMode,
          product_name: aiProduct.trim() || null, tone: aiTone,
          target_audience: aiAudience.trim() || null, goal: aiGoal, style: aiStyle,
          niche: niche || null, duration_seconds: durationOverride ?? durationSeconds,
        }),
      });
      setScriptId(s.id);
      return s.id;
    } catch (e) { setError((e as Error).message); return null; }
  };

  // ── Step 2: create project (if needed) + breakdown ──
  const runBreakdown = useCallback(async (pid: string) => {
    setBreakdownStatus('running'); setScenes([]);
    breakdownKeyRef.current = `${renderMode}:${format}:${style}:${niche}:${durationSeconds}`;
    try {
      await authedFetch(`/api/projects/${pid}/breakdown`, { method: 'POST' });
    } catch (e) { setBreakdownStatus('failed'); setError((e as Error).message); return; }

    const started = Date.now();
    const poll = async () => {
      try {
        const p = await authedJson<Project>(`/api/projects/${pid}`);
        if (p.status === 'scenes_ready') { setScenes(p.scenes ?? []); setBreakdownStatus('ready'); return; }
        if (p.status.startsWith('failed')) { setBreakdownStatus('failed'); setError(p.error_message ?? 'Scene breakdown failed.'); return; }
      } catch { /* keep polling */ }
      if (Date.now() - started < 120_000) setTimeout(poll, 2500);
      else { setBreakdownStatus('failed'); setError('Scene breakdown timed out.'); }
    };
    setTimeout(poll, 2000);
  }, [renderMode, format, style, niche, durationSeconds]);

  // Step 1 (Script → Configure): save script + set the video length.
  // AI mode: the user's chosen Target length is the source of truth for the video
  // (scene count / credits / render all key off it). Custom scripts have no target,
  // so their length is derived from the pasted text (snapped to a length option).
  const handleScriptNext = async () => {
    setError(''); setBusy(true);
    try {
      const nextDuration = scriptMode === 'ai'
        ? Math.min(aiSeconds, planCap)
        : LENGTH_OPTIONS.reduce((best, o) =>
            Math.abs(o.seconds - scriptSeconds) < Math.abs(best.seconds - scriptSeconds) ? o : best,
            LENGTH_OPTIONS[1]).seconds;
      const sid = await saveScript(nextDuration);
      if (!sid) return;
      setDurationSeconds(nextDuration);
      setStep(1);
    } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  };

  // Step 2 (Configure → Scenes): persist the config, then break the script into
  // scenes USING that config (niche/style/format/mode all shape the prompts).
  const handleConfigureNext = async () => {
    setError(''); setBusy(true);
    try {
      const sid = scriptId ?? await saveScript();
      if (!sid) { setStep(0); return; }
      const body = {
        name: aiTitle.trim() || 'Untitled Project', script_id: sid,
        render_mode: renderMode, format, niche, style,
        duration_seconds: durationSeconds, subtitle_settings: subtitle,
        reference_image_url: referenceImageUrl,
      };
      let pid = projectId;
      if (!pid) {
        const p = await authedJson<Project>('/api/projects', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        });
        pid = p.id; setProjectId(pid); setProjectName(body.name);
      } else {
        await authedFetch(`/api/projects/${pid}`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        });
      }
      setStep(2);
      // Re-run breakdown if not done or the config changed since the last one.
      const key = `${renderMode}:${format}:${style}:${niche}:${durationSeconds}:${referenceImageUrl ?? ''}`;
      if (breakdownStatus !== 'ready' || breakdownKeyRef.current !== key) runBreakdown(pid);
    } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  };

  // Poll the project until every scene has an image (scene previews / regenerate).
  const pollSceneImages = (pid: string) => {
    let tries = 0;
    const tick = async () => {
      try {
        const p = await authedJson<Project>(`/api/projects/${pid}`);
        if (p.scenes) setScenes(p.scenes.slice().sort((a, b) => a.idx - b.idx));
        const pending = (p.scenes ?? []).some((s) => !(s.image_urls && s.image_urls.length));
        if (pending && tries++ < 45) setTimeout(tick, 4000);
      } catch { if (tries++ < 45) setTimeout(tick, 4000); }
    };
    setTimeout(tick, 3000);
  };

  const regenerateSceneImage = async (sceneId: string) => {
    setScenes((prev) => prev.map((s) => s.id === sceneId ? { ...s, status: 'pending' } : s));
    try { await authedFetch(`/api/scenes/${sceneId}/regenerate-image`, { method: 'POST' }); } catch { /* ignore */ }
    if (projectId) pollSceneImages(projectId);
  };

  // Generate a preview image for every scene that doesn't have one yet. Images are
  // reused by the final render (backend skips scenes that already have images).
  const generatePreviews = async () => {
    if (!projectId) return;
    const targets = scenes.filter((s) => !(s.image_urls && s.image_urls.length));
    if (targets.length === 0) return;
    setScenes((prev) => prev.map((s) => targets.some((t) => t.id === s.id) ? { ...s, status: 'pending' } : s));
    await Promise.all(targets.map((s) =>
      authedFetch(`/api/scenes/${s.id}/regenerate-image`, { method: 'POST' }).catch(() => {})));
    pollSceneImages(projectId);
  };

  // ── Step 3 → PATCH config, resolve voice ──
  const resolveVoiceConfigId = async (): Promise<string | null> => {
    if (voiceTab === 'preset') {
      if (selectedSavedId) return selectedSavedId;
      if (!selectedPreset) return null;
      const existing = savedVoices.find((v) => v.voice_id === selectedPreset.id);
      if (existing) return existing.id;
      const v = await authedJson<SavedVoice>('/api/voices', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: selectedPreset.name, provider: selectedPreset.provider ?? 'elevenlabs',
          voice_id: selectedPreset.id, is_custom: false, validated: true,
        }),
      });
      setSavedVoices((prev) => [v, ...prev]);
      return v.id;
    }
    // custom
    if (!customVoiceId.trim()) { setError('Enter a custom voice ID.'); return null; }
    const val = await authedJson<{ valid: boolean; name: string | null }>('/api/voices/validate', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voice_id: customVoiceId.trim(), provider: customProvider }),
    });
    if (!val.valid) { setError('That voice ID is not valid.'); return null; }
    const v = await authedJson<SavedVoice>('/api/voices', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: val.name ?? `Custom (${customProvider})`, provider: customProvider,
        voice_id: customVoiceId.trim(), is_custom: true, validated: true,
      }),
    });
    setSavedVoices((prev) => [v, ...prev]);
    return v.id;
  };

  // ── Step 4: generate + track ──
  // Backfill per-stage durations from job_events (covers fast stages the realtime
  // subscription missed, and resuming a finished project) so times never disappear.
  const loadDurations = useCallback((pid: string) => {
    supabase.from('job_events').select('stage, status, duration_ms').eq('project_id', pid).then(({ data }) => {
      for (const ev of (data ?? []) as { stage: string; status: string; duration_ms: number }[]) {
        const idx = EVENT_STAGE_TO_IDX[ev.stage];
        if (idx != null && (ev.status === 'completed' || ev.status === 'failed') && ev.duration_ms != null) {
          durationsRef.current[idx] = ev.duration_ms;
        }
      }
      setDurations({ ...durationsRef.current });
    });
  }, []);

  const trackProject = useCallback((pid: string) => {
    cleanupRef.current?.();
    const durRef = durationsRef.current;

    const applyStatus = (p: Partial<Project>) => {
      if (p.status) setProjectStatus(p.status);
      if (p.final_video_url) setFinalUrl(p.final_video_url);
      if (p.error_message) setError(p.error_message);
      if (p.processing_time_ms) setProcessingTime(fmtDuration(p.processing_time_ms));
    };

    authedJson<Project & { job_events?: { stage: string; status: string; duration_ms: number }[] }>(`/api/projects/${pid}`)
      .then((p) => { applyStatus(p); }).catch(() => {});

    const channel = supabase
      .channel(`project:${pid}`)
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'projects', filter: `id=eq.${pid}` },
        (payload) => applyStatus(payload.new as Partial<Project>))
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'job_events', filter: `project_id=eq.${pid}` },
        (payload) => {
          const ev = payload.new as { stage: string; status: string; duration_ms: number };
          const idx = EVENT_STAGE_TO_IDX[ev.stage];
          if (idx != null && (ev.status === 'completed' || ev.status === 'failed') && ev.duration_ms != null) {
            durRef[idx] = ev.duration_ms; setDurations({ ...durRef });
          }
        })
      .subscribe();

    loadDurations(pid);

    const timer = setInterval(async () => {
      try {
        const p = await authedJson<Project>(`/api/projects/${pid}`);
        applyStatus(p);
        if (isTerminal(p.status)) { clearInterval(timer); }
      } catch { /* keep polling */ }
    }, 5000);

    cleanupRef.current = () => { clearInterval(timer); supabase.removeChannel(channel); };
  }, []);

  const handleGenerate = async () => {
    if (!projectId) return;
    setError(''); setBusy(true);
    try {
      const voiceConfigId = await resolveVoiceConfigId();
      if (!voiceConfigId) return;

      await authedFetch(`/api/projects/${projectId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          render_mode: renderMode, format, niche, style,
          reference_image_url: referenceImageUrl,
          duration_seconds: durationSeconds, voice_config_id: voiceConfigId,
          subtitle_settings: subtitle,
        }),
      });

      const res = await authedFetch(`/api/projects/${projectId}/generate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id: crypto.randomUUID() }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d?.detail ?? 'Failed to start generation.'); return;
      }
      setProjectStatus('pending'); durationsRef.current = {}; setDurations({}); setFinalUrl(null);
      setStep(3); trackProject(projectId);
      router.replace(`/create?project=${projectId}`);
    } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  };

  const handleCancel = async () => {
    if (!projectId) return;
    const ok = await confirm({
      title: 'Cancel render?',
      message: 'This stops the video generation. Credits are refunded if no billable work has run yet.',
      confirmLabel: 'Cancel render', cancelLabel: 'Keep rendering', variant: 'danger',
    });
    if (!ok) return;
    try { await authedFetch(`/api/projects/${projectId}/cancel`, { method: 'POST' }); toast('Render cancelled'); }
    catch { /* ignore */ }
  };

  // ── Derived ──
  const scriptReady = scriptMode === 'custom' ? customScript.trim().length > 0 : generated.trim().length > 0;
  const voiceReady = voiceTab === 'preset' ? (!!selectedPreset || !!selectedSavedId) : customVoiceId.trim().length > 0;
  const credits = creditCost(durationSeconds, renderMode);
  const pipelineStages = stagesToDisplay(projectStatus, durations);
  const isGenerating = step === 3 && projectStatus !== '' && !isTerminal(projectStatus);
  const isDone = projectStatus === 'completed';
  // Once generation has started (status set), lock the stepper — you can't go back
  // to edit Script/Scenes/Configure of a rendering or finished project.
  const navLocked = projectStatus !== '';
  const activeStage = pipelineStages.find((s) => s.status === 'active');
  const activeStageLabel = activeStage?.name ?? 'Starting…';
  const renderPercent = isDone ? 100 : Math.min(99, Math.round(
    ((pipelineStages.filter((s) => s.status === 'complete').length + (activeStage ? 0.5 : 0)) / pipelineStages.length) * 100));
  // Total = sum of per-stage durations (not the assembly-only processing_time_ms).
  const totalMs = Object.values(durations).reduce((a, b) => a + b, 0);

  // ─────────────────────────────────────────────────────────────────────────

  if (loadingProject) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header / stepper */}
      <div className="px-6 py-4 border-b border-border bg-surface/60 flex items-center gap-6">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-semibold text-text truncate max-w-[220px]">{projectName || 'New Project'}</span>
        </div>
        <div className="flex items-center gap-1 mx-auto">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center">
              <button
                disabled={i > step || navLocked}
                onClick={() => { if (!navLocked && i < step) setStep(i); }}
                className={cn('flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors',
                  i === step ? 'text-primary font-semibold'
                    : i < step ? (navLocked ? 'text-text-secondary' : 'text-text-secondary hover:text-text')
                    : 'text-text-muted')}
              >
                <span className={cn('w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                  i === step ? 'bg-primary text-white' : i < step ? 'bg-primary-100 text-primary' : 'bg-surface-muted text-text-muted')}>
                  {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
                </span>
                {label}
              </button>
              {i < STEPS.length - 1 && <ChevronRight className="w-4 h-4 text-border-strong mx-1" />}
            </div>
          ))}
        </div>
        <Link href="/projects" className="text-sm text-text-muted hover:text-text">Exit</Link>
      </div>

      {error && (
        <div className="mx-6 mt-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-error/8 border border-error/20 text-error text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {/* Body */}
      {step === 3 ? (
        <div className="flex-1 min-h-0 flex">
          {/* Left rail — flush to the nav sidebar, full height */}
          <aside className="w-[340px] shrink-0 border-r border-border bg-surface overflow-y-auto p-5 flex flex-col">
            <div className="flex items-center gap-2 mb-5">
              {isDone ? <Check className="w-5 h-5 text-success" />
                : isGenerating ? <Loader2 className="w-5 h-5 text-primary animate-spin" />
                : isTerminal(projectStatus) ? <AlertTriangle className="w-5 h-5 text-error" />
                : <Rocket className="w-5 h-5 text-primary" />}
              <span className="text-sm font-semibold text-text">
                {isDone ? 'Your video is ready' : isGenerating ? 'Generating…' : isTerminal(projectStatus) ? 'Generation stopped' : 'Ready to generate'}
              </span>
              {isDone && totalMs > 0 && <span className="ml-auto text-xs text-text-muted flex items-center gap-1"><Clock className="w-3 h-3" /> {fmtDuration(totalMs)}</span>}
            </div>

            {(isGenerating || isDone || isTerminal(projectStatus)) ? (
              <JobProgress stages={pipelineStages} />
            ) : (
              <div className="space-y-2.5">
                <SummaryRow label="Scenes" value={`${scenes.length}`} />
                <SummaryRow label="Rendering mode" value={RENDER_MODES.find((m) => m.value === renderMode)?.label ?? ''} />
                <SummaryRow label="Format" value={format} />
                <SummaryRow label="Length" value={LENGTH_OPTIONS.find((o) => o.seconds === durationSeconds)?.label ?? `${durationSeconds}s`} />
                <SummaryRow label="Niche" value={niche || '—'} />
                <SummaryRow label="Subtitles" value={subtitle.enabled ? 'On' : 'Off'} />
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="text-sm text-text-muted flex items-center gap-1.5"><Zap className="w-4 h-4 text-primary" /> Estimated cost</span>
                  <span className="text-sm font-semibold text-text">{credits} credits</span>
                </div>
              </div>
            )}

            <div className="mt-auto pt-6">
              {isGenerating && (
                <button onClick={handleCancel} className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-error"><X className="w-3.5 h-3.5" /> Cancel render</button>
              )}
              {isDone && finalUrl && (
                <div className="flex flex-col gap-2">
                  <a href={finalUrl} download className="btn-cta inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white"><Download className="w-4 h-4" /> Download</a>
                  <Link href="/projects" className="btn-secondary inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm">Back to projects</Link>
                </div>
              )}
            </div>
          </aside>

          {/* Preview stage — fills remaining space */}
          <div className="flex-1 min-h-0 bg-surface-muted flex items-center justify-center p-6 overflow-auto">
            <Preview
              format={format}
              finalUrl={isDone ? finalUrl : null}
              percent={renderPercent}
              activeLabel={activeStageLabel}
              isGenerating={isGenerating}
              failed={isTerminal(projectStatus) && !isDone}
            />
          </div>
        </div>
      ) : (
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>

              {/* STEP 1 — SCRIPT */}
              {step === 0 && (
                <div className="space-y-6">
                  <StepHeader icon={<FileText className="w-5 h-5" />} title="Start with a script"
                    desc="Write your script with AI, paste your own, or pick a saved one." />

                  <div className="inline-flex rounded-xl bg-surface-muted p-1">
                    {(['ai', 'custom'] as const).map((m) => (
                      <button key={m} onClick={() => { setScriptMode(m); setScriptId(null); }}
                        className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                          scriptMode === m ? 'bg-white text-primary shadow-card' : 'text-text-muted hover:text-text')}>
                        {m === 'ai' ? 'Generate with AI' : 'Paste custom'}
                      </button>
                    ))}
                  </div>

                  {scriptMode === 'ai' ? (
                    <div className="glass rounded-2xl p-6 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Niche"><CustomSelect value={niche} onChange={setNiche} options={niches.map((n) => ({ value: n, label: n }))} /></Field>
                        <Field label="Title / concept"><input className={inputClass} value={aiTitle} onChange={(e) => setAiTitle(e.target.value)} placeholder="e.g. Discipline beats motivation" /></Field>
                        <Field label="Product / topic"><input className={inputClass} value={aiProduct} onChange={(e) => setAiProduct(e.target.value)} placeholder="optional" /></Field>
                        <Field label="Audience"><input className={inputClass} value={aiAudience} onChange={(e) => setAiAudience(e.target.value)} placeholder="e.g. young creators" /></Field>
                        <Field label={`Target length · ${plan.name} allows up to ${formatDuration(planCap)}`}><CustomSelect value={String(Math.min(aiSeconds, planCap))} onChange={(v) => setAiSeconds(Number(v))} options={lengthOptions.map((o) => ({ value: String(o.seconds), label: o.label }))} /></Field>
                        <Field label="Goal"><CustomSelect value={aiGoal} onChange={setAiGoal} options={GOAL_OPTIONS} /></Field>
                        <Field label="Style"><CustomSelect value={aiStyle} onChange={setAiStyle} options={SCRIPT_STYLE_OPTIONS} /></Field>
                        <Field label="Tone"><CustomSelect value={aiTone} onChange={setAiTone} options={TONE_OPTIONS} /></Field>
                      </div>
                      <button onClick={handleAiGenerate} disabled={!aiTitle.trim() || genLoading}
                        className="btn-cta inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white disabled:opacity-50">
                        {genLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        {genLoading ? 'Generating…' : 'Generate script'}
                      </button>
                      {generated && (
                        <div>
                          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Generated script</label>
                          <div className="mt-2 rounded-xl border border-border bg-surface-muted p-4 text-sm text-text leading-relaxed whitespace-pre-wrap max-h-72 overflow-y-auto">{generated}</div>
                          <p className="text-xs text-text-muted mt-1">~{estimateScriptSeconds(generated)}s spoken · target {formatDuration(Math.min(aiSeconds, planCap))} · this is the final AI script — to change it, adjust the fields and Generate again</p>
                          {Math.abs(estimateScriptSeconds(generated) - Math.min(aiSeconds, planCap)) / Math.min(aiSeconds, planCap) > 0.25 && (
                            <div className="mt-2 flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800">
                              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                              <span>
                                The script reads at ~{estimateScriptSeconds(generated)}s but your target is {formatDuration(Math.min(aiSeconds, planCap))}. The video uses your target length, so {estimateScriptSeconds(generated) < Math.min(aiSeconds, planCap) ? 'scenes may feel stretched — Generate again to fill the full duration.' : 'the narration may feel rushed — Generate again or pick a longer target.'}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="glass rounded-2xl p-6 space-y-3">
                      <Field label="Your script">
                        {scriptId ? (
                          <div className="rounded-xl border border-border bg-surface-muted p-4 text-sm text-text leading-relaxed whitespace-pre-wrap min-h-[200px] max-h-72 overflow-y-auto">{customScript}</div>
                        ) : (
                          <textarea className={cn(inputClass, 'min-h-[200px] resize-y')} value={customScript} onChange={(e) => setCustomScript(e.target.value)} placeholder="Paste your script here…" />
                        )}
                      </Field>
                      <p className="text-xs text-text-muted">~{estimateScriptSeconds(customScript)}s spoken · custom scripts are locked once saved and used exactly as written</p>
                    </div>
                  )}

                  {savedScripts.length > 0 && (
                    <div>
                      <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Or reuse a saved script</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                        {savedScripts.slice(0, 6).map((s) => (
                          <button key={s.id} onClick={() => {
                            setScriptId(s.id); setScriptMode(s.generation_mode);
                            if (s.generation_mode === 'custom') setCustomScript(s.content); else setGenerated(s.content);
                            setAiTitle(s.title); setAiProduct(s.product_name ?? ''); setAiAudience(s.target_audience ?? '');
                            if (s.goal) setAiGoal(s.goal); if (s.style) setAiStyle(s.style); if (s.tone) setAiTone(s.tone);
                            if (s.niche) setNiche(s.niche);
                            if (s.duration_seconds) setDurationSeconds(s.duration_seconds);
                          }}
                            className={cn('text-left p-4 rounded-xl border transition-colors', scriptId === s.id ? 'border-primary bg-primary-50' : 'border-border bg-white hover:border-primary/40')}>
                            <p className="text-sm font-medium text-text truncate">{s.title}</p>
                            <p className="text-xs text-text-muted line-clamp-2 mt-1">{s.content}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3 — SCENES */}
              {step === 2 && (
                <div className="space-y-6">
                  <StepHeader icon={<Film className="w-5 h-5" />} title="Review your scenes"
                    desc="We split your script into ~10-second scenes. Generate previews to see each image, then regenerate any that don't fit — previews are reused in the final render." />

                  {breakdownStatus === 'idle' && (
                    <div className="glass rounded-2xl p-10 flex flex-col items-center gap-3 text-center">
                      <Film className="w-8 h-8 text-primary/40" />
                      <p className="text-sm text-text">This project has no scenes yet.</p>
                      <button onClick={() => projectId && runBreakdown(projectId)}
                        className="btn-cta inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white">
                        <Sparkles className="w-4 h-4" /> Generate scenes
                      </button>
                    </div>
                  )}

                  {breakdownStatus === 'running' && (
                    <div className="glass rounded-2xl p-10 flex flex-col items-center gap-3 text-center">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                      <p className="text-sm font-medium text-text">Breaking your script into scenes…</p>
                      <p className="text-xs text-text-muted">This usually takes a few seconds.</p>
                    </div>
                  )}

                  {breakdownStatus === 'failed' && (
                    <div className="glass rounded-2xl p-8 text-center space-y-3">
                      <AlertTriangle className="w-8 h-8 text-error mx-auto" />
                      <p className="text-sm text-text">Scene breakdown failed.</p>
                      <button onClick={() => projectId && runBreakdown(projectId)} className="btn-secondary inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium">
                        <RefreshCw className="w-4 h-4" /> Retry
                      </button>
                    </div>
                  )}

                  {breakdownStatus === 'ready' && (
                    <>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-text-muted">{scenes.length} scene{scenes.length !== 1 ? 's' : ''}</p>
                        <div className="flex items-center gap-2">
                          {scenes.some((s) => !(s.image_urls && s.image_urls.length)) && (
                            <button onClick={generatePreviews} className="btn-cta inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold text-white">
                              <Sparkles className="w-3.5 h-3.5" /> Generate previews
                            </button>
                          )}
                          <button onClick={() => projectId && runBreakdown(projectId)} className="btn-secondary inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium">
                            <RefreshCw className="w-3.5 h-3.5" /> Re-generate scenes
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {scenes.map((s) => (
                          <div key={s.id} className="glass rounded-xl overflow-hidden flex flex-col">
                            <div className="relative w-full aspect-video bg-primary-50 overflow-hidden flex items-center justify-center">
                              {s.image_urls?.[0] ? (
                                <img src={s.image_urls[0]} alt="" onClick={() => setPreviewScene(s)}
                                  className="absolute inset-0 w-full h-full object-cover cursor-zoom-in transition-transform duration-300 hover:scale-105" />
                              ) : s.status === 'pending' ? (
                                <div className="flex flex-col items-center gap-1.5 text-primary"><Loader2 className="w-6 h-6 animate-spin" /><span className="text-[10px] text-text-muted">generating…</span></div>
                              ) : (
                                <ImageIcon className="w-7 h-7 text-primary/40" />
                              )}
                              <button onClick={() => regenerateSceneImage(s.id)} title="Regenerate image"
                                className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-white/90 backdrop-blur flex items-center justify-center text-text-muted hover:text-primary shadow-card">
                                <RefreshCw className="w-3.5 h-3.5" />
                              </button>
                              {s.motion_type && <span className="absolute bottom-2 left-2 text-[10px] px-1.5 py-0.5 rounded-full bg-[#1C1530]/70 text-white backdrop-blur">{s.motion_type}</span>}
                            </div>
                            <div className="p-3">
                              <span className="text-xs font-semibold text-text-secondary">Scene {s.idx + 1}</span>
                              <p className="text-xs text-text mt-1 line-clamp-2 min-h-[2rem]">{s.scene_text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* STEP 2 — CONFIGURE */}
              {step === 1 && (
                <div className="space-y-6">
                  <StepHeader icon={<Settings2 className="w-5 h-5" />} title="Configure your video"
                    desc="Choose your rendering mode and settings, then let AI bring your story to life." />

                  <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6 items-start">
                  <div className="space-y-6 min-w-0">

                  {/* Rendering mode */}
                  <div>
                    <SectionLabel icon={<Camera className="w-4 h-4" />} text="Visual Rendering Mode" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                      {RENDER_MODES.map((m) => {
                        const active = m.value === renderMode;
                        return (
                          <button key={m.value} disabled={m.disabled}
                            onClick={() => !m.disabled && setRenderMode(m.value as RenderMode)}
                            className={cn('text-left p-4 rounded-2xl border transition-all',
                              m.disabled ? 'opacity-55 cursor-not-allowed border-border bg-white'
                                : active ? 'border-primary bg-primary-50 shadow-card' : 'border-border bg-white hover:border-primary/40')}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center text-primary"><Clapperboard className="w-4 h-4" /></div>
                              <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', active ? 'bg-primary text-white' : 'bg-surface-muted text-text-muted')}>{m.tag}</span>
                            </div>
                            <p className="text-sm font-semibold text-text">{m.label}</p>
                            <p className="text-xs text-text-muted mt-0.5 leading-relaxed">{m.desc}</p>
                            <ul className="mt-3 space-y-1">
                              {m.bullets.map((b) => (
                                <li key={b} className="flex items-center gap-1.5 text-xs text-text-secondary"><Check className={cn('w-3.5 h-3.5', active ? 'text-primary' : 'text-success')} /> {b}</li>
                              ))}
                            </ul>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                    {/* Video settings */}
                    <div className="glass rounded-2xl p-5 space-y-4">
                      <SectionLabel icon={<Settings2 className="w-4 h-4" />} text="Video Settings" />
                      <div>
                        <label className="text-xs font-semibold text-text-secondary">Aspect Ratio</label>
                        <div className="flex gap-3 mt-2">
                          {FORMAT_OPTIONS.map((f) => (
                            <button key={f.value} onClick={() => setFormat(f.value)}
                              className={cn('flex-1 flex items-center gap-2 p-3 rounded-xl border transition-colors', format === f.value ? 'border-primary bg-primary-50' : 'border-border bg-white hover:border-primary/40')}>
                              <span className="border-2 rounded shrink-0" style={{ width: f.w / 2, height: f.h / 2, borderColor: format === f.value ? '#7C3AED' : '#DDD7EC' }} />
                              <span className="text-left"><span className="block text-sm font-medium text-text">{f.label}</span><span className="block text-[10px] text-text-muted">{f.sub}</span></span>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="Video Length">
                          <div className="w-full px-3 py-2.5 rounded-xl border border-border bg-surface-muted text-sm flex items-center justify-between">
                            <span className="text-text">{LENGTH_OPTIONS.find((o) => o.seconds === durationSeconds)?.label ?? `${durationSeconds}s`}</span>
                            <span className="text-[10px] text-text-muted">{scriptMode === 'ai' ? 'from target' : 'from script'}</span>
                          </div>
                        </Field>
                        <Field label="Video Style"><CustomSelect value={style} onChange={setStyle} options={STYLE_OPTIONS} /></Field>
                      </div>
                      <Field label="Niche"><CustomSelect value={niche} onChange={setNiche} options={niches.map((n) => ({ value: n, label: n }))} placeholder="Pick a niche" disabled /></Field>

                      {/* Reference image — best-effort character consistency across scenes */}
                      <div>
                        <label className="block text-xs font-semibold text-text-secondary mb-1.5">Reference image <span className="text-text-muted font-normal">(optional)</span></label>
                        <div className="flex items-start gap-4">
                          <label className={cn('shrink-0 w-16 h-16 rounded-xl border border-dashed border-border flex items-center justify-center overflow-hidden cursor-pointer bg-surface-muted hover:border-primary/40 transition-colors', refUploading && 'opacity-60 pointer-events-none')}>
                            {referenceImageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={referenceImageUrl} alt="Reference" className="w-full h-full object-cover" />
                            ) : refUploading ? (
                              <Loader2 className="w-5 h-5 animate-spin text-text-muted" />
                            ) : (
                              <ImageIcon className="w-5 h-5 text-text-muted" />
                            )}
                            <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden"
                              onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadReference(f); e.target.value = ''; }} />
                          </label>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-text-muted leading-relaxed">
                              Upload a character or subject to keep consistent across scenes. On the current engine this is best-effort (same look and description, not an identical face every scene).
                            </p>
                            {referenceImageUrl && (
                              <button onClick={() => setReferenceImageUrl(null)} className="mt-2 text-xs font-medium text-[#EF4444] hover:underline">Remove</button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Voiceover */}
                    {/* max-h caps this card at roughly Video Settings' natural height, so
                        items-stretch can't let the voice list balloon the shared row taller. */}
                    <div className="glass rounded-2xl p-5 space-y-4 flex flex-col max-h-[450px]">
                      <SectionLabel icon={<Play className="w-4 h-4" />} text="Voiceover" />
                      <div className="self-start inline-flex rounded-xl bg-surface-muted p-1">
                        {(['preset', 'custom'] as const).map((t) => (
                          <button key={t} onClick={() => setVoiceTab(t)} className={cn('px-4 py-1.5 rounded-lg text-sm font-medium transition-colors', voiceTab === t ? 'bg-white text-primary shadow-card' : 'text-text-muted hover:text-text')}>
                            {t === 'preset' ? 'Preset Voices' : 'Custom Voice'}
                          </button>
                        ))}
                      </div>
                      {voiceTab === 'preset' ? (
                        <div className="space-y-2 flex-1 min-h-0 overflow-y-auto pr-1">
                          {savedVoices.map((v) => (
                            <VoiceRow key={v.id} name={v.name} sub={`${v.provider}${v.is_custom ? ' · custom' : ''}`} active={selectedSavedId === v.id}
                              onClick={() => { setSelectedSavedId(v.id); setSelectedPreset(null); }} />
                          ))}
                          {presetVoices.map((v) => (
                            <VoiceRow key={v.id} name={v.name} sub={`${v.accent} · ${v.gender}`} active={selectedPreset?.id === v.id && !selectedSavedId}
                              onClick={() => { setSelectedPreset(v); setSelectedSavedId(''); }} />
                          ))}
                          {savedVoices.length === 0 && presetVoices.length === 0 && <p className="text-xs text-text-muted">No voices available.</p>}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <Field label="Provider"><CustomSelect value={customProvider} onChange={(v) => setCustomProvider(v as 'elevenlabs' | 'minimax')} options={[{ value: 'elevenlabs', label: 'ElevenLabs' }, { value: 'minimax', label: 'Minimax' }]} /></Field>
                          <Field label="Voice ID"><input className={inputClass} value={customVoiceId} onChange={(e) => setCustomVoiceId(e.target.value)} placeholder="Paste a voice ID" /></Field>
                          <p className="text-xs text-text-muted">We validate the ID before generating.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Subtitles */}
                  <div className="glass rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <SectionLabel icon={<FileText className="w-4 h-4" />} text="Subtitle Settings" />
                      <button onClick={() => setSubtitle((s) => ({ ...s, enabled: !s.enabled }))}
                        className={cn('relative w-10 h-6 rounded-full transition-colors', subtitle.enabled ? 'bg-primary' : 'bg-border-strong')}>
                        <span className={cn('absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all', subtitle.enabled ? 'left-[18px]' : 'left-0.5')} />
                      </button>
                    </div>
                    {subtitle.enabled && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Field label="Font"><CustomSelect value={subtitle.font_style} onChange={(v) => setSubtitle((s) => ({ ...s, font_style: v as SubtitleStyleOption }))} options={SUBTITLE_STYLES} /></Field>
                        <Field label="Size">
                          <div className="flex gap-1.5">
                            {SUBTITLE_SIZES.map((sz) => (
                              <button key={sz.value} onClick={() => setSubtitle((s) => ({ ...s, font_size: sz.value }))}
                                className={cn('flex-1 py-2 rounded-lg text-xs font-medium border', subtitle.font_size === sz.value ? 'border-primary bg-primary-50 text-primary' : 'border-border text-text-muted hover:border-primary/40')}>{sz.label}</button>
                            ))}
                          </div>
                        </Field>
                        <Field label="Color">
                          <div className="flex gap-1.5 flex-wrap">
                            {SUBTITLE_COLORS.map((c) => (
                              <button key={c.value} onClick={() => setSubtitle((s) => ({ ...s, font_color: c.value }))} title={c.label}
                                className={cn('w-7 h-7 rounded-lg border-2', subtitle.font_color === c.value ? 'border-primary' : 'border-border')} style={{ background: c.value }} />
                            ))}
                            <label
                              title="Custom color"
                              className={cn(
                                'relative w-7 h-7 rounded-lg border-2 cursor-pointer overflow-hidden',
                                !SUBTITLE_COLORS.some((c) => c.value === subtitle.font_color) ? 'border-primary' : 'border-border'
                              )}
                              style={{ background: 'conic-gradient(from 0deg, red, yellow, lime, cyan, blue, magenta, red)' }}
                            >
                              <input
                                type="color"
                                value={subtitle.font_color}
                                onChange={(e) => setSubtitle((s) => ({ ...s, font_color: e.target.value.toUpperCase() }))}
                                className="absolute -inset-1 opacity-0 cursor-pointer"
                              />
                            </label>
                          </div>
                        </Field>
                        <Field label="Position"><CustomSelect value={subtitle.placement} onChange={(v) => setSubtitle((s) => ({ ...s, placement: v as SubtitlePlacement }))} options={[{ value: 'top', label: 'Top' }, { value: 'center', label: 'Center' }, { value: 'bottom', label: 'Bottom' }]} /></Field>
                      </div>
                    )}
                  </div>

                  </div>

                  {/* Live preview — sticky, mirrors the actual render frame + subtitle overlay */}
                  <div className="xl:sticky xl:top-6">
                    <label className="block text-xs font-semibold text-text-secondary mb-1.5">Preview</label>
                    <SubtitlePreview subtitle={subtitle} format={format} />
                  </div>

                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      )}

      {/* Footer nav */}
      {!isGenerating && !isDone && !isTerminal(projectStatus) && (
        <div className="px-6 py-4 border-t border-border bg-surface flex items-center justify-between">
          <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}
            className="btn-secondary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium disabled:opacity-40">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          {step === 3 ? (
            <button onClick={handleGenerate} disabled={busy || !voiceReady}
              className="btn-cta inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm text-white disabled:opacity-50">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Generate Video
            </button>
          ) : (
            <button
              onClick={() => { if (step === 0) handleScriptNext(); else if (step === 1) handleConfigureNext(); else setStep(3); }}
              disabled={busy || (step === 0 && !scriptReady) || (step === 2 && breakdownStatus !== 'ready')}
              className="btn-cta inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm text-white disabled:opacity-50">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Next <ArrowRight className="w-4 h-4" /></>}
            </button>
          )}
        </div>
      )}

      {/* Scene preview lightbox */}
      {previewScene && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6" onClick={() => setPreviewScene(null)}>
          <div className="absolute inset-0 bg-[#1C1530]/60 backdrop-blur-sm" />
          <div className="relative max-w-3xl w-full bg-surface rounded-2xl shadow-panel border border-border overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setPreviewScene(null)} className="absolute top-3 right-3 z-10 w-8 h-8 rounded-lg bg-white/90 flex items-center justify-center text-text-muted hover:text-text shadow-card"><X className="w-4 h-4" /></button>
            {previewScene.image_urls?.[0] && (
              <img src={previewScene.image_urls[0]} alt="" className="w-full max-h-[68vh] object-contain bg-black" />
            )}
            <div className="p-5">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-sm font-semibold text-text">Scene {previewScene.idx + 1}</span>
                {previewScene.motion_type && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-muted text-text-muted">{previewScene.motion_type}</span>}
              </div>
              <p className="text-sm text-text-muted leading-relaxed">{previewScene.scene_text}</p>
              <button onClick={() => { regenerateSceneImage(previewScene.id); setPreviewScene(null); }}
                className="btn-secondary inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium mt-4"><RefreshCw className="w-4 h-4" /> Regenerate image</button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}

export default function CreatePage() {
  return (
    <Suspense fallback={<div className="h-full flex items-center justify-center"><div className="w-6 h-6 rounded-full border-2 border-primary/30 border-t-primary animate-spin" /></div>}>
      <CreateWizard />
    </Suspense>
  );
}

// ─── Small presentational helpers ──────────────────────────────────────────────

function StepHeader({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <span className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center text-primary">{icon}</span>
        <h2 className="text-2xl font-display font-bold text-text">{title}</h2>
      </div>
      <p className="text-sm text-text-muted mt-1.5">{desc}</p>
    </div>
  );
}

function SectionLabel({ icon, text }: { icon: React.ReactNode; text: string }) {
  return <div className="flex items-center gap-2 text-text"><span className="text-primary">{icon}</span><span className="text-sm font-semibold">{text}</span></div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-xs font-semibold text-text-secondary mb-1.5">{label}</label>{children}</div>;
}

// One setting per row (label left, control right) — used to keep a settings card
// narrow/tall so a preview panel next to it can stretch taller instead of wider.
function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4">
      <label className="w-16 shrink-0 text-xs font-semibold text-text-secondary">{label}</label>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between text-sm"><span className="text-text-muted">{label}</span><span className="text-text font-medium">{value}</span></div>;
}

function VoiceRow({ name, sub, active, onClick }: { name: string; sub: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={cn('w-full flex items-center gap-3 p-2.5 rounded-xl border transition-colors', active ? 'border-primary bg-primary-50' : 'border-border bg-white hover:border-primary/40')}>
      <span className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center text-primary shrink-0"><Play className="w-3.5 h-3.5" /></span>
      <span className="text-left min-w-0"><span className="block text-sm font-medium text-text truncate">{name}</span><span className="block text-[10px] text-text-muted">{sub}</span></span>
      {active && <Check className="w-4 h-4 text-primary ml-auto shrink-0" />}
    </button>
  );
}

function WaveBars() {
  return (
    <div className="flex items-end justify-center gap-1 h-9 mt-1">
      {Array.from({ length: 11 }).map((_, i) => (
        <motion.span
          key={i}
          className="w-1.5 rounded-full bg-gradient-to-t from-[#7C3AED] to-[#EC4899]"
          animate={{ height: ['25%', '95%', '25%'] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.07, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

// Final render canvas dimensions (backend RENDER_DIMENSIONS, common.py) — this is
// the canvas subtitles are actually burned onto, so the preview scales font_size
// against these (not the smaller SDXL image-gen canvas) so text occupies the same
// on-screen fraction as it will in the real burned-in video.
const CANVAS_DIMENSIONS: Record<Format, { w: number; h: number }> = {
  '9:16': { w: 1080, h: 1920 },
  '16:9': { w: 1920, h: 1080 },
};
// Sized for the 380px sticky preview column (see xl:grid-cols-[1fr_380px]).
const PREVIEW_HEIGHT = 600;

function SubtitlePreview({ subtitle, format }: { subtitle: SubtitleSettingsState; format: Format }) {
  const portrait = format === '9:16';
  const canvas = CANVAS_DIMENSIONS[format];
  const alignClass = subtitle.placement === 'top' ? 'items-start pt-6'
    : subtitle.placement === 'center' ? 'items-center' : 'items-end pb-6';
  // Matches the real render's framing (see Preview()): portrait is height-driven,
  // landscape is width-driven, so the on-screen shape matches the actual export.
  const frameHeight = portrait ? PREVIEW_HEIGHT : PREVIEW_HEIGHT * (9 / 16);
  const frameStyle: React.CSSProperties = portrait
    ? { height: frameHeight, aspectRatio: '9 / 16' }
    : { width: '100%', aspectRatio: '16 / 9' };
  // font_size is authored against the real canvas height, so scale it by how much
  // smaller the preview frame is — same on-screen proportion as the real render.
  const previewFontSize = subtitle.font_size * (frameHeight / canvas.h);

  return (
    <div
      className={cn('relative mx-auto rounded-2xl overflow-hidden bg-gradient-to-b from-[#1C1530] to-[#0F0A1C] border border-border shadow-panel flex justify-center px-6', alignClass)}
      style={{ ...frameStyle, maxWidth: '100%' }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <Play className="w-12 h-12 text-white/10" />
      </div>
      {subtitle.enabled && (
        <span
          className="relative text-center max-w-full break-words leading-tight"
          style={{
            color: subtitle.font_color,
            fontFamily: SUBTITLE_FONT_FAMILY[subtitle.font_style],
            fontSize: previewFontSize,
            fontWeight: subtitle.font_style === 'bold' ? 700 : 400,
            fontStyle: subtitle.font_style === 'italic' ? 'italic' : 'normal',
            textShadow: '0 0 2px #000, 0 0 2px #000, 1px 1px 1px #000, -1px -1px 1px #000, 2px 2px 3px rgba(0,0,0,0.8)',
          }}
        >
          Like this, your subtitles will appear
        </span>
      )}
    </div>
  );
}

function Preview({ format, finalUrl, percent, activeLabel, isGenerating, failed }: {
  format: Format; finalUrl: string | null; percent: number; activeLabel: string; isGenerating: boolean; failed: boolean;
}) {
  const portrait = format === '9:16';
  const frameStyle: React.CSSProperties = portrait
    ? { height: 'min(82vh, 900px)', aspectRatio: '9 / 16' }
    : { width: '100%', aspectRatio: '16 / 9', maxHeight: '74vh' };

  return (
    <div
      className="relative rounded-2xl overflow-hidden bg-[#0F0A1C] border border-border shadow-panel flex items-center justify-center"
      style={{ ...frameStyle, maxWidth: '100%' }}
    >
        {finalUrl ? (
          <video src={finalUrl} controls className="w-full h-full object-contain bg-black" />
        ) : failed ? (
          <div className="flex flex-col items-center gap-2 text-white/70 p-6 text-center">
            <AlertTriangle className="w-8 h-8 text-error" />
            <span className="text-sm">Generation stopped</span>
          </div>
        ) : isGenerating ? (
          <div className="flex flex-col items-center gap-3 text-white px-6 text-center">
            <div className="text-5xl font-bold tabular-nums leading-none">{percent}<span className="text-2xl align-top">%</span></div>
            <div className="text-xs text-white/60">{activeLabel}</div>
            <WaveBars />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-white/45 p-6 text-center">
            <Play className="w-8 h-8" />
            <span className="text-sm">Your video will appear here</span>
          </div>
        )}
    </div>
  );
}
