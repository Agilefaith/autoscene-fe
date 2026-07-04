export function PresetSkeleton() {
  return (
    <div className="glass rounded-2xl p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1.5">
          <div className="h-4 w-24 rounded-lg bg-surface-muted animate-pulse" />
          <div className="h-3 w-32 rounded-lg bg-surface-muted animate-pulse" />
        </div>
        <div className="h-3 w-12 rounded-lg bg-surface-muted animate-pulse" />
      </div>
      <div className="h-8 w-full rounded-lg bg-surface-muted animate-pulse" />
      <div className="flex gap-2">
        <div className="w-8 h-8 rounded-full bg-surface-muted animate-pulse shrink-0" />
        <div className="flex-1 h-8 rounded-xl bg-surface-muted animate-pulse" />
      </div>
    </div>
  );
}

export function SavedSkeleton() {
  return (
    <div className="glass rounded-xl px-4 py-3.5 flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-surface-muted animate-pulse shrink-0" />
      <div className="w-16 h-6 rounded-full bg-surface-muted animate-pulse shrink-0" />
      <div className="w-28 h-4 rounded-lg bg-surface-muted animate-pulse shrink-0 hidden sm:block" />
      <div className="flex-1 h-4 rounded-lg bg-surface-muted animate-pulse" />
      <div className="w-20 h-6 rounded-full bg-surface-muted animate-pulse shrink-0" />
      <div className="w-8 h-8 rounded-lg bg-surface-muted animate-pulse shrink-0" />
    </div>
  );
}
