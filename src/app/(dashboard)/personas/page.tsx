'use client';

import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreVertical, Plus, Video, Pencil, Trash2, Info, Upload, X, Users } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface PersonaData {
  id: string;
  name: string;
  imageUrl: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function KebabMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
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
          <div className="absolute right-0 top-9 z-20 bg-[#2A2A3D] border border-[#3A3A52] rounded-xl py-1 min-w-[120px] shadow-[0_8px_24px_rgba(0,0,0,0.6)]">
            <button
              onClick={() => { onEdit(); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#A1A1AA] hover:text-white hover:bg-[#31314A] transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" /> Edit
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

function UploadModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (persona: Omit<PersonaData, 'id'>) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('File must be an image (PNG or JPG).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be under 10MB.');
      return;
    }
    setError('');
    setPreview(URL.createObjectURL(file));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleSubmit = () => {
    if (!name.trim()) { setError('Persona name is required.'); return; }
    if (!preview) { setError('Please upload a photo first.'); return; }
    onSave({ name: name.trim(), imageUrl: preview });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-md bg-[#0F0F18] rounded-2xl border border-white/[0.10] p-6 flex flex-col gap-5 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Upload Persona</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg glass flex items-center justify-center text-[#52525B] hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dropzone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={cn(
            'relative w-full h-48 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden',
            dragging
              ? 'border-[#00D4FF]/60 bg-[#00D4FF]/[0.04]'
              : 'border-white/[0.10] hover:border-[#00D4FF]/40 hover:bg-[rgba(0,212,255,0.02)]'
          )}
        >
          {preview ? (
            <>
              <img src={preview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <p className="text-xs text-white font-medium">Click to change photo</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-3">
                <Upload className="w-5 h-5 text-[#52525B]" />
              </div>
              <p className="text-sm font-medium text-[#A1A1AA]">Drag & drop or click to upload</p>
              <p className="text-xs text-[#3F3F46] mt-1">PNG, JPG · Max 10MB</p>
            </>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />

        {/* Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[#A1A1AA]">Persona Name</label>
          <input
            className="bg-[#050507] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-[#52525B] focus:outline-none focus:border-[#8A2BE2]/60 transition-colors text-sm"
            placeholder="e.g. Aria, Luna, Sofia…"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Error */}
        {error && <p className="text-xs text-[#EF4444]">{error}</p>}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-sm font-semibold text-[#A1A1AA] hover:text-white hover:border-white/20 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 btn-neon py-2.5 rounded-xl text-sm font-semibold"
          >
            Save Persona
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function EmptyState({ onUpload }: { onUpload: () => void }) {
  return (
    <motion.div
      variants={itemVariants}
      className="flex flex-col items-center justify-center py-24 gap-5 text-center"
    >
      <div className="w-20 h-20 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
        <Users className="w-9 h-9 text-[#3F3F46]" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-white mb-1">No personas yet</h3>
        <p className="text-sm text-[#52525B] max-w-xs leading-relaxed">
          Upload your AI influencer photo to create your first persona. Personas are used as the avatar in every video you generate.
        </p>
      </div>
      <button
        onClick={onUpload}
        className="btn-neon flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm"
      >
        <Plus className="w-4 h-4" />
        Upload First Persona
      </button>
    </motion.div>
  );
}

const DUMMY_PERSONAS: PersonaData[] = [
  { id: '1', name: 'Aria', imageUrl: 'https://i.pravatar.cc/300?img=47' },
  { id: '2', name: 'Luna', imageUrl: 'https://i.pravatar.cc/300?img=25' },
];

export default function PersonasPage() {
  const [personas, setPersonas] = useState<PersonaData[]>(DUMMY_PERSONAS);
  const [showModal, setShowModal] = useState(false);
  const personaLimit = 10;

  const handleSave = (data: Omit<PersonaData, 'id'>) => {
    setPersonas((prev) => [...prev, { ...data, id: crypto.randomUUID() }]);
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    setPersonas((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <>
      <AnimatePresence>
        {showModal && (
          <UploadModal onClose={() => setShowModal(false)} onSave={handleSave} />
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
            <h1 className="text-2xl font-bold text-white">Persona Library</h1>
            {personas.length > 0 && (
              <span className="px-3 py-1 rounded-full bg-[#00D4FF]/10 border border-[#00D4FF]/20 text-xs font-semibold text-[#00D4FF]">
                {personas.length} / {personaLimit} Personas
              </span>
            )}
          </div>
          {personas.length > 0 && (
            <button
              onClick={() => setShowModal(true)}
              className="btn-neon flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
            >
              <Plus className="w-4 h-4" />
              Upload New Persona
            </button>
          )}
        </motion.div>

        {personas.length > 0 && (
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#8A2BE2]/10 border border-[#8A2BE2]/20"
          >
            <Info className="w-4 h-4 text-[#8A2BE2] shrink-0" />
            <p className="text-sm text-[#A1A1AA]">
              Personas can be reused across all campaigns.{' '}
              <span className="text-[#8A2BE2] font-medium">Upgrade to Pro</span> for up to 10 personas.
            </p>
          </motion.div>
        )}

        {/* Empty state */}
        {personas.length === 0 ? (
          <EmptyState onUpload={() => setShowModal(true)} />
        ) : (
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {personas.map((persona) => (
              <motion.div
                key={persona.id}
                variants={itemVariants}
                className="glass gradient-border rounded-2xl overflow-hidden flex flex-col group"
              >
                {/* Image */}
                <div className="w-full h-40 shrink-0 overflow-hidden bg-[#0B0B12]">
                  <img
                    src={persona.imageUrl}
                    alt={persona.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-white">{persona.name}</h3>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link
                      href="/create"
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[rgba(0,212,255,0.08)] border border-[#00D4FF]/20 text-[#00D4FF] text-xs font-semibold hover:bg-[rgba(0,212,255,0.15)] transition-all"
                    >
                      <Video className="w-3.5 h-3.5" />
                      Use in Video
                    </Link>
                    <KebabMenu
                      onEdit={() => console.log('Edit', persona.id)}
                      onDelete={() => handleDelete(persona.id)}
                    />
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Upload card */}
            <motion.div variants={itemVariants}>
              <button
                onClick={() => setShowModal(true)}
                className="w-full h-full min-h-[240px] glass rounded-2xl border-2 border-dashed border-white/[0.08] hover:border-[#00D4FF]/40 hover:bg-[rgba(0,212,255,0.03)] transition-all flex flex-col items-center justify-center gap-3 group"
              >
                <div className="w-12 h-12 rounded-full bg-white/[0.04] border border-white/[0.08] group-hover:border-[#00D4FF]/30 flex items-center justify-center transition-all">
                  <Plus className="w-5 h-5 text-[#52525B] group-hover:text-[#00D4FF] transition-colors" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-[#52525B] group-hover:text-white transition-colors">
                    Upload New Persona
                  </p>
                  <p className="text-xs text-[#3F3F46] mt-0.5">PNG, JPG up to 10MB</p>
                </div>
              </button>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </>
  );
}
