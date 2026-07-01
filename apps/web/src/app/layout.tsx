// apps/web/src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: { default: 'LeetTrack', template: '%s | LeetTrack' },
  description: 'AI-powered LeetCode Progress Tracking for DSA Classes',
  keywords: ['LeetCode', 'DSA', 'Programming', 'Education', 'Analytics'],
  openGraph: {
    type: 'website',
    title: 'LeetTrack',
    description: 'Track, Analyze, Improve — LeetCode Progress for Classrooms',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-gray-50 dark:bg-gray-950`}>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              className: 'text-sm font-medium',
              duration: 4000,
              style: { background: '#1e293b', color: '#f8fafc', borderRadius: '10px' },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
