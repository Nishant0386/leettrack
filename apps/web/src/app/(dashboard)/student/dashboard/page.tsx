'use client';
// apps/web/src/app/(dashboard)/student/dashboard/page.tsx
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Code2, Trophy, Flame, Star, FlaskConical } from 'lucide-react';
import { api } from '@/lib/api';
import { useSession } from 'next-auth/react';

const BADGE_CONFIG = [
  { id: 'FIRST_PROBLEM', label: 'First Problem', icon: '🎯', desc: 'Solved your first problem' },
  { id: 'STREAK_7', label: '7-Day Streak', icon: '🔥', desc: 'Active 7 days in a row' },
  { id: 'STREAK_30', label: '30-Day Streak', icon: '💎', desc: 'Active 30 days in a row' },
  { id: 'PROBLEMS_100', label: '100 Solved', icon: '💯', desc: 'Solved 100 problems' },
  { id: 'PROBLEMS_500', label: '500 Solved', icon: '⚡', desc: 'Solved 500 problems' },
  { id: 'CONSISTENCY_MASTER', label: 'Consistency Master', icon: '🏆', desc: 'Top consistency rating' },
  { id: 'DSA_WARRIOR', label: 'DSA Warrior', icon: '⚔️', desc: 'Mastered DSA fundamentals' },
  { id: 'HARD_CHAMPION', label: 'Hard Champion', icon: '👑', desc: '50+ Hard problems solved' },
];

// Mock data for dev-bypass mode
const DEV_PROFILE = { name: 'Demo Student', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=student', studentProfile: { leetcodeUsername: 'demo_coder', level: 'Intermediate', xpPoints: 1240, leetcodeVerified: true, badges: [{ badge: 'FIRST_PROBLEM' }, { badge: 'STREAK_7' }, { badge: 'PROBLEMS_100' }] } };
const DEV_LEETCODE = { totalSolved: 187, easySolved: 110, mediumSolved: 65, hardSolved: 12, contestRating: 1542, streak: 14, ranking: 83421, daily: 2, weekly: 8, monthly: 24, snapshots: Array.from({ length: 30 }, (_, i) => ({ date: new Date(Date.now() - (29 - i) * 86400000).toISOString(), totalSolved: 160 + i * Math.floor(Math.random() * 2) })) };

export default function StudentDashboard() {
  const { data: session } = useSession();
  const isDevBypass = (session as any)?.accessToken === 'dev-bypass-token';

  const { data: profile } = useQuery({
    queryKey: ['student-profile'],
    queryFn: () => api.get('/auth/me').then((r) => r.data),
    enabled: !isDevBypass,
    retry: false,
  });

  const { data: leetcode } = useQuery({
    queryKey: ['leetcode-data'],
    queryFn: () => api.get('/leetcode/my-data').then((r) => r.data),
    enabled: !isDevBypass && !!profile?.studentProfile?.leetcodeVerified,
    retry: false,
  });

  const displayProfile = isDevBypass ? DEV_PROFILE : profile;
  const lc = isDevBypass ? DEV_LEETCODE : leetcode;
  const student = displayProfile?.studentProfile;

  const statsCards = [
    { label: 'Total Solved', value: lc?.totalSolved || 0, icon: Code2, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950' },
    { label: 'Contest Rating', value: lc?.contestRating ? Math.round(lc.contestRating) : '—', icon: Trophy, color: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-950' },
    { label: 'Current Streak', value: lc?.streak ? `${lc.streak}d` : '0d', icon: Flame, color: 'text-orange-500 bg-orange-50 dark:bg-orange-950' },
    { label: 'Global Rank', value: lc?.ranking ? `#${lc.ranking.toLocaleString()}` : '—', icon: Star, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950' },
  ];

  const growthData = (lc?.snapshots || []).slice(-30).map((s: any) => ({
    date: new Date(s.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    solved: s.totalSolved,
  }));

  return (
    <div className="space-y-8">
      {/* Dev mode banner */}
      {isDevBypass && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl text-sm text-amber-700 dark:text-amber-300">
          <FlaskConical className="w-4 h-4 flex-shrink-0" />
          <span><strong>Dev Mode</strong> — showing demo data. Connect Google OAuth for real data.</span>
        </div>
      )}

      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-brand-500 to-purple-600 rounded-2xl p-6 text-white"
      >
        <div className="flex items-center gap-4">
          {displayProfile?.avatarUrl && (
            <img src={displayProfile.avatarUrl} alt="" className="w-14 h-14 rounded-full ring-2 ring-white/30" />
          )}
          <div>
            <p className="text-brand-100 text-sm">Welcome back,</p>
            <h1 className="text-2xl font-bold">{displayProfile?.name}</h1>
            <p className="text-brand-200 text-sm mt-0.5">
              LeetCode: {student?.leetcodeUsername || 'Not connected'} · Level: {student?.level || 'Beginner'} · {student?.xpPoints || 0} XP
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color}`}>
              <card.icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{card.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Difficulty Breakdown & Growth Chart */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Difficulty */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Difficulty Breakdown</h3>
          <div className="space-y-3">
            {[
              { label: 'Easy', solved: lc?.easySolved || 0, color: 'bg-green-500', total: 800 },
              { label: 'Medium', solved: lc?.mediumSolved || 0, color: 'bg-yellow-500', total: 1700 },
              { label: 'Hard', solved: lc?.hardSolved || 0, color: 'bg-red-500', total: 700 },
            ].map((d) => (
              <div key={d.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">{d.label}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{d.solved}</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${d.color} rounded-full transition-all duration-700`}
                    style={{ width: `${Math.min((d.solved / d.total) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: 'Daily', value: `+${lc?.daily || 0}` },
                { label: 'Weekly', value: `+${lc?.weekly || 0}` },
                { label: 'Monthly', value: `+${lc?.monthly || 0}` },
              ].map((g) => (
                <div key={g.label}>
                  <div className="text-lg font-bold text-green-500">{g.value}</div>
                  <div className="text-xs text-gray-400">{g.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Growth Chart */}
        <div className="md:col-span-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Progress Timeline (30 days)</h3>
          {growthData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="solved" stroke="#0e8de7" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
              No progress data yet. Start solving problems!
            </div>
          )}
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Achievement Center</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {BADGE_CONFIG.map((badge) => {
            const earned = student?.badges?.some((b: any) => b.badge === badge.id);
            return (
              <div
                key={badge.id}
                className={`rounded-xl p-4 text-center border transition ${
                  earned
                    ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800'
                    : 'border-gray-100 dark:border-gray-800 opacity-40 grayscale'
                }`}
              >
                <div className="text-3xl mb-2">{badge.icon}</div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">{badge.label}</div>
                <div className="text-xs text-gray-400 mt-1">{badge.desc}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

