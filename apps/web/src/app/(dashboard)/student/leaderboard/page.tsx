'use client';
// apps/web/src/app/(dashboard)/student/leaderboard/page.tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Trophy, Medal } from 'lucide-react';
import { classesApi, api } from '@/lib/api';
import { cn } from '@/lib/utils';

const PERIODS = ['daily', 'weekly', 'monthly', 'semester'] as const;

export default function StudentLeaderboardPage() {
  const [selectedClass, setSelectedClass] = useState('');
  const [period, setPeriod] = useState<typeof PERIODS[number]>('semester');

  const { data: classes } = useQuery({
    queryKey: ['my-classes'],
    queryFn: () => classesApi.list().then((r) => r.data),
  });

  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['leaderboard', selectedClass, period],
    queryFn: () => api.get(`/leaderboard/${selectedClass}?period=${period}`).then((r) => r.data),
    enabled: !!selectedClass,
  });

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-7 h-7 text-yellow-500" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leaderboard</h1>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">Select a class...</option>
          {(classes || []).map((e: any) => (
            <option key={e.class.id} value={e.class.id}>{e.class.name}</option>
          ))}
        </select>

        <div className="flex gap-1">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                'px-3 py-1.5 text-xs rounded-lg font-medium transition capitalize',
                period === p ? 'bg-brand-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {!selectedClass ? (
        <p className="text-gray-400 text-sm">Select a class to view its leaderboard.</p>
      ) : isLoading ? (
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl divide-y divide-gray-50 dark:divide-gray-800">
          {(leaderboard || []).map((entry: any) => (
            <div key={entry.studentId} className="flex items-center gap-4 p-4">
              <span
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                  entry.rank === 1 && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950',
                  entry.rank === 2 && 'bg-gray-200 text-gray-700 dark:bg-gray-700',
                  entry.rank === 3 && 'bg-orange-100 text-orange-700 dark:bg-orange-950',
                  entry.rank > 3 && 'bg-gray-50 text-gray-500 dark:bg-gray-800',
                )}
              >
                {entry.rank <= 3 ? <Medal className="w-4 h-4" /> : entry.rank}
              </span>
              <img src={entry.avatar || '/avatar.svg'} alt="" className="w-9 h-9 rounded-full" />
              <span className="flex-1 font-medium text-gray-900 dark:text-white">{entry.name}</span>
              <span className="text-sm text-gray-400">{entry.xpPoints} XP</span>
              <span className="font-bold text-brand-500 w-12 text-right">{entry.score}</span>
            </div>
          ))}
          {(!leaderboard || leaderboard.length === 0) && (
            <p className="text-gray-400 text-sm text-center py-8">No leaderboard data yet</p>
          )}
        </div>
      )}
    </div>
  );
}
