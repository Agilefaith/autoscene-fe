'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, ArrowLeft, ShieldCheck, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import Logo from '@/components/layout/Logo';

const inputClass = cn(
  'w-full pl-10 pr-4 py-3 rounded-xl text-sm text-text placeholder-text-muted',
  'bg-surface-muted border border-border',
  'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
  'transition-all duration-200'
);

const MIN_PASSWORD_LENGTH = 8;

/** Where the recovery link left us: still establishing the session, ready to set
 *  a new password, or arrived with a link that is expired or already used. */
type LinkState = 'checking' | 'ready' | 'invalid';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [linkState, setLinkState] = useState<LinkState>('checking');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // Supabase can deliver a recovery link three ways depending on how the project
  // is configured, so all three are handled: a PKCE `code`, a `token_hash` to
  // verify, or tokens in the URL fragment that the client picks up itself.
  useEffect(() => {
    let cancelled = false;

    const establishSession = async () => {
      const params = new URLSearchParams(window.location.search);
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));

      const errorDescription = params.get('error_description') ?? hash.get('error_description');
      if (errorDescription) {
        if (!cancelled) {
          setError(errorDescription);
          setLinkState('invalid');
        }
        return;
      }

      const code = params.get('code');
      const tokenHash = params.get('token_hash');

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!cancelled) setLinkState(error ? 'invalid' : 'ready');
        return;
      }

      if (tokenHash) {
        const { error } = await supabase.auth.verifyOtp({
          type: 'recovery',
          token_hash: tokenHash,
        });
        if (!cancelled) setLinkState(error ? 'invalid' : 'ready');
        return;
      }

      // Fragment flow: the client parses the tokens out of the URL on load, so
      // the session may land a beat after this effect runs.
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      if (data.session) {
        setLinkState('ready');
        return;
      }
      const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session && !cancelled) setLinkState('ready');
      });
      const timer = setTimeout(() => {
        if (!cancelled) setLinkState((s) => (s === 'checking' ? 'invalid' : s));
      }, 3000);
      return () => {
        sub.subscription.unsubscribe();
        clearTimeout(timer);
      };
    };

    void establishSession();
    return () => { cancelled = true; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Your password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (password !== confirm) {
      setError('Those passwords do not match.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }
    setDone(true);
    setTimeout(() => router.push('/dashboard'), 1500);
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
          {linkState === 'checking' ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
              <p className="text-sm text-text-muted">Checking your reset link...</p>
            </div>
          ) : linkState === 'invalid' ? (
            <div className="flex flex-col items-center text-center gap-3">
              <h1 className="text-2xl font-display font-bold text-text">This link has expired</h1>
              <p className="text-sm text-text-muted">
                {error ?? 'Password reset links can only be used once and are valid for one hour.'}
              </p>
              <Link
                href="/forgot-password"
                className="btn-cta w-full py-3 rounded-xl text-sm font-semibold mt-3"
              >
                Request a new link
              </Link>
            </div>
          ) : done ? (
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-2xl font-display font-bold text-text">Password updated</h1>
              <p className="text-sm text-text-muted">Taking you to your dashboard...</p>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-display font-bold text-text mb-2 text-center">
                Set a new password
              </h1>
              <p className="text-sm text-text-muted text-center mb-8">
                Choose a password of at least {MIN_PASSWORD_LENGTH} characters.
              </p>

              {error && (
                <div className="mb-4 px-4 py-3 rounded-xl bg-error/10 border border-error/20 text-sm text-error">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-text-secondary">New password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className={cn(inputClass, 'pr-12')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-text-secondary">Confirm password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                      placeholder="••••••••"
                      className={inputClass}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-cta w-full py-3 rounded-xl text-sm font-semibold mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Updating...' : 'Update password'}
                </button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
