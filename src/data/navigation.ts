export interface NavLink {
  label: string;
  href: string;
  dropdown?: boolean;
}

// Root-anchored hashes so the links also work from /features (a bare "#…"
// would silently do nothing outside the landing page).
export const navLinks: NavLink[] = [
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Features', href: '/features' },
  { label: 'Pricing', href: '/#pricing' },
];
