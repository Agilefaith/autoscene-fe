'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlignLeft, FileText, Plus, Search, Zap } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { containerVariants, itemVariants } from '@/lib/animations';
import { authedFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { ScriptModal } from '@/components/scripts/ScriptModal';
import { EmptyState } from '@/components/ui/EmptyState';
import { useConfirm, useToast } from '@/components/ui/ConfirmProvider';
import { KebabMenu } from '@/components/ui/KebabMenu';
import { Copy, Pencil, Trash2 } from 'lucide-react';
import type { FilterMode, Script } from '@/types/script';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ScriptsPage() {
  const { user } = useAuth();
  const confirm = useConfirm();
  const toast = useToast();

  const [scripts, setScripts]       = useState<Script[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [modal, setModal]           = useState<'new' | Script | null>(null);

  const fetchScripts = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await authedFetch('/api/scripts');
      if (res.ok) setScripts(await res.json());
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchScripts(); }, [fetchScripts]);

  const handleCreated = (s: Script) => setScripts((prev) => [s, ...prev]);
  const handleUpdated = (updated: Script) =>
    setScripts((prev) => prev.map((s) => s.id === updated.id ? updated : s));

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: 'Delete script?',
      message: 'This permanently deletes the script. This cannot be undone.',
      confirmLabel: 'Delete', variant: 'danger',
    });
    if (!ok) return;
    setScripts((prev) => prev.filter((s) => s.id !== id));
    try { await authedFetch(`/api/scripts/${id}`, { method: 'DELETE' }); toast('Script deleted'); }
    catch { fetchScripts(); toast('Failed to delete script', 'error'); }
  };

  const handleDuplicate = async (script: Script) => {
    try {
      const res = await authedFetch('/api/scripts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: script.title + ' (Copy)',
          content: script.content,
          mode: script.generation_mode,
          product_name: script.product_name,
          tone: script.tone,
          target_audience: script.target_audience,
          goal: script.goal,
          style: script.style,
        }),
      });
      if (res.ok) {
        const created: Script = await res.json();
        setScripts((prev) => [created, ...prev]);
        toast('Script duplicated');
      }
    } catch {
      toast('Failed to duplicate script', 'error');
    }
  };

  const filtered = scripts.filter((s) => {
    const matchSearch =
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.content.toLowerCase().includes(search.toLowerCase());
    const matchMode = filterMode === 'all' || s.generation_mode === filterMode;
    return matchSearch && matchMode;
  });

  return (
    <>
      <AnimatePresence>
        {modal && (
          <ScriptModal
            initial={modal === 'new' ? undefined : modal}
            onClose={() => setModal(null)}
            onCreated={handleCreated}
            onUpdated={handleUpdated}
          />
        )}
      </AnimatePresence>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto flex flex-col gap-6"
      >
        <motion.div variants={itemVariants} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-text">Script Library</h1>
            {scripts.length > 0 && (
              <span className="px-3 py-1 rounded-full bg-[#7C3AED]/10 border border-[#7C3AED]/20 text-xs font-semibold text-[#7C3AED]">
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

        {loading ? (
          <motion.div variants={itemVariants} className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass rounded-2xl px-5 py-4 h-20 animate-pulse bg-surface-muted" />
            ))}
          </motion.div>
        ) : scripts.length === 0 ? (
          <EmptyState
            icon={<FileText className="w-9 h-9 text-[#3F3F46]" />}
            title="No scripts yet"
            description="Save AI-generated or custom scripts here to reuse them across multiple video campaigns."
            action={{ label: 'Create First Script', onClick: () => setModal('new') }}
          />
        ) : (
          <>
            <motion.div variants={itemVariants} className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search scripts…"
                  className="bg-surface-muted border border-border rounded-xl pl-10 pr-4 py-3 text-text focus:outline-none focus:border-[#7C3AED]/50 transition-colors w-full text-sm placeholder-[#A8A2BC]"
                />
              </div>
              <div className="flex items-center gap-1 bg-surface-muted border border-border rounded-xl px-1.5 h-[46px]">
                {(['all', 'ai', 'custom'] as FilterMode[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilterMode(f)}
                    className={cn(
                      'px-4 h-8 rounded-lg text-xs font-medium transition-all',
                      filterMode === f
                        ? 'bg-[#7C3AED]/10 text-[#7C3AED]'
                        : 'text-text-muted hover:text-text'
                    )}
                  >
                    {f === 'all' ? 'All' : f === 'ai' ? 'AI' : 'Custom'}
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.div variants={containerVariants} className="flex flex-col gap-3">
              {filtered.length === 0 ? (
                <motion.div
                  variants={itemVariants}
                  className="glass rounded-2xl p-10 flex flex-col items-center gap-3 text-center"
                >
                  <FileText className="w-8 h-8 text-[#3F3F46]" />
                  <p className="text-text-muted text-sm">No scripts match your search.</p>
                </motion.div>
              ) : (
                filtered.map((script) => (
                  <motion.div
                    key={script.id}
                    variants={itemVariants}
                    className="glass rounded-2xl px-5 py-4 flex items-start gap-4 hover:bg-surface-muted transition-all"
                  >
                    <div className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5',
                      script.generation_mode === 'ai' ? 'bg-[#7C3AED]/10' : 'bg-[#7C3AED]/10'
                    )}>
                      {script.generation_mode === 'ai'
                        ? <Zap className="w-4 h-4 text-[#7C3AED]" />
                        : <AlignLeft className="w-4 h-4 text-[#7C3AED]" />
                      }
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-text truncate">{script.title}</h3>
                        <span className={cn(
                          'px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0',
                          script.generation_mode === 'ai'
                            ? 'bg-[#7C3AED]/10 border-[#7C3AED]/20 text-[#7C3AED]'
                            : 'bg-[#7C3AED]/10 border-[#7C3AED]/20 text-[#7C3AED]'
                        )}>
                          {script.generation_mode === 'ai' ? 'AI Generated' : 'Custom'}
                        </span>
                      </div>
                      <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
                        {script.content}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-[#3F3F46] hidden sm:block">{formatDate(script.created_at)}</span>
                      <Link
                        href="/create"
                        className="px-3 py-1.5 rounded-lg bg-[rgba(0,212,255,0.08)] border border-[#7C3AED]/20 text-[#7C3AED] text-xs font-semibold hover:bg-[rgba(0,212,255,0.15)] transition-all"
                      >
                        Use
                      </Link>
                      <KebabMenu items={[
                        // Custom scripts are immutable → view-only
                        { label: script.is_locked ? 'View' : 'Edit', icon: <Pencil className="w-3.5 h-3.5" />, onClick: () => setModal(script) },
                        { label: 'Duplicate', icon: <Copy className="w-3.5 h-3.5" />,   onClick: () => handleDuplicate(script) },
                        { label: 'Delete',    icon: <Trash2 className="w-3.5 h-3.5" />, onClick: () => handleDelete(script.id), danger: true },
                      ]} />
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
