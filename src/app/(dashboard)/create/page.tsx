'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  AlertTriangle,
  Play,
  Check,
  Zap,
  Users,
  ArrowRight,
  CheckCircle,
  Loader2,
  Circle,
  Download,
  RefreshCw,
  Copy,
  FileText,
  Mic,
  UserCircle,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { PIPELINE_STAGES, type PipelineStageItem } from '@/components/jobs/JobProgress';

// ─── Types ────────────────────────────────────────────────────────────────────

type ScriptMode = 'ai' | 'custom';
type VideoFormat = '16:9' | '9:16' | '1:1' | '4:5';
type MotionIntensity = 'subtle' | 'moderate' | 'expressive' | 'engaging';
type VideoLength =
  | '15s' | '30s' | '45s' | '60s' | '90s'
  | '2m' | '3m' | '5m' | '8m' | '10m' | '15m' | '20m';

// ─── Static data ──────────────────────────────────────────────────────────────

const STEPS = [
  'Choose Persona',
  'Script',
  'Voice',
  'Motion Intensity',
  'Video Format',
  'Video Length',
  'Generate',
];

const PERSONAS: { id: string; name: string; from: string; to: string }[] = [];

const VOICES = [
  { id: '1', name: 'Aria Neural', accent: 'American English' },
  { id: '2', name: 'Marcus Pro', accent: 'British English' },
  { id: '3', name: 'Zoe HD', accent: 'Australian English' },
  { id: '4', name: 'Leo Studio', accent: 'American English (M)' },
];

const MOTION_OPTIONS: { value: MotionIntensity; label: string; desc: string }[] = [
  { value: 'subtle', label: 'Subtle', desc: 'Minimal camera movement, natural feel' },
  { value: 'moderate', label: 'Moderate', desc: 'Smooth zooms and gentle transitions' },
  { value: 'expressive', label: 'Expressive', desc: 'Dynamic cuts and motion emphasis' },
  { value: 'engaging', label: 'Engaging', desc: 'High energy, trend-driven pacing' },
];

const FORMAT_OPTIONS: { value: VideoFormat; label: string; w: number; h: number }[] = [
  { value: '16:9', label: '16:9 YouTube', w: 64, h: 36 },
  { value: '9:16', label: '9:16 TikTok', w: 36, h: 64 },
  { value: '1:1', label: '1:1 Instagram', w: 48, h: 48 },
  { value: '4:5', label: '4:5 Feed', w: 44, h: 55 },
];

const LENGTH_OPTIONS: VideoLength[] = [
  '15s', '30s', '45s', '60s', '90s', '2m', '3m', '5m', '8m', '10m', '15m', '20m',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const videoLengthToSeconds = (len: VideoLength): number => {
  const map: Record<VideoLength, number> = {
    '15s': 15, '30s': 30, '45s': 45, '60s': 60, '90s': 90,
    '2m': 120, '3m': 180, '5m': 300, '8m': 480, '10m': 600, '15m': 900, '20m': 1200,
  };
  return map[len] ?? 30;
};

const creditCost = (length: VideoLength) => {
  const secs = videoLengthToSeconds(length);
  return Math.ceil(secs / 30);
};

const inputClass =
  'bg-[#050507] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-[#52525B] focus:outline-none focus:border-[#8A2BE2]/60 transition-colors w-full text-sm';

// ─── Step Components ──────────────────────────────────────────────────────────

function StepChoosePersona({
  selected,
  onSelect,
  personas,
}: {
  selected: string;
  onSelect: (id: string) => void;
  personas: typeof PERSONAS;
}) {
  if (personas.length === 0) {
    return (
      <div className="mt-3 flex flex-col items-center gap-3 py-5 px-3 rounded-xl border border-dashed border-white/[0.08] text-center">
        <div className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
          <Users className="w-5 h-5 text-[#3F3F46]" />
        </div>
        <div>
          <p className="text-xs font-semibold text-white mb-1">Belum ada persona</p>
          <p className="text-[10px] text-[#52525B] leading-relaxed">
            Upload foto AI influencer kamu terlebih dahulu sebelum membuat video.
          </p>
        </div>
        <Link
          href="/personas"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#8A2BE2]/10 border border-[#8A2BE2]/30 text-[#8A2BE2] text-xs font-semibold hover:bg-[#8A2BE2]/20 transition-all"
        >
          Upload Persona
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-2 mt-3">
      {personas.map((p) => (
        <button
          key={p.id}
          onClick={() => onSelect(p.id)}
          className={cn(
            'flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-200',
            selected === p.id
              ? 'border-[#8A2BE2]/60 bg-[#8A2BE2]/10'
              : 'border-white/[0.06] glass hover:border-white/20'
          )}
        >
          <div className={cn('w-11 h-11 rounded-full bg-gradient-to-br shrink-0', p.from, p.to)} />
          <span className="text-[10px] text-[#A1A1AA] truncate w-full text-center">{p.name}</span>
        </button>
      ))}
      <Link
        href="/personas"
        className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border border-dashed border-white/20 hover:border-[#8A2BE2]/50 transition-all text-[#52525B] hover:text-[#8A2BE2]"
      >
        <span className="text-xl leading-none">+</span>
        <span className="text-[10px]">New</span>
      </Link>
    </div>
  );
}

function StepScript({
  mode,
  onModeChange,
  scriptText,
  onScriptTextChange,
  videoTitle,
  onVideoTitleChange,
}: {
  mode: ScriptMode;
  onModeChange: (m: ScriptMode) => void;
  scriptText: string;
  onScriptTextChange: (t: string) => void;
  videoTitle: string;
  onVideoTitleChange: (t: string) => void;
}) {
  return (
    <div className="mt-3 flex flex-col gap-3">
      {/* Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => onModeChange('ai')}
          className={cn(
            'flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all leading-tight px-2',
            mode === 'ai'
              ? 'bg-[#8A2BE2]/10 border-[#8A2BE2]/60 text-[#8A2BE2]'
              : 'border-white/[0.08] text-[#52525B] hover:text-white'
          )}
        >
          AI Generate from Title
        </button>
        <button
          onClick={() => onModeChange('custom')}
          className={cn(
            'flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all',
            mode === 'custom'
              ? 'bg-[#8A2BE2]/10 border-[#8A2BE2]/60 text-[#8A2BE2]'
              : 'border-white/[0.08] text-[#52525B] hover:text-white'
          )}
        >
          Custom Script
        </button>
      </div>

      {mode === 'ai' ? (
        <div className="flex flex-col gap-2">
          <input
            className={inputClass}
            placeholder="Paste your video title here…"
            value={videoTitle}
            onChange={(e) => onVideoTitleChange(e.target.value)}
          />
          <button className="btn-neon py-2.5 rounded-xl text-sm font-semibold">
            Generate Script
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <textarea
            className={cn(inputClass, 'min-h-[180px] resize-none')}
            placeholder="Paste or type your script here…"
            value={scriptText}
            onChange={(e) => onScriptTextChange(e.target.value)}
          />
          <p className="flex items-center gap-1.5 text-[10px] text-[#FBBF24]/80">
            <AlertTriangle className="w-3 h-3 shrink-0" />
            Script will be used exactly as written, no AI edits.
          </p>
        </div>
      )}
    </div>
  );
}

function StepVoice({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (id: string) => void;
}) {
  const [useCustom, setUseCustom] = useState(false);
  const [customId, setCustomId] = useState('');

  return (
    <div className="mt-3 flex flex-col gap-2">
      {VOICES.map((v) => (
        <button
          key={v.id}
          onClick={() => onSelect(v.id)}
          className={cn(
            'flex items-center gap-3 px-3 py-3 rounded-xl border transition-all',
            selected === v.id
              ? 'border-[#8A2BE2]/60 bg-[#8A2BE2]/10'
              : 'border-white/[0.06] glass hover:border-white/20'
          )}
        >
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-white">{v.name}</p>
            <p className="text-xs text-[#52525B]">{v.accent}</p>
          </div>
          <div className="flex items-end gap-0.5 h-6">
            {[3, 5, 8, 4, 7, 3, 6, 5, 8, 3].map((h, i) => (
              <div
                key={i}
                className="w-0.5 rounded-full bg-[#8A2BE2]/50"
                style={{ height: `${h * 3}px` }}
              />
            ))}
          </div>
          <div
            role="button"
            onClick={(e) => { e.stopPropagation(); console.log('play', v.id); }}
            className="w-8 h-8 rounded-full bg-[#8A2BE2]/10 border border-[#8A2BE2]/20 flex items-center justify-center text-[#8A2BE2] hover:bg-[#8A2BE2]/20 transition-colors shrink-0 cursor-pointer"
          >
            <Play className="w-3 h-3 ml-0.5" />
          </div>
        </button>
      ))}

      <button
        onClick={() => setUseCustom(!useCustom)}
        className="flex items-center gap-2 px-3 py-2 text-xs text-[#A1A1AA] hover:text-white transition-colors"
      >
        <span
          className={cn(
            'w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all',
            useCustom ? 'border-[#8A2BE2] bg-[#8A2BE2]' : 'border-white/20'
          )}
        >
          {useCustom && <Check className="w-2.5 h-2.5 text-white" />}
        </span>
        Use Custom Voice ID
      </button>

      {useCustom && (
        <div className="flex gap-2">
          <input
            className={cn(inputClass, 'flex-1')}
            placeholder="ElevenLabs or Minimax Voice ID"
            value={customId}
            onChange={(e) => setCustomId(e.target.value)}
          />
          <button className="btn-neon px-4 rounded-xl text-sm font-semibold shrink-0">
            Validate
          </button>
        </div>
      )}
    </div>
  );
}

function StepMotion({
  selected,
  onSelect,
}: {
  selected: MotionIntensity;
  onSelect: (v: MotionIntensity) => void;
}) {
  return (
    <div className="mt-3 grid grid-cols-2 gap-2">
      {MOTION_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onSelect(opt.value)}
          className={cn(
            'flex flex-col gap-1 px-3 py-3 rounded-xl border text-left transition-all',
            selected === opt.value
              ? 'border-[#8A2BE2]/60 bg-gradient-to-br from-[#8A2BE2]/10 to-[#00D4FF]/10'
              : 'border-white/[0.06] glass hover:border-white/20'
          )}
        >
          <span className="text-sm font-semibold text-white">{opt.label}</span>
          <span className="text-[10px] text-[#52525B] leading-relaxed">{opt.desc}</span>
        </button>
      ))}
    </div>
  );
}

function StepFormat({
  selected,
  onSelect,
}: {
  selected: VideoFormat;
  onSelect: (v: VideoFormat) => void;
}) {
  return (
    <div className="mt-3 grid grid-cols-2 gap-2">
      {FORMAT_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onSelect(opt.value)}
          className={cn(
            'flex flex-col items-center justify-center gap-3 px-3 py-5 rounded-xl transition-all',
            selected === opt.value
              ? 'bg-[#8A2BE2]/10'
              : 'hover:bg-white/[0.03]'
          )}
        >
          <div
            className={cn(
              'rounded-sm border-2 transition-all',
              selected === opt.value ? 'border-[#8A2BE2]' : 'border-white/20'
            )}
            style={{ width: `${opt.w * 0.75}px`, height: `${opt.h * 0.75}px` }}
          />
          <span className={cn('text-xs font-medium transition-colors', selected === opt.value ? 'text-white' : 'text-[#52525B]')}>
            {opt.label}
          </span>
        </button>
      ))}
    </div>
  );
}

function StepLength({
  selected,
  onSelect,
}: {
  selected: VideoLength;
  onSelect: (v: VideoLength) => void;
}) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {LENGTH_OPTIONS.map((len) => (
        <button
          key={len}
          onClick={() => onSelect(len)}
          className={cn(
            'px-3 py-1.5 rounded-lg text-sm font-medium border transition-all',
            selected === len
              ? 'bg-gradient-to-r from-[#8A2BE2]/20 to-[#00D4FF]/20 border-[#8A2BE2]/60 text-white'
              : 'border-white/[0.06] text-[#52525B] hover:text-white hover:border-white/20'
          )}
        >
          {len}
        </button>
      ))}
    </div>
  );
}

function StepGenerate({
  selectedPersona,
  scriptMode,
  selectedVoice,
  motionIntensity,
  videoFormat,
  videoLength,
  onGenerate,
}: {
  selectedPersona: string;
  scriptMode: ScriptMode;
  selectedVoice: string;
  motionIntensity: MotionIntensity;
  videoFormat: VideoFormat;
  videoLength: VideoLength;
  onGenerate: () => void;
}) {
  const persona = PERSONAS.find((p) => p.id === selectedPersona);
  const voice = VOICES.find((v) => v.id === selectedVoice);
  const cost = creditCost(videoLength);

  const summaryItems = [
    { label: 'Persona', value: persona?.name ?? '—' },
    { label: 'Script', value: scriptMode === 'ai' ? 'AI Generated' : 'Custom' },
    { label: 'Voice', value: voice?.name ?? '—' },
    { label: 'Motion', value: motionIntensity.charAt(0).toUpperCase() + motionIntensity.slice(1) },
    { label: 'Format', value: videoFormat },
    { label: 'Length', value: videoLength },
  ];

  return (
    <div className="mt-3 flex flex-col gap-4">
      <div className="glass rounded-xl p-4 flex flex-col gap-2.5">
        {summaryItems.map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <span className="text-xs text-[#52525B]">{item.label}</span>
            <span className="text-xs font-medium text-white">{item.value}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#8A2BE2]/10 border border-[#8A2BE2]/20">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#00D4FF]" />
          <span className="text-sm font-semibold text-white">{cost} credits</span>
        </div>
        <span className="text-xs text-[#A1A1AA]">≈ {videoLength} of video</span>
      </div>

      <button onClick={onGenerate} className="btn-neon w-full py-3.5 rounded-xl text-base font-bold">
        Generate Video
      </button>
      <p className="text-xs text-[#52525B] text-center leading-relaxed">
        Credits are deducted upon successful generation.
      </p>
    </div>
  );
}

// ─── Video Detail Panel ───────────────────────────────────────────────────────

function VideoPlayer({ videoUrl, videoFormat, videoLength }: {
  videoUrl: string | null;
  videoFormat: VideoFormat;
  videoLength: VideoLength;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setIsPlaying(true); }
    else { v.pause(); setIsPlaying(false); }
  };

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    setProgress((v.currentTime / v.duration) * 100);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    v.currentTime = ((e.clientX - rect.left) / rect.width) * v.duration;
  };

  const playerWidth: Record<VideoFormat, string> = {
    '9:16': '220px', '4:5': '260px', '1:1': '320px', '16:9': '100%',
  };

  return (
    <div className="flex justify-center">
      <div
        className="relative rounded-2xl overflow-hidden bg-black border border-white/[0.08] group cursor-pointer"
        style={{ width: playerWidth[videoFormat], aspectRatio: videoFormat.replace(':', '/') }}
        onClick={togglePlay}
      >
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-cover"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={() => setDuration(videoRef.current?.duration ?? 0)}
            onEnded={() => setIsPlaying(false)}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#8A2BE2]/20 via-[#0B0B12] to-[#00D4FF]/10" />
        )}

        {/* Play/pause overlay */}
        <div className={cn(
          'absolute inset-0 flex items-center justify-center transition-opacity duration-200',
          isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'
        )}>
          <div className="w-14 h-14 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center">
            {isPlaying
              ? <span className="flex gap-1"><span className="w-1 h-5 bg-white rounded-full" /><span className="w-1 h-5 bg-white rounded-full" /></span>
              : <Play className="w-6 h-6 text-white ml-0.5" />
            }
          </div>
        </div>

        {/* Bottom bar */}
        <div className="absolute bottom-0 left-0 right-0 px-3 pb-3 pt-6 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {/* Progress bar */}
          {videoUrl && duration > 0 && (
            <div
              className="w-full h-1 bg-white/20 rounded-full mb-2 cursor-pointer"
              onClick={(e) => { e.stopPropagation(); handleSeek(e); }}
            >
              <div className="h-full bg-[#00D4FF] rounded-full" style={{ width: `${progress}%` }} />
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium text-white/60">{videoFormat}</span>
            <span className="text-[10px] font-medium text-white/60">{videoLength}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function VideoDetailPanel({
  videoFormat,
  voiceName,
  personaName,
  scriptMode,
  videoLength,
  processingTime,
  videoUrl = null,
}: {
  videoFormat: VideoFormat;
  voiceName: string;
  personaName: string;
  scriptMode: ScriptMode;
  videoLength: VideoLength;
  processingTime: string;
  videoUrl?: string | null;
}) {
  const creditCostDisplay = creditCost(videoLength);

  const metadata = [
    { icon: FileText,   label: 'Script',         value: scriptMode === 'ai' ? 'AI Generated' : 'Custom Script' },
    { icon: Mic,        label: 'Voice',           value: voiceName || '—' },
    { icon: UserCircle, label: 'Avatar',          value: personaName || '—' },
    { icon: Zap,        label: 'Credits Used',    value: `${creditCostDisplay} credits` },
    { icon: Clock,      label: 'Processing Time', value: processingTime },
  ];

  return (
    <motion.div
      key="video-detail"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col h-full overflow-y-auto px-8 py-6 gap-5 max-w-2xl mx-auto w-full"
    >
      {/* Player */}
      <VideoPlayer videoUrl={videoUrl} videoFormat={videoFormat} videoLength={videoLength} />

      {/* Actions */}
      <div className="flex gap-2">
        <button className="btn-neon flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold">
          <Download className="w-4 h-4" />
          Download
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border border-white/[0.08] text-[#A1A1AA] hover:text-white hover:border-white/20 transition-all">
          <RefreshCw className="w-4 h-4" />
          Regenerate
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border border-white/[0.08] text-[#A1A1AA] hover:text-white hover:border-white/20 transition-all">
          <Copy className="w-4 h-4" />
          Duplicate
        </button>
      </div>

      {/* Metadata */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-white/[0.06]">
          <p className="text-xs font-semibold text-[#52525B] uppercase tracking-widest">Video Details</p>
        </div>
        <div className="flex flex-col divide-y divide-white/[0.04]">
          {metadata.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 px-5 py-3.5">
              <Icon className="w-4 h-4 text-[#52525B] shrink-0" />
              <span className="text-sm text-[#52525B] flex-1">{label}</span>
              <span className="text-sm font-medium text-white text-right max-w-[200px] truncate">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Pipeline helpers ─────────────────────────────────────────────────────────

const STAGE_DURATIONS = [3000, 4000, 8000, 5000, 3000, 2000];

// ─── Generating Left Panel ────────────────────────────────────────────────────

function GeneratingLeftPanel({
  stages,
  isDone,
  voiceName,
  personaName,
  scriptMode,
  motionIntensity,
  videoFormat,
  videoLength,
  onCancel,
}: {
  stages: PipelineStageItem[];
  isDone: boolean;
  voiceName: string;
  personaName: string;
  scriptMode: ScriptMode;
  motionIntensity: MotionIntensity;
  videoFormat: VideoFormat;
  videoLength: VideoLength;
  onCancel: () => void;
}) {
  const activeStage = stages.find((s) => s.status === 'active');

  const summary = [
    { label: 'Persona', value: personaName || '—' },
    { label: 'Script',  value: scriptMode === 'ai' ? 'AI Generated' : 'Custom' },
    { label: 'Voice',   value: voiceName || '—' },
    { label: 'Motion',  value: motionIntensity.charAt(0).toUpperCase() + motionIntensity.slice(1) },
    { label: 'Format',  value: videoFormat },
    { label: 'Length',  value: videoLength },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-full"
    >
      {/* Header */}
      <div className="px-6 py-5 border-b border-white/[0.06] shrink-0">
        <div className="flex items-center gap-3">
          {isDone
            ? <div className="w-7 h-7 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/30 flex items-center justify-center shrink-0">
                <CheckCircle className="w-3.5 h-3.5 text-[#22C55E]" />
              </div>
            : <div className="w-7 h-7 rounded-full bg-[#00D4FF]/10 border border-[#00D4FF]/20 flex items-center justify-center shrink-0">
                <Loader2 className="w-3.5 h-3.5 text-[#00D4FF] animate-spin" />
              </div>
          }
          <div>
            <h1 className="text-base font-bold text-white">
              {isDone ? 'Video Ready' : 'Generating Video'}
            </h1>
            <p className="text-xs text-[#52525B] mt-0.5">
              {isDone ? 'Your video has been generated.' : activeStage ? activeStage.name + '…' : 'Starting pipeline…'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 px-4 py-4 flex flex-col gap-4">
        {/* Summary card */}
        <div className="glass rounded-xl overflow-hidden">
          <div className="px-4 py-2.5 border-b border-white/[0.06]">
            <p className="text-[10px] font-semibold text-[#52525B] uppercase tracking-widest">Settings</p>
          </div>
          <div className="flex flex-col divide-y divide-white/[0.04]">
            {summary.map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between px-4 py-2.5">
                <span className="text-xs text-[#52525B]">{label}</span>
                <span className="text-xs font-medium text-[#A1A1AA] max-w-[150px] truncate text-right">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pipeline stages */}
        <div className="flex flex-col gap-1">
          <p className="text-[10px] font-semibold text-[#52525B] uppercase tracking-widest px-1 mb-1">Pipeline</p>
          {stages.map((stage) => (
            <div
              key={stage.name}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300',
                stage.status === 'active'
                  ? 'bg-[rgba(0,212,255,0.05)] border border-[#00D4FF]/20'
                  : 'border border-transparent'
              )}
            >
              <div className="shrink-0">
                {stage.status === 'complete' && <CheckCircle className="w-4 h-4 text-[#22C55E]" />}
                {stage.status === 'active'   && <Loader2 className="w-4 h-4 text-[#00D4FF] animate-spin" />}
                {stage.status === 'pending'  && <Circle className="w-4 h-4 text-[#3F3F46]" />}
              </div>
              <span className={cn(
                'flex-1 text-sm font-medium',
                stage.status === 'complete' ? 'text-[#52525B]' :
                stage.status === 'active'   ? 'text-white' : 'text-[#3F3F46]'
              )}>
                {stage.name}
              </span>
              {stage.status === 'complete' && stage.duration && (
                <span className="text-[10px] text-[#3F3F46]">{stage.duration}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Cancel */}
      {!isDone && (
        <div className="px-6 py-4 border-t border-white/[0.06] shrink-0">
          <button
            onClick={onCancel}
            className="w-full text-xs text-[#52525B] hover:text-[#EF4444] transition-colors py-2"
          >
            Cancel Generation
          </button>
        </div>
      )}
    </motion.div>
  );
}

// ─── Generating Right Panel ───────────────────────────────────────────────────

function GeneratingRightPanel({
  stages,
  videoFormat,
  videoLength,
}: {
  stages: PipelineStageItem[];
  videoFormat: VideoFormat;
  videoLength: VideoLength;
}) {
  const completedCount = stages.filter((s) => s.status === 'complete').length;
  const activeStage    = stages.find((s) => s.status === 'active');
  const total          = stages.length;
  const pct = Math.round(
    (completedCount / total) * 100 + (activeStage ? (1 / total) * 40 : 0)
  );

  const playerWidth: Record<VideoFormat, string> = {
    '9:16': '200px', '4:5': '240px', '1:1': '300px', '16:9': '100%',
  };

  return (
    <motion.div
      key="generating-right"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-full items-center justify-center px-8 gap-6"
    >
      <div
        className="relative rounded-2xl overflow-hidden border border-white/[0.08] flex items-center justify-center"
        style={{ width: playerWidth[videoFormat], aspectRatio: videoFormat.replace(':', '/') }}
      >
        {/* Shimmer */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#8A2BE2]/10 via-[#050507] to-[#00D4FF]/10" />
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
        />

        {/* Progress */}
        <div className="relative z-10 flex flex-col items-center gap-2">
          <span className="text-4xl font-bold text-white tabular-nums">{pct}%</span>
          <span className="text-xs text-[#52525B] text-center px-4">
            {activeStage?.name ?? (pct === 100 ? 'Finalizing…' : 'Starting…')}
          </span>
        </div>

        {/* Format/length badges */}
        <span className="absolute bottom-2.5 left-2.5 text-[10px] font-medium text-white/40 bg-black/30 px-2 py-0.5 rounded-full">
          {videoFormat}
        </span>
        <span className="absolute bottom-2.5 right-2.5 text-[10px] font-medium text-white/40 bg-black/30 px-2 py-0.5 rounded-full">
          {videoLength}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-[280px]">
        <div className="w-full h-1 rounded-full bg-white/[0.06] overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#8A2BE2] to-[#00D4FF]"
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Preview Panel ─────────────────────────────────────────────────────────────

function PreviewPanel({
  videoFormat,
  selectedPersona,
  selectedVoice,
  motionIntensity,
  videoLength,
  currentStep,
  isGenerating,
}: {
  videoFormat: VideoFormat;
  selectedPersona: string;
  selectedVoice: string;
  motionIntensity: MotionIntensity;
  videoLength: VideoLength;
  currentStep: number;
  isGenerating: boolean;
}) {
  const persona = PERSONAS.find((p) => p.id === selectedPersona);
  const voice = VOICES.find((v) => v.id === selectedVoice);

  const cardStyle = (): React.CSSProperties => {
    switch (videoFormat) {
      case '9:16': return { aspectRatio: '9/16', height: '100%', maxHeight: '76vh' };
      case '16:9': return { aspectRatio: '16/9', width: '100%', maxWidth: '700px' };
      case '1:1':  return { aspectRatio: '1/1',  height: '72%',  maxHeight: '72vh' };
      case '4:5':  return { aspectRatio: '4/5',  height: '80%',  maxHeight: '76vh' };
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Label */}
      <div className="px-8 pt-6 pb-3 shrink-0">
        <p className="text-xs font-semibold text-[#52525B] uppercase tracking-widest">Preview</p>
      </div>

      {/* Card area — fills remaining space */}
      <div className="flex-1 flex items-center justify-center px-8 overflow-hidden min-h-0">
        <div
          className="relative rounded-2xl overflow-hidden flex items-center justify-center bg-gradient-to-br from-[#8A2BE2]/20 via-[#0B0B12] to-[#00D4FF]/10 border border-white/[0.08]"
          style={cardStyle()}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#8A2BE2]/10 via-transparent to-[#00D4FF]/10" />
          {persona && (
            <div className={cn('absolute inset-0 opacity-10 bg-gradient-to-br', persona.from, persona.to)} />
          )}
          <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center z-10">
            <Play className="w-7 h-7 text-white ml-1" />
          </div>
          <span className="absolute bottom-3 left-3 text-[11px] font-medium text-white/60 bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-sm">
            {videoFormat}
          </span>
          <span className="absolute bottom-3 right-3 text-[11px] font-medium text-white/60 bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-sm">
            {videoLength}
          </span>
        </div>
      </div>

      {/* Chips — appear only after each step is passed */}
      <div className="px-8 pb-6 pt-3 shrink-0 flex flex-wrap gap-2 justify-center min-h-[40px]">
        {currentStep > 1 && persona && (
          <span className="px-3 py-1 rounded-full bg-[#8A2BE2]/10 border border-[#8A2BE2]/20 text-xs text-[#A1A1AA]">
            {persona.name}
          </span>
        )}
        {currentStep > 3 && voice && (
          <span className="px-3 py-1 rounded-full bg-[#00D4FF]/10 border border-[#00D4FF]/20 text-xs text-[#A1A1AA]">
            {voice.name}
          </span>
        )}
        {currentStep > 4 && (
          <span className="px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.06] text-xs text-[#A1A1AA] capitalize">{motionIntensity}</span>
        )}
        {currentStep > 5 && (
          <span className="px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.06] text-xs text-[#A1A1AA]">{videoFormat}</span>
        )}
        {currentStep > 6 && (
          <span className="px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.06] text-xs text-[#A1A1AA]">{videoLength}</span>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CreatePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPersona, setSelectedPersona] = useState('');
  const [scriptMode, setScriptMode] = useState<ScriptMode>('ai');
  const [scriptText, setScriptText] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('1');
  const [motionIntensity, setMotionIntensity] = useState<MotionIntensity>('moderate');
  const [videoFormat, setVideoFormat] = useState<VideoFormat>('9:16');
  const [videoLength, setVideoLength] = useState<VideoLength>('30s');
  const [isGenerating, setIsGenerating]   = useState(false);
  const [isDone, setIsDone]               = useState(false);
  const [pipelineStages, setPipelineStages] = useState<PipelineStageItem[]>([]);
  const [processingTime, setProcessingTime] = useState('');

  const handleGenerate = () => {
    setPipelineStages(PIPELINE_STAGES.map((s) => ({ ...s, status: 'pending' })));
    setIsDone(false);
    setIsGenerating(true);
  };

  const handleCancel = () => {
    setIsGenerating(false);
    setIsDone(false);
    setPipelineStages([]);
  };

  useEffect(() => {
    if (!isGenerating || isDone) return;

    const startTime = Date.now();
    let idx = 0;
    let tid: ReturnType<typeof setTimeout>;

    const advance = () => {
      setPipelineStages((prev) =>
        prev.map((s, i) => ({
          ...s,
          status: i < idx ? 'complete' : i === idx ? 'active' : 'pending',
          duration: i < idx ? `${(STAGE_DURATIONS[i] / 1000).toFixed(0)}s` : undefined,
        }))
      );

      if (idx < PIPELINE_STAGES.length - 1) {
        tid = setTimeout(() => { idx += 1; advance(); }, STAGE_DURATIONS[idx]);
      } else {
        tid = setTimeout(() => {
          setPipelineStages((prev) => prev.map((s) => ({ ...s, status: 'complete' })));
          setProcessingTime(`${Math.round((Date.now() - startTime) / 1000)}s`);
          setIsDone(true);
        }, STAGE_DURATIONS[idx]);
      }
    };

    advance();
    return () => clearTimeout(tid);
  }, [isGenerating]);

  const isStepComplete = (_step: number): boolean => true;
  const canGoToStep = (_step: number): boolean => true;

  const stepContent = (step: number) => {
    switch (step) {
      case 1:
        return <StepChoosePersona selected={selectedPersona} onSelect={setSelectedPersona} personas={PERSONAS} />;
      case 2:
        return (
          <StepScript
            mode={scriptMode}
            onModeChange={setScriptMode}
            scriptText={scriptText}
            onScriptTextChange={setScriptText}
            videoTitle={videoTitle}
            onVideoTitleChange={setVideoTitle}
          />
        );
      case 3:
        return <StepVoice selected={selectedVoice} onSelect={setSelectedVoice} />;
      case 4:
        return <StepMotion selected={motionIntensity} onSelect={setMotionIntensity} />;
      case 5:
        return <StepFormat selected={videoFormat} onSelect={setVideoFormat} />;
      case 6:
        return <StepLength selected={videoLength} onSelect={setVideoLength} />;
      case 7:
        return (
          <StepGenerate
            selectedPersona={selectedPersona}
            scriptMode={scriptMode}
            selectedVoice={selectedVoice}
            motionIntensity={motionIntensity}
            videoFormat={videoFormat}
            videoLength={videoLength}
            onGenerate={handleGenerate}
          />
        );
      default:
        return null;
    }
  };

  const voiceName   = VOICES.find((v) => v.id === selectedVoice)?.name ?? '';
  const personaName = PERSONAS.find((p) => p.id === selectedPersona)?.name ?? '';

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left panel */}
      <div className="w-[420px] flex-shrink-0 bg-[#0B0B12] border-r border-white/[0.06] flex flex-col h-full">
        <AnimatePresence mode="wait">
          {isGenerating ? (
            <GeneratingLeftPanel
              key="gen-left"
              stages={pipelineStages}
              isDone={isDone}
              voiceName={voiceName}
              personaName={personaName}
              scriptMode={scriptMode}
              motionIntensity={motionIntensity}
              videoFormat={videoFormat}
              videoLength={videoLength}
              onCancel={handleCancel}
            />
          ) : (
            <motion.div
              key="wizard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col h-full"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-white/[0.06] shrink-0">
                <h1 className="text-xl font-bold text-white">Create Video</h1>
                <p className="text-xs text-[#52525B] mt-0.5">Step {currentStep} of {STEPS.length}</p>
              </div>

              {/* Steps list + nav */}
              <div className="flex-1 overflow-y-auto min-h-0 px-4">
                <div className="flex flex-col min-h-full py-4">
                  <div className="flex flex-col gap-1">
                    {STEPS.map((title, i) => {
                      const stepNum  = i + 1;
                      const isActive   = currentStep === stepNum;
                      const isComplete = currentStep > stepNum;

                      return (
                        <div key={stepNum}>
                          <button
                            onClick={() => canGoToStep(stepNum) && setCurrentStep(stepNum)}
                            disabled={!canGoToStep(stepNum)}
                            className={cn(
                              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left',
                              isActive ? 'bg-[#8A2BE2]/[0.06]' : canGoToStep(stepNum) ? 'hover:bg-white/[0.02]' : 'cursor-not-allowed opacity-50'
                            )}
                          >
                            <div className={cn(
                              'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all',
                              isActive || isComplete
                                ? 'bg-gradient-to-br from-[#8A2BE2] to-[#00D4FF] text-white'
                                : 'bg-white/[0.06] text-[#3F3F46]'
                            )}>
                              {isComplete ? <Check className="w-3.5 h-3.5" /> : stepNum}
                            </div>
                            <span className={cn(
                              'text-sm font-medium flex-1',
                              isActive ? 'text-white' : isComplete ? 'text-[#A1A1AA]' : 'text-[#3F3F46]'
                            )}>
                              {title}
                            </span>
                            {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#8A2BE2]" />}
                          </button>

                          <AnimatePresence>
                            {isActive && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.25 }}
                                className="overflow-hidden px-3"
                              >
                                {stepContent(stepNum)}
                                <div className="h-2" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>

                  {/* Nav buttons */}
                  <div className="mt-auto pt-4 border-t border-white/[0.06] flex gap-3">
                    {currentStep > 1 && (
                      <button
                        onClick={() => setCurrentStep((s) => s - 1)}
                        className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-sm font-semibold text-[#A1A1AA] hover:text-white hover:border-white/20 transition-all"
                      >
                        Back
                      </button>
                    )}
                    {currentStep < STEPS.length && (
                      <button
                        onClick={() => isStepComplete(currentStep) && setCurrentStep((s) => s + 1)}
                        disabled={!isStepComplete(currentStep)}
                        className={cn(
                          'flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all',
                          isStepComplete(currentStep)
                            ? 'btn-neon'
                            : 'bg-white/[0.04] border border-white/[0.06] text-[#3F3F46] cursor-not-allowed'
                        )}
                      >
                        Next Step
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right panel */}
      <div className="flex-1 overflow-hidden flex flex-col bg-[#050507]">
        <AnimatePresence mode="wait">
          {!isGenerating ? (
            <PreviewPanel
              key="preview"
              videoFormat={videoFormat}
              selectedPersona={selectedPersona}
              selectedVoice={selectedVoice}
              motionIntensity={motionIntensity}
              videoLength={videoLength}
              currentStep={currentStep}
              isGenerating={false}
            />
          ) : isDone ? (
            <VideoDetailPanel
              key="detail"
              videoFormat={videoFormat}
              voiceName={voiceName}
              personaName={personaName}
              scriptMode={scriptMode}
              videoLength={videoLength}
              processingTime={processingTime}
            />
          ) : (
            <GeneratingRightPanel
              key="gen-right"
              stages={pipelineStages}
              videoFormat={videoFormat}
              videoLength={videoLength}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
