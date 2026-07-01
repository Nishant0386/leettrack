'use client';
// apps/web/src/app/(dashboard)/teacher/dashboard/page.tsx
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Plus, Users, BookOpen, Calendar, FlaskConical } from 'lucide-react';
import { classesApi } from '@/lib/api';
import { useSession } from 'next-auth/react';

// Demo data shown when using dev-bypass login (no real backend required)
const DEV_CLASSES = [
  { id: 'demo-1', name: 'Data Structures & Algorithms', subject: 'Computer Science', joinCode: 'DSA2024', _count: { enrollments: 24, liveSessions: 8 } },
  { id: 'demo-2', name: 'Competitive Programming', subject: 'CS Elective', joinCode: 'CP2024', _count: { enrollments: 15, liveSessions: 3 } },
  { id: 'demo-3', name: 'Interview Prep Bootcamp', subject: 'Career', joinCode: 'PREP24', _count: { enrollments: 32, liveSessions: 12 } },
];

export default function TeacherDashboardRoot() {
  const { data: session } = useSession();
  const isDevBypass = (session as any)?.accessToken === 'dev-bypass-token';

  const { data: classes, isLoading } = useQuery({
    queryKey: ['my-classes'],
    queryFn: () => classesApi.list().then((r) => r.data),
    enabled: !isDevBypass,   // skip real API call in dev mode
    retry: false,
  });

  const displayClasses = isDevBypass ? DEV_CLASSES : classes;

  if (isLoading && !isDevBypass) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!displayClasses || displayClasses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <BookOpen className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No classes yet</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Create your first class to start tracking student progress</p>
        <Link
          href="/teacher/classes/new"
          className="inline-flex items-center gap-2 px-5 py-3 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-xl transition"
        >
          <Plus className="w-4 h-4" /> Create Class
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Dev mode banner */}
      {isDevBypass && (
        <div className="mb-5 flex items-center gap-2 px-4 py-2.5 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl text-sm text-amber-700 dark:text-amber-300">
          <FlaskConical className="w-4 h-4 flex-shrink-0" />
          <span><strong>Dev Mode</strong> — showing demo data. Connect Google OAuth for real data.</span>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Classes</h1>
        <Link
          href="/teacher/classes/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg transition"
        >
          <Plus className="w-4 h-4" /> New Class
        </Link>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {displayClasses.map((cls: any) => (
          <Link
            key={cls.id}
            href={`/teacher/classes/${cls.id}/dashboard`}
            className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 hover:shadow-lg hover:border-brand-200 transition group"
          >
            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-brand-500 transition mb-1">
              {cls.name}
            </h3>
            <p className="text-sm text-gray-400 mb-4">{cls.subject}</p>
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" /> {cls._count?.enrollments || 0} students
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> {cls._count?.liveSessions || 0} sessions
              </span>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400">
              Join Code: <span className="font-mono font-semibold text-brand-500">{cls.joinCode}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
