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
      return <CheckCircle className="w-5 h-5 text-success shrink-0" />;
    case 'active':
      return <Loader2 className="w-5 h-5 text-primary shrink-0 animate-spin" />;
    case 'failed':
      return <XCircle className="w-5 h-5 text-error shrink-0" />;
    default:
      return <Circle className="w-5 h-5 text-[#C9C3DC] shrink-0" />;
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
              ? 'bg-primary-50 border border-primary/15'
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
                ? 'text-text-secondary'
                : stage.status === 'active'
                  ? 'text-text'
                  : stage.status === 'failed'
                    ? 'text-error'
                    : 'text-text-muted'
            )}
          >
            {stage.name}
          </span>

          {stage.status === 'complete' && stage.duration && (
            <span className="text-xs text-success font-medium shrink-0">{stage.duration}</span>
          )}

          {stage.status === 'active' && (
            <span className="text-xs text-primary animate-pulse shrink-0">In progress…</span>
          )}

          {stage.status === 'failed' && (
            <span className="text-xs text-error shrink-0">Failed</span>
          )}
        </motion.div>
      ))}
    </div>
  );
}
