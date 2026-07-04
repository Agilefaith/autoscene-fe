// Shared form-control classes — AutoScene light theme (see globals.css @theme tokens).
const base =
  'bg-white border border-border-strong rounded-xl px-4 py-3 text-text placeholder-[#A8A2BC] ' +
  'focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors w-full text-sm';

export const inputClass = base;
// Kept for backward-compat; light theme uses a single accent (violet).
export const inputClassPurple = base;

export const selectClass = `${base} appearance-none cursor-pointer`;
export const selectClassPurple = selectClass;
