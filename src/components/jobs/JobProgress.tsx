'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Loader2, Circle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type PipelineStageItem } from '@/data/jobProgress';

export type { PipelineStageItem };
export { PIPELINE_STAGES } from '@/data/jobProgress';

interface JobProgressProps {
  stages: PipelineStageItem[];
}

const statusIcon = (status: PipelineStageItem['status']) => {
  switch (status) {
    case 'complete':
      return <CheckCircle className="w-5 h-5 text-[#22C55E] shrink-0" />;
    case 'active':
      return <Loader2 className="w-5 h-5 text-[#00D4FF] shrink-0 animate-spin" />;
    case 'failed':
      return <XCircle className="w-5 h-5 text-[#EF4444] shrink-0" />;
    default:
      return <Circle className="w-5 h-5 text-[#3F3F46] shrink-0" />;
  }
};

export default function JobProgress({ stages }: JobProgressProps) {
  return (
    <div className="flex flex-col gap-1">
      {stages.map((stage, i) => (
        <motion.div
          key={stage.name}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, delay: i * 0.07 }}
          className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300',
            stage.status === 'active'
              ? 'bg-[rgba(0,212,255,0.07)] border border-[#00D4FF]/20 shadow-[0_0_12px_rgba(0,212,255,0.08)]'
              : 'bg-transparent'
          )}
        >
          <div className="flex flex-col items-center self-stretch">
            {statusIcon(stage.status)}
          </div>

          <span
            className={cn(
              'flex-1 text-sm font-medium',
              stage.status === 'complete'
                ? 'text-[#A1A1AA]'
                : stage.status === 'active'
                  ? 'text-white'
                  : stage.status === 'failed'
                    ? 'text-[#EF4444]'
                    : 'text-[#3F3F46]'
            )}
          >
            {stage.name}
          </span>

          {stage.status === 'complete' && stage.duration && (
            <span className="text-xs text-[#22C55E] font-medium shrink-0">{stage.duration}</span>
          )}

          {stage.status === 'active' && (
            <span className="text-xs text-[#00D4FF] animate-pulse shrink-0">In progress…</span>
          )}

          {stage.status === 'failed' && (
            <span className="text-xs text-[#EF4444] shrink-0">Failed</span>
          )}
        </motion.div>
      ))}
    </div>
  );
}
