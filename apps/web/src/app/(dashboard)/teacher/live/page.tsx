'use client';
// apps/web/src/app/(dashboard)/teacher/live/page.tsx
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Video, Plus, Play, Square, Calendar, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { classesApi, liveSessionsApi } from '@/lib/api';

export default function TeacherLivePage() {
  const queryClient = useQueryClient();
  const [selectedClass, setSelectedClass] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', scheduledAt: '', duration: 60 });
  const [submitting, setSubmitting] = useState(false);

  const { data: classes } = useQuery({
    queryKey: ['my-classes'],
    queryFn: () => classesApi.list().then((r) => r.data),
  });

  const { data: sessions, refetch } = useQuery({
    queryKey: ['live-sessions', selectedClass],
    queryFn: () => liveSessionsApi.list(selectedClass).then((r) => r.data),
    enabled: !!selectedClass,
  });

  async function handleCreate() {
    if (!form.title || !form.scheduledAt) return toast.error('Title and schedule time required');
    setSubmitting(true);
    try {
      await liveSessionsApi.create({ classId: selectedClass, ...form });
      toast.success('Session scheduled!');
      setShowForm(false);
      setForm({ title: '', scheduledAt: '', duration: 60 });
      refetch();
    } catch {
      toast.error('Failed to schedule session');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStart(id: string) {
    await liveSessionsApi.start(id);
    refetch();
    toast.success('Session started!');
  }

  async function handleEnd(id: string) {
    await liveSessionsApi.end(id);
    refetch();
    toast.success('Session ended');
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Video className="w-7 h-7 text-brand-500" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Live Classes</h1>
        </div>
        {selectedClass && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg transition"
          >
            <Plus className="w-4 h-4" /> Schedule Session
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
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Session title"
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800"
          />
          <input
            type="datetime-local"
            value={form.scheduledAt}
            onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800"
          />
          <input
            type="number"
            value={form.duration}
            onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) })}
            placeholder="Duration (minutes)"
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800"
          />
          <button
            onClick={handleCreate}
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-xl transition"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Schedule'}
          </button>
        </div>
      )}

      <div className="space-y-3">
        {(sessions || []).map((s: any) => (
          <div key={s.id} className="flex items-center justify-between bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{s.title}</p>
              <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                <Calendar className="w-3 h-3" /> {new Date(s.scheduledAt).toLocaleString()} · {s.duration}min · {s.status}
              </p>
            </div>
            <div className="flex gap-2">
              {s.status === 'SCHEDULED' && (
                <button onClick={() => handleStart(s.id)} className="flex items-center gap-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded-lg transition">
                  <Play className="w-3 h-3" /> Start
                </button>
              )}
              {s.status === 'LIVE' && (
                <>
                  <a href={s.meetingUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-medium rounded-lg transition">
                    Join
                  </a>
                  <button onClick={() => handleEnd(s.id)} className="flex items-center gap-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-lg transition">
                    <Square className="w-3 h-3" /> End
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
        {selectedClass && (!sessions || sessions.length === 0) && (
          <p className="text-gray-400 text-sm text-center py-8">No sessions scheduled yet</p>
        )}
      </div>
    </div>
  );
}
