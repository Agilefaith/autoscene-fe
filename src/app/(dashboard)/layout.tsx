'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Video, User, FileText, Mic,
  Calendar, CreditCard, Bell, Search, Sparkles,
  ChevronRight, Zap, LogOut, Check, AlertTriangle,
  CheckCircle2, XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Config ───────────────────────────────────────────────────────────────────

const sidebarItems = [
  { label: 'Dashboard',    href: '/dashboard',  icon: LayoutDashboard },
  { label: 'Create Video', href: '/create',     icon: Video },
  { label: 'Personas',     href: '/personas',   icon: User },
  { label: 'Scripts',      href: '/scripts',    icon: FileText },
  { label: 'Voices',       href: '/voices',     icon: Mic },
  { label: 'Campaigns',    href: '/campaigns',  icon: Calendar },
  { label: 'Billing',      href: '/billing',    icon: CreditCard },
];

type NotifType = 'success' | 'error' | 'warning' | 'info';

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

const DUMMY_NOTIFICATIONS: Notification[] = [
  {
    id: '1', type: 'success', read: false,
    title: 'Video ready',
    body: '"Skincare Morning Routine Ad" has been generated successfully.',
    time: '2m ago',
  },
  {
    id: '2', type: 'error', read: false,
    title: 'Generation failed',
    body: '"Product Launch Announcement" failed during Avatar Rendering. Retry available.',
    time: '18m ago',
  },
  {
    id: '3', type: 'warning', read: true,
    title: 'Credits running low',
    body: 'You have 6 credits remaining (≈ 3 mins of video). Top up to keep generating.',
    time: '1h ago',
  },
  {
    id: '4', type: 'success', read: true,
    title: 'Campaign triggered',
    body: '"Daily Skincare Tips" campaign ran successfully — 1 video queued.',
    time: '9h ago',
  },
];

const notifIcon = (type: NotifType) => {
  switch (type) {
    case 'success': return <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />;
    case 'error':   return <XCircle       className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" />;
    case 'warning': return <AlertTriangle className="w-4 h-4 text-[#FBBF24] shrink-0 mt-0.5" />;
    default:        return <Bell          className="w-4 h-4 text-[#00D4FF] shrink-0 mt-0.5" />;
  }
};

const planMeta = {
  free:    { label: 'Free',    color: '#52525B', bg: 'bg-white/[0.06]' },
  pro:     { label: 'Pro',     color: '#00D4FF', bg: 'bg-[#00D4FF]/10' },
  premium: { label: 'Premium', color: '#8A2BE2', bg: 'bg-[#8A2BE2]/10' },
};

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery]       = useState('');
  const [notifOpen, setNotifOpen]           = useState(false);
  const [profileOpen, setProfileOpen]       = useState(false);
  const [notifications, setNotifications]   = useState<Notification[]>(DUMMY_NOTIFICATIONS);

  const notifRef   = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const mockUser = {
    name: 'Alex Rivera',
    email: 'alex@example.com',
    plan: 'pro' as 'free' | 'pro' | 'premium',
    initials: 'AR',
  };

  const plan = planMeta[mockUser.plan];
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const closeAll = () => { setNotifOpen(false); setProfileOpen(false); };

  return (
    <div className="flex h-screen bg-[#050507] overflow-hidden">

      {/* ── Sidebar ── */}
      <aside className="w-[240px] flex-shrink-0 bg-[#0B0B12] border-r border-white/[0.06] flex flex-col h-full">

        {/* Logo + plan badge */}
        <div className="px-5 h-[72px] flex items-center gap-2.5 border-b border-white/[0.06]">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#8A2BE2] to-[#00D4FF] flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-lg font-bold gradient-text tracking-tight">Vidora</span>
          </Link>
          <span
            className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', plan.bg)}
            style={{ color: plan.color }}
          >
            {plan.label}
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20 glow-blue'
                    : 'text-[#52525B] hover:text-[#A1A1AA] hover:bg-white/[0.06]'
                )}
              >
                <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-[#00D4FF]' : '')} />
                {item.label}
                {isActive && <ChevronRight className="w-3 h-3 ml-auto text-[#00D4FF]/60" />}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="h-[72px] border-b border-white/[0.06] bg-[#050507]/80 backdrop-blur-xl flex items-center px-6 gap-4 shrink-0 relative z-40">

          {/* Search */}
          <div className="flex-1 max-w-sm relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#52525B]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search videos, personas…"
              className="w-full pl-9 pr-4 py-2 rounded-xl text-sm text-white placeholder-[#52525B] glass border-0 focus:outline-none focus:ring-1 focus:ring-[#00D4FF]/30 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 ml-auto">

            {/* Credits pill */}
            <Link
              href="/billing"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] hover:border-[#00D4FF]/30 transition-colors"
            >
              <Zap className="w-3.5 h-3.5 text-[#00D4FF]" />
              <span className="text-xs font-semibold text-white">26</span>
              <span className="text-xs text-[#52525B]">credits</span>
            </Link>

            {/* ── Notification bell ── */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => { setNotifOpen((o) => !o); setProfileOpen(false); }}
                className="relative w-9 h-9 rounded-xl bg-[#1C1C2A] border border-[#2E2E42] flex items-center justify-center text-[#52525B] hover:text-white transition-colors"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#00D4FF]" />
                )}
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <>
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-11 z-50 w-[340px] bg-[#2A2A3D] border border-white/[0.18] rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.8)] overflow-hidden"
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between px-4 py-3 border-b border-[#3A3A52]">
                        <span className="text-sm font-semibold text-white">Notifications</span>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllRead}
                            className="flex items-center gap-1 text-xs text-[#00D4FF] hover:text-white transition-colors"
                          >
                            <Check className="w-3 h-3" /> Mark all read
                          </button>
                        )}
                      </div>

                      {/* List */}
                      <div className="flex flex-col max-h-[360px] overflow-y-auto">
                        {notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={closeAll}
                            className={cn(
                              'flex items-start gap-3 px-4 py-3.5 border-b border-[#3A3A52] transition-colors cursor-pointer',
                              !n.read ? 'bg-[#31314A]' : 'hover:bg-[#31314A]'
                            )}
                          >
                            {notifIcon(n.type)}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-0.5">
                                <p className={cn('text-xs font-semibold', n.read ? 'text-[#C4C4D4]' : 'text-white')}>
                                  {n.title}
                                </p>
                                <span className="text-[10px] text-[#8A8AA0] shrink-0">{n.time}</span>
                              </div>
                              <p className="text-[11px] text-[#9898B0] leading-relaxed">{n.body}</p>
                            </div>
                            {!n.read && (
                              <div className="w-1.5 h-1.5 rounded-full bg-[#00D4FF] shrink-0 mt-1.5" />
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* ── Profile avatar + dropdown ── */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => { setProfileOpen((o) => !o); setNotifOpen(false); }}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-[#8A2BE2] to-[#00D4FF] flex items-center justify-center text-xs font-bold text-white hover:opacity-90 transition-opacity"
              >
                {mockUser.initials}
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <>
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-11 z-50 w-[220px] bg-[#2A2A3D] border border-white/[0.18] rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.8)] overflow-hidden"
                    >
                      {/* User info */}
                      <div className="px-4 py-3.5 border-b border-[#3A3A52]">
                        <p className="text-sm font-semibold text-white">{mockUser.name}</p>
                        <p className="text-xs text-[#52525B] mt-0.5">{mockUser.email}</p>
                        <span
                          className={cn('inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full', plan.bg)}
                          style={{ color: plan.color }}
                        >
                          {plan.label} Plan
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="py-1">
                        <Link
                          href="/billing"
                          onClick={closeAll}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-[#A1A1AA] hover:text-white hover:bg-[#31314A] transition-colors"
                        >
                          <CreditCard className="w-3.5 h-3.5" /> Billing & Credits
                        </Link>
                        <button
                          onClick={() => { closeAll(); console.log('logout'); }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-[#EF4444] hover:bg-[#3D2525] transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5" /> Log out
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

          </div>
        </header>

        {/* Page content */}
        <motion.main
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className={cn(
            'flex-1 overflow-hidden',
            pathname === '/create' ? 'overflow-hidden' : 'overflow-y-auto p-6'
          )}
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
