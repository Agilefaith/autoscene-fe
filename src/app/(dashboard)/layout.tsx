'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard, FolderOpen, FileText, Film, Mic, Palette,
  LayoutTemplate, Images, Download, CreditCard, Settings,
  Bell, Search, Zap, LogOut, Check, AlertTriangle,
  CheckCircle2, XCircle, Crown, ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Logo from '@/components/layout/Logo';
import { ConfirmProvider } from '@/components/ui/ConfirmProvider';
import { resolvePlan } from '@/data/plans';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Config ───────────────────────────────────────────────────────────────────

const sidebarItems: { label: string; href: string; icon: LucideIcon; badge?: string }[] = [
  { label: 'Dashboard',        href: '/dashboard',        icon: LayoutDashboard },
  { label: 'Projects',         href: '/projects',         icon: FolderOpen },
  { label: 'Scripts',          href: '/scripts',          icon: FileText },
  { label: 'Scenes',           href: '/scenes',           icon: Film },
  { label: 'Voiceovers',       href: '/voices',           icon: Mic },
  { label: 'Styles',           href: '/styles',           icon: Palette },
  { label: 'Templates',        href: '/templates',        icon: LayoutTemplate },
  { label: 'Thumbnail Cloner', href: '/thumbnail-cloner', icon: Images, badge: 'New' },
  { label: 'Exports',          href: '/exports',          icon: Download },
  { label: 'Billing',          href: '/billing',          icon: CreditCard },
  { label: 'Settings',         href: '/settings',         icon: Settings },
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
    body: '"Discipline vs Motivation" has finished rendering.',
    time: '2m ago',
  },
  {
    id: '2', type: 'error', read: false,
    title: 'Render failed',
    body: '"Silent Millionaire" failed during Rendering Scenes. Retry available.',
    time: '18m ago',
  },
  {
    id: '3', type: 'warning', read: true,
    title: 'Running low on videos',
    body: 'You have 2 videos left in your plan this month. Upgrade to keep generating.',
    time: '1h ago',
  },
];

const notifIcon = (type: NotifType) => {
  switch (type) {
    case 'success': return <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />;
    case 'error':   return <XCircle       className="w-4 h-4 text-error shrink-0 mt-0.5" />;
    case 'warning': return <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />;
    default:        return <Bell          className="w-4 h-4 text-primary shrink-0 mt-0.5" />;
  }
};


// ─── Layout ───────────────────────────────────────────────────────────────────

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, credits, signOut, loading } = useAuth();
  // Team access is admin-only (invite-only app), so it is added per-render rather
  // than sitting in the static list every user would see.
  const navItems = profile?.role === 'admin'
    ? [...sidebarItems, { label: 'Team access', href: '/team', icon: ShieldCheck }]
    : sidebarItems;

  const [searchQuery, setSearchQuery]     = useState('');
  const [notifOpen, setNotifOpen]         = useState(false);
  const [profileOpen, setProfileOpen]     = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(DUMMY_NOTIFICATIONS);

  const notifRef   = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  const displayName = user?.user_metadata?.full_name ?? user?.email ?? 'User';
  const displayEmail = user?.email ?? '';
  const initials = displayName.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase();
  const plan = resolvePlan(profile?.user_type, profile?.plan_tier);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const closeAll = () => { setNotifOpen(false); setProfileOpen(false); };

  return (
    <ConfirmProvider>
    <div className="flex h-screen bg-bg overflow-hidden">

      {/* ── Sidebar (dark) ── */}
      <aside className="w-[264px] flex-shrink-0 bg-[#0F0A1C] border-r border-white/[0.06] flex flex-col h-full">

        {/* Logo + plan badge */}
        <div className="px-5 h-[72px] flex items-center gap-2 border-b border-white/[0.06]">
          <Logo href="/dashboard" size={26} wordmarkClassName="text-lg text-white" />
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-white/70">
            {plan.name}
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-[#7C3AED] to-[#C026D3] text-white shadow-[0_6px_18px_-6px_rgba(124,58,237,0.7)]'
                    : 'text-[#9B96AD] hover:text-white hover:bg-white/[0.05]'
                )}
              >
                <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-white' : '')} />
                {item.label}
                {item.badge && (
                  <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-[#EC4899]/50 text-[#EC4899]">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Upgrade card */}
        {plan.id === 'free' && (
          <div className="px-3">
            <div className="rounded-2xl p-4 text-center bg-[#171227] border border-white/[0.07]">
              <div className="w-9 h-9 mx-auto rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#C026D3] flex items-center justify-center mb-2">
                <Crown className="w-4 h-4 text-white" />
              </div>
              <p className="text-sm font-semibold text-white">Upgrade your plan</p>
              <p className="text-[11px] text-[#9B96AD] leading-relaxed mt-1 mb-3">
                Subscribe for a monthly video quota, longer videos, and Mode 2 enhanced motion.
              </p>
              <Link
                href="/billing"
                className="block w-full px-3 py-2 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-[#7C3AED] via-[#EC4899] to-[#FB923C] hover:opacity-95 transition-opacity"
              >
                Upgrade Now
              </Link>
            </div>
          </div>
        )}
        <div className="pb-4" />
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="h-[72px] border-b border-border bg-surface/80 backdrop-blur-xl flex items-center px-6 gap-4 shrink-0 relative z-40">

          {/* Search */}
          <div className="flex-1 max-w-sm relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects…"
              className="w-full pl-9 pr-4 py-2 rounded-xl text-sm text-text placeholder-[#A8A2BC] bg-surface-muted border border-border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 ml-auto">

            {/* Credits pill */}
            <Link
              href="/billing"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-50 border border-primary/15 hover:border-primary/30 transition-colors"
            >
              <Zap className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-text">{credits?.balance ?? 0}</span>
              <span className="text-xs text-text-muted">{(credits?.balance ?? 0) === 1 ? 'video left' : 'videos left'}</span>
            </Link>

            {/* ── Notification bell ── */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => { setNotifOpen((o) => !o); setProfileOpen(false); }}
                className="relative w-9 h-9 rounded-xl bg-surface-muted border border-border flex items-center justify-center text-text-muted hover:text-text transition-colors"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
                )}
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-11 z-50 w-[340px] bg-surface border border-border rounded-2xl shadow-panel overflow-hidden"
                  >
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                      <span className="text-sm font-semibold text-text">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          className="flex items-center gap-1 text-xs text-primary hover:text-primary-dark transition-colors"
                        >
                          <Check className="w-3 h-3" /> Mark all read
                        </button>
                      )}
                    </div>
                    <div className="flex flex-col max-h-[360px] overflow-y-auto">
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={closeAll}
                          className={cn(
                            'flex items-start gap-3 px-4 py-3.5 border-b border-border transition-colors cursor-pointer',
                            !n.read ? 'bg-primary-50/60' : 'hover:bg-surface-muted'
                          )}
                        >
                          {notifIcon(n.type)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-0.5">
                              <p className={cn('text-xs font-semibold', n.read ? 'text-text-secondary' : 'text-text')}>
                                {n.title}
                              </p>
                              <span className="text-[10px] text-text-muted shrink-0">{n.time}</span>
                            </div>
                            <p className="text-[11px] text-text-muted leading-relaxed">{n.body}</p>
                          </div>
                          {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Profile avatar + dropdown ── */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => { setProfileOpen((o) => !o); setNotifOpen(false); }}
                className="w-9 h-9 rounded-full gradient-brand flex items-center justify-center text-xs font-bold text-white hover:opacity-90 transition-opacity"
              >
                {initials}
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-11 z-50 w-[220px] bg-surface border border-border rounded-2xl shadow-panel overflow-hidden"
                  >
                    <div className="px-4 py-3.5 border-b border-border">
                      <p className="text-sm font-semibold text-text">{displayName}</p>
                      <p className="text-xs text-text-muted mt-0.5 truncate">{displayEmail}</p>
                      <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full text-primary bg-primary-50">
                        {plan.name}
                      </span>
                    </div>
                    <div className="py-1">
                      <Link
                        href="/settings"
                        onClick={closeAll}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-text-secondary hover:text-text hover:bg-surface-muted transition-colors"
                      >
                        <Settings className="w-3.5 h-3.5" /> Settings
                      </Link>
                      <Link
                        href="/billing"
                        onClick={closeAll}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-text-secondary hover:text-text hover:bg-surface-muted transition-colors"
                      >
                        <CreditCard className="w-3.5 h-3.5" /> Billing & Credits
                      </Link>
                      <button
                        onClick={() => { closeAll(); signOut(); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-error hover:bg-error/5 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Log out
                      </button>
                    </div>
                  </motion.div>
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
          className={cn('flex-1', pathname === '/create' ? 'overflow-hidden' : 'overflow-y-auto p-6')}
        >
          {children}
        </motion.main>
      </div>
    </div>
    </ConfirmProvider>
  );
}
