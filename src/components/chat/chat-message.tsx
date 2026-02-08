'use client';

import { cn } from '@/lib/utils';
import { Brain, User } from 'lucide-react';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

export function ChatMessage({ role, content, isStreaming }: ChatMessageProps) {
  const isUser = role === 'user';

  return (
    <div
      className={cn(
        'flex gap-4 animate-fade-in',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center',
          isUser
            ? 'bg-gradient-to-br from-cyan-500 to-teal-400'
            : 'bg-zinc-800 border border-zinc-700'
        )}
      >
        {isUser ? (
          <User className="w-5 h-5 text-zinc-900" />
        ) : (
          <Brain className="w-5 h-5 text-cyan-500" />
        )}
      </div>

      {/* Message bubble */}
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-5 py-3',
          isUser
            ? 'bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border border-cyan-500/30'
            : 'bg-zinc-800/50 border border-zinc-700'
        )}
      >
        <div
          className={cn(
            'prose prose-invert prose-sm max-w-none',
            'prose-p:my-1 prose-p:leading-relaxed',
            'prose-ul:my-2 prose-li:my-0',
            isStreaming && 'animate-pulse'
          )}
        >
          {content.split('\n').map((paragraph, i) => (
            <p key={i} className="text-zinc-200">
              {paragraph}
            </p>
          ))}
          {isStreaming && (
            <span className="inline-block w-2 h-4 bg-cyan-500 animate-pulse ml-1" />
          )}
        </div>
      </div>
    </div>
  );
}
