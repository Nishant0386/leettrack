// apps/web/src/components/teacher/LeaderboardCard.tsx
import { Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Entry {
  rank: number;
  name: string;
  avatar?: string;
  totalSolved: number;
}

const RANK_STYLES: Record<number, string> = {
  1: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400',
  2: 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  3: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400',
};

export function LeaderboardCard({ entries }: { entries: Entry[] }) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-yellow-500" />
        <h3 className="font-semibold text-gray-900 dark:text-white">Top Performers</h3>
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">No data yet</p>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <div key={entry.rank} className="flex items-center gap-3">
              <div
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                  RANK_STYLES[entry.rank] || 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
                )}
              >
                {entry.rank}
              </div>
              <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-950 flex items-center justify-center text-brand-600 dark:text-brand-400 font-medium text-xs flex-shrink-0">
                {entry.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{entry.name}</p>
              </div>
              <span className="text-sm font-bold text-brand-500">{entry.totalSolved}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
