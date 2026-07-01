'use client';
// apps/web/src/app/onboarding/page.tsx
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, classesApi } from '@/lib/api';

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);

  const isTeacher = session?.user?.role === 'TEACHER' || session?.user?.role === 'SUPER_ADMIN';

  async function handleConnectLeetcode() {
    if (!username.trim()) return toast.error('Please enter your LeetCode username');
    setLoading(true);
    try {
      await api.post('/auth/connect-leetcode', { username: username.trim() });
      setVerified(true);
      toast.success('LeetCode profile verified!');
      setTimeout(() => setStep(2), 800);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'LeetCode profile not found');
    } finally {
      setLoading(false);
    }
  }

  async function handleJoinClass() {
    if (!joinCode.trim()) return toast.error('Please enter a join code');
    setLoading(true);
    try {
      await classesApi.join({ code: joinCode.trim() });
      toast.success('Joined class successfully!');
      router.push('/student/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid join code');
    } finally {
      setLoading(false);
    }
  }

  if (isTeacher) {
    router.push('/teacher/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="w-full max-w-md">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1.5 rounded-full transition-colors ${
                s <= step ? 'bg-brand-500' : 'bg-gray-200 dark:bg-gray-800'
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-8"
            >
              <div className="w-12 h-12 bg-brand-50 dark:bg-brand-950 rounded-xl flex items-center justify-center mb-4">
                <Code2 className="w-6 h-6 text-brand-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Connect your LeetCode account
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                Enter your LeetCode username — we only read your public profile, no password needed.
              </p>

              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. john_doe_2024"
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 mb-4"
                disabled={verified}
              />

              <button
                onClick={handleConnectLeetcode}
                disabled={loading || verified}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-medium rounded-xl transition"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : verified ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" /> Verified
                  </>
                ) : (
                  <>
                    Verify & Continue <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-8"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Join your class
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                Enter the join code your teacher shared with you.
              </p>

              <input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="e.g. A1B2C3D4"
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 mb-4 uppercase tracking-wider font-mono"
              />

              <button
                onClick={handleJoinClass}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-medium rounded-xl transition"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Join Class <ArrowRight className="w-4 h-4" /></>}
              </button>

              <button
                onClick={() => router.push('/student/dashboard')}
                className="w-full text-center text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mt-4"
              >
                Skip for now
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
