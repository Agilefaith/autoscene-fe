export interface NavLink {
  label: string;
  href: string;
  dropdown?: boolean;
}

export const navLinks: NavLink[] = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Features', href: '#niches' },
  { label: 'Pricing', href: '#pricing' },
];
