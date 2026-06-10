'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Plus,
  Search,
  MoreVertical,
  Pencil,
  Copy,
  Trash2,
  Zap,
  AlignLeft,
  X,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type ScriptMode = 'ai' | 'custom';
type FilterMode = 'all' | 'ai' | 'custom';

interface ScriptData {
  id: string;
  title: string;
  content: string;
  mode: ScriptMode;
  createdAt: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const inputClass =
  'bg-[#050507] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-[#52525B] focus:outline-none focus:border-[#8A2BE2]/60 transition-colors w-full text-sm';

// ─── Script Modal ─────────────────────────────────────────────────────────────

function ScriptModal({
  initial,
  onClose,
  onSave,
}: {
  initial?: ScriptData;
  onClose: () => void;
  onSave: (data: Omit<ScriptData, 'id' | 'createdAt'>) => void;
}) {
  const [mode, setMode]   = useState<ScriptMode>(initial?.mode ?? 'ai');
  const [title, setTitle] = useState(initial?.title ?? '');
  const [content, setContent] = useState(initial?.content ?? '');
  const [error, setError] = useState('');

  const isEdit = !!initial;

  const handleSave = () => {
    if (!title.trim()) { setError('Title is required.'); return; }
    if (!content.trim()) { setError('Script content is required.'); return; }
    onSave({ title: title.trim(), content: content.trim(), mode });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-lg bg-[#0F0F18] rounded-2xl border border-white/[0.10] p-6 flex flex-col gap-5 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">{isEdit ? 'Edit Script' : 'New Script'}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg glass flex items-center justify-center text-[#52525B] hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setMode('ai')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold border transition-all',
              mode === 'ai'
                ? 'bg-[#00D4FF]/10 border-[#00D4FF]/40 text-[#00D4FF]'
                : 'border-white/[0.08] text-[#52525B] hover:text-white'
            )}
          >
            <Zap className="w-3.5 h-3.5" />
            AI Generated
          </button>
          <button
            onClick={() => setMode('custom')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold border transition-all',
              mode === 'custom'
                ? 'bg-[#8A2BE2]/10 border-[#8A2BE2]/40 text-[#8A2BE2]'
                : 'border-white/[0.08] text-[#52525B] hover:text-white'
            )}
          >
            <AlignLeft className="w-3.5 h-3.5" />
            Custom Script
          </button>
        </div>

        {/* Title */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[#A1A1AA]">
            {mode === 'ai' ? 'Video Title' : 'Script Title'}
          </label>
          <input
            className={inputClass}
            placeholder={mode === 'ai' ? 'e.g. Skincare Morning Routine Ad…' : 'e.g. Product Launch Script…'}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Content */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[#A1A1AA]">Script Content</label>
          <textarea
            className={cn(inputClass, 'min-h-[160px] resize-none leading-relaxed')}
            placeholder={mode === 'ai' ? 'AI-generated script will appear here…' : 'Paste or type your script here…'}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          {mode === 'custom' && (
            <p className="flex items-center gap-1.5 text-[10px] text-[#FBBF24]/80">
              <AlertTriangle className="w-3 h-3 shrink-0" />
              Script will be used exactly as written, no AI edits.
            </p>
          )}
        </div>

        {error && <p className="text-xs text-[#EF4444]">{error}</p>}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-sm font-semibold text-[#A1A1AA] hover:text-white hover:border-white/20 transition-all"
          >
            Cancel
          </button>
          <button onClick={handleSave} className="flex-1 btn-neon py-2.5 rounded-xl text-sm font-semibold">
            {isEdit ? 'Save Changes' : 'Save Script'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Kebab menu ───────────────────────────────────────────────────────────────

function ScriptKebab({
  onEdit,
  onDuplicate,
  onDelete,
}: {
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 rounded-lg glass flex items-center justify-center text-[#52525B] hover:text-white transition-colors"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-9 z-20 bg-[#2A2A3D] border border-[#3A3A52] rounded-xl py-1 min-w-[130px] shadow-xl">
            <button
              onClick={() => { onEdit(); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#A1A1AA] hover:text-white hover:bg-[#31314A] transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" /> Edit
            </button>
            <button
              onClick={() => { onDuplicate(); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#A1A1AA] hover:text-white hover:bg-[#31314A] transition-colors"
            >
              <Copy className="w-3.5 h-3.5" /> Duplicate
            </button>
            <button
              onClick={() => { onDelete(); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#EF4444] hover:bg-[#3D2525] transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <motion.div
      variants={itemVariants}
      className="flex flex-col items-center justify-center py-24 gap-5 text-center"
    >
      <div className="w-20 h-20 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
        <FileText className="w-9 h-9 text-[#3F3F46]" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-white mb-1">No scripts yet</h3>
        <p className="text-sm text-[#52525B] max-w-xs leading-relaxed">
          Save AI-generated or custom scripts here to reuse them across multiple video campaigns.
        </p>
      </div>
      <button
        onClick={onNew}
        className="btn-neon flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm"
      >
        <Plus className="w-4 h-4" />
        Create First Script
      </button>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const DUMMY_SCRIPTS: ScriptData[] = [
  {
    id: '1',
    title: 'Skincare Morning Routine Ad',
    content: "Wake up and glow! ✨ My morning routine starts with this game-changing serum that transformed my skin in just 2 weeks. Hydration, radiance, and zero breakouts — this is your sign to try it.",
    mode: 'ai',
    createdAt: 'Jun 1, 2026',
  },
  {
    id: '2',
    title: 'Product Launch Announcement',
    content: "The wait is finally over. Our new collection just dropped and I am OBSESSED. Limited stock, so don't sleep on this — link in bio.",
    mode: 'custom',
    createdAt: 'Jun 5, 2026',
  },
];

export default function ScriptsPage() {
  const [scripts, setScripts]       = useState<ScriptData[]>(DUMMY_SCRIPTS);
  const [search, setSearch]         = useState('');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [modal, setModal]           = useState<'new' | ScriptData | null>(null);

  const filtered = scripts.filter((s) => {
    const matchSearch =
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.content.toLowerCase().includes(search.toLowerCase());
    const matchMode = filterMode === 'all' || s.mode === filterMode;
    return matchSearch && matchMode;
  });

  const handleSave = (data: Omit<ScriptData, 'id' | 'createdAt'>) => {
    if (modal === 'new') {
      setScripts((prev) => [
        { ...data, id: crypto.randomUUID(), createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
        ...prev,
      ]);
    } else if (modal && modal !== 'new') {
      setScripts((prev) => prev.map((s) => s.id === modal.id ? { ...s, ...data } : s));
    }
    setModal(null);
  };

  const handleDuplicate = (script: ScriptData) => {
    setScripts((prev) => [
      { ...script, id: crypto.randomUUID(), title: script.title + ' (Copy)', createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
      ...prev,
    ]);
  };

  const handleDelete = (id: string) => {
    setScripts((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <>
      <AnimatePresence>
        {modal && (
          <ScriptModal
            initial={modal === 'new' ? undefined : modal}
            onClose={() => setModal(null)}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-6xl mx-auto flex flex-col gap-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">Script Library</h1>
            {scripts.length > 0 && (
              <span className="px-3 py-1 rounded-full bg-[#8A2BE2]/10 border border-[#8A2BE2]/20 text-xs font-semibold text-[#8A2BE2]">
                {scripts.length} script{scripts.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          {scripts.length > 0 && (
            <button
              onClick={() => setModal('new')}
              className="btn-neon flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
            >
              <Plus className="w-4 h-4" />
              New Script
            </button>
          )}
        </motion.div>

        {scripts.length === 0 ? (
          <EmptyState onNew={() => setModal('new')} />
        ) : (
          <>
            {/* Search + filter */}
            <motion.div variants={itemVariants} className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#52525B]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search scripts…"
                  className="bg-[#0B0B12] border border-white/[0.08] rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-[#00D4FF]/50 transition-colors w-full text-sm placeholder-[#52525B]"
                />
              </div>
              <div className="flex items-center gap-1 bg-[#0B0B12] border border-white/[0.08] rounded-xl px-1.5 h-[46px]">
                {(['all', 'ai', 'custom'] as FilterMode[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilterMode(f)}
                    className={cn(
                      'px-4 h-8 rounded-lg text-xs font-medium transition-all',
                      filterMode === f
                        ? 'bg-[#00D4FF]/10 text-[#00D4FF]'
                        : 'text-[#52525B] hover:text-white'
                    )}
                  >
                    {f === 'all' ? 'All' : f === 'ai' ? 'AI' : 'Custom'}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* List */}
            <motion.div variants={containerVariants} className="flex flex-col gap-3">
              {filtered.length === 0 ? (
                <motion.div
                  variants={itemVariants}
                  className="glass rounded-2xl p-10 flex flex-col items-center gap-3 text-center"
                >
                  <FileText className="w-8 h-8 text-[#3F3F46]" />
                  <p className="text-[#52525B] text-sm">No scripts match your search.</p>
                </motion.div>
              ) : (
                filtered.map((script) => (
                  <motion.div
                    key={script.id}
                    variants={itemVariants}
                    className="glass rounded-2xl px-5 py-4 flex items-start gap-4 hover:bg-white/[0.02] transition-all"
                  >
                    {/* Icon */}
                    <div className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5',
                      script.mode === 'ai' ? 'bg-[#00D4FF]/10' : 'bg-[#8A2BE2]/10'
                    )}>
                      {script.mode === 'ai'
                        ? <Zap className="w-4 h-4 text-[#00D4FF]" />
                        : <AlignLeft className="w-4 h-4 text-[#8A2BE2]" />
                      }
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-white truncate">{script.title}</h3>
                        <span className={cn(
                          'px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0',
                          script.mode === 'ai'
                            ? 'bg-[#00D4FF]/10 border-[#00D4FF]/20 text-[#00D4FF]'
                            : 'bg-[#8A2BE2]/10 border-[#8A2BE2]/20 text-[#8A2BE2]'
                        )}>
                          {script.mode === 'ai' ? 'AI Generated' : 'Custom'}
                        </span>
                      </div>
                      <p className="text-xs text-[#52525B] line-clamp-2 leading-relaxed">
                        {script.content}
                      </p>
                    </div>

                    {/* Right */}
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-[#3F3F46] hidden sm:block">{script.createdAt}</span>
                      <Link
                        href="/create"
                        className="px-3 py-1.5 rounded-lg bg-[rgba(0,212,255,0.08)] border border-[#00D4FF]/20 text-[#00D4FF] text-xs font-semibold hover:bg-[rgba(0,212,255,0.15)] transition-all"
                      >
                        Use
                      </Link>
                      <ScriptKebab
                        onEdit={() => setModal(script)}
                        onDuplicate={() => handleDuplicate(script)}
                        onDelete={() => handleDelete(script.id)}
                      />
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          </>
        )}
      </motion.div>
    </>
  );
}
