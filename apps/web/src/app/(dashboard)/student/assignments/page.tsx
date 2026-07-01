'use client';
// apps/web/src/app/(dashboard)/student/assignments/page.tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, CheckCircle, Clock, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { assignmentsApi } from '@/lib/api';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: { label: 'Pending', color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950', icon: Clock },
  SUBMITTED: { label: 'Submitted', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950', icon: CheckCircle },
  GRADED: { label: 'Graded', color: 'text-green-600 bg-green-50 dark:bg-green-950', icon: CheckCircle },
  MISSED: { label: 'Missed', color: 'text-red-600 bg-red-50 dark:bg-red-950', icon: XCircle },
};

export default function StudentAssignmentsPage() {
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const { data: submissions, isLoading, refetch } = useQuery({
    queryKey: ['my-assignments'],
    queryFn: () => assignmentsApi.list().then((r) => r.data),
  });

  async function handleSubmit(assignmentId: string) {
    const notes = prompt('Add notes about your submission (optional):');
    setSubmittingId(assignmentId);
    try {
      const formData = new FormData();
      if (notes) formData.append('notes', notes);
      await assignmentsApi.submit(assignmentId, formData);
      toast.success('Assignment submitted!');
      refetch();
    } catch {
      toast.error('Submission failed');
    } finally {
      setSubmittingId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <FileText className="w-7 h-7 text-brand-500" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Assignments</h1>
      </div>

      {isLoading ? (
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      ) : !submissions || submissions.length === 0 ? (
        <p className="text-gray-400 text-sm">No assignments yet.</p>
      ) : (
        <div className="space-y-3">
          {submissions.map((s: any) => {
            const config = STATUS_CONFIG[s.status] || STATUS_CONFIG.PENDING;
            const Icon = config.icon;
            return (
              <div key={s.id} className="flex items-center justify-between bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{s.assignment.title}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Due {new Date(s.assignment.dueDate).toLocaleDateString()} · {s.assignment.maxMarks} marks
                    {s.marksObtained != null && ` · Scored ${s.marksObtained}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium', config.color)}>
                    <Icon className="w-3 h-3" /> {config.label}
                  </span>
                  {s.status === 'PENDING' && (
                    <button
                      onClick={() => handleSubmit(s.assignmentId)}
                      disabled={submittingId === s.assignmentId}
                      className="px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-medium rounded-lg transition"
                    >
                      Submit
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
