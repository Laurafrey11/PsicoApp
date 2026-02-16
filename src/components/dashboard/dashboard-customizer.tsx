'use client';

import { useState, useEffect, useCallback } from 'react';
import { Settings, RotateCcw, Plus, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { WIDGET_REGISTRY, DEFAULT_LAYOUT } from './widget-registry';
import { WidgetWrapper } from './widget-wrapper';
import { Button } from '@/components/ui';

const STORAGE_KEY = 'ego-core-dashboard-layout';

function loadLayout(): string[] {
  if (typeof window === 'undefined') return DEFAULT_LAYOUT;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as string[];
      const validIds = WIDGET_REGISTRY.map((w) => w.id);
      const filtered = parsed.filter((id) => validIds.includes(id));
      if (filtered.length > 0) return filtered;
    }
  } catch {
    // ignore invalid data
  }
  return DEFAULT_LAYOUT;
}

function saveLayout(layout: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
  } catch {
    // storage full or unavailable
  }
}

export function DashboardCustomizer() {
  const t = useTranslations('dashboardEditor');
  const [layout, setLayout] = useState<string[]>(DEFAULT_LAYOUT);
  const [isEditing, setIsEditing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setLayout(loadLayout());
    setMounted(true);
  }, []);

  const updateLayout = useCallback((newLayout: string[]) => {
    setLayout(newLayout);
    saveLayout(newLayout);
  }, []);

  const moveWidget = useCallback((index: number, direction: -1 | 1) => {
    setLayout((prev) => {
      const next = [...prev];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= next.length) return prev;
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      saveLayout(next);
      return next;
    });
  }, []);

  const hideWidget = useCallback((widgetId: string) => {
    setLayout((prev) => {
      const next = prev.filter((id) => id !== widgetId);
      saveLayout(next);
      return next;
    });
  }, []);

  const addWidget = useCallback((widgetId: string) => {
    setLayout((prev) => {
      if (prev.includes(widgetId)) return prev;
      const next = [...prev, widgetId];
      saveLayout(next);
      return next;
    });
  }, []);

  const resetLayout = useCallback(() => {
    updateLayout([...DEFAULT_LAYOUT]);
  }, [updateLayout]);

  const hiddenWidgets = WIDGET_REGISTRY.filter((w) => !layout.includes(w.id));

  if (!mounted) {
    return <div className="space-y-6 animate-pulse"><div className="h-32 bg-zinc-800/50 rounded-xl" /><div className="h-48 bg-zinc-800/50 rounded-xl" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-end gap-2">
        {isEditing && (
          <Button
            onClick={resetLayout}
            variant="ghost"
            className="text-zinc-400 hover:text-zinc-100 text-sm gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            {t('resetTemplate')}
          </Button>
        )}
        <Button
          onClick={() => setIsEditing(!isEditing)}
          variant={isEditing ? 'primary' : 'ghost'}
          className={isEditing ? 'gap-2 bg-cyan-600 hover:bg-cyan-700 text-white' : 'text-zinc-400 hover:text-zinc-100 gap-2'}
        >
          {isEditing ? (
            <>
              <Check className="w-4 h-4" />
              {t('done')}
            </>
          ) : (
            <>
              <Settings className="w-4 h-4" />
              {t('editMode')}
            </>
          )}
        </Button>
      </div>

      {/* Widgets */}
      <div className="space-y-6">
        {layout.map((widgetId, index) => {
          const widget = WIDGET_REGISTRY.find((w) => w.id === widgetId);
          if (!widget) return null;
          const Component = widget.component;

          return (
            <WidgetWrapper
              key={widget.id}
              isEditing={isEditing}
              isFirst={index === 0}
              isLast={index === layout.length - 1}
              onMoveUp={() => moveWidget(index, -1)}
              onMoveDown={() => moveWidget(index, 1)}
              onHide={() => hideWidget(widget.id)}
            >
              <Component />
            </WidgetWrapper>
          );
        })}
      </div>

      {/* Hidden widgets - add back */}
      {isEditing && hiddenWidgets.length > 0 && (
        <div className="border border-dashed border-zinc-700 rounded-xl p-4 space-y-3">
          <p className="text-sm text-zinc-500">{t('addWidget')}</p>
          <div className="flex flex-wrap gap-2">
            {hiddenWidgets.map((widget) => (
              <button
                key={widget.id}
                onClick={() => addWidget(widget.id)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-300 hover:border-cyan-500/50 hover:text-cyan-400 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                {widget.id}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
