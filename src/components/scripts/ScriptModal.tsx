'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlignLeft, Clock, Hash, Loader2, X, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { modalVariants } from '@/lib/animations';
import { inputClassPurple, selectClassPurple } from '@/lib/styles';
import { authedFetch } from '@/lib/api';
import { GOAL_OPTIONS, STYLE_OPTIONS } from '@/data/scriptOptions';
import type { GeneratePreview, Script, ScriptMode } from '@/types/script';

interface ScriptModalProps {
  initial?: Script;
  onClose: () => void;
  onCreated: (s: Script) => void;
  onUpdated: (s: Script) => void;
}

export function ScriptModal({ initial, onClose, onCreated, onUpdated }: ScriptModalProps) {
  const isEdit = !!initial;
  // Custom scripts are immutable (backend returns 403 on edit) — view-only.
  const isLocked = isEdit && !!initial?.is_locked;

  const [mode, setMode]       = useState<ScriptMode>(initial?.generation_mode ?? 'ai');
  const [title, setTitle]     = useState(initial?.title ?? '');
  const [error, setError]     = useState('');
  const [saving, setSaving]   = useState(false);

  const [productName, setProductName] = useState(initial?.product_name ?? '');
  const [audience, setAudience]       = useState(initial?.target_audience ?? '');
  const [tone, setTone]               = useState(initial?.tone ?? '');
  const [goal, setGoal]               = useState(initial?.goal ?? 'sales');
  const [style, setStyle]             = useState(initial?.style ?? 'ugc');
  const [generating, setGenerating]   = useState(false);
  const [preview, setPreview]         = useState<GeneratePreview | null>(null);

  const [content, setContent] = useState(initial?.content ?? '');

  const handleGenerate = async () => {
    if (!title.trim())       { setError('Video title is required.'); return; }
    if (!productName.trim()) { setError('Product name is required.'); return; }
    if (!audience.trim())    { setError('Target audience is required.'); return; }
    if (!tone.trim())        { setError('Tone is required.'); return; }
    setError('');
    setGenerating(true);
    try {
      const res = await authedFetch('/api/scripts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          product_name: productName.trim(),
          target_audience: audience.trim(),
          tone: tone.trim(),
          goal,
          style,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.detail ?? 'Failed to generate script. Try again.');
        return;
      }
      setPreview(await res.json());
    } catch {
      setError('Network error. Check your connection.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (isLocked) { setError('Custom scripts are immutable and cannot be edited.'); return; }
    if (!title.trim()) { setError('Title is required.'); return; }

    if (isEdit) {
      setSaving(true);
      try {
        const payload: Record<string, string> = { title: title.trim() };
        if (content.trim() !== initial!.content) payload.content = content.trim();
        const res = await authedFetch(`/api/scripts/${initial!.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data?.detail ?? 'Failed to update script.');
          return;
        }
        onUpdated(await res.json());
        onClose();
      } catch {
        setError('Network error. Check your connection.');
      } finally {
        setSaving(false);
      }
      return;
    }

    if (mode === 'ai' && !preview) { setError('Generate the script first.'); return; }
    if (mode === 'custom' && !content.trim()) { setError('Script content is required.'); return; }

    setSaving(true);
    try {
      const body =
        mode === 'ai'
          ? {
              title: title.trim(),
              content: preview!.content,
              mode: 'ai',
              product_name: productName.trim(),
              target_audience: audience.trim(),
              tone: tone.trim(),
              goal,
              style,
            }
          : { title: title.trim(), content: content.trim(), mode: 'custom' };

      const res = await authedFetch('/api/scripts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.detail ?? 'Failed to save script.');
        return;
      }
      onCreated(await res.json());
      onClose();
    } catch {
      setError('Network error. Check your connection.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="show"
        exit="exit"
        className="relative w-full max-w-lg bg-white rounded-2xl border border-border p-6 flex flex-col gap-5 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-text">{isEdit ? 'Edit Script' : 'New Script'}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg glass flex items-center justify-center text-text-muted hover:text-text transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!isEdit && (
          <div className="flex gap-2">
            <button
              onClick={() => { setMode('ai'); setPreview(null); setError(''); }}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold border transition-all',
                mode === 'ai'
                  ? 'bg-[#7C3AED]/10 border-[#7C3AED]/40 text-[#7C3AED]'
                  : 'border-border text-text-muted hover:text-text'
              )}
            >
              <Zap className="w-3.5 h-3.5" /> AI Generated
            </button>
            <button
              onClick={() => { setMode('custom'); setPreview(null); setError(''); }}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold border transition-all',
                mode === 'custom'
                  ? 'bg-[#7C3AED]/10 border-[#7C3AED]/40 text-[#7C3AED]'
                  : 'border-border text-text-muted hover:text-text'
              )}
            >
              <AlignLeft className="w-3.5 h-3.5" /> Custom Script
            </button>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-text-secondary">
            {mode === 'ai' ? 'Video Title' : 'Script Title'}
          </label>
          <input
            className={inputClassPurple}
            placeholder={mode === 'ai' ? 'e.g. Skincare Morning Routine Ad…' : 'e.g. Product Launch Script…'}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {mode === 'ai' && !isEdit && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-text-secondary">Product Name</label>
                <input
                  className={inputClassPurple}
                  placeholder="e.g. GlowSerum Pro"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-text-secondary">Target Audience</label>
                <input
                  className={inputClassPurple}
                  placeholder="e.g. Women 18–35"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-secondary">Tone</label>
              <input
                className={inputClassPurple}
                placeholder="e.g. Energetic, casual, authoritative…"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-text-secondary">Goal</label>
                <select className={selectClassPurple} value={goal} onChange={(e) => setGoal(e.target.value)}>
                  {GOAL_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-text-secondary">Style</label>
                <select className={selectClassPurple} value={style} onChange={(e) => setStyle(e.target.value)}>
                  {STYLE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            {!preview && (
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#7C3AED]/10 border border-[#7C3AED]/30 text-[#7C3AED] text-sm font-semibold hover:bg-[#7C3AED]/20 transition-all disabled:opacity-50"
              >
                {generating
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
                  : <><Zap className="w-4 h-4" /> Generate Script</>
                }
              </button>
            )}

            {preview && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-text-secondary">Generated Script</label>
                  <div className="flex items-center gap-3 text-[10px] text-text-muted">
                    <span className="flex items-center gap-1">
                      <Hash className="w-3 h-3" /> {preview.word_count} words
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> ~{Math.round(preview.estimated_duration_seconds)}s
                    </span>
                    <button onClick={() => setPreview(null)} className="text-[#7C3AED] hover:underline">
                      Regenerate
                    </button>
                  </div>
                </div>
                <textarea
                  readOnly
                  value={preview.content}
                  className={cn(inputClassPurple, 'min-h-[120px] resize-none leading-relaxed opacity-80 cursor-default')}
                />
              </div>
            )}
          </>
        )}

        {mode === 'custom' && !isEdit && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-secondary">Script Content</label>
            <textarea
              className={cn(inputClassPurple, 'min-h-[160px] resize-none leading-relaxed')}
              placeholder="Paste or type your script here…"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
        )}

        {isEdit && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-secondary">Script Content</label>
            {isLocked && (
              <p className="text-[11px] text-text-secondary bg-surface-muted border border-border rounded-lg px-3 py-2">
                This is a custom script. Custom scripts are <span className="text-text font-medium">immutable</span> and can’t be edited.
              </p>
            )}
            <textarea
              readOnly={isLocked}
              className={cn(
                inputClassPurple, 'min-h-[160px] resize-none leading-relaxed',
                isLocked && 'opacity-80 cursor-default',
              )}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
        )}

        {error && <p className="text-xs text-[#EF4444]">{error}</p>}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold text-text-secondary hover:text-text hover:border-white/20 transition-all"
          >
            {isLocked ? 'Close' : 'Cancel'}
          </button>
          {!isLocked && (
            <button
              onClick={handleSave}
              disabled={saving || (mode === 'ai' && !isEdit && !preview)}
              className="flex-1 btn-neon py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-40"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEdit ? 'Save Changes' : 'Save Script'}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
