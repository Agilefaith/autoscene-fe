'use client';

import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Plus, Trash2, Check, AlertCircle, Mic, Pause,
  Loader2, MicOff, Upload, Wand2, Hash,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlatformVoice {
  id: string;
  name: string;
  accent: string;
  gender: 'Female' | 'Male' | 'Non-binary';
  barHeights: number[];
}

type ValidationStatus = 'validated' | 'pending' | 'validating' | 'cloning';

interface CustomVoice {
  id: string;
  voiceId: string;
  nickname: string;
  status: ValidationStatus;
  source: 'manual' | 'clone';
}

type AddMode = 'id' | 'clone';

// ─── Static data ──────────────────────────────────────────────────────────────

const PLATFORM_VOICES: PlatformVoice[] = [
  { id: '1', name: 'Aria Neural',  accent: 'American English',  gender: 'Female',     barHeights: [3, 6, 9, 5, 8, 4, 7, 6, 9, 4, 6, 3] },
  { id: '2', name: 'Marcus Pro',   accent: 'British English',   gender: 'Male',       barHeights: [5, 8, 6, 9, 4, 7, 5, 8, 3, 6, 8, 5] },
  { id: '3', name: 'Zoe HD',       accent: 'Australian English', gender: 'Female',    barHeights: [4, 7, 5, 8, 6, 9, 4, 7, 5, 8, 4, 6] },
  { id: '4', name: 'Leo Studio',   accent: 'American English',  gender: 'Male',       barHeights: [6, 4, 8, 5, 9, 3, 7, 5, 8, 4, 7, 5] },
  { id: '5', name: 'Mia Warm',     accent: 'Canadian English',  gender: 'Female',     barHeights: [3, 5, 8, 4, 6, 9, 4, 7, 5, 8, 3, 6] },
  { id: '6', name: 'Kai Dynamic',  accent: 'Neutral English',   gender: 'Non-binary', barHeights: [7, 5, 9, 4, 8, 5, 7, 3, 9, 6, 4, 8] },
];

const INITIAL_CUSTOM_VOICES: CustomVoice[] = [
  { id: '1', voiceId: 'pNInz6obpgDQGcFmaJgB', nickname: 'My Brand Voice', status: 'validated', source: 'clone' },
  { id: '2', voiceId: 'male-qn-qingse',        nickname: 'Deep Tone',      status: 'pending',   source: 'manual' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.38 } },
};

const inputClass =
  'bg-[#050507] border border-white/[0.08] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00D4FF]/60 transition-colors w-full text-sm placeholder-[#52525B]';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const genderColor = (g: PlatformVoice['gender']) =>
  g === 'Female' ? 'text-[#F472B6]' : g === 'Male' ? 'text-[#60A5FA]' : 'text-[#A78BFA]';

const truncateId = (id: string) =>
  id.length > 22 ? id.slice(0, 9) + '…' + id.slice(-7) : id;

// ─── Animated Waveform ────────────────────────────────────────────────────────

function Waveform({ heights, playing }: { heights: number[]; playing: boolean }) {
  return (
    <div className="flex items-end gap-[3px] h-8">
      {heights.map((h, i) => (
        <div
          key={i}
          className={cn(
            'w-[3px] rounded-full transition-colors duration-300',
            playing ? 'bg-gradient-to-t from-[#8A2BE2] to-[#00D4FF]' : 'bg-[#00D4FF]/30'
          )}
          style={{
            height: `${h * 3}px`,
            ...(playing ? { animation: `waveAnim 0.7s ease-in-out ${i * 0.055}s infinite alternate` } : {}),
          }}
        />
      ))}
      <style>{`@keyframes waveAnim { from { transform: scaleY(0.35); } to { transform: scaleY(1); } }`}</style>
    </div>
  );
}

// ─── Platform Voice Card ──────────────────────────────────────────────────────

function PlatformVoiceCard({ voice }: { voice: PlatformVoice }) {
  const [playing, setPlaying] = useState(false);

  const handlePlay = () => {
    setPlaying((p) => !p);
    if (!playing) setTimeout(() => setPlaying(false), 3000);
  };

  return (
    <motion.div variants={itemVariants} className="glass rounded-2xl p-4 flex flex-col gap-3 hover:bg-white/[0.02] transition-all">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-white">{voice.name}</h3>
          <p className="text-xs text-[#52525B] mt-0.5">{voice.accent}</p>
        </div>
        <span className={cn('text-[10px] font-semibold shrink-0 mt-0.5', genderColor(voice.gender))}>
          {voice.gender}
        </span>
      </div>

      <Waveform heights={voice.barHeights} playing={playing} />

      <div className="flex items-center gap-2">
        <button
          onClick={handlePlay}
          className={cn(
            'w-8 h-8 rounded-full border flex items-center justify-center transition-all shrink-0',
            playing
              ? 'bg-[#00D4FF] border-[#00D4FF] text-[#050507]'
              : 'bg-[#00D4FF]/10 border-[#00D4FF]/20 text-[#00D4FF] hover:bg-[#00D4FF]/20'
          )}
        >
          {playing ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 ml-0.5" />}
        </button>
        <Link
          href="/create"
          className="flex-1 py-1.5 rounded-xl bg-[rgba(0,212,255,0.08)] border border-[#00D4FF]/20 text-[#00D4FF] text-xs font-semibold hover:bg-[rgba(0,212,255,0.15)] transition-all text-center"
        >
          Use
        </Link>
      </div>
    </motion.div>
  );
}

// ─── Custom Voice Row ─────────────────────────────────────────────────────────

function CustomVoiceRow({ voice, onDelete }: { voice: CustomVoice; onDelete: () => void }) {
  const [playing, setPlaying] = useState(false);
  const canPlay = voice.status === 'validated';

  const handlePlay = () => {
    if (!canPlay) return;
    setPlaying((p) => !p);
    if (!playing) setTimeout(() => setPlaying(false), 3000);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.25 }}
      className="glass rounded-xl px-4 py-3.5 flex items-center gap-3"
    >
      {/* Play */}
      <button
        onClick={handlePlay}
        disabled={!canPlay}
        className={cn(
          'w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-all',
          canPlay
            ? playing
              ? 'bg-[#8A2BE2] border-[#8A2BE2] text-white'
              : 'bg-[#8A2BE2]/10 border-[#8A2BE2]/20 text-[#8A2BE2] hover:bg-[#8A2BE2]/20'
            : 'bg-white/[0.03] border-white/[0.06] text-[#3F3F46] cursor-not-allowed'
        )}
      >
        {playing ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 ml-0.5" />}
      </button>

      {/* Source badge */}
      <span className={cn(
        'px-2.5 py-1 rounded-full text-[10px] font-bold border shrink-0',
        voice.source === 'clone'
          ? 'bg-[#8A2BE2]/10 border-[#8A2BE2]/20 text-[#8A2BE2]'
          : 'bg-orange-500/10 border-orange-500/20 text-orange-400'
      )}>
        {voice.source === 'clone' ? 'Cloned' : 'Manual ID'}
      </span>

      {/* Voice ID */}
      <span className="text-xs text-[#52525B] font-mono shrink-0 hidden sm:block">
        {truncateId(voice.voiceId)}
      </span>

      {/* Nickname */}
      <span className="text-sm font-medium text-white flex-1 truncate">{voice.nickname}</span>

      {/* Status */}
      <span className={cn(
        'flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold border shrink-0',
        voice.status === 'validated'
          ? 'bg-[#22C55E]/10 border-[#22C55E]/20 text-[#22C55E]'
          : voice.status === 'validating' || voice.status === 'cloning'
            ? 'bg-[#00D4FF]/10 border-[#00D4FF]/20 text-[#00D4FF]'
            : 'bg-[#FBBF24]/10 border-[#FBBF24]/20 text-[#FBBF24]'
      )}>
        {voice.status === 'validated'  && <><Check className="w-3 h-3" /> Validated</>}
        {voice.status === 'validating' && <><Loader2 className="w-3 h-3 animate-spin" /> Validating…</>}
        {voice.status === 'cloning'    && <><Loader2 className="w-3 h-3 animate-spin" /> Cloning…</>}
        {voice.status === 'pending'    && <><AlertCircle className="w-3 h-3" /> Pending</>}
      </span>

      {/* Delete */}
      <button
        onClick={onDelete}
        className="w-8 h-8 rounded-lg glass flex items-center justify-center text-[#52525B] hover:text-[#EF4444] transition-colors shrink-0"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

// ─── Custom Voices Empty State ────────────────────────────────────────────────

function CustomEmptyState() {
  return (
    <div className="flex flex-col items-center gap-2 py-6 text-center">
      <MicOff className="w-7 h-7 text-[#3F3F46]" />
      <p className="text-sm text-[#52525B]">No custom voices added yet.</p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function VoicesPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [customVoices, setCustomVoices] = useState<CustomVoice[]>(INITIAL_CUSTOM_VOICES);
  const [addMode, setAddMode]           = useState<AddMode>('clone');

  // Paste ID form
  const [newVoiceId, setNewVoiceId]   = useState('');
  const [newNickname, setNewNickname] = useState('');
  const [formError, setFormError]     = useState('');

  // Clone form
  const [cloneName, setCloneName]         = useState('');
  const [audioFile, setAudioFile]         = useState<File | null>(null);
  const [audioDragging, setAudioDragging] = useState(false);
  const [cloneError, setCloneError]       = useState('');

  const addVoice = (voice: CustomVoice, delay: number, finalStatus: ValidationStatus) => {
    setCustomVoices((prev) => [...prev, voice]);
    setTimeout(() => {
      setCustomVoices((prev) =>
        prev.map((v) => v.id === voice.id ? { ...v, status: finalStatus } : v)
      );
    }, delay);
  };

  const handleAddById = () => {
    if (!newVoiceId.trim()) { setFormError('Voice ID is required.'); return; }
    setFormError('');
    const v: CustomVoice = {
      id: crypto.randomUUID(), voiceId: newVoiceId.trim(),
      nickname: newNickname.trim() || 'Custom Voice', status: 'validating', source: 'manual',
    };
    addVoice(v, 2500, 'validated');
    setNewVoiceId(''); setNewNickname('');
  };

  const handleAudioFile = (file: File) => {
    if (!file.type.startsWith('audio/')) { setCloneError('File must be an audio file (MP3 or WAV).'); return; }
    if (file.size > 25 * 1024 * 1024) { setCloneError('File size must be under 25MB.'); return; }
    setCloneError(''); setAudioFile(file);
  };

  const handleCloneVoice = () => {
    if (!cloneName.trim()) { setCloneError('Voice name is required.'); return; }
    if (!audioFile) { setCloneError('Please upload an audio sample first.'); return; }
    setCloneError('');
    const id = crypto.randomUUID();
    const v: CustomVoice = {
      id, voiceId: 'el_' + id.slice(0, 12),
      nickname: cloneName.trim(), status: 'cloning', source: 'clone',
    };
    addVoice(v, 4000, 'validated');
    setCloneName(''); setAudioFile(null);
  };

  const handleDelete = (id: string) => {
    setCustomVoices((prev) => prev.filter((v) => v.id !== id));
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-6xl mx-auto flex flex-col gap-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-white">Voice Library</h1>
        <p className="text-sm text-[#52525B] mt-1">
          Choose from platform voices or add a custom voice via cloning or manual ID.
        </p>
      </motion.div>

      {/* ── Platform Voices ── */}
      <motion.section variants={itemVariants} className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Platform Voices</h2>
          <span className="text-xs text-[#52525B]">{PLATFORM_VOICES.length} voices · ElevenLabs</span>
        </div>
        <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PLATFORM_VOICES.map((voice) => (
            <PlatformVoiceCard key={voice.id} voice={voice} />
          ))}
        </motion.div>
      </motion.section>

      {/* ── Custom Voices ── */}
      <motion.section variants={itemVariants} className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Your Voices</h2>
          {customVoices.length > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs text-[#52525B]">
              {customVoices.length} saved
            </span>
          )}
        </div>

        <AnimatePresence mode="popLayout">
          {customVoices.length === 0 ? (
            <CustomEmptyState />
          ) : (
            customVoices.map((cv) => (
              <CustomVoiceRow key={cv.id} voice={cv} onDelete={() => handleDelete(cv.id)} />
            ))
          )}
        </AnimatePresence>

        {/* ── Add Voice Card ── */}
        <div className="glass rounded-2xl p-5 flex flex-col gap-4 mt-1">
          {/* Mode toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setAddMode('clone'); setFormError(''); setCloneError(''); }}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all',
                addMode === 'clone'
                  ? 'bg-[#8A2BE2]/10 border-[#8A2BE2]/30 text-[#8A2BE2]'
                  : 'border-white/[0.08] text-[#52525B] hover:text-white'
              )}
            >
              <Wand2 className="w-3.5 h-3.5" />
              Clone Voice
            </button>
            <button
              onClick={() => { setAddMode('id'); setFormError(''); setCloneError(''); }}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all',
                addMode === 'id'
                  ? 'bg-[#00D4FF]/10 border-[#00D4FF]/30 text-[#00D4FF]'
                  : 'border-white/[0.08] text-[#52525B] hover:text-white'
              )}
            >
              <Hash className="w-3.5 h-3.5" />
              Paste Voice ID
            </button>
          </div>

          <AnimatePresence mode="wait">
            {addMode === 'clone' ? (
              <motion.div
                key="clone"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="flex flex-col gap-3"
              >
                <p className="text-xs text-[#52525B] leading-relaxed">
                  Upload a clear audio sample (30s–3min) and we'll clone it into a reusable voice using ElevenLabs.
                </p>

                {/* Audio dropzone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setAudioDragging(true); }}
                  onDragLeave={() => setAudioDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setAudioDragging(false); const f = e.dataTransfer.files[0]; if (f) handleAudioFile(f); }}
                  className={cn(
                    'relative w-full h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all gap-1.5',
                    audioDragging
                      ? 'border-[#8A2BE2]/60 bg-[#8A2BE2]/[0.04]'
                      : audioFile
                        ? 'border-[#22C55E]/40 bg-[#22C55E]/[0.04]'
                        : 'border-white/[0.10] hover:border-[#8A2BE2]/40 hover:bg-[#8A2BE2]/[0.02]'
                  )}
                >
                  {audioFile ? (
                    <>
                      <Check className="w-5 h-5 text-[#22C55E]" />
                      <p className="text-xs text-[#22C55E] font-medium">{audioFile.name}</p>
                      <p className="text-[10px] text-[#52525B]">Click to replace</p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-[#52525B]" />
                      <p className="text-xs text-[#A1A1AA] font-medium">Drag & drop or click to upload</p>
                      <p className="text-[10px] text-[#3F3F46]">MP3, WAV · Max 25MB · 30s–3min recommended</p>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/mpeg,audio/wav,audio/*"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAudioFile(f); }}
                />

                <input
                  className={inputClass}
                  placeholder="Voice name (e.g. Sofia Brand Voice)"
                  value={cloneName}
                  onChange={(e) => { setCloneName(e.target.value); setCloneError(''); }}
                />

                {cloneError && <p className="text-xs text-[#EF4444]">{cloneError}</p>}

                <div className="flex justify-end">
                  <button
                    onClick={handleCloneVoice}
                    className="btn-neon flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
                  >
                    <Wand2 className="w-4 h-4" />
                    Clone Voice
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="id"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="flex flex-col gap-3"
              >
                <p className="text-xs text-[#52525B] leading-relaxed">
                  Paste an existing ElevenLabs Voice ID to use a voice you've already created on their platform.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    className={inputClass}
                    placeholder="ElevenLabs Voice ID"
                    value={newVoiceId}
                    onChange={(e) => { setNewVoiceId(e.target.value); setFormError(''); }}
                  />
                  <input
                    className={inputClass}
                    placeholder="Nickname (optional)"
                    value={newNickname}
                    onChange={(e) => setNewNickname(e.target.value)}
                  />
                </div>

                {formError && <p className="text-xs text-[#EF4444]">{formError}</p>}

                <div className="flex justify-end">
                  <button
                    onClick={handleAddById}
                    className="btn-neon flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
                  >
                    <Plus className="w-4 h-4" />
                    Validate &amp; Save
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.section>
    </motion.div>
  );
}
