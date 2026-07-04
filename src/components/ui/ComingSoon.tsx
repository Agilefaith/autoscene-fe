'use client';

import { Sparkles } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';

export function ComingSoon({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-display font-bold text-text mb-6">{title}</h1>
      <div className="glass rounded-2xl">
        <EmptyState
          icon={icon ?? <Sparkles className="w-8 h-8" />}
          title={`${title} — coming soon`}
          description={description}
        />
      </div>
    </div>
  );
}
