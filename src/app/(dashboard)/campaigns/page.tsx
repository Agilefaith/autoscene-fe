'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, MoreVertical, Pencil, Pause, Trash2,
  Calendar, X, Play, Clock, Users, FileText, Mic,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

type CampaignStatus = 'active' | 'paused';
type ScheduleType   = 'Daily' | 'Weekly' | 'Custom';

interface CampaignData {
  id: string;
  name: string;
  persona: string;
  script: string;
  voice: string;
  schedule: ScheduleType;
  scheduleDays?: string[];   // Weekly
  scheduleDate?: string;     // Custom
  scheduleTime: string;
  status: CampaignStatus;
}

// ─── Options ──────────────────────────────────────────────────────────────────

const PERSONA_OPTIONS = ['Aria', 'Luna', 'Sofia', 'Zara', 'Jade', 'Nova'];
const SCRIPT_OPTIONS  = [
  'Skincare Morning Routine Ad',
  'Product Launch Announcement',
  'Weekly Fitness Challenge Promo',
  'Tech Gadget Unboxing Review',
];
const VOICE_OPTIONS   = ['Aria Neural', 'Marcus Pro', 'Zoe HD', 'Leo Studio', 'Mia Warm', 'Kai Dynamic'];
const WEEKDAYS        = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// ─── Dummy data ───────────────────────────────────────────────────────────────

const INITIAL_CAMPAIGNS: CampaignData[] = [
  {
    id: '1', name: 'Daily Skincare Tips',
    persona: 'Aria', script: 'Skincare Morning Routine Ad', voice: 'Aria Neural',
    schedule: 'Daily', scheduleTime: '09:00', status: 'active',
  },
  {
    id: '2', name: 'Weekly Fitness Roundup',
    persona: 'Jade', script: 'Weekly Fitness Challenge Promo', voice: 'Leo Studio',
    schedule: 'Weekly', scheduleDays: ['Mon', 'Thu'], scheduleTime: '08:00', status: 'active',
  },
  {
    id: '3', name: 'Product Launch — June',
    persona: 'Luna', script: 'Product Launch Announcement', voice: 'Mia Warm',
    schedule: 'Custom', scheduleDate: '2026-06-20', scheduleTime: '15:00', status: 'paused',
  },
];

// ─── Utils ────────────────────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.38 } },
};

const inputClass =
  'bg-[#050507] border border-white/[0.08] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00D4FF]/60 transition-colors w-full text-sm placeholder-[#52525B]';
const selectClass =
  'bg-[#050507] border border-white/[0.08] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00D4FF]/60 transition-colors w-full text-sm appearance-none cursor-pointer';

function formatSchedule(c: CampaignData): string {
  if (c.schedule === 'Daily') return `Daily at ${c.scheduleTime}`;
  if (c.schedule === 'Weekly') {
    const days = (c.scheduleDays ?? []).join(', ');
    return `${days || 'Weekly'} at ${c.scheduleTime}`;
  }
  if (c.schedule === 'Custom' && c.scheduleDate) {
    const d = new Date(c.scheduleDate);
    return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at ${c.scheduleTime}`;
  }
  return c.schedule;
}

// ─── Kebab Menu ───────────────────────────────────────────────────────────────

function CampaignKebab({
  campaign, onEdit, onToggle, onDelete,
}: {
  campaign: CampaignData;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 rounded-lg glass flex items-center justify-center text-[#52525B] hover:text-white transition-colors"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-9 z-20 bg-[#2A2A3D] border border-[#3A3A52] rounded-xl py-1 min-w-[130px] shadow-xl">
            <button
              onClick={() => { onEdit(); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#A1A1AA] hover:text-white hover:bg-[#31314A] transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" /> Edit
            </button>
            <button
              onClick={() => { onToggle(); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#A1A1AA] hover:text-white hover:bg-[#31314A] transition-colors"
            >
              {campaign.status === 'active'
                ? <><Pause className="w-3.5 h-3.5" /> Pause</>
                : <><Play className="w-3.5 h-3.5" /> Resume</>}
            </button>
            <button
              onClick={() => { onDelete(); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#EF4444] hover:bg-[#3D2525] transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Campaign Modal ───────────────────────────────────────────────────────────

function CampaignModal({
  initial,
  onClose,
  onSave,
}: {
  initial?: CampaignData;
  onClose: () => void;
  onSave: (data: Omit<CampaignData, 'id' | 'status'>) => void;
}) {
  const isEdit = !!initial;

  const [name, setName]           = useState(initial?.name ?? '');
  const [persona, setPersona]     = useState(initial?.persona ?? '');
  const [script, setScript]       = useState(initial?.script ?? '');
  const [voice, setVoice]         = useState(initial?.voice ?? '');
  const [schedule, setSchedule]   = useState<ScheduleType>(initial?.schedule ?? 'Daily');
  const [days, setDays]           = useState<string[]>(initial?.scheduleDays ?? []);
  const [date, setDate]           = useState(initial?.scheduleDate ?? '');
  const [time, setTime]           = useState(initial?.scheduleTime ?? '09:00');
  const [error, setError]         = useState('');

  const toggleDay = (d: string) =>
    setDays((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);

  const handleSave = () => {
    if (!name.trim())   { setError('Campaign name is required.'); return; }
    if (!persona)       { setError('Please select a persona.'); return; }
    if (!script)        { setError('Please select a script.'); return; }
    if (!voice)         { setError('Please select a voice.'); return; }
    if (schedule === 'Weekly' && days.length === 0) { setError('Select at least one day.'); return; }
    if (schedule === 'Custom' && !date) { setError('Please pick a date.'); return; }
    setError('');
    onSave({
      name: name.trim(), persona, script, voice, schedule,
      scheduleDays: schedule === 'Weekly' ? days : undefined,
      scheduleDate: schedule === 'Custom' ? date : undefined,
      scheduleTime: time,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-lg bg-[#0F0F18] rounded-2xl border border-white/[0.10] p-6 flex flex-col gap-5 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">{isEdit ? 'Edit Campaign' : 'New Campaign'}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg glass flex items-center justify-center text-[#52525B] hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Campaign name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[#A1A1AA]">Campaign Name</label>
          <input
            className={inputClass}
            placeholder="e.g. Daily Skincare Tips"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Persona / Script / Voice */}
        <div className="grid grid-cols-1 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#A1A1AA] flex items-center gap-1.5">
              <Users className="w-3 h-3" /> Persona
            </label>
            <select className={selectClass} value={persona} onChange={(e) => setPersona(e.target.value)}>
              <option value="">Choose persona…</option>
              {PERSONA_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#A1A1AA] flex items-center gap-1.5">
              <FileText className="w-3 h-3" /> Script
            </label>
            <select className={selectClass} value={script} onChange={(e) => setScript(e.target.value)}>
              <option value="">Choose script…</option>
              {SCRIPT_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#A1A1AA] flex items-center gap-1.5">
              <Mic className="w-3 h-3" /> Voice
            </label>
            <select className={selectClass} value={voice} onChange={(e) => setVoice(e.target.value)}>
              <option value="">Choose voice…</option>
              {VOICE_OPTIONS.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
        </div>

        {/* Schedule type */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-[#A1A1AA]">Schedule</label>
          <div className="flex gap-2">
            {(['Daily', 'Weekly', 'Custom'] as ScheduleType[]).map((s) => (
              <button
                key={s}
                onClick={() => setSchedule(s)}
                className={cn(
                  'flex-1 py-2.5 rounded-xl border text-xs font-semibold transition-all',
                  schedule === s
                    ? 'bg-[#00D4FF]/10 border-[#00D4FF]/40 text-[#00D4FF]'
                    : 'border-white/[0.08] text-[#52525B] hover:text-white'
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Schedule detail */}
        <AnimatePresence mode="wait">
          {schedule === 'Weekly' && (
            <motion.div
              key="weekly"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-col gap-2 overflow-hidden"
            >
              <label className="text-xs font-medium text-[#A1A1AA]">Days of the Week</label>
              <div className="flex gap-1.5 flex-wrap">
                {WEEKDAYS.map((d) => (
                  <button
                    key={d}
                    onClick={() => toggleDay(d)}
                    className={cn(
                      'w-10 h-10 rounded-xl border text-xs font-semibold transition-all',
                      days.includes(d)
                        ? 'bg-[#8A2BE2]/15 border-[#8A2BE2]/50 text-[#8A2BE2]'
                        : 'border-white/[0.08] text-[#52525B] hover:text-white'
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {schedule === 'Custom' && (
            <motion.div
              key="custom"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <label className="text-xs font-medium text-[#A1A1AA] mb-1.5 block">Date</label>
              <input
                type="date"
                className={inputClass}
                value={date}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setDate(e.target.value)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Time */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[#A1A1AA]">Time</label>
          <input
            type="time"
            className={inputClass}
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>

        {error && <p className="text-xs text-[#EF4444] -mt-2">{error}</p>}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-sm font-semibold text-[#A1A1AA] hover:text-white hover:border-white/20 transition-all"
          >
            Cancel
          </button>
          <button onClick={handleSave} className="flex-1 btn-neon py-2.5 rounded-xl text-sm font-semibold">
            {isEdit ? 'Save Changes' : 'Create Campaign'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <motion.div
      variants={itemVariants}
      className="flex flex-col items-center justify-center py-24 gap-5 text-center"
    >
      <div className="w-20 h-20 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
        <Calendar className="w-9 h-9 text-[#3F3F46]" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-white mb-1">No campaigns yet</h3>
        <p className="text-sm text-[#52525B] max-w-xs leading-relaxed">
          Schedule recurring video generation jobs — daily, weekly, or on a custom date.
        </p>
      </div>
      <button
        onClick={onNew}
        className="btn-neon flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm"
      >
        <Plus className="w-4 h-4" />
        Create First Campaign
      </button>
    </motion.div>
  );
}

// ─── Campaign Card ────────────────────────────────────────────────────────────

function CampaignCard({
  campaign, onEdit, onToggle, onDelete,
}: {
  campaign: CampaignData;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <motion.div
      variants={itemVariants}
      layout
      className="glass rounded-2xl px-5 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition-all"
    >
      {/* Status dot */}
      <div className={cn(
        'w-2 h-2 rounded-full shrink-0',
        campaign.status === 'active' ? 'bg-[#22C55E] shadow-[0_0_6px_#22C55E]' : 'bg-[#3F3F46]'
      )} />

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-sm font-semibold text-white truncate">{campaign.name}</h3>
          <span className={cn(
            'px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0',
            campaign.status === 'active'
              ? 'bg-[#22C55E]/10 border-[#22C55E]/20 text-[#22C55E]'
              : 'bg-[#3F3F46]/30 border-[#3F3F46]/30 text-[#52525B]'
          )}>
            {campaign.status === 'active' ? 'Active' : 'Paused'}
          </span>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-1 text-xs text-[#52525B]">
            <Users className="w-3 h-3" /> {campaign.persona}
          </span>
          <span className="flex items-center gap-1 text-xs text-[#52525B] hidden sm:flex">
            <FileText className="w-3 h-3" />
            <span className="truncate max-w-[140px]">{campaign.script}</span>
          </span>
          <span className="flex items-center gap-1 text-xs text-[#52525B] hidden md:flex">
            <Mic className="w-3 h-3" /> {campaign.voice}
          </span>
        </div>
      </div>

      {/* Schedule */}
      <div className="hidden sm:flex items-center gap-1.5 shrink-0">
        <div className={cn(
          'flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-semibold',
          campaign.schedule === 'Daily'
            ? 'bg-[#00D4FF]/10 border-[#00D4FF]/20 text-[#00D4FF]'
            : campaign.schedule === 'Weekly'
              ? 'bg-[#8A2BE2]/10 border-[#8A2BE2]/20 text-[#8A2BE2]'
              : 'bg-[#FBBF24]/10 border-[#FBBF24]/20 text-[#FBBF24]'
        )}>
          <Clock className="w-3 h-3" />
          {formatSchedule(campaign)}
        </div>
      </div>

      {/* Kebab */}
      <CampaignKebab
        campaign={campaign}
        onEdit={onEdit}
        onToggle={onToggle}
        onDelete={onDelete}
      />
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<CampaignData[]>(INITIAL_CAMPAIGNS);
  const [modal, setModal]         = useState<'new' | CampaignData | null>(null);

  const handleSave = (data: Omit<CampaignData, 'id' | 'status'>) => {
    if (modal === 'new') {
      setCampaigns((prev) => [{ ...data, id: crypto.randomUUID(), status: 'active' }, ...prev]);
    } else if (modal !== null) {
      setCampaigns((prev) => prev.map((c) => c.id === modal.id ? { ...c, ...data } : c));
    }
    setModal(null);
  };

  const handleToggle = (id: string) => {
    setCampaigns((prev) =>
      prev.map((c) => c.id === id ? { ...c, status: c.status === 'active' ? 'paused' : 'active' } : c)
    );
  };

  const handleDelete = (id: string) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <>
      <AnimatePresence>
        {modal && (
          <CampaignModal
            initial={modal === 'new' ? undefined : modal}
            onClose={() => setModal(null)}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-6xl mx-auto flex flex-col gap-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">Campaign Scheduler</h1>
            {campaigns.length > 0 && (
              <span className="px-3 py-1 rounded-full bg-[#00D4FF]/10 border border-[#00D4FF]/20 text-xs font-semibold text-[#00D4FF]">
                {campaigns.filter((c) => c.status === 'active').length} active
              </span>
            )}
          </div>
          {campaigns.length > 0 && (
            <button
              onClick={() => setModal('new')}
              className="btn-neon flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
            >
              <Plus className="w-4 h-4" />
              New Campaign
            </button>
          )}
        </motion.div>

        {campaigns.length === 0 ? (
          <EmptyState onNew={() => setModal('new')} />
        ) : (
          <motion.div variants={containerVariants} className="flex flex-col gap-3">
            {campaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                onEdit={() => setModal(campaign)}
                onToggle={() => handleToggle(campaign.id)}
                onDelete={() => handleDelete(campaign.id)}
              />
            ))}
          </motion.div>
        )}
      </motion.div>
    </>
  );
}
