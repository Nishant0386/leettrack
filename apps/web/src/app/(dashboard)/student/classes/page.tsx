'use client';
// apps/web/src/app/(dashboard)/student/classes/page.tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Plus, LogOut, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { classesApi } from '@/lib/api';

export default function StudentClassesPage() {
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);
  const { data: enrollments, isLoading, refetch } = useQuery({
    queryKey: ['my-classes'],
    queryFn: () => classesApi.list().then((r) => r.data),
  });

  async function handleJoin() {
    if (!joinCode.trim()) return;
    setJoining(true);
    try {
      await classesApi.join({ code: joinCode.trim() });
      toast.success('Joined class!');
      setJoinCode('');
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid join code');
    } finally {
      setJoining(false);
    }
  }

  async function handleLeave(classId: string) {
    if (!confirm('Leave this class?')) return;
    await classesApi.leave(classId);
    toast.success('Left class');
    refetch();
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="w-7 h-7 text-brand-500" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Classes</h1>
      </div>

      <div className="flex gap-2 mb-6 max-w-md">
        <input
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
          placeholder="Enter join code"
          className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 font-mono uppercase focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <button
          onClick={handleJoin}
          disabled={joining}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-xl transition disabled:opacity-60"
        >
          {joining ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Join
        </button>
      </div>

      {isLoading ? (
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      ) : !enrollments || enrollments.length === 0 ? (
        <p className="text-gray-400 text-sm">You haven't joined any classes yet.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {enrollments.map((e: any) => (
            <div key={e.class.id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{e.class.name}</h3>
              <p className="text-sm text-gray-400 mb-4">{e.class.subject}</p>
              <p className="text-xs text-gray-400 mb-4">Instructor: {e.class.teacher?.user?.name}</p>
              <button
                onClick={() => handleLeave(e.class.id)}
                className="flex items-center gap-1.5 text-xs text-red-500 hover:underline"
              >
                <LogOut className="w-3 h-3" /> Leave class
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
