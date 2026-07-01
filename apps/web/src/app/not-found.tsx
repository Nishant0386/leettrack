// apps/web/src/app/not-found.tsx
import Link from 'next/link';
import { Code2 } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="text-center">
        <Code2 className="w-12 h-12 text-brand-500 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">404</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">This page doesn't exist.</p>
        <Link href="/" className="text-brand-500 hover:underline font-medium">
          Back to home
        </Link>
      </div>
    </div>
  );
}
