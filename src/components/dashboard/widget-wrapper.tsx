'use client';

import { ChevronUp, ChevronDown, EyeOff } from 'lucide-react';

interface WidgetWrapperProps {
  children: React.ReactNode;
  isEditing: boolean;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onHide: () => void;
}

export function WidgetWrapper({
  children,
  isEditing,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onHide,
}: WidgetWrapperProps) {
  return (
    <div className={`relative group ${isEditing ? 'ring-1 ring-zinc-700 rounded-xl p-1' : ''}`}>
      {isEditing && (
        <div className="absolute -top-3 right-2 z-10 flex items-center gap-1">
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            className="p-1 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-zinc-100 hover:border-zinc-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Mover arriba"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            className="p-1 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-zinc-100 hover:border-zinc-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Mover abajo"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <button
            onClick={onHide}
            className="p-1 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-red-400 hover:border-red-500/50 transition-colors"
            aria-label="Ocultar widget"
          >
            <EyeOff className="w-4 h-4" />
          </button>
        </div>
      )}
      {children}
    </div>
  );
}
