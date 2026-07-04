'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, Zap, FolderOpen, CheckCircle2, ArrowRight, Film } from 'lucide-react';
import { authedJson } from '@/lib/api';
import { containerVariants, itemVariants } from '@/lib/animations';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/projects/StatusBadge';
import type { Project } from '@/types/project';

interface Usage { credit_balance: number; videos_generated: number }

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      authedJson<Project[]>('/api/projects').catch(() => [] as Project[]),
      authedJson<Usage>('/api/billing/usage').catch(() => null),
    ]).then(([p, u]) => { setProjects(p); setUsage(u); setLoading(false); });
  }, []);

  const completed = projects.filter((p) => p.status === 'completed').length;
  const stats = [
    { label: 'Credits', value: usage?.credit_balance ?? '—', icon: Zap },
    { label: 'Projects', value: projects.length, icon: FolderOpen },
    { label: 'Completed', value: completed, icon: CheckCircle2 },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-text">Dashboard</h1>
          <p className="text-sm text-text-muted mt-1">Create and manage your AI videos.</p>
        </div>
        <Link href="/create" className="btn-cta inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white">
          <Plus className="w-4 h-4" /> New Project
        </Link>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="glass rounded-2xl p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center text-primary"><s.icon className="w-5 h-5" /></div>
            <div>
              <p className="text-2xl font-bold text-text leading-none">{s.value}</p>
              <p className="text-xs text-text-muted mt-1">{s.label}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Recent projects */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-text">Recent projects</h2>
          {projects.length > 0 && <Link href="/projects" className="text-xs text-primary hover:text-primary-dark inline-flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></Link>}
        </div>

        {loading ? (
          <div className="glass rounded-2xl p-10 flex justify-center"><div className="w-6 h-6 rounded-full border-2 border-primary/30 border-t-primary animate-spin" /></div>
        ) : projects.length === 0 ? (
          <div className="glass rounded-2xl">
            <EmptyState icon={<Film className="w-8 h-8" />} title="No projects yet"
              description="Start your first AI video — write a script, review the scenes, and generate."
              action={{ label: 'New Project', onClick: () => { window.location.href = '/create'; } }} />
          </div>
        ) : (
          <div className="glass rounded-2xl divide-y divide-border">
            {projects.slice(0, 5).map((p) => (
              <Link key={p.id} href={`/create?project=${p.id}`} className="flex items-center gap-4 px-5 py-3.5 hover:bg-surface-muted transition-colors first:rounded-t-2xl last:rounded-b-2xl">
                <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center text-primary shrink-0"><Film className="w-4 h-4" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text truncate">{p.name}</p>
                  <p className="text-xs text-text-muted">{p.render_mode === 'mode_2' ? 'Enhanced' : 'Cinematic'} · {p.format} · {new Date(p.created_at).toLocaleDateString()}</p>
                </div>
                <StatusBadge status={p.status} />
              </Link>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
