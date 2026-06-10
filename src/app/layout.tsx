import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Vidora: AI Influencer Video Generator',
  description:
    'Create professional AI influencer videos on autopilot. Upload your image, configure your settings, and receive a fully rendered video in minutes.',
  keywords: ['AI video', 'AI influencer', 'video generation', 'SaaS', 'content creation'],
  authors: [{ name: 'Vidora' }],
  openGraph: {
    title: 'Vidora — AI Influencer Video Generator',
    description: 'Create professional AI influencer videos on autopilot.',
    type: 'website',
    siteName: 'Vidora',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vidora: AI Influencer Video Generator',
    description: 'Create professional AI influencer videos on autopilot.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full bg-[#050507] text-white antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
