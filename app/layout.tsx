// app/layout.tsx
import type { ReactNode } from 'react';
import type { Metadata, Viewport } from 'next';
import './globals.css';
import ServiceWorkerRegister from './components/ServiceWorkerRegister';

export const metadata: Metadata = {
  title: 'WageWise',
  description: 'AI money coach for people with irregular income',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'WageWise',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: '#020617',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
