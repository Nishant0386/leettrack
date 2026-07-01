'use client';
// apps/web/src/app/(dashboard)/teacher/students/page.tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users } from 'lucide-react';
import { classesApi } from '@/lib/api';

export default function TeacherStudentsPage() {
  const [selectedClass, setSelectedClass] = useState('');

  const { data: classes } = useQuery({
    queryKey: ['my-classes'],
    queryFn: () => classesApi.list().then((r) => r.data),
  });

  const { data: students, isLoading } = useQuery({
    queryKey: ['class-students', selectedClass],
    queryFn: () => classesApi.getStudents(selectedClass).then((r) => r.data),
    enabled: !!selectedClass,
  });

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Users className="w-7 h-7 text-brand-500" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Students</h1>
      </div>

      <select
        value={selectedClass}
        onChange={(e) => setSelectedClass(e.target.value)}
        className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 mb-6 focus:outline-none focus:ring-2 focus:ring-brand-500"
      >
        <option value="">Select a class...</option>
        {(classes || []).map((cls: any) => (
          <option key={cls.id} value={cls.id}>{cls.name}</option>
        ))}
      </select>

      {isLoading ? (
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(students || []).map((e: any) => (
            <div key={e.student.id} className="flex items-center gap-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4">
              <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-950 flex items-center justify-center text-brand-600 dark:text-brand-400 font-semibold flex-shrink-0">
                {e.student.user.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-gray-900 dark:text-white truncate">{e.student.user.name}</p>
                <p className="text-xs text-gray-400 truncate">{e.student.leetcodeUsername || 'Not connected'}</p>
              </div>
            </div>
          ))}
          {selectedClass && (!students || students.length === 0) && (
            <p className="text-gray-400 text-sm col-span-full text-center py-8">No students enrolled yet</p>
          )}
        </div>
      )}
    </div>
  );
}
