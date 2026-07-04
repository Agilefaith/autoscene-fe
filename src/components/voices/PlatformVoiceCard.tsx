'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Pause, Play } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { itemVariants } from '@/lib/animations';
import { API_URL } from '@/lib/api';
import { Waveform } from './Waveform';
import { waveHeights } from './waveUtils';
import type { PresetVoice } from '@/types/voice';

const GENDER_COLOR: Record<PresetVoice['gender'], string> = {
  female: 'text-[#F472B6]',
  male: 'text-[#60A5FA]',
  'non-binary': 'text-[#A78BFA]',
};

const GENDER_LABEL: Record<PresetVoice['gender'], string> = {
  female: 'Female',
  male: 'Male',
  'non-binary': 'Non-binary',
};

interface PlatformVoiceCardProps {
  voice: PresetVoice;
}

export function PlatformVoiceCard({ voice }: PlatformVoiceCardProps) {
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const heights  = waveHeights(voice.id);

  const handlePlay = async () => {
    if (playing && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlaying(false);
      return;
    }

    setError(false);
    setLoading(true);

    try {
      const previewUrl = `${API_URL}/api/voices/preview/${voice.id}`;

      if (!audioRef.current || audioRef.current.src !== previewUrl) {
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

  return (
    <motion.div
      variants={itemVariants}
      className="glass rounded-2xl p-4 flex flex-col gap-3 hover:bg-surface-muted transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-text">{voice.name}</h3>
          <p className="text-xs text-text-muted mt-0.5">{voice.accent}</p>
        </div>
        <span className={cn('text-[10px] font-semibold shrink-0 mt-0.5', GENDER_COLOR[voice.gender])}>
          {GENDER_LABEL[voice.gender]}
        </span>
      </div>

      <Waveform heights={heights} playing={playing} />

      <div className="flex items-center gap-2">
        <button
          onClick={handlePlay}
          disabled={loading}
          title={error ? 'Preview unavailable' : playing ? 'Stop' : 'Play preview'}
          className={cn(
            'w-8 h-8 rounded-full border flex items-center justify-center transition-all shrink-0',
            error
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
        <Link
          href="/create"
          className="flex-1 py-1.5 rounded-xl bg-[rgba(0,212,255,0.08)] border border-[#7C3AED]/20 text-[#7C3AED] text-xs font-semibold hover:bg-[rgba(0,212,255,0.15)] transition-all text-center"
        >
          Use
        </Link>
      </div>
    </motion.div>
  );
}
