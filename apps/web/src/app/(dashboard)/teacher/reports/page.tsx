'use client';
// apps/web/src/app/(dashboard)/teacher/reports/page.tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileSpreadsheet, FileText, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { classesApi, api } from '@/lib/api';

export default function TeacherReportsPage() {
  const [selectedClass, setSelectedClass] = useState('');
  const [downloading, setDownloading] = useState<string | null>(null);

  const { data: classes } = useQuery({
    queryKey: ['my-classes'],
    queryFn: () => classesApi.list().then((r) => r.data),
  });

  async function download(type: 'excel' | 'attendance-csv') {
    if (!selectedClass) return toast.error('Please select a class first');
    setDownloading(type);
    try {
      const res = await api.get(`/reports/class/${selectedClass}/${type}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = type === 'excel' ? 'class-report.xlsx' : 'attendance-report.csv';
      a.click();
      toast.success('Report downloaded!');
    } catch {
      toast.error('Failed to generate report');
    } finally {
      setDownloading(null);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Reports & Export Center</h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Generate and export class analytics reports</p>

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

      <div className="grid md:grid-cols-2 gap-5 max-w-2xl">
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
          <FileSpreadsheet className="w-8 h-8 text-green-500 mb-3" />
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Class Analytics</h3>
          <p className="text-sm text-gray-400 mb-4">Full student performance breakdown as Excel</p>
          <button
            onClick={() => download('excel')}
            disabled={downloading === 'excel'}
            className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition"
          >
            <Download className="w-4 h-4" /> {downloading === 'excel' ? 'Generating...' : 'Download Excel'}
          </button>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
          <FileText className="w-8 h-8 text-blue-500 mb-3" />
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Attendance Report</h3>
          <p className="text-sm text-gray-400 mb-4">Session-wise attendance log as CSV</p>
          <button
            onClick={() => download('attendance-csv')}
            disabled={downloading === 'attendance-csv'}
            className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition"
          >
            <Download className="w-4 h-4" /> {downloading === 'attendance-csv' ? 'Generating...' : 'Download CSV'}
          </button>
        </div>
      </div>
    </div>
  );
}
