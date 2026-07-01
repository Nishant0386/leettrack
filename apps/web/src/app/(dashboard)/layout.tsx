'use client';
// apps/web/src/app/(dashboard)/layout.tsx
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code2, LayoutDashboard, Users, BookOpen, Video, Bell,
  MessageSquare, BarChart3, Trophy, Settings, LogOut,
  ChevronLeft, ChevronRight, Menu, Brain, FileText, Mail, TrendingUp,
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';

const teacherNav = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/teacher/dashboard' },
  { label: 'My Classes', icon: BookOpen, href: '/teacher/classes' },
  { label: 'Students', icon: Users, href: '/teacher/students' },
  { label: 'Analytics', icon: BarChart3, href: '/teacher/analytics' },
  { label: 'AI Insights', icon: Brain, href: '/teacher/insights' },
  { label: 'Assignments', icon: FileText, href: '/teacher/assignments' },
  { label: 'Live Classes', icon: Video, href: '/teacher/live' },
  { label: 'Messages', icon: MessageSquare, href: '/teacher/messages' },
  { label: 'Email', icon: Mail, href: '/teacher/email' },
  { label: 'Reports', icon: BarChart3, href: '/teacher/reports' },
];

const studentNav = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/student/dashboard' },
  { label: 'My Classes', icon: BookOpen, href: '/student/classes' },
  { label: 'Progress', icon: TrendingUp, href: '/student/progress' },
  { label: 'Assignments', icon: FileText, href: '/student/assignments' },
  { label: 'Leaderboard', icon: Trophy, href: '/student/leaderboard' },
  { label: 'Live Classes', icon: Video, href: '/student/live' },
  { label: 'Messages', icon: MessageSquare, href: '/student/messages' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const isTeacher = session?.user?.role === 'TEACHER' || session?.user?.role === 'SUPER_ADMIN';
  const navItems = isTeacher ? teacherNav : studentNav;

  const Sidebar = () => (
    <div className={cn(
      'flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 transition-all duration-300',
      collapsed ? 'w-16' : 'w-64',
    )}>
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-gray-100 dark:border-gray-800">
        <Code2 className="w-7 h-7 text-brand-500 flex-shrink-0" />
        {!collapsed && (
          <span className="ml-3 text-lg font-bold text-gray-900 dark:text-white">LeetTrack</span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* User */}
      {!collapsed && (
        <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <img
              src={session?.user?.image || '/avatar.svg'}
              alt=""
              className="w-9 h-9 rounded-full"
            />
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {session?.user?.name}
              </p>
              <p className="text-xs text-gray-400 truncate">{session?.user?.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                active
                  ? 'bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white',
              )}
            >
              <item.icon className={cn('w-5 h-5 flex-shrink-0', active && 'text-brand-500')} />
              {!collapsed && item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-gray-100 dark:border-gray-800 space-y-1">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
        >
          <Settings className="w-5 h-5" />
          {!collapsed && 'Settings'}
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition"
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && 'Sign Out'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 30 }}
              className="fixed left-0 top-0 h-full z-50 md:hidden w-64"
            >
              <Sidebar />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 flex items-center px-4 md:px-6 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 gap-4">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-gray-400 hover:text-gray-600"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1" />

          <button className="relative p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          <img
            src={session?.user?.image || '/avatar.svg'}
            alt=""
            className="w-8 h-8 rounded-full cursor-pointer"
          />
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
