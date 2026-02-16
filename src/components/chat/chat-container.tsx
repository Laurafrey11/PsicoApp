'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Brain, RefreshCw, Download } from 'lucide-react';
import { ChatMessage } from './chat-message';
import { ChatInput } from './chat-input';
import { LockdownMode } from './lockdown-mode';
import { ReferralBlock } from './referral-block';
import { ReferralForm } from './referral-form';
import { ConsentScreen } from './consent-screen';
import { detectRisk } from '@/lib/utils/risk-detector';
import { Button } from '@/components/ui';
import { useChatCustom } from '@/hooks/use-chat';
import { exportChatAsPDF } from '@/lib/utils/export-pdf';

export function ChatContainer() {
  const t = useTranslations();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showLockdown, setShowLockdown] = useState(false);
  const [ipBlocked, setIpBlocked] = useState(false);
  const [blockedUntil, setBlockedUntil] = useState<string | null>(null);
  const [checkingIP, setCheckingIP] = useState(true);
  const [showReferralForm, setShowReferralForm] = useState(false);
  const [referralContexto, setReferralContexto] = useState('');
  const [hasConsent, setHasConsent] = useState(false);

  // Verificar consentimiento guardado
  useEffect(() => {
    const consent = localStorage.getItem('ego-core-consent');
    if (consent === 'true') {
      setHasConsent(true);
    }
  }, []);

  const {
    messages,
    isLoading,
    error,
    sendMessage,
    setMessages,
  } = useChatCustom({
    api: '/api/chat',
    onError: (error) => {
      console.error('Chat error:', error);
    },
    onBlocked: (until) => {
      setIpBlocked(true);
      setBlockedUntil(until);
    },
    onReferralNeeded: (contexto) => {
      setReferralContexto(contexto);
      setShowReferralForm(true);
    },
  });

  // Verificar estado de IP al montar
  useEffect(() => {
    async function checkIP() {
      try {
        const response = await fetch('/api/check-ip');
        const data = await response.json();
        if (data.blocked) {
          setIpBlocked(true);
          setBlockedUntil(data.blockedUntil);
        }
      } catch (err) {
        console.error('Error checking IP:', err);
      } finally {
        setCheckingIP(false);
      }
    }
    checkIP();
  }, []);

  // Scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend(content: string) {
    const risk = detectRisk(content);
    if (risk.shouldActivateLockdown) {
      setShowLockdown(true);
    }
    await sendMessage(content);
  }

  function handleNewChat() {
    setMessages([]);
  }

  function handleDismissLockdown() {
    setShowLockdown(false);
  }

  function handleReferralComplete() {
    setShowReferralForm(false);
    // El usuario puede seguir chateando 2 días más
  }

  // Estado de carga mientras verifica IP
  if (checkingIP) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="flex flex-col items-center gap-4">
          <Brain className="w-10 h-10 text-cyan-500 animate-pulse" />
          <p className="text-zinc-500">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  // Pantalla de consentimiento
  if (!hasConsent) {
    return <ConsentScreen onAccept={() => setHasConsent(true)} />;
  }

  // Pantalla de IP bloqueada
  if (ipBlocked) {
    return <ReferralBlock blockedUntil={blockedUntil} />;
  }

  // Overlay de lockdown
  if (showLockdown) {
    return <LockdownMode onDismiss={handleDismissLockdown} />;
  }

  // Formulario de derivación
  if (showReferralForm) {
    return (
      <ReferralForm
        contexto={referralContexto}
        onComplete={handleReferralComplete}
      />
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
            <Brain className="w-5 h-5 text-cyan-500" />
          </div>
          <div>
            <h1 className="font-semibold text-zinc-100">{t('chat.title')}</h1>
            <p className="text-xs text-zinc-500">GPT-4o</p>
          </div>
        </div>

        <div className="flex gap-2">
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => exportChatAsPDF(messages)}>
              <Download className="w-4 h-4" />
              PDF
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={handleNewChat}>
            <RefreshCw className="w-4 h-4" />
            {t('chat.newConversation')}
          </Button>
        </div>
      </div>

      {/* Área de mensajes */}
      <div className="flex-1 overflow-y-auto py-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-6">
              <Brain className="w-10 h-10 text-cyan-500" />
            </div>
            <h2 className="text-xl font-semibold text-zinc-200 mb-2">
              {t('chat.title')}
            </h2>
            <p className="text-zinc-500 max-w-md">
              {t('chat.welcome')}
            </p>
          </div>
        ) : (
          messages.map((message, index) => (
            <ChatMessage
              key={message.id}
              role={message.role}
              content={message.content}
              isStreaming={isLoading && index === messages.length - 1 && message.role === 'assistant'}
            />
          ))
        )}

        {/* Indicador de carga */}
        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
              <Brain className="w-5 h-5 text-cyan-500 animate-pulse" />
            </div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-2xl px-5 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {t('errors.generic')}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput
        onSend={handleSend}
        isLoading={isLoading}
      />
    </div>
  );
}
