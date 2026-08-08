'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, MailCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import Logo from '@/components/layout/Logo';

const inputClass = cn(
  'w-full pl-10 pr-4 py-3 rounded-xl text-sm text-text placeholder-text-muted',
  'bg-surface-muted border border-border',
  'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
  'transition-all duration-200'
);

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    // Shown even when the address has no account: confirming which emails are
    // registered would leak the member list of an invite-only app.
    setSent(true);
  };

  return (
    <div className="min-h-screen animated-bg flex items-center justify-center px-4 py-16 relative">
      <Link
        href="/login"
        className="absolute top-6 left-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-text-muted hover:text-text border border-border hover:border-border-strong hover:bg-surface transition-all duration-200"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to sign in
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <div className="flex justify-center mb-10">
          <Logo href="/" size={34} />
        </div>

        <div className="rounded-2xl bg-surface border border-border glow-panel p-8">
          {sent ? (
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center">
                <MailCheck className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-2xl font-display font-bold text-text">Check your email</h1>
              <p className="text-sm text-text-muted">
                If <span className="text-text-secondary">{email}</span> has an AutoScene
                account, we have sent it a link to set a new password. The link is valid
                for one hour.
              </p>
              <Link
                href="/login"
                className="btn-secondary w-full py-3 rounded-xl text-sm font-medium mt-3"
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-display font-bold text-text mb-2 text-center">
                Forgot your password?
              </h1>
              <p className="text-sm text-text-muted text-center mb-8">
                Enter your email and we will send you a link to set a new one.
              </p>

              {error && (
                <div className="mb-4 px-4 py-3 rounded-xl bg-error/10 border border-error/20 text-sm text-error">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-text-secondary">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="you@example.com"
                      className={inputClass}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-cta w-full py-3 rounded-xl text-sm font-semibold mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send reset link'}
                </button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
