'use client';
// apps/web/src/app/(dashboard)/teacher/messages/page.tsx
import { useQuery } from '@tanstack/react-query';
import { MessageSquare } from 'lucide-react';
import { api } from '@/lib/api';
import { formatRelativeTime } from '@/lib/utils';

export default function TeacherMessagesPage() {
  const { data: conversations, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => api.get('/messages/conversations').then((r) => r.data),
  });

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="w-7 h-7 text-brand-500" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Messages</h1>
      </div>

      {isLoading ? (
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      ) : !conversations || conversations.length === 0 ? (
        <p className="text-gray-400 text-sm">No conversations yet. Messages from students will appear here.</p>
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl divide-y divide-gray-50 dark:divide-gray-800">
          {conversations.map((conv: any) => (
            <div key={conv.user.id} className="flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition cursor-pointer">
              <img src={conv.user.avatarUrl || '/avatar.svg'} alt="" className="w-10 h-10 rounded-full" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white truncate">{conv.user.name}</p>
                <p className="text-sm text-gray-400 truncate">{conv.lastMessage.content}</p>
              </div>
              <span className="text-xs text-gray-400 flex-shrink-0">{formatRelativeTime(conv.lastMessage.createdAt)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
