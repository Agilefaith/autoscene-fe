import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { navLinks } from '@/data/navigation';

export default function SiteFooter() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#0B0B12]">
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#8A2BE2] to-[#00D4FF] flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
          <span className="text-sm font-semibold gradient-text">Vidora</span>
        </div>

        <nav className="flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-xs text-[#52525B] hover:text-[#A1A1AA] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <p className="text-xs text-[#52525B]">
          © {new Date().getFullYear()} Vidora. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
