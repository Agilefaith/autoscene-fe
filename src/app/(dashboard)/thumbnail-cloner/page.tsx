'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle, Download, Film, Images, Loader2, Sparkles, UploadCloud, X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { containerVariants, itemVariants } from '@/lib/animations';
import { authedFetch, authedJson } from '@/lib/api';

interface ProjectRow {
  id: string;
  name: string;
  status: string;
  thumbnail_urls?: string[] | null;
}

const POLL_MS = 5000;
const POLL_LIMIT = 36; // ~3 minutes

export default function ThumbnailClonerPage() {
  const [tab, setTab] = useState<'project' | 'clone'>('project');

  // ── From a project ──
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [selectedId, setSelectedId] = useState('');
  const [generating, setGenerating] = useState(false);
  const [thumbs, setThumbs] = useState<string[]>([]);
  const [error, setError] = useState('');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Clone a reference ──
  const [refFile, setRefFile] = useState<File | null>(null);
  const [refPreview, setRefPreview] = useState<string | null>(null);
  // Optional second reference: a face to feature in the cloned thumbnail
  // (Faith, 2026-08-11). Nothing else about the clone flow changes.
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [instructions, setInstructions] = useState('');
  const [cloning, setCloning] = useState(false);
  const [cloneUrl, setCloneUrl] = useState<string | null>(null);
  const [cloneError, setCloneError] = useState('');

  useEffect(() => {
    authedJson<ProjectRow[]>('/api/projects?limit=50')
      .then((rows) => setProjects(rows.filter((p) => p.status === 'completed')))
      .catch(() => {})
      .finally(() => setLoadingProjects(false));
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const selected = projects.find((p) => p.id === selectedId) ?? null;

  const handleGenerate = async () => {
    if (!selected) return;
    setError(''); setThumbs([]); setGenerating(true);
    try {
      const res = await authedFetch(`/api/thumbnails/projects/${selected.id}`, { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data?.detail ?? 'Failed to start generation.'); setGenerating(false); return; }
      if (data.status === 'ready' && data.thumbnail_urls?.length) {
        setThumbs(data.thumbnail_urls); setGenerating(false); return;
      }
      // Queued — poll the project until thumbnail_urls fills.
      let ticks = 0;
      pollRef.current = setInterval(async () => {
        ticks += 1;
        try {
          const p = await authedJson<ProjectRow>(`/api/projects/${selected.id}`);
          if (p.thumbnail_urls?.length) {
            setThumbs(p.thumbnail_urls); setGenerating(false);
            if (pollRef.current) clearInterval(pollRef.current);
          }
        } catch { /* keep polling */ }
        if (ticks >= POLL_LIMIT && pollRef.current) {
          clearInterval(pollRef.current); setGenerating(false);
          setError('Generation is taking longer than expected — check back on this page in a minute.');
        }
      }, POLL_MS);
    } catch (e) { setError((e as Error).message); setGenerating(false); }
  };

  const handlePickFile = (f: File | null) => {
    setRefFile(f); setCloneUrl(null); setCloneError('');
    if (refPreview) URL.revokeObjectURL(refPreview);
    setRefPreview(f ? URL.createObjectURL(f) : null);
  };

  const handlePickAvatar = (f: File | null) => {
    setAvatarFile(f); setCloneUrl(null); setCloneError('');
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(f ? URL.createObjectURL(f) : null);
  };

  const handleClone = async () => {
    if (!refFile) { setCloneError('Upload a reference thumbnail first.'); return; }
    setCloneError(''); setCloneUrl(null); setCloning(true);
    try {
      const fd = new FormData();
      fd.append('file', refFile);
      if (avatarFile) fd.append('avatar', avatarFile);
      fd.append('instructions', instructions.trim());
      const res = await authedFetch('/api/thumbnails/clone', { method: 'POST', body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setCloneError(data?.detail ?? 'Clone failed. Please try again.'); return; }
      setCloneUrl(data.url);
    } catch (e) { setCloneError((e as Error).message); }
    finally { setCloning(false); }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-5xl mx-auto space-y-6">
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-display font-bold text-text">Thumbnail Cloner</h1>
        <p className="text-sm text-text-muted mt-1">
          Auto-generate thumbnail variations from a finished video, or clone the look of a
          competitor&apos;s thumbnail from a reference.
        </p>
      </motion.div>

      <motion.div variants={itemVariants} className="inline-flex rounded-xl bg-surface-muted p-1">
        {([['project', 'From a project', Film], ['clone', 'Clone a reference', Images]] as const).map(([id, label, Icon]) => (
          <button key={id} onClick={() => setTab(id)}
            className={cn('inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              tab === id ? 'bg-white text-primary shadow-card' : 'text-text-muted hover:text-text')}>
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </motion.div>

      {tab === 'project' ? (
        <motion.div variants={itemVariants} className="glass rounded-2xl p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">Completed video</label>
            {loadingProjects ? (
              <div className="flex items-center gap-2 text-sm text-text-muted"><Loader2 className="w-4 h-4 animate-spin" /> Loading projects…</div>
            ) : projects.length === 0 ? (
              <p className="text-sm text-text-muted">No completed videos yet — finish a render first, then come back here.</p>
            ) : (
              <select
                className="w-full px-3 py-2.5 rounded-xl border border-border-strong bg-white text-sm text-text"
                value={selectedId}
                onChange={(e) => { setSelectedId(e.target.value); setThumbs([]); setError(''); }}
              >
                <option value="">Select a video…</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            )}
          </div>

          {selected?.thumbnail_urls?.length && thumbs.length === 0 ? (
            <ThumbGrid urls={selected.thumbnail_urls} />
          ) : thumbs.length > 0 ? (
            <ThumbGrid urls={thumbs} />
          ) : null}

          {error && <p className="flex items-center gap-1.5 text-xs text-[#EF4444]"><AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}</p>}

          <button onClick={handleGenerate} disabled={!selected || generating}
            className="btn-cta inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white disabled:opacity-50">
            {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating 2 variations…</> : <><Sparkles className="w-4 h-4" /> Generate 2 thumbnails</>}
          </button>
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} className="glass rounded-2xl p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">Reference thumbnail</label>
              <label className={cn('relative flex flex-col items-center justify-center gap-2 aspect-video rounded-xl border border-dashed border-border bg-surface-muted cursor-pointer overflow-hidden hover:border-primary/40 transition-colors')}>
                {refPreview ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={refPreview} alt="Reference" className="absolute inset-0 w-full h-full object-cover" />
                    <button
                      onClick={(e) => { e.preventDefault(); handlePickFile(null); }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[#1C1530]/70 text-white backdrop-blur flex items-center justify-center hover:bg-[#EF4444] transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-6 h-6 text-text-muted" />
                    <span className="text-xs text-text-muted">Upload a competitor&apos;s thumbnail (PNG/JPG/WEBP)</span>
                  </>
                )}
                <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden"
                  onChange={(e) => { handlePickFile(e.target.files?.[0] ?? null); e.target.value = ''; }} />
              </label>
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                Avatar / face <span className="text-text-muted font-normal">(optional)</span>
              </label>
              <label className={cn('relative flex flex-col items-center justify-center gap-2 aspect-video rounded-xl border border-dashed border-border bg-surface-muted cursor-pointer overflow-hidden hover:border-primary/40 transition-colors')}>
                {avatarPreview ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={avatarPreview} alt="Avatar" className="absolute inset-0 w-full h-full object-cover" />
                    <button
                      onClick={(e) => { e.preventDefault(); handlePickAvatar(null); }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[#1C1530]/70 text-white backdrop-blur flex items-center justify-center hover:bg-[#EF4444] transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-6 h-6 text-text-muted" />
                    <span className="text-xs text-text-muted">Add a face to feature on the thumbnail</span>
                  </>
                )}
                <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden"
                  onChange={(e) => { handlePickAvatar(e.target.files?.[0] ?? null); e.target.value = ''; }} />
              </label>
            </div>
            <div className="flex flex-col md:col-span-2">
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">What should change?</label>
              <textarea
                className="flex-1 min-h-[120px] px-3 py-2.5 rounded-xl border border-border-strong bg-white text-sm text-text resize-none"
                placeholder="e.g. Same dramatic composition, but make the subject a woman in a red dress and set it at night"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />
              <p className="text-[11px] text-text-muted mt-1.5">
                We recreate the composition, colors, and energy as a new original — text, logos, and real
                people&apos;s faces from the reference aren&apos;t copied.
              </p>
            </div>
          </div>

          {cloneUrl && <ThumbGrid urls={[cloneUrl]} />}
          {cloneError && <p className="flex items-center gap-1.5 text-xs text-[#EF4444]"><AlertCircle className="w-3.5 h-3.5 shrink-0" /> {cloneError}</p>}

          <button onClick={handleClone} disabled={!refFile || cloning}
            className="btn-cta inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white disabled:opacity-50">
            {cloning ? <><Loader2 className="w-4 h-4 animate-spin" /> Cloning…</> : <><Images className="w-4 h-4" /> Clone thumbnail</>}
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}

function ThumbGrid({ urls }: { urls: string[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {urls.map((u, i) => (
        <div key={u} className="rounded-xl border border-border overflow-hidden bg-surface-muted">
          <div className="relative aspect-video">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={u} alt={`Thumbnail ${i + 1}`} className="absolute inset-0 w-full h-full object-cover" />
          </div>
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-xs font-medium text-text-secondary">Variation {i + 1}</span>
            <a href={u} download target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
              <Download className="w-3.5 h-3.5" /> Download
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
