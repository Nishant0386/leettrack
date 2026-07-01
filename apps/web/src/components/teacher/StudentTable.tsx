'use client';
// apps/web/src/components/teacher/StudentTable.tsx
import Link from 'next/link';
import { ArrowUpRight, ArrowDownRight, Minus, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Student {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  leetcodeUsername?: string;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  dailyGrowth: number;
  weeklyGrowth: number;
  monthlyGrowth: number;
  attendancePercent: number;
  assignmentCompletion: number;
  lastActive: string | null;
}

function GrowthBadge({ value }: { value: number }) {
  if (value > 0) return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950 px-2 py-0.5 rounded-full">
      <ArrowUpRight className="w-3 h-3" /> +{value}
    </span>
  );
  if (value < 0) return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-red-500 bg-red-50 dark:text-red-400 dark:bg-red-950 px-2 py-0.5 rounded-full">
      <ArrowDownRight className="w-3 h-3" /> {value}
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded-full">
      <Minus className="w-3 h-3" /> 0
    </span>
  );
}

function PercentBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs text-gray-600 dark:text-gray-400 w-9 text-right">{value}%</span>
    </div>
  );
}

export function StudentTable({ students, classId }: { students: Student[]; classId: string }) {
  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <p className="text-sm">No students found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            <th className="px-6 py-3 text-left">Student</th>
            <th className="px-4 py-3 text-right">Total</th>
            <th className="px-4 py-3 text-right">Easy</th>
            <th className="px-4 py-3 text-right">Med</th>
            <th className="px-4 py-3 text-right">Hard</th>
            <th className="px-4 py-3 text-center">Weekly ↑</th>
            <th className="px-4 py-3 text-center">Monthly ↑</th>
            <th className="px-4 py-3">Attendance</th>
            <th className="px-4 py-3">Assignments</th>
            <th className="px-4 py-3 text-right">Last Active</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
          {students.map((student) => (
            <tr
              key={student.id}
              className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-950 flex items-center justify-center text-brand-600 dark:text-brand-400 font-medium text-xs flex-shrink-0">
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{student.name}</div>
                    {student.leetcodeUsername && (
                      <a
                        href={`https://leetcode.com/${student.leetcodeUsername}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-brand-500 hover:underline"
                      >
                        @{student.leetcodeUsername}
                      </a>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-4 py-4 text-right font-bold text-gray-900 dark:text-white">
                {student.totalSolved}
              </td>
              <td className="px-4 py-4 text-right text-green-600 dark:text-green-400 font-medium">
                {student.easySolved}
              </td>
              <td className="px-4 py-4 text-right text-yellow-600 dark:text-yellow-400 font-medium">
                {student.mediumSolved}
              </td>
              <td className="px-4 py-4 text-right text-red-500 font-medium">
                {student.hardSolved}
              </td>
              <td className="px-4 py-4 text-center">
                <GrowthBadge value={student.weeklyGrowth} />
              </td>
              <td className="px-4 py-4 text-center">
                <GrowthBadge value={student.monthlyGrowth} />
              </td>
              <td className="px-4 py-4 min-w-[120px]">
                <PercentBar value={student.attendancePercent} color="bg-blue-500" />
              </td>
              <td className="px-4 py-4 min-w-[120px]">
                <PercentBar value={student.assignmentCompletion} color="bg-purple-500" />
              </td>
              <td className="px-4 py-4 text-right text-gray-400 text-xs">
                {student.lastActive
                  ? new Date(student.lastActive).toLocaleDateString('en', { month: 'short', day: 'numeric' })
                  : '—'}
              </td>
              <td className="px-4 py-4">
                <Link
                  href={`/teacher/classes/${classId}/students/${student.id}`}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 transition"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
