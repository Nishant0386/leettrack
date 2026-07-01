'use client';
// apps/web/src/app/(dashboard)/student/live/page.tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Video, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { classesApi, liveSessionsApi } from '@/lib/api';

export default function StudentLivePage() {
  const [selectedClass, setSelectedClass] = useState('');

  const { data: classes } = useQuery({
    queryKey: ['my-classes'],
    queryFn: () => classesApi.list().then((r) => r.data),
  });

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['live-sessions', selectedClass],
    queryFn: () => liveSessionsApi.list(selectedClass).then((r) => r.data),
    enabled: !!selectedClass,
  });

  async function handleJoin(sessionId: string) {
    try {
      const { data } = await liveSessionsApi.join(sessionId);
      window.open(data.meetingUrl, '_blank');
    } catch {
      toast.error('Unable to join session');
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Video className="w-7 h-7 text-brand-500" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Live Classes</h1>
      </div>

      <select
        value={selectedClass}
        onChange={(e) => setSelectedClass(e.target.value)}
        className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 mb-6 focus:outline-none focus:ring-2 focus:ring-brand-500"
      >
        <option value="">Select a class...</option>
        {(classes || []).map((e: any) => (
          <option key={e.class.id} value={e.class.id}>{e.class.name}</option>
        ))}
      </select>

      {isLoading ? (
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      ) : (
        <div className="space-y-3">
          {(sessions || []).map((s: any) => (
            <div key={s.id} className="flex items-center justify-between bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{s.title}</p>
                <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                  <Calendar className="w-3 h-3" /> {new Date(s.scheduledAt).toLocaleString()} · {s.status}
                </p>
              </div>
              {s.status === 'LIVE' && (
                <button onClick={() => handleJoin(s.id)} className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg transition">
                  Join Now
                </button>
              )}
            </div>
          ))}
          {selectedClass && (!sessions || sessions.length === 0) && (
            <p className="text-gray-400 text-sm text-center py-8">No live classes scheduled</p>
          )}
        </div>
      )}
    </div>
  );
}
