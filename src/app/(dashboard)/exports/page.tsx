'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Download, Film } from 'lucide-react';
import { authedJson } from '@/lib/api';
import { containerVariants, itemVariants } from '@/lib/animations';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Project } from '@/types/project';

export default function ExportsPage() {
  const [videos, setVideos] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authedJson<Project[]>('/api/projects')
      .then((all) => setVideos(all.filter((p) => p.status === 'completed' && p.final_video_url)))
      .catch(() => setVideos([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-7xl mx-auto space-y-6">
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-display font-bold text-text">Exports</h1>
        <p className="text-sm text-text-muted mt-1">All your finished videos, ready to download.</p>
      </motion.div>

      {loading ? (
        <div className="glass rounded-2xl p-12 flex justify-center"><div className="w-6 h-6 rounded-full border-2 border-primary/30 border-t-primary animate-spin" /></div>
      ) : videos.length === 0 ? (
        <div className="glass rounded-2xl">
          <EmptyState icon={<Download className="w-8 h-8" />} title="No exports yet"
            description="Finished videos will appear here once a project completes."
            action={{ label: 'New Project', onClick: () => { window.location.href = '/create'; } }} />
        </div>
      ) : (
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((p) => (
            <div key={p.id} className="glass rounded-2xl overflow-hidden flex flex-col">
              <div className="aspect-video bg-black">
                <video src={p.final_video_url!} className="w-full h-full object-contain" preload="metadata" />
              </div>
              <div className="p-4 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text truncate">{p.name}</p>
                  <p className="text-xs text-text-muted">{p.format} · {p.duration_seconds}s · {new Date(p.completed_at ?? p.created_at).toLocaleDateString()}</p>
                </div>
                <Link href={`/create?project=${p.id}`} className="text-xs text-text-muted hover:text-primary px-2">Open</Link>
                <a href={p.final_video_url!} download className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center text-primary hover:bg-primary-100 transition-colors" title="Download">
                  <Download className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
