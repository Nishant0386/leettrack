'use client';
// apps/web/src/app/(dashboard)/teacher/insights/page.tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Brain, AlertTriangle, CheckCircle, TrendingDown } from 'lucide-react';
import { classesApi, api } from '@/lib/api';
import { RiskBadge } from '@/components/ui/RiskBadge';

export default function TeacherInsightsPage() {
  const [selectedClass, setSelectedClass] = useState<string>('');

  const { data: classes } = useQuery({
    queryKey: ['my-classes'],
    queryFn: () => classesApi.list().then((r) => r.data),
  });

  const { data: summary, isLoading } = useQuery({
    queryKey: ['ai-insights-summary', selectedClass],
    queryFn: () => api.get(`/ai-insights/class/${selectedClass}/summary`).then((r) => r.data),
    enabled: !!selectedClass,
  });

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Brain className="w-7 h-7 text-purple-500" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Insights Engine</h1>
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

      {!selectedClass ? (
        <p className="text-gray-400 text-sm">Select a class to view AI-generated risk analysis and insights.</p>
      ) : isLoading ? (
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Avg Score', value: `${summary?.avgScore || 0}/100`, icon: TrendingDown, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950' },
              { label: 'Healthy', value: summary?.healthy || 0, icon: CheckCircle, color: 'text-green-500 bg-green-50 dark:bg-green-950' },
              { label: 'Needs Attention', value: summary?.needsAttention || 0, icon: AlertTriangle, color: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-950' },
              { label: 'At Risk', value: summary?.atRisk || 0, icon: AlertTriangle, color: 'text-red-500 bg-red-50 dark:bg-red-950' },
            ].map((c) => (
              <div key={c.label} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${c.color}`}>
                  <c.icon className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{c.value}</div>
                <div className="text-xs text-gray-400 mt-1">{c.label}</div>
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Generated Insights</h3>
            <div className="space-y-2">
              {(summary?.allInsights || []).length === 0 ? (
                <p className="text-sm text-gray-400">No insights generated yet. Insights refresh every 6 hours.</p>
              ) : (
                summary.allInsights.map((insight: string, i: number) => (
                  <div key={i} className="text-sm text-gray-700 dark:text-gray-300 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    {insight}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
