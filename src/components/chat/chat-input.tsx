'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function ChatInput({ onSend, isLoading, disabled }: ChatInputProps) {
  const t = useTranslations('chat');
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [input]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading || disabled) return;

    onSend(input.trim());
    setInput('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="flex items-end gap-3 p-4 bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('placeholder')}
          disabled={isLoading || disabled}
          rows={1}
          className={cn(
            'flex-1 bg-transparent resize-none outline-none',
            'text-zinc-100 placeholder:text-zinc-500',
            'max-h-[200px] py-2',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        />

        <button
          type="submit"
          disabled={!input.trim() || isLoading || disabled}
          className={cn(
            'flex-shrink-0 w-10 h-10 rounded-xl',
            'flex items-center justify-center',
            'bg-gradient-to-r from-cyan-500 to-teal-400',
            'text-zinc-900 transition-all',
            'hover:shadow-lg hover:shadow-cyan-500/25',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none'
          )}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-zinc-600 text-center mt-3">
        {t('disclaimer')}
      </p>
    </form>
  );
}
