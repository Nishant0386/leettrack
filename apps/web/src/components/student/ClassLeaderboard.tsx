'use client';
// apps/web/src/components/student/ClassLeaderboard.tsx
import { useQuery } from '@tanstack/react-query';
import { Trophy, Medal } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

export function ClassLeaderboard({ classId }: { classId: string }) {
  const { data: leaderboard } = useQuery({
    queryKey: ['leaderboard', classId],
    queryFn: () => api.get(`/leaderboard/${classId}`).then((r) => r.data),
    enabled: !!classId,
  });

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-yellow-500" />
        <h3 className="font-semibold text-gray-900 dark:text-white">Class Leaderboard</h3>
      </div>
      <div className="space-y-2">
        {(leaderboard || []).slice(0, 10).map((entry: any) => (
          <div
            key={entry.studentId}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            <span
              className={cn(
                'w-6 text-center text-sm font-bold',
                entry.rank === 1 && 'text-yellow-500',
                entry.rank === 2 && 'text-gray-400',
                entry.rank === 3 && 'text-orange-400',
              )}
            >
              {entry.rank <= 3 ? <Medal className="w-4 h-4 inline" /> : entry.rank}
            </span>
            <img src={entry.avatar} alt="" className="w-7 h-7 rounded-full" />
            <span className="flex-1 text-sm font-medium text-gray-900 dark:text-white truncate">{entry.name}</span>
            <span className="text-sm font-bold text-brand-500">{entry.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
