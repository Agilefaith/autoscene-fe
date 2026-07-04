'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { navLinks } from '@/data/navigation';
import Logo from './Logo';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b',
          scrolled
            ? 'bg-white/80 backdrop-blur-xl border-border shadow-[0_4px_24px_rgba(82,50,168,0.05)]'
            : 'bg-transparent border-transparent'
        )}
        style={{ height: 80 }}
      >
        <div className="max-w-[1536px] mx-auto px-6 h-full flex items-center justify-between">
          <Logo />

          <nav className="hidden md:flex items-center gap-9">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="flex items-center gap-1 text-[15px] text-text-secondary hover:text-text transition-colors duration-200 font-medium"
              >
                {link.label}
                {link.dropdown && <ChevronDown className="w-4 h-4 text-text-muted mt-0.5" />}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-5">
            <Link
              href="/login"
              className="text-[15px] font-medium text-text-secondary hover:text-text transition-colors duration-200"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="btn-cta text-[15px] px-6 py-2.5 rounded-xl cursor-pointer"
            >
              Start Creating Free
            </Link>
          </div>

          <button
            className="md:hidden text-text-secondary hover:text-text transition-colors p-2"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[80px] left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-b border-border p-6 md:hidden shadow-[0_8px_30px_rgba(82,50,168,0.10)]"
          >
            <nav className="flex flex-col gap-4 mb-6">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between text-text-secondary hover:text-text transition-colors py-2 font-medium"
                >
                  {link.label}
                  {link.dropdown && <ChevronDown className="w-4 h-4 text-text-muted" />}
                </a>
              ))}
            </nav>
            <div className="flex flex-col gap-3">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="text-center py-2.5 rounded-xl border border-border-strong text-text-secondary hover:text-text hover:bg-surface-muted transition-all font-medium"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileOpen(false)}
                className="btn-cta text-center py-2.5 rounded-xl font-medium"
              >
                Start Creating Free
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
