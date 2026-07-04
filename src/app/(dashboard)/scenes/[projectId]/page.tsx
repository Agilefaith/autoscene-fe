'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft, RefreshCw, Image as ImageIcon, ArrowRight, Film } from 'lucide-react';
import { authedFetch, authedJson } from '@/lib/api';
import { cn } from '@/lib/utils';
import { containerVariants, itemVariants } from '@/lib/animations';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/ConfirmProvider';
import type { Project, Scene } from '@/types/project';

const sceneStatus = (s: string): { label: string; className: string } => {
  if (s === 'rendered') return { label: 'Rendered', className: 'bg-success/10 text-success' };
  if (s === 'image_ready') return { label: 'Image ready', className: 'bg-success/10 text-success' };
  if (s === 'failed') return { label: 'Failed', className: 'bg-error/10 text-error' };
  return { label: 'Pending', className: 'bg-primary-50 text-primary' };
};

export default function ProjectScenesPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const toast = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authedJson<Project>(`/api/projects/${projectId}`)
      .then((p) => { setProject(p); setScenes((p.scenes ?? []).slice().sort((a, b) => a.idx - b.idx)); })
      .catch(() => setProject(null))
      .finally(() => setLoading(false));
  }, [projectId]);

  const regenerate = async (id: string) => {
    setScenes((prev) => prev.map((s) => s.id === id ? { ...s, status: 'pending' } : s));
    const res = await authedFetch(`/api/scenes/${id}/regenerate-image`, { method: 'POST' });
    if (res.status === 409) toast('This project is rendering — try again after it finishes.', 'error');
    else if (res.ok) toast('Regenerating scene image…');
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-7xl mx-auto space-y-6">
      <motion.div variants={itemVariants} className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <Link href="/scenes" className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text mb-1">
            <ChevronLeft className="w-3.5 h-3.5" /> Scenes
          </Link>
          <h1 className="text-2xl font-display font-bold text-text truncate">{project?.name ?? 'Project'}</h1>
          <p className="text-sm text-text-muted mt-0.5">{scenes.length} scene{scenes.length !== 1 ? 's' : ''}</p>
        </div>
        {project && (
          <Link href={`/create?project=${project.id}`} className="btn-secondary inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium shrink-0">
            Open project <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </motion.div>

      {loading ? (
        <div className="glass rounded-2xl p-12 flex justify-center"><div className="w-6 h-6 rounded-full border-2 border-primary/30 border-t-primary animate-spin" /></div>
      ) : scenes.length === 0 ? (
        <div className="glass rounded-2xl">
          <EmptyState icon={<Film className="w-8 h-8" />} title="No scenes yet"
            description="This project has no scenes. Open it to break the script into scenes."
            action={{ label: 'Open project', onClick: () => { window.location.href = `/create?project=${projectId}`; } }} />
        </div>
      ) : (
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {scenes.map((s) => {
            const st = sceneStatus(s.status);
            return (
              <div key={s.id} className="glass rounded-2xl overflow-hidden flex flex-col">
                <div className="relative w-full aspect-video overflow-hidden bg-primary-50 flex items-center justify-center">
                  {s.image_urls?.[0]
                    ? <img src={s.image_urls[0]} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    : <ImageIcon className="w-7 h-7 text-primary/40" />}
                  <span className={cn('absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full', st.className)}>{st.label}</span>
                  <button onClick={() => regenerate(s.id)} title="Regenerate image"
                    className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-white/90 backdrop-blur flex items-center justify-center text-text-muted hover:text-primary shadow-card">
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="p-3 flex-1 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-text-secondary">Scene {s.idx + 1}</span>
                    {s.motion_type && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-muted text-text-muted shrink-0">{s.motion_type}</span>}
                  </div>
                  <p className="text-xs text-text line-clamp-2 min-h-[2rem]">{s.scene_text}</p>
                </div>
              </div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
}
