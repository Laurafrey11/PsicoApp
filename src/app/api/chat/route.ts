import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { createAdminClient } from '@/lib/supabase/admin';
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

export const maxDuration = 30;

const REFERRAL_MARKER = '[DERIVAR_PROFESIONAL]';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const supabase = createAdminClient();
    const clientIP = getClientIP(req);

    // --- Paso 0: Rate limiting ---
    const rateLimit = checkRateLimit(clientIP);
    if (!rateLimit.allowed) {
      return Response.json(
        { error: 'Demasiados mensajes. Esperá un rato antes de continuar.', rateLimited: true },
        { status: 429 }
      );
    }

    // --- Paso 1: Verificar estado de la IP ---
    const ipStatus = await checkIPStatus(supabase, clientIP);

    // Si está bloqueada, retornar respuesta de bloqueo
    if (ipStatus.blocked) {
      return Response.json({
        blocked: true,
        blockedUntil: ipStatus.blockedUntil?.toISOString(),
      });
    }

    // Si fue derivada, verificar período de gracia
    if (ipStatus.referred && ipStatus.referralId) {
      const { data: referralData } = await supabase
        .from('ip_referrals')
        .select('*')
        .eq('id', ipStatus.referralId)
        .single() as { data: { referred_at: string } | null };

      if (referralData && isGracePeriodExpired(referralData.referred_at)) {
        // Período de gracia pasó → bloquear IP
        const blockedUntil = await blockIP(supabase, ipStatus.referralId);
        await recordAttempt(supabase, ipStatus.referralId);

        return Response.json({
          blocked: true,
          blockedUntil: blockedUntil.toISOString(),
        });
      }

      // Dentro del período de gracia → registrar intento y continuar
      await recordAttempt(supabase, ipStatus.referralId);
    }

    // --- Paso 2: Preparar y enviar a OpenAI ---
    const processedMessages = messages.map((msg: { role: string; content: string }) => ({
      role: msg.role,
      content: msg.role === 'user' ? anonymize(msg.content) : msg.content,
    }));

    // La derivación se crea cuando el usuario completa el formulario
    // (via /api/send-referral), no aquí. El marcador [DERIVAR_PROFESIONAL]
    // se detecta en el cliente para mostrar el formulario.
    const result = streamText({
      model: openai('gpt-4o'),
      system: THERAPEUTIC_SYSTEM_PROMPT,
      messages: processedMessages,
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
          // Enviar cualquier contenido restante en el buffer (sin el marcador)
          const cleaned = buffer.replace(REFERRAL_MARKER, '').trimEnd();
          if (cleaned.length > 0) {
            controller.enqueue(encoder.encode(cleaned));
          }
          controller.close();
          return;
        }

        buffer += decoder.decode(value, { stream: true });

        // Si el buffer contiene el marcador completo, limpiarlo
        if (buffer.includes(REFERRAL_MARKER)) {
          const cleaned = buffer.replace(REFERRAL_MARKER, '').trimEnd();
          buffer = '';
          if (cleaned.length > 0) {
            controller.enqueue(encoder.encode(cleaned));
          }
        } else if (buffer.length > REFERRAL_MARKER.length * 2) {
          // Enviar la parte segura del buffer (que no puede ser parte del marcador)
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
