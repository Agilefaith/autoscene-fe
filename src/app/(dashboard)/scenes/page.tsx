'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Film } from 'lucide-react';
import { authedJson } from '@/lib/api';
import { containerVariants, itemVariants } from '@/lib/animations';
import { EmptyState } from '@/components/ui/EmptyState';

interface SceneItem {
  id: string;
  project_id: string;
  idx: number;
  image_urls?: string[] | null;
  projects?: { name: string; status: string } | null;
}

interface Folder { id: string; name: string; count: number; cover: string | null }

export default function ScenesPage() {
  const [scenes, setScenes] = useState<SceneItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authedJson<SceneItem[]>('/api/scenes').then(setScenes).catch(() => setScenes([])).finally(() => setLoading(false));
  }, []);

  // One folder per project: name, scene count, and a cover image (first scene with an image).
  const folders: Folder[] = useMemo(() => {
    const m = new Map<string, { name: string; scenes: SceneItem[] }>();
    for (const s of scenes) {
      if (!m.has(s.project_id)) m.set(s.project_id, { name: s.projects?.name ?? 'Untitled project', scenes: [] });
      m.get(s.project_id)!.scenes.push(s);
    }
    return Array.from(m.entries()).map(([id, g]) => {
      const ordered = g.scenes.slice().sort((a, b) => a.idx - b.idx);
      const cover = ordered.find((s) => s.image_urls?.[0])?.image_urls?.[0] ?? null;
      return { id, name: g.name, count: g.scenes.length, cover };
    });
  }, [scenes]);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-7xl mx-auto space-y-6">
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-display font-bold text-text">Scenes</h1>
        <p className="text-sm text-text-muted mt-1">Browse scenes by project. Open a folder to view and regenerate its scenes.</p>
      </motion.div>

      {loading ? (
        <div className="glass rounded-2xl p-12 flex justify-center"><div className="w-6 h-6 rounded-full border-2 border-primary/30 border-t-primary animate-spin" /></div>
      ) : folders.length === 0 ? (
        <div className="glass rounded-2xl">
          <EmptyState icon={<Film className="w-8 h-8" />} title="No scenes yet"
            description="Scenes appear here once you break a script into scenes inside a project."
            action={{ label: 'New Project', onClick: () => { window.location.href = '/create'; } }} />
        </div>
      ) : (
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {folders.map((f) => (
            <Link key={f.id} href={`/scenes/${f.id}`}
              className="group glass glass-hover rounded-2xl p-3 pt-5 flex flex-col transition-transform hover:-translate-y-0.5">
              {/* stacked-card cover */}
              <div className="relative aspect-video mb-3">
                <div className="absolute left-5 right-5 top-0 h-full rounded-xl bg-primary-100 border border-border" style={{ transform: 'translateY(-9px) scale(0.95)' }} />
                <div className="absolute left-2.5 right-2.5 top-0 h-full rounded-xl bg-primary-50 border border-border" style={{ transform: 'translateY(-4px) scale(0.98)' }} />
                <div className="absolute inset-0 rounded-xl overflow-hidden border border-border bg-primary-50 flex items-center justify-center">
                  {f.cover
                    ? <img src={f.cover} alt="" className="w-full h-full object-cover" />
                    : <Film className="w-7 h-7 text-primary/40" />}
                </div>
                <span className="absolute bottom-2 right-2 z-10 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#1C1530]/70 text-white backdrop-blur">
                  {f.count} scene{f.count !== 1 ? 's' : ''}
                </span>
              </div>
              <p className="text-sm font-semibold text-text truncate">{f.name}</p>
              <p className="text-xs text-text-muted mt-0.5">{f.count} scene{f.count !== 1 ? 's' : ''}</p>
            </Link>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
