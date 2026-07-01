'use client';
// apps/web/src/app/(dashboard)/student/progress/page.tsx
import { useQuery } from '@tanstack/react-query';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Target, Award } from 'lucide-react';
import { leetcodeApi } from '@/lib/api';

export default function StudentProgressPage() {
  const { data: lc, isLoading } = useQuery({
    queryKey: ['leetcode-data'],
    queryFn: () => leetcodeApi.getMyData().then((r) => r.data),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!lc) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <Target className="w-14 h-14 text-gray-300 mb-4" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">LeetCode not connected</h2>
        <p className="text-gray-400 text-sm">Connect your LeetCode account from onboarding to see progress.</p>
      </div>
    );
  }

  const timeline = (lc.snapshots || []).map((s: any) => ({
    date: new Date(s.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    Easy: s.easySolved,
    Medium: s.mediumSolved,
    Hard: s.hardSolved,
    total: s.totalSolved,
  }));

  const weeklyBuckets: { week: string; solved: number }[] = [];
  for (let i = 0; i < timeline.length; i += 7) {
    const chunk = timeline.slice(i, i + 7);
    if (chunk.length === 0) continue;
    weeklyBuckets.push({
      week: chunk[0].date,
      solved: chunk[chunk.length - 1].total - chunk[0].total,
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <TrendingUp className="w-7 h-7 text-brand-500" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Progress Analytics</h1>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Daily', value: lc.daily || 0 },
          { label: 'Weekly', value: lc.weekly || 0 },
          { label: 'Monthly', value: lc.monthly || 0 },
        ].map((g) => (
          <div key={g.label} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 text-center">
            <div className="text-2xl font-bold text-green-500">+{g.value}</div>
            <div className="text-xs text-gray-400 mt-1">{g.label} Growth</div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Solving Timeline (Cumulative)</h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={timeline}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line type="monotone" dataKey="total" name="Total Solved" stroke="#0e8de7" strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Weekly Growth</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={weeklyBuckets}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="week" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="solved" fill="#0e8de7" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
