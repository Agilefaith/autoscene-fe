import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

// Satoshi — self-hosted display font (Fontshare). See docs/AUTOSCENE_DESIGN_SYSTEM.md §3.
const satoshi = localFont({
  variable: '--font-satoshi',
  display: 'swap',
  src: [
    { path: './fonts/Satoshi-400.woff2', weight: '400', style: 'normal' },
    { path: './fonts/Satoshi-500.woff2', weight: '500', style: 'normal' },
    { path: './fonts/Satoshi-700.woff2', weight: '700', style: 'normal' },
    { path: './fonts/Satoshi-900.woff2', weight: '900', style: 'normal' },
  ],
});

export const metadata: Metadata = {
  title: 'AutoScene — Turn Your Scripts Into Stunning Videos Automatically',
  description:
    'AutoScene transforms your ideas into fully edited videos with AI-generated visuals, voiceovers, motion, and subtitles — in minutes, not hours.',
  keywords: ['AI video', 'faceless video', 'video generation', 'SaaS', 'content creation', 'AutoScene'],
  authors: [{ name: 'AutoScene' }],
  openGraph: {
    title: 'AutoScene — Turn Your Scripts Into Stunning Videos Automatically',
    description: 'AI-generated visuals, voiceovers, motion, and subtitles — in minutes, not hours.',
    type: 'website',
    siteName: 'AutoScene',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AutoScene — Turn Your Scripts Into Stunning Videos Automatically',
    description: 'AI-generated visuals, voiceovers, motion, and subtitles — in minutes, not hours.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${satoshi.variable} h-full`}>
      <body className="min-h-full bg-bg text-text antialiased overflow-x-hidden">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
