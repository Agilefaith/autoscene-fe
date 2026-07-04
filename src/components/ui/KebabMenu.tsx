'use client';

import { useRef, useState } from 'react';
import { MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface KebabItem {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}

interface KebabMenuProps {
  items: KebabItem[];
}

export function KebabMenu({ items }: KebabMenuProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos]   = useState({ top: 0, right: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleOpen = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 6, right: window.innerWidth - rect.right });
    }
    setOpen((p) => !p);
  };

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={handleOpen}
        className="w-8 h-8 rounded-lg glass flex items-center justify-center text-[#52525B] hover:text-white transition-colors"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="fixed z-50 bg-[#2A2A3D] border border-[#3A3A52] rounded-xl py-1 min-w-[130px] shadow-[0_8px_24px_rgba(0,0,0,0.6)]"
            style={{ top: pos.top, right: pos.right }}
          >
            {items.map((item) => (
              <button
                key={item.label}
                onClick={() => { item.onClick(); setOpen(false); }}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors',
                  item.danger
                    ? 'text-[#EF4444] hover:bg-[#3D2525]'
                    : 'text-[#A1A1AA] hover:text-white hover:bg-[#31314A]'
                )}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
