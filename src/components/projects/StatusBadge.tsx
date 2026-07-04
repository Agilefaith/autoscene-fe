import { cn } from '@/lib/utils';

const MAP: Record<string, { label: string; className: string }> = {
  draft:     { label: 'Draft',      className: 'bg-surface-muted text-text-muted' },
  completed: { label: 'Completed',  className: 'bg-success/10 text-success' },
  cancelled: { label: 'Cancelled',  className: 'bg-surface-muted text-text-muted' },
  timed_out: { label: 'Timed out',  className: 'bg-error/10 text-error' },
};

const PROCESSING = new Set([
  'scene_breakdown', 'scenes_ready', 'pending', 'generating_images',
  'voiceover', 'rendering_scenes', 'assembling',
]);

export function StatusBadge({ status }: { status: string }) {
  let meta = MAP[status];
  if (!meta) {
    if (status.startsWith('failed')) meta = { label: 'Failed', className: 'bg-error/10 text-error' };
    else if (PROCESSING.has(status)) meta = { label: 'Processing', className: 'bg-primary-50 text-primary' };
    else meta = { label: status, className: 'bg-surface-muted text-text-muted' };
  }
  return (
    <span className={cn('inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full', meta.className)}>
      {meta.label}
    </span>
  );
}
