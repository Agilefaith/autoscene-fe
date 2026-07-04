'use client';

import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { itemVariants } from '@/lib/animations';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      variants={itemVariants}
      className="flex flex-col items-center justify-center py-24 gap-5 text-center"
    >
      <div className="w-20 h-20 rounded-full bg-primary-50 border border-border flex items-center justify-center text-primary">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-text mb-1">{title}</h3>
        <p className="text-sm text-text-muted max-w-xs leading-relaxed">{description}</p>
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="btn-neon flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm"
        >
          <Plus className="w-4 h-4" />
          {action.label}
        </button>
      )}
    </motion.div>
  );
}
