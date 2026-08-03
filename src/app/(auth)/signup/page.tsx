'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock } from 'lucide-react';
import Logo from '@/components/layout/Logo';

/**
 * Self-service signup is closed: AutoScene is invite-only (Faith, 2026-08-03).
 * The route is kept so old links and bookmarks explain the situation instead of
 * showing a 404, or a form that would fail on submit.
 */
export default function SignupClosedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Link
        href="/"
        className="absolute top-6 left-6 inline-flex items-center gap-2 text-sm text-text-muted hover:text-text transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to home
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="flex justify-center mb-8">
          <Logo href="/" size={30} wordmarkClassName="text-2xl" />
        </div>

        <div className="glass rounded-2xl p-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-xl font-display font-bold text-text">Invite-only access</h1>
          <p className="text-sm text-text-muted mt-2 leading-relaxed">
            AutoScene accounts are created by invitation. If you have been invited, check your
            email for the invitation link and set your password there.
          </p>
          <Link
            href="/login"
            className="btn-cta inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white mt-6 w-full"
          >
            Go to sign in
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
