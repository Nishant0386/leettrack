'use client';
// apps/web/src/app/(dashboard)/teacher/assignments/page.tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Plus, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { classesApi, assignmentsApi } from '@/lib/api';

export default function TeacherAssignmentsPage() {
  const [selectedClass, setSelectedClass] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', dueDate: '', difficulty: 'MEDIUM', maxMarks: 100 });
  const [submitting, setSubmitting] = useState(false);

  const { data: classes } = useQuery({
    queryKey: ['my-classes'],
    queryFn: () => classesApi.list().then((r) => r.data),
  });

  const { data: assignments, refetch } = useQuery({
    queryKey: ['assignments', selectedClass],
    queryFn: () => assignmentsApi.list(selectedClass).then((r) => r.data),
    enabled: !!selectedClass,
  });

  async function handleCreate() {
    if (!form.title || !form.dueDate) return toast.error('Title and due date required');
    setSubmitting(true);
    try {
      await assignmentsApi.create({ classId: selectedClass, ...form });
      toast.success('Assignment created!');
      setShowForm(false);
      setForm({ title: '', description: '', dueDate: '', difficulty: 'MEDIUM', maxMarks: 100 });
      refetch();
    } catch {
      toast.error('Failed to create assignment');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FileText className="w-7 h-7 text-brand-500" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Assignments</h1>
        </div>
        {selectedClass && (
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg transition">
            <Plus className="w-4 h-4" /> New Assignment
          </button>
        )}
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

      {showForm && (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 mb-6 max-w-lg space-y-3">
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Assignment title" className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800" />
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={3} className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 resize-none" />
          <div className="grid grid-cols-2 gap-3">
            <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800">
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
            <input type="number" value={form.maxMarks} onChange={(e) => setForm({ ...form, maxMarks: parseInt(e.target.value) })} placeholder="Max marks" className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800" />
          </div>
          <input type="datetime-local" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800" />
          <button onClick={handleCreate} disabled={submitting} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-xl transition">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Assignment'}
          </button>
        </div>
      )}

      <div className="space-y-3">
        {(assignments || []).map((a: any) => {
          const submitted = a.submissions?.filter((s: any) => s.status === 'SUBMITTED' || s.status === 'GRADED').length || 0;
          return (
            <div key={a.id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{a.title}</p>
                  <p className="text-xs text-gray-400 mt-1">Due {new Date(a.dueDate).toLocaleDateString()} · {a.difficulty} · {a.maxMarks} marks</p>
                </div>
                <span className="text-sm font-medium text-brand-500">{submitted}/{a.submissions?.length || 0} submitted</span>
              </div>
            </div>
          );
        })}
        {selectedClass && (!assignments || assignments.length === 0) && (
          <p className="text-gray-400 text-sm text-center py-8">No assignments yet</p>
        )}
      </div>
    </div>
  );
}
