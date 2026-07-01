// apps/web/src/app/page.tsx
import Link from 'next/link';
import { ArrowRight, BarChart3, Brain, Shield, Users, Zap, Code2, Trophy } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Code2 className="w-7 h-7 text-brand-500" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">LeetTrack</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/signin" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition">
              Sign In
            </Link>
            <Link
              href="/auth/signin"
              className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg transition"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 rounded-full text-xs font-medium text-brand-600 dark:text-brand-400 mb-6">
            <Zap className="w-3 h-3" /> AI-Powered · LeetCode Tracking · Real-time Analytics
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
            Track. Analyze.{' '}
            <span className="text-brand-500">Improve.</span>
          </h1>
          <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10">
            The ultimate classroom management platform for DSA instructors. Monitor student LeetCode progress,
            generate AI-powered insights, and drive performance — all without requiring passwords.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signin"
              className="inline-flex items-center gap-2 px-8 py-4 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition shadow-lg shadow-brand-500/25"
            >
              Start for Free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-xl transition"
            >
              See Features
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: 'Students Tracked', value: '10,000+' },
            { label: 'Classes Managed', value: '500+' },
            { label: 'Problems Analyzed', value: '2M+' },
            { label: 'Institutions', value: '50+' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything you need to run a DSA class
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              From LeetCode tracking to live classes, assignments to AI insights — all in one platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: BarChart3,
                color: 'text-blue-500 bg-blue-50 dark:bg-blue-950',
                title: 'Real-time Analytics',
                desc: 'Live LeetCode snapshots with daily, weekly, and monthly growth tracking. Automatic historical analytics engine.',
              },
              {
                icon: Brain,
                color: 'text-purple-500 bg-purple-50 dark:bg-purple-950',
                title: 'AI Insights Engine',
                desc: 'Performance scoring, risk detection (green/yellow/red), and semester-end predictions powered by AI.',
              },
              {
                icon: Shield,
                color: 'text-green-500 bg-green-50 dark:bg-green-950',
                title: 'Zero Password Required',
                desc: 'Students log in with Google OAuth. LeetCode data pulled from public profiles only — 100% secure.',
              },
              {
                icon: Users,
                color: 'text-orange-500 bg-orange-50 dark:bg-orange-950',
                title: 'Class Management',
                desc: 'Create classes, generate join codes, manage enrollments, conduct live sessions with Jitsi.',
              },
              {
                icon: Trophy,
                color: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-950',
                title: 'Gamification',
                desc: 'XP points, levels, badges, and dynamic leaderboards — daily, weekly, monthly, semester.',
              },
              {
                icon: Zap,
                color: 'text-red-500 bg-red-50 dark:bg-red-950',
                title: 'Live Classes',
                desc: 'Built-in video conferencing via Jitsi, screen sharing, attendance tracking, and session recording.',
              },
            ].map((f) => (
              <div
                key={f.title}
                className="p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl hover:shadow-lg transition"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 bg-brand-500">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to transform your DSA class?</h2>
          <p className="text-brand-100 mb-8 text-lg">
            Join hundreds of instructors using LeetTrack to elevate student performance.
          </p>
          <Link
            href="/auth/signin"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-brand-600 font-bold rounded-xl hover:bg-brand-50 transition shadow-lg"
          >
            Get Started — It's Free <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-100 dark:border-gray-800 text-center text-sm text-gray-400">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Code2 className="w-4 h-4 text-brand-500" />
          <span className="font-semibold text-gray-900 dark:text-white">LeetTrack</span>
        </div>
        <p>© {new Date().getFullYear()} LeetTrack. Built for educators who code.</p>
      </footer>
    </div>
  );
}
