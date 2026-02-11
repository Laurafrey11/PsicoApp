'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Brain,
  LayoutDashboard,
  Heart,
  MessageCircle,
  TrendingUp,
  Zap,
  Settings,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function DashboardNav() {
  const t = useTranslations();
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: t('dashboard.title') },
    { href: '/mood', icon: Heart, label: t('mood.title') },
    { href: '/chat', icon: MessageCircle, label: t('chat.title') },
    { href: '/analytics', icon: TrendingUp, label: t('analytics.title') },
    { href: '/stress', icon: Zap, label: t('stress.title') },
    { href: '/settings', icon: Settings, label: t('settings.title') },
  ];

  const isActive = (href: string) => {
    const cleanPath = pathname.replace(/^\/(es|en)/, '');
    return cleanPath === href || cleanPath.startsWith(href + '/');
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-zinc-900 border border-zinc-800"
      >
        {isMobileOpen ? (
          <X className="w-6 h-6 text-zinc-400" />
        ) : (
          <Menu className="w-6 h-6 text-zinc-400" />
        )}
      </button>

      {/* Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-64 bg-zinc-950 border-r border-zinc-800 z-40',
          'transform transition-transform duration-200 ease-in-out',
          'lg:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-zinc-800">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Brain className="w-8 h-8 text-cyan-500" />
              <span className="text-xl font-bold gradient-text">Ego-Core</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                  isActive(item.href)
                    ? 'bg-cyan-500/10 text-cyan-500'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
                )}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-zinc-800">
            <p className="text-xs text-zinc-600 text-center">
              Ego-Core v0.1.0
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
