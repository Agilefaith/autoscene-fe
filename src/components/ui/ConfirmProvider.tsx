'use client';

import { createContext, useCallback, useContext, useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, HelpCircle, CheckCircle2, XCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

type Variant = 'danger' | 'default';
export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: Variant;
}
type ToastType = 'success' | 'error' | 'info';
interface Toast { id: string; message: string; type: ToastType }

interface Ctx {
  confirm: (opts: ConfirmOptions) => Promise<boolean>;
  toast: (message: string, type?: ToastType) => void;
}

const ConfirmContext = createContext<Ctx>({
  confirm: async () => false,
  toast: () => {},
});

export const useConfirm = () => useContext(ConfirmContext).confirm;
export const useToast = () => useContext(ConfirmContext).toast;

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ opts: ConfirmOptions; resolve: (v: boolean) => void } | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const confirm = useCallback(
    (opts: ConfirmOptions) => new Promise<boolean>((resolve) => setState({ opts, resolve })),
    [],
  );
  const close = useCallback((val: boolean) => {
    setState((s) => { s?.resolve(val); return null; });
  }, []);

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  // Escape closes the dialog (cancel)
  useEffect(() => {
    if (!state) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [state, close]);

  const value = useMemo(() => ({ confirm, toast }), [confirm, toast]);
  const danger = state?.opts.variant === 'danger';

  return (
    <ConfirmContext.Provider value={value}>
      {children}

      {mounted && createPortal(
        <AnimatePresence>
          {state && (
            <motion.div
              className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              <div className="absolute inset-0 bg-[#1C1530]/40 backdrop-blur-sm" onClick={() => close(false)} />
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 12 }}
                transition={{ duration: 0.18 }}
                className="relative w-full max-w-sm bg-surface rounded-2xl shadow-panel border border-border p-6"
              >
                <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center mb-4',
                  danger ? 'bg-error/10 text-error' : 'bg-primary-50 text-primary')}>
                  {danger ? <AlertTriangle className="w-5 h-5" /> : <HelpCircle className="w-5 h-5" />}
                </div>
                <h3 className="text-base font-semibold text-text">{state.opts.title}</h3>
                {state.opts.message && <p className="text-sm text-text-muted mt-1.5 leading-relaxed">{state.opts.message}</p>}
                <div className="flex justify-end gap-2 mt-5">
                  <button onClick={() => close(false)} className="btn-secondary px-4 py-2 rounded-xl text-sm font-medium">
                    {state.opts.cancelLabel ?? 'Cancel'}
                  </button>
                  <button
                    onClick={() => close(true)}
                    className={cn('px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors',
                      danger ? 'bg-error hover:bg-error/90' : 'btn-cta')}
                  >
                    {state.opts.confirmLabel ?? 'Confirm'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}

      {mounted && createPortal(
        <div className="fixed bottom-5 right-5 z-[10000] flex flex-col gap-2 items-end">
          <AnimatePresence>
            {toasts.map((t) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2.5 bg-surface border border-border rounded-xl shadow-panel px-4 py-3 max-w-xs"
              >
                {t.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                  : t.type === 'error' ? <XCircle className="w-4 h-4 text-error shrink-0" />
                  : <Info className="w-4 h-4 text-primary shrink-0" />}
                <span className="text-sm text-text">{t.message}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>,
        document.body,
      )}
    </ConfirmContext.Provider>
  );
}
