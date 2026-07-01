// apps/web/src/components/ui/RiskBadge.tsx
import { cn } from '@/lib/utils';

const RISK_CONFIG = {
  HEALTHY: { label: 'Healthy', color: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400' },
  NEEDS_ATTENTION: { label: 'Needs Attention', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400' },
  AT_RISK: { label: 'At Risk', color: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400' },
};

export function RiskBadge({ level }: { level: keyof typeof RISK_CONFIG }) {
  const config = RISK_CONFIG[level] || RISK_CONFIG.HEALTHY;
  return (
    <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium', config.color)}>
      {config.label}
    </span>
  );
}
