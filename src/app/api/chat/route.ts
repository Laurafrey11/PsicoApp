import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { anonymize } from '@/lib/utils/anonymize';
import { THERAPEUTIC_SYSTEM_PROMPT } from '@/lib/openai/system-prompt';
import {
  getClientIP,
  checkIPStatus,
  isGracePeriodExpired,
  blockIP,
  recordAttempt,
} from '@/lib/utils/ip-manager';
import { checkRateLimit } from '@/lib/utils/rate-limiter';
import { checkBillingStatus } from '@/lib/billing/check-status';

export const maxDuration = 30;

const REFERRAL_MARKER = '[DERIVAR_PROFESIONAL]';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const adminSupabase = createAdminClient();
    const clientIP = getClientIP(req);

    // --- Paso 0: Auth check ---
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return Response.json(
        { error: 'Se requiere una cuenta para usar el chat.', authRequired: true },
        { status: 401 }
      );
    }

    // --- Paso 0.5: Billing block check ---
    const billingStatus = await checkBillingStatus(user.id);
    if (billingStatus.blocked) {
      return Response.json(
        {
          error: 'Tenés una factura pendiente de pago.',
          billingBlocked: true,
          invoiceId: billingStatus.invoiceId,
          amountUsd: billingStatus.amountUsd,
        },
        { status: 403 }
      );
    }

    // --- Paso 1: Rate limiting ---
    const rateLimit = checkRateLimit(clientIP);
    if (!rateLimit.allowed) {
      return Response.json(
        { error: 'Demasiados mensajes. Esperá un rato antes de continuar.', rateLimited: true },
        { status: 429 }
      );
    }

    // --- Paso 2: Verificar estado de la IP ---
    const ipStatus = await checkIPStatus(adminSupabase, clientIP);

    if (ipStatus.blocked) {
      return Response.json({
        blocked: true,
        blockedUntil: ipStatus.blockedUntil?.toISOString(),
      });
    }

    if (ipStatus.referred && ipStatus.referralId) {
      const { data: referralData } = await adminSupabase
        .from('ip_referrals')
        .select('*')
        .eq('id', ipStatus.referralId)
        .single() as { data: { referred_at: string } | null };

      if (referralData && isGracePeriodExpired(referralData.referred_at)) {
        const blockedUntil = await blockIP(adminSupabase, ipStatus.referralId);
        await recordAttempt(adminSupabase, ipStatus.referralId);

        return Response.json({
          blocked: true,
          blockedUntil: blockedUntil.toISOString(),
        });
      }

      await recordAttempt(adminSupabase, ipStatus.referralId);
    }

    // --- Paso 3: Preparar y enviar a OpenAI ---
    const processedMessages = messages.map((msg: { role: string; content: string }) => ({
      role: msg.role,
      content: msg.role === 'user' ? anonymize(msg.content) : msg.content,
    }));

    const result = streamText({
      model: openai('gpt-4o'),
      system: THERAPEUTIC_SYSTEM_PROMPT,
      messages: processedMessages,
      onFinish: async ({ usage }) => {
        // Guardar token usage en chat_messages
        if (usage) {
          try {
            await adminSupabase.from('chat_messages').insert({
              user_id: user.id,
              role: 'assistant',
              tokens_used: usage.totalTokens,
              model_used: 'gpt-4o',
              created_at: new Date().toISOString(),
            });
          } catch (err) {
            console.error('Error saving token usage:', err);
          }
        }
      },
    });

    // --- Paso 4: Transformar stream para eliminar el marcador ---
    const originalResponse = result.toTextStreamResponse();
    const reader = originalResponse.body?.getReader();

    if (!reader) {
      return new Response('Error al leer el stream', { status: 500 });
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    let buffer = '';

    const transformedStream = new ReadableStream({
      async pull(controller) {
        const { done, value } = await reader.read();
        if (done) {
          const cleaned = buffer.replace(REFERRAL_MARKER, '').trimEnd();
          if (cleaned.length > 0) {
            controller.enqueue(encoder.encode(cleaned));
          }
          controller.close();
          return;
        }

        buffer += decoder.decode(value, { stream: true });

        if (buffer.includes(REFERRAL_MARKER)) {
          const cleaned = buffer.replace(REFERRAL_MARKER, '').trimEnd();
          buffer = '';
          if (cleaned.length > 0) {
            controller.enqueue(encoder.encode(cleaned));
          }
        } else if (buffer.length > REFERRAL_MARKER.length * 2) {
          const safeLength = buffer.length - REFERRAL_MARKER.length;
          const safePart = buffer.substring(0, safeLength);
          buffer = buffer.substring(safeLength);
          if (safePart.length > 0) {
            controller.enqueue(encoder.encode(safePart));
          }
        }
      },
    });

    return new Response(transformedStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response('Error interno del servidor', { status: 500 });
  }
}
