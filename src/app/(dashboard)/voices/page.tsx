'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Check, Hash, Loader2, Mic, MicOff, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { containerVariants, itemVariants } from '@/lib/animations';
import { inputClass } from '@/lib/styles';
import { authedFetch, API_URL } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { PlatformVoiceCard } from '@/components/voices/PlatformVoiceCard';
import { SavedVoiceRow } from '@/components/voices/SavedVoiceRow';
import { PresetSkeleton, SavedSkeleton } from '@/components/voices/VoiceSkeletons';
import { useConfirm, useToast } from '@/components/ui/ConfirmProvider';
import type { PresetVoice, SavedVoice, ValidateResult } from '@/types/voice';

export default function VoicesPage() {
  const { user } = useAuth();
  const confirm = useConfirm();
  const toast = useToast();

  const [presets, setPresets]               = useState<PresetVoice[]>([]);
  const [savedVoices, setSavedVoices]       = useState<SavedVoice[]>([]);
  const [loadingPresets, setLoadingPresets] = useState(true);
  const [loadingSaved, setLoadingSaved]     = useState(true);

  const [voiceId, setVoiceId]       = useState('');
  const [nickname, setNickname]     = useState('');
  const [provider, setProvider]     = useState<'elevenlabs' | 'minimax'>('elevenlabs');
  const [formError, setFormError]   = useState('');
  const [validating, setValidating] = useState(false);
  const [saving, setSaving]         = useState(false);
  const [validated, setValidated]   = useState<ValidateResult | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/voices/preset`)
      .then((r) => r.ok ? r.json() : [])
      .then(setPresets)
      .catch(() => {})
      .finally(() => setLoadingPresets(false));
  }, []);

  const fetchSaved = useCallback(async () => {
    if (!user) return;
    setLoadingSaved(true);
    try {
      const res = await authedFetch('/api/voices');
      if (res.ok) setSavedVoices(await res.json());
    } finally {
      setLoadingSaved(false);
    }
  }, [user]);

  useEffect(() => { fetchSaved(); }, [fetchSaved]);

  const handleValidate = async () => {
    if (!voiceId.trim()) { setFormError('Voice ID is required.'); return; }
    setFormError('');
    setValidated(null);
    setValidating(true);
    try {
      const res = await authedFetch('/api/voices/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voice_id: voiceId.trim(), provider }),
      });
      if (!res.ok) { setFormError('Validation failed. Check the voice ID.'); return; }
      const result: ValidateResult = await res.json();
      if (!result.valid) {
        setFormError('Voice ID not found. Make sure it exists in ElevenLabs.');
        return;
      }
      setValidated(result);
      if (result.name && !nickname.trim()) setNickname(result.name);
    } catch {
      setFormError('Network error. Check your connection.');
    } finally {
      setValidating(false);
    }
  };

  const handleSave = async () => {
    if (!validated) return;
    if (!nickname.trim()) { setFormError('Please give this voice a nickname.'); return; }
    setSaving(true);
    try {
      const res = await authedFetch('/api/voices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nickname.trim(),
          provider: validated.provider,
          voice_id: validated.voice_id,
          is_custom: true,
          validated: true,
        }),
      });
      if (!res.ok) { setFormError('Failed to save voice.'); return; }
      const created: SavedVoice = await res.json();
      setSavedVoices((prev) => [created, ...prev]);
      setVoiceId('');
      setNickname('');
      setValidated(null);
      setFormError('');
    } catch {
      setFormError('Network error. Check your connection.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: 'Remove voice?',
      message: 'This removes the saved voice from your library.',
      confirmLabel: 'Remove', variant: 'danger',
    });
    if (!ok) return;
    setSavedVoices((prev) => prev.filter((v) => v.id !== id));
    try { await authedFetch(`/api/voices/${id}`, { method: 'DELETE' }); toast('Voice removed'); }
    catch { fetchSaved(); toast('Failed to remove voice', 'error'); }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-7xl mx-auto flex flex-col gap-8"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-text">Voice Library</h1>
        <p className="text-sm text-text-muted mt-1">
          Choose from platform voices or connect a custom voice using your Voice ID.
        </p>
      </motion.div>

      <motion.section variants={itemVariants} className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-text">Platform Voices</h2>
          {!loadingPresets && (
            <span className="text-xs text-text-muted">{presets.length} voices available</span>
          )}
        </div>

        {loadingPresets ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <PresetSkeleton key={i} />)}
          </div>
        ) : presets.length === 0 ? (
          <div className="glass rounded-2xl p-10 flex flex-col items-center gap-3 text-center">
            <Mic className="w-8 h-8 text-[#3F3F46]" />
            <p className="text-sm text-text-muted">Could not load platform voices.</p>
          </div>
        ) : (
          <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {presets.map((voice) => (
              <PlatformVoiceCard key={voice.id} voice={voice} />
            ))}
          </motion.div>
        )}
      </motion.section>

      <motion.section variants={itemVariants} className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-text">Your Voices</h2>
          {!loadingSaved && savedVoices.length > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-surface-muted border border-border text-xs text-text-muted">
              {savedVoices.length} saved
            </span>
          )}
        </div>

        {loadingSaved ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 2 }).map((_, i) => <SavedSkeleton key={i} />)}
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {savedVoices.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-2 py-6 text-center"
              >
                <MicOff className="w-7 h-7 text-[#3F3F46]" />
                <p className="text-sm text-text-muted">No custom voices saved yet.</p>
              </motion.div>
            ) : (
              savedVoices.map((v) => (
                <SavedVoiceRow key={v.id} voice={v} onDelete={() => handleDelete(v.id)} />
              ))
            )}
          </AnimatePresence>
        )}

        <div className="glass rounded-2xl p-5 flex flex-col gap-4 mt-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-[#7C3AED]" />
              <h3 className="text-sm font-semibold text-text">Add Custom Voice</h3>
            </div>
            <div className="flex items-center gap-1 bg-white border border-border rounded-xl px-1.5 h-9">
              {(['elevenlabs', 'minimax'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => { setProvider(p); setValidated(null); setFormError(''); }}
                  className={cn(
                    'px-3 h-7 rounded-lg text-[11px] font-semibold transition-all',
                    provider === p ? 'bg-[#7C3AED]/10 text-[#7C3AED]' : 'text-text-muted hover:text-text'
                  )}
                >
                  {p === 'elevenlabs' ? 'ElevenLabs' : 'Minimax'}
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs text-text-muted leading-relaxed -mt-1">
            Paste your Voice ID below. You can find it in your voice provider account under your saved voices.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-secondary">Voice ID</label>
              <input
                className={inputClass}
                placeholder="Paste your Voice ID here"
                value={voiceId}
                onChange={(e) => { setVoiceId(e.target.value); setValidated(null); setFormError(''); }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-secondary">
                Nickname{' '}
                {!validated && <span className="text-[#3F3F46]">(auto-filled after validate)</span>}
              </label>
              <input
                className={inputClass}
                placeholder="e.g. My Brand Voice"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
            </div>
          </div>

          {validated && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#22C55E]/[0.08] border border-[#22C55E]/20"
            >
              <Check className="w-4 h-4 text-[#22C55E] shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#22C55E]">
                  Voice found{validated.name ? `: "${validated.name}"` : ''}
                </p>
                <p className="text-[10px] text-text-muted mt-0.5">
                  Confirm the nickname and save to your library.
                </p>
              </div>
            </motion.div>
          )}

          {formError && (
            <p className="flex items-center gap-1.5 text-xs text-[#EF4444]">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {formError}
            </p>
          )}

          <div className="flex justify-end gap-2">
            {!validated ? (
              <button
                onClick={handleValidate}
                disabled={validating}
                className="btn-neon flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
              >
                {validating
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Validating…</>
                  : <><Check className="w-4 h-4" /> Validate ID</>
                }
              </button>
            ) : (
              <>
                <button
                  onClick={() => { setValidated(null); setFormError(''); }}
                  className="px-4 py-2.5 rounded-xl border border-border text-sm font-semibold text-text-secondary hover:text-text transition-all"
                >
                  Reset
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-neon flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
                >
                  {saving
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                    : <><Plus className="w-4 h-4" /> Save Voice</>
                  }
                </button>
              </>
            )}
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}
