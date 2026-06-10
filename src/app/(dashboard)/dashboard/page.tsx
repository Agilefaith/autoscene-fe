'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Video, Download, Eye, Zap, Users, TrendingUp, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

type JobStatus = 'processing' | 'completed' | 'failed';

interface Job {
  id: string;
  name: string;
  status: JobStatus;
  date: string;
  gradientFrom: string;
  gradientTo: string;
}

const recentJobs: Job[] = [
  {
    id: '1',
    name: 'Skincare Morning Routine Ad',
    status: 'completed',
    date: 'Jun 5, 2026',
    gradientFrom: 'from-pink-500/30',
    gradientTo: 'to-purple-900/20',
  },
  {
    id: '2',
    name: 'Fitness 30-Day Challenge Promo',
    status: 'processing',
    date: 'Jun 6, 2026',
    gradientFrom: 'from-orange-500/30',
    gradientTo: 'to-red-900/20',
  },
  {
    id: '3',
    name: 'Tech Gadget Unboxing Review',
    status: 'completed',
    date: 'Jun 4, 2026',
    gradientFrom: 'from-[#00D4FF]/20',
    gradientTo: 'to-blue-900/20',
  },
  {
    id: '4',
    name: 'Finance Tips — Save $500/Month',
    status: 'failed',
    date: 'Jun 3, 2026',
    gradientFrom: 'from-green-500/20',
    gradientTo: 'to-emerald-900/20',
  },
  {
    id: '5',
    name: 'Travel Vlog — Bali Highlights',
    status: 'completed',
    date: 'Jun 2, 2026',
    gradientFrom: 'from-yellow-500/20',
    gradientTo: 'to-amber-900/20',
  },
];

const statusConfig: Record<JobStatus, { label: string; classes: string; pulse?: boolean }> = {
  processing: {
    label: 'Processing',
    classes: 'bg-[#00D4FF]/10 text-[#00D4FF] border-[#00D4FF]/20',
    pulse: true,
  },
  completed: {
    label: 'Completed',
    classes: 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20',
  },
  failed: {
    label: 'Failed',
    classes: 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20',
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

export default function DashboardPage() {
  const totalCredits = 24;
  const totalVideos = 47;
  const personaCount = 3;
  const personaLimit = 10;
  const usedCredits = 76;
  const maxCredits = 100;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-6xl mx-auto flex flex-col gap-8 relative"
    >
      {/* Ambient glow — matches landing page atmosphere */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[400px] rounded-full bg-[#8A2BE2]/[0.07] blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[300px] rounded-full bg-[#00D4FF]/[0.04] blur-[100px]" />
      </div>
      {/* Header row */}
      <motion.div variants={itemVariants} className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Good morning, <span className="gradient-text">Alex</span>
          </h1>
          <p className="text-[#52525B] text-sm mt-1">Here's what's happening with your videos today.</p>
        </div>
        <Link
          href="/create"
          className="btn-neon flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          Create Video
        </Link>
      </motion.div>

      {/* Stats row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Credits remaining */}
        <div className="glass glass-hover rounded-2xl p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#00D4FF]/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#00D4FF]" />
            </div>
            <span className="text-2xl font-bold text-white">{totalCredits}</span>
          </div>
          <p className="text-sm font-medium text-white mb-0.5">Credits Remaining</p>
          <p className="text-xs text-[#52525B]">≈ {Math.round(totalCredits * 0.5)} min of video</p>
        </div>

        {/* Videos generated */}
        <div className="glass glass-hover rounded-2xl p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#8A2BE2]/10 flex items-center justify-center">
              <Video className="w-5 h-5 text-[#8A2BE2]" />
            </div>
            <span className="text-2xl font-bold text-white">{totalVideos}</span>
          </div>
          <p className="text-sm font-medium text-white mb-0.5">Videos Generated</p>
          <p className="text-xs text-[#52525B]">All time total</p>
        </div>

        {/* Personas */}
        <div className="glass glass-hover rounded-2xl p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-green-400" />
            </div>
            <span className="text-2xl font-bold text-white">
              {personaCount}
              <span className="text-sm text-[#52525B] font-normal">/{personaLimit}</span>
            </span>
          </div>
          <p className="text-sm font-medium text-white mb-0.5">Personas</p>
          <p className="text-xs text-[#52525B]">{personaLimit - personaCount} slots available</p>
        </div>
      </motion.div>

      {/* Recent Jobs */}
      <motion.div variants={itemVariants} className="glass rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#00D4FF]" />
            Recent Jobs
          </h2>
          <span className="text-xs text-[#52525B]">Last 5 jobs</span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.04]">
                <th className="text-left px-6 py-3 text-xs font-medium text-[#52525B] uppercase tracking-wider">
                  Video
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-[#52525B] uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-[#52525B] uppercase tracking-wider hidden md:table-cell">
                  Date
                </th>
                <th className="text-right px-6 py-3 text-xs font-medium text-[#52525B] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {recentJobs.map((job, i) => {
                const statusCfg = statusConfig[job.status];
                return (
                  <tr
                    key={job.id}
                    className={cn(
                      'border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors',
                      i === recentJobs.length - 1 && 'border-b-0'
                    )}
                  >
                    {/* Thumbnail + name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'w-12 h-8 rounded-lg bg-gradient-to-br shrink-0',
                            job.gradientFrom,
                            job.gradientTo
                          )}
                        />
                        <span className="text-sm font-medium text-white truncate max-w-[160px] md:max-w-[240px]">
                          {job.name}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
                          statusCfg.classes
                        )}
                      >
                        {statusCfg.pulse && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00D4FF] animate-pulse" />
                        )}
                        {statusCfg.label}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-4 hidden md:table-cell">
                      <span className="text-sm text-[#52525B]">{job.date}</span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => console.log('View job', job.id)}
                          className="w-8 h-8 rounded-lg glass flex items-center justify-center text-[#52525B] hover:text-white transition-colors"
                          title="View"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {job.status === 'completed' && (
                          <button
                            onClick={() => console.log('Download job', job.id)}
                            className="w-8 h-8 rounded-lg glass flex items-center justify-center text-[#52525B] hover:text-[#00D4FF] transition-colors"
                            title="Download"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Credit usage */}
      <motion.div variants={itemVariants} className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#00D4FF]" />
            Credit Usage This Month
          </h2>
          <span className="text-sm text-[#52525B]">{usedCredits}/{maxCredits} used</span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-white/[0.06] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#00D4FF] to-[#8A2BE2] transition-all duration-700"
            style={{ width: `${(usedCredits / maxCredits) * 100}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-[#52525B]">{usedCredits} credits used</span>
          <Link href="/billing" className="text-xs text-[#00D4FF] hover:text-white transition-colors">
            Buy more credits →
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}
