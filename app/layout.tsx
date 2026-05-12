import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, DM_Sans } from 'next/font/google';
import './globals.css';
import { PWARegistration } from '@/components/PWARegistration';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Brisa Literária',
  description: 'Ouvir para sentir, sentir para aprender',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Brisa Literária',
  },
};

export const viewport: Viewport = {
  themeColor: '#b2e0e8',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${cormorant.variable} ${dmSans.variable}`}>
      <body suppressHydrationWarning className="bg-[var(--color-bg)] text-[var(--color-text)] font-body antialiased">
        <div className="relative min-h-screen">
          {/* Subtle paper texture overlay */}
          <div className="fixed inset-0 pointer-events-none opacity-[0.03] noise-bg z-[50]" />
          <PWARegistration />
          <main className="pb-20">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
