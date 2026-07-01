// apps/web/src/components/shared/ComingSoon.tsx
import { LucideIcon } from 'lucide-react';

export function ComingSoon({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
      <div className="w-16 h-16 bg-brand-50 dark:bg-brand-950 rounded-2xl flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-brand-500" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
      <p className="text-gray-500 dark:text-gray-400 max-w-sm">{description}</p>
    </div>
  );
}
