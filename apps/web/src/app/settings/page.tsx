'use client';
// apps/web/src/app/settings/page.tsx
import { useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { Settings, Moon, Sun, User } from 'lucide-react';

export default function SettingsPage() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-8">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="w-7 h-7 text-brand-500" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <User className="w-4 h-4" /> Profile
          </h3>
          <div className="flex items-center gap-4">
            <img src={session?.user?.image || '/avatar.svg'} alt="" className="w-14 h-14 rounded-full" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{session?.user?.name}</p>
              <p className="text-sm text-gray-400">{session?.user?.email}</p>
              <p className="text-xs text-brand-500 font-medium mt-1">{session?.user?.role}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Appearance</h3>
          <div className="flex gap-3">
            <button
              onClick={() => setTheme('light')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition ${
                theme === 'light' ? 'border-brand-500 bg-brand-50 text-brand-600' : 'border-gray-200 dark:border-gray-700 text-gray-500'
              }`}
            >
              <Sun className="w-4 h-4" /> Light
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition ${
                theme === 'dark' ? 'border-brand-500 bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400' : 'border-gray-200 dark:border-gray-700 text-gray-500'
              }`}
            >
              <Moon className="w-4 h-4" /> Dark
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
