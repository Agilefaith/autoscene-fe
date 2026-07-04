'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Check, Loader2, Pause, Play, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { API_URL } from '@/lib/api';
import { Waveform } from './Waveform';
import { waveHeights } from './waveUtils';
import type { SavedVoice } from '@/types/voice';

const PROVIDER_STYLE: Record<string, string> = {
  elevenlabs: 'bg-[#7C3AED]/10 border-[#7C3AED]/20 text-[#7C3AED]',
  minimax:    'bg-orange-500/10 border-orange-500/20 text-orange-400',
};

const PROVIDER_LABEL: Record<string, string> = {
  elevenlabs: 'ElevenLabs',
  minimax:    'Minimax',
};

function truncateId(id: string) {
  return id.length > 22 ? id.slice(0, 9) + '…' + id.slice(-7) : id;
}

interface SavedVoiceRowProps {
  voice: SavedVoice;
  onDelete: () => void;
}

export function SavedVoiceRow({ voice, onDelete }: SavedVoiceRowProps) {
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const heights  = waveHeights(voice.voice_id);

  const canPreview = voice.validated;

  const previewUrl =
    voice.provider === 'minimax'
      ? `${API_URL}/api/voices/preview/minimax/${voice.voice_id}`
      : `${API_URL}/api/voices/preview/${voice.voice_id}`;

  const handlePlay = async () => {
    if (!canPreview) return;

    if (playing && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlaying(false);
      return;
    }

    setError(false);
    setLoading(true);

    try {
      if (!audioRef.current || !audioRef.current.src.endsWith(voice.voice_id)) {
        const audio = new Audio(previewUrl);
        audio.onended   = () => setPlaying(false);
        audio.onerror   = () => { setPlaying(false); setLoading(false); setError(true); };
        audio.oncanplay = () => setLoading(false);
        audioRef.current = audio;
      }

      await audioRef.current.play();
      setPlaying(true);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const btnDisabled = !canPreview || loading;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.25 }}
      className="glass rounded-xl px-4 py-3.5 flex items-center gap-3"
    >
      <button
        onClick={handlePlay}
        disabled={btnDisabled}
        title={
          !voice.validated
            ? 'Voice not validated'
            : error
              ? 'Preview unavailable'
              : playing
                ? 'Stop'
                : 'Play preview'
        }
        className={cn(
          'w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-all',
          !canPreview || error
            ? 'bg-surface-muted border-border text-[#3F3F46] cursor-not-allowed'
            : playing
              ? 'bg-[#7C3AED] border-[#7C3AED] text-white'
              : loading
                ? 'bg-[#7C3AED]/10 border-[#7C3AED]/20 text-[#7C3AED] cursor-wait'
                : 'bg-[#7C3AED]/10 border-[#7C3AED]/20 text-[#7C3AED] hover:bg-[#7C3AED]/20'
        )}
      >
        {loading
          ? <Loader2 className="w-3 h-3 animate-spin" />
          : playing
            ? <Pause className="w-3 h-3" />
            : <Play className="w-3 h-3 ml-0.5" />
        }
      </button>

      {playing && (
        <div className="hidden sm:block">
          <Waveform heights={heights} playing={playing} color="#7C3AED" />
        </div>
      )}

      <span className={cn(
        'px-2.5 py-1 rounded-full text-[10px] font-bold border shrink-0',
        PROVIDER_STYLE[voice.provider] ?? 'bg-surface-muted border-border text-text-muted'
      )}>
        {PROVIDER_LABEL[voice.provider] ?? voice.provider}
      </span>

      <span className="text-xs text-text-muted font-mono shrink-0 hidden sm:block">
        {truncateId(voice.voice_id)}
      </span>

      <span className="text-sm font-medium text-text flex-1 truncate">{voice.name}</span>

      <span className={cn(
        'flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold border shrink-0',
        voice.validated
          ? 'bg-[#22C55E]/10 border-[#22C55E]/20 text-[#22C55E]'
          : 'bg-[#FBBF24]/10 border-[#FBBF24]/20 text-[#FBBF24]'
      )}>
        {voice.validated
          ? <><Check className="w-3 h-3" /> Validated</>
          : <><AlertCircle className="w-3 h-3" /> Pending</>
        }
      </span>

      <button
        onClick={onDelete}
        className="w-8 h-8 rounded-lg glass flex items-center justify-center text-text-muted hover:text-[#EF4444] transition-colors shrink-0"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}
