'use client';
// apps/web/src/app/(dashboard)/teacher/classes/[classId]/dashboard/page.tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  PieChart, Pie, Cell, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import {
  Users, TrendingUp, BookOpen, Video, Activity,
  AlertTriangle, CheckCircle, Clock, Search, Filter,
  Download, RefreshCw, ArrowUpRight, ArrowDownRight, Brain,
} from 'lucide-react';
import { api } from '@/lib/api';
import { StudentTable } from '@/components/teacher/StudentTable';
import { LeaderboardCard } from '@/components/teacher/LeaderboardCard';
import { RiskBadge } from '@/components/ui/RiskBadge';
import { cn } from '@/lib/utils';

const DIFFICULTY_COLORS = { Easy: '#22c55e', Medium: '#f59e0b', Hard: '#ef4444' };

interface PageProps { params: { classId: string } }

export default function TeacherDashboard({ params }: PageProps) {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [search, setSearch] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['class-dashboard', params.classId],
    queryFn: () => api.get(`/analytics/class/${params.classId}`).then((r) => r.data),
    refetchInterval: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const { kpi, difficultyDistribution, dailyActivity, leaderboard, studentTable } = data || {};

  const diffData = [
    { name: 'Easy', value: difficultyDistribution?.easy || 0 },
    { name: 'Medium', value: difficultyDistribution?.medium || 0 },
    { name: 'Hard', value: difficultyDistribution?.hard || 0 },
  ];

  const filteredStudents = (studentTable || []).filter(
    (s: any) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.leetcodeUsername?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Class Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Live LeetCode analytics for your class
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button className="flex items-center gap-2 px-3 py-2 text-sm bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition">
            <Download className="w-4 h-4" /> Export Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Students',
            value: kpi?.totalStudents || 0,
            icon: Users,
            color: 'text-blue-500 bg-blue-50 dark:bg-blue-950',
            sub: `${kpi?.activeStudents || 0} active`,
          },
          {
            label: 'Total Solved',
            value: kpi?.totalSolved?.toLocaleString() || 0,
            icon: CheckCircle,
            color: 'text-green-500 bg-green-50 dark:bg-green-950',
            sub: `Avg ${kpi?.avgSolved || 0} / student`,
          },
          {
            label: 'Avg Growth',
            value: `+${kpi?.avgGrowthRate || 0}/wk`,
            icon: TrendingUp,
            color: 'text-purple-500 bg-purple-50 dark:bg-purple-950',
            sub: 'Problems this week',
          },
          {
            label: 'Avg Attendance',
            value: `${kpi?.avgAttendance || 0}%`,
            icon: Video,
            color: 'text-orange-500 bg-orange-50 dark:bg-orange-950',
            sub: `${kpi?.upcomingClasses || 0} upcoming classes`,
          },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {card.label}
              </span>
              <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', card.color)}>
                <card.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</div>
            <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Difficulty Pie */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Difficulty Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={diffData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                {diffData.map((entry) => (
                  <Cell key={entry.name} fill={DIFFICULTY_COLORS[entry.name as keyof typeof DIFFICULTY_COLORS]} />
                ))}
              </Pie>
              <Tooltip formatter={(val) => [val, 'Problems']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-around mt-2">
            {diffData.map((d) => (
              <div key={d.name} className="text-center">
                <div className="text-lg font-bold text-gray-900 dark:text-white">{d.value}</div>
                <div className="text-xs text-gray-400" style={{ color: DIFFICULTY_COLORS[d.name as keyof typeof DIFFICULTY_COLORS] }}>
                  {d.name}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Activity Line Chart */}
        <div className="md:col-span-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Daily Activity</h3>
            <div className="flex gap-2">
              {(['7d', '30d', '90d'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={cn(
                    'px-3 py-1 text-xs rounded-lg font-medium transition',
                    period === p
                      ? 'bg-brand-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={dailyActivity || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#0e8de7" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Leaderboard + Risk Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        <LeaderboardCard entries={leaderboard?.slice(0, 5) || []} />

        <div className="md:col-span-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-5 h-5 text-purple-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">AI Risk Overview</h3>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Healthy', count: 0, color: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400' },
              { label: 'Needs Attention', count: 0, color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400' },
              { label: 'At Risk', count: 0, color: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400' },
            ].map((r) => (
              <div key={r.label} className={cn('rounded-xl p-4 text-center', r.color)}>
                <div className="text-2xl font-bold">{r.count}</div>
                <div className="text-xs font-medium mt-1">{r.label}</div>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-400 text-center">
            AI insights update every 6 hours based on LeetCode snapshots
          </p>
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white">Student Analytics</h3>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search students..."
                  className="pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <button className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                <Filter className="w-4 h-4" /> Filter
              </button>
            </div>
          </div>
        </div>
        <StudentTable students={filteredStudents} classId={params.classId} />
      </div>
    </div>
  );
}
