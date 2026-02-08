'use client';

import { useState, useCallback } from 'react';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface UseChatOptions {
  api?: string;
  onError?: (error: Error) => void;
}

interface UseChatReturn {
  messages: Message[];
  isLoading: boolean;
  error: Error | null;
  sendMessage: (content: string) => Promise<void>;
  setMessages: (messages: Message[]) => void;
}

export function useChatCustom(options: UseChatOptions = {}): UseChatReturn {
  const { api = '/api/chat', onError } = options;

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content,
      };

      // Add user message immediately
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(api, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [...messages, userMessage].map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });

        // Check if response is JSON (lockdown mode)
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          const data = await response.json();
          if (data.lockdown) {
            // Return early, lockdown will be handled by the component
            setIsLoading(false);
            return;
          }
        }

        if (!response.ok) {
          throw new Error('Error en la respuesta del servidor');
        }

        // Handle streaming response
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error('No se pudo leer la respuesta');
        }

        // Add assistant message placeholder
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: '',
        };

        setMessages((prev) => [...prev, assistantMessage]);

        // Read the stream
        let fullContent = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          fullContent += chunk;

          // Update assistant message content
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessage.id
                ? { ...m, content: fullContent }
                : m
            )
          );
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Error desconocido');
        setError(error);
        onError?.(error);
      } finally {
        setIsLoading(false);
      }
    },
    [api, messages, onError]
  );

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    setMessages,
  };
}
