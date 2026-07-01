'use client';
// apps/web/src/app/(dashboard)/teacher/email/page.tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Mail, Send, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { classesApi, emailApi } from '@/lib/api';

export default function TeacherEmailPage() {
  const [selectedClass, setSelectedClass] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);

  const { data: classes } = useQuery({
    queryKey: ['my-classes'],
    queryFn: () => classesApi.list().then((r) => r.data),
  });

  const { data: students } = useQuery({
    queryKey: ['class-students', selectedClass],
    queryFn: () => classesApi.getStudents(selectedClass).then((r) => r.data),
    enabled: !!selectedClass,
  });

  async function handleSend() {
    if (!subject.trim() || !content.trim()) return toast.error('Subject and content are required');
    if (!students || students.length === 0) return toast.error('No students in this class');

    setSending(true);
    try {
      await emailApi.sendBulk({
        recipients: students.map((s: any) => ({ email: s.student.user.email, name: s.student.user.name })),
        subject,
        content,
      });
      toast.success(`Email sent to ${students.length} students!`);
      setSubject('');
      setContent('');
    } catch {
      toast.error('Failed to send email');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Mail className="w-7 h-7 text-brand-500" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Email Center</h1>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 space-y-4">
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">Select recipient class...</option>
          {(classes || []).map((cls: any) => (
            <option key={cls.id} value={cls.id}>{cls.name}</option>
          ))}
        </select>

        {selectedClass && (
          <p className="text-xs text-gray-400">Will send to {students?.length || 0} enrolled students</p>
        )}

        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject"
          className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          placeholder="Write your email content (HTML supported)..."
          className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
        />

        <button
          onClick={handleSend}
          disabled={sending || !selectedClass}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-medium rounded-xl transition"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {sending ? 'Sending...' : 'Send Email'}
        </button>
      </div>
    </div>
  );
}
