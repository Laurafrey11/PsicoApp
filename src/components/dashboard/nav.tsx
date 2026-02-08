'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { User } from '@supabase/supabase-js';
import {
  Brain,
  LayoutDashboard,
  Heart,
  MessageCircle,
  TrendingUp,
  Zap,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import { signOut } from '@/lib/actions/auth';

interface DashboardNavProps {
  user: User;
}

export function DashboardNav({ user }: DashboardNavProps) {
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
    // Remove locale prefix and check if path matches
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

          {/* User section */}
          <div className="p-4 border-t border-zinc-800">
            <div className="flex items-center gap-3 mb-4 px-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-teal-400 flex items-center justify-center text-zinc-900 font-medium">
                {user.email?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-100 truncate">
                  {user.user_metadata?.full_name || 'Usuario'}
                </p>
                <p className="text-xs text-zinc-500 truncate">
                  {user.email}
                </p>
              </div>
            </div>

            <form action={signOut}>
              <Button
                type="submit"
                variant="ghost"
                className="w-full justify-start text-zinc-400 hover:text-red-400"
              >
                <LogOut className="w-5 h-5" />
                {t('auth.signOut')}
              </Button>
            </form>
          </div>
        </div>
      </aside>
    </>
  );
}
