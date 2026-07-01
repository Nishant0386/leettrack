'use client';
// apps/web/src/app/(dashboard)/teacher/classes/page.tsx
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Plus, Users, Calendar, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import { classesApi } from '@/lib/api';

export default function TeacherClassesPage() {
  const { data: classes, isLoading } = useQuery({
    queryKey: ['my-classes'],
    queryFn: () => classesApi.list().then((r) => r.data),
  });

  function copyJoinCode(code: string) {
    navigator.clipboard.writeText(code);
    toast.success('Join code copied!');
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Classes</h1>
        <Link
          href="/teacher/classes/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg transition"
        >
          <Plus className="w-4 h-4" /> New Class
        </Link>
      </div>

      {(!classes || classes.length === 0) ? (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center">
          <p className="text-gray-400 mb-4">No classes yet</p>
          <Link href="/teacher/classes/new" className="text-brand-500 font-medium hover:underline">
            Create your first class →
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {classes.map((cls: any) => (
            <div
              key={cls.id}
              className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 hover:shadow-lg transition"
            >
              <Link href={`/teacher/classes/${cls.id}/dashboard`}>
                <h3 className="font-semibold text-gray-900 dark:text-white hover:text-brand-500 transition mb-1">
                  {cls.name}
                </h3>
              </Link>
              <p className="text-sm text-gray-400 mb-4">{cls.subject}</p>
              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> {cls._count?.enrollments || 0} students
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {cls._count?.liveSessions || 0} sessions
                </span>
              </div>
              <button
                onClick={() => copyJoinCode(cls.joinCode)}
                className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                <span className="font-mono font-semibold text-brand-500">{cls.joinCode}</span>
                <Copy className="w-3.5 h-3.5 text-gray-400" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
