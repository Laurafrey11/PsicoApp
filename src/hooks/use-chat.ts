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
  onBlocked?: (blockedUntil: string | null) => void;
  onReferralNeeded?: (contexto: string) => void;
}

interface UseChatReturn {
  messages: Message[];
  isLoading: boolean;
  error: Error | null;
  sendMessage: (content: string) => Promise<void>;
  setMessages: (messages: Message[]) => void;
}

const REFERRAL_MARKER = '[DERIVAR_PROFESIONAL]';

export function useChatCustom(options: UseChatOptions = {}): UseChatReturn {
  const { api = '/api/chat', onError, onBlocked, onReferralNeeded } = options;

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

        // Verificar si la respuesta es JSON (lockdown o bloqueo)
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          const data = await response.json();
          if (data.lockdown) {
            setIsLoading(false);
            return;
          }
          if (data.blocked) {
            onBlocked?.(data.blockedUntil ?? null);
            setIsLoading(false);
            return;
          }
        }

        if (!response.ok) {
          throw new Error('Error en la respuesta del servidor');
        }

        // Manejar streaming
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error('No se pudo leer la respuesta');
        }

        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: '',
        };

        setMessages((prev) => [...prev, assistantMessage]);

        let fullContent = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          fullContent += chunk;

          // Mostrar contenido sin el marcador de derivación
          const displayContent = fullContent
            .replace(REFERRAL_MARKER, '')
            .trimEnd();

          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessage.id
                ? { ...m, content: displayContent }
                : m
            )
          );
        }

        // Después de completar el stream, verificar si hubo derivación
        if (fullContent.includes(REFERRAL_MARKER)) {
          const cleanContent = fullContent.replace(REFERRAL_MARKER, '').trimEnd();
          onReferralNeeded?.(cleanContent);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Error desconocido');
        setError(error);
        onError?.(error);
      } finally {
        setIsLoading(false);
      }
    },
    [api, messages, onError, onBlocked, onReferralNeeded]
  );

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    setMessages,
  };
}
