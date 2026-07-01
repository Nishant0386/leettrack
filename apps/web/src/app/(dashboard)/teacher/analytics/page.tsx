'use client';
// apps/web/src/app/(dashboard)/teacher/analytics/page.tsx
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { BarChart3, ArrowRight } from 'lucide-react';
import { classesApi } from '@/lib/api';

export default function TeacherAnalyticsPage() {
  const { data: classes, isLoading } = useQuery({
    queryKey: ['my-classes'],
    queryFn: () => classesApi.list().then((r) => r.data),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Analytics</h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
        Select a class to view its full analytics dashboard
      </p>

      {isLoading ? (
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {(classes || []).map((cls: any) => (
            <Link
              key={cls.id}
              href={`/teacher/classes/${cls.id}/dashboard`}
              className="flex items-center justify-between p-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl hover:shadow-lg hover:border-brand-200 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-50 dark:bg-brand-950 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-brand-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{cls.name}</p>
                  <p className="text-xs text-gray-400">{cls._count?.enrollments || 0} students</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-brand-500 transition" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
