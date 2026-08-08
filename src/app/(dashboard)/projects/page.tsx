'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, Film, Download, Trash2 } from 'lucide-react';
import { authedFetch, authedJson } from '@/lib/api';
import { containerVariants, itemVariants } from '@/lib/animations';
import { EmptyState } from '@/components/ui/EmptyState';
import { useConfirm, useToast } from '@/components/ui/ConfirmProvider';
import { StatusBadge } from '@/components/projects/StatusBadge';
import type { Project } from '@/types/project';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const confirm = useConfirm();
  const toast = useToast();

  useEffect(() => {
    authedJson<Project[]>('/api/projects').then(setProjects).catch(() => setProjects([])).finally(() => setLoading(false));
  }, []);

  const remove = async (id: string) => {
    const ok = await confirm({
      title: 'Delete project?',
      message: 'This permanently deletes the project and its scenes. This cannot be undone.',
      confirmLabel: 'Delete', variant: 'danger',
    });
    if (!ok) return;
    setProjects((prev) => prev.filter((p) => p.id !== id));
    try { await authedFetch(`/api/projects/${id}`, { method: 'DELETE' }); toast('Project deleted'); }
    catch { toast('Failed to delete project', 'error'); }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-7xl mx-auto space-y-6">
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-text">Projects</h1>
          <p className="text-sm text-text-muted mt-1">All your video projects.</p>
        </div>
        <Link href="/create" className="btn-cta inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white">
          <Plus className="w-4 h-4" /> New Project
        </Link>
      </motion.div>

      {loading ? (
        <div className="glass rounded-2xl p-12 flex justify-center"><div className="w-6 h-6 rounded-full border-2 border-primary/30 border-t-primary animate-spin" /></div>
      ) : projects.length === 0 ? (
        <div className="glass rounded-2xl">
          <EmptyState icon={<Film className="w-8 h-8" />} title="No projects yet"
            description="Create your first AI video to see it here."
            action={{ label: 'New Project', onClick: () => { window.location.href = '/create'; } }} />
        </div>
      ) : (
        <motion.div variants={itemVariants} className="glass rounded-2xl divide-y divide-border">
          {projects.map((p) => (
            <div key={p.id} className="flex items-center gap-4 px-5 py-4 hover:bg-surface-muted transition-colors first:rounded-t-2xl last:rounded-b-2xl">
              <div className="w-11 h-11 rounded-lg bg-primary-50 flex items-center justify-center text-primary shrink-0 overflow-hidden">
                <Film className="w-5 h-5" />
              </div>
              <Link href={`/create?project=${p.id}`} className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text truncate">{p.name}</p>
                <p className="text-xs text-text-muted">
                  Cinematic · {p.format} · {p.duration_seconds}s · {new Date(p.created_at).toLocaleDateString()}
                </p>
              </Link>
              <StatusBadge status={p.status} />
              {p.final_video_url && (
                <a href={p.final_video_url} download title="Download" className="p-2 rounded-lg text-text-muted hover:text-primary hover:bg-primary-50 transition-colors">
                  <Download className="w-4 h-4" />
                </a>
              )}
              <button onClick={() => remove(p.id)} title="Delete" className="p-2 rounded-lg text-text-muted hover:text-error hover:bg-error/5 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
