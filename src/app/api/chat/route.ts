import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { createClient } from '@/lib/supabase/server';
import { anonymize } from '@/lib/utils/anonymize';
import { detectRisk } from '@/lib/utils/risk-detector';
import { THERAPEUTIC_SYSTEM_PROMPT } from '@/lib/openai/system-prompt';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response('No autorizado', { status: 401 });
    }

    // Obtener el último mensaje del usuario
    const lastUserMessage = messages[messages.length - 1];

    if (lastUserMessage?.role === 'user') {
      // Detectar riesgo
      const riskResult = detectRisk(lastUserMessage.content);

      // Si hay riesgo alto, guardar log de emergencia
      if (riskResult.shouldActivateLockdown) {
        await supabase.from('emergency_logs').insert({
          user_id: user.id,
          trigger_message: anonymize(lastUserMessage.content),
          detected_keywords: riskResult.detectedKeywords,
          risk_level: riskResult.level,
          lockdown_activated: true,
        });

        // Retornar respuesta especial para activar lockdown
        return Response.json({
          lockdown: true,
          riskLevel: riskResult.level,
        });
      }

      // Anonimizar el mensaje antes de guardar y enviar
      const anonymizedContent = anonymize(lastUserMessage.content);

      // Guardar mensaje del usuario
      await supabase.from('chat_messages').insert({
        user_id: user.id,
        role: 'user',
        content: lastUserMessage.content,
        content_anonymized: anonymizedContent,
        flagged_risk: riskResult.level !== 'none',
        risk_keywords: riskResult.detectedKeywords.length > 0 ? riskResult.detectedKeywords : null,
      });
    }

    // Obtener últimos 15 mensajes para contexto (memoria corto plazo)
    const { data: recentMessages } = await supabase
      .from('chat_messages')
      .select('role, content')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(15);

    // Obtener último resumen para contexto (memoria largo plazo)
    const { data: latestSummary } = await supabase
      .from('summaries')
      .select('content, key_insights')
      .eq('user_id', user.id)
      .eq('summary_type', 'weekly')
      .order('period_end', { ascending: false })
      .limit(1)
      .single();

    // Construir contexto con memoria
    let systemPrompt = THERAPEUTIC_SYSTEM_PROMPT;

    if (latestSummary) {
      systemPrompt += `\n\n## Contexto previo del usuario:\n${latestSummary.content}`;
      if (latestSummary.key_insights) {
        systemPrompt += `\n\nInsights clave: ${(latestSummary.key_insights as string[]).join(', ')}`;
      }
    }

    // Preparar mensajes para OpenAI (anonimizados)
    const processedMessages = messages.map((msg: { role: string; content: string }) => ({
      role: msg.role,
      content: msg.role === 'user' ? anonymize(msg.content) : msg.content,
    }));

    // Stream response
    const result = streamText({
      model: openai('gpt-4o'),
      system: systemPrompt,
      messages: processedMessages,
      onFinish: async ({ text }) => {
        // Guardar respuesta del asistente
        await supabase.from('chat_messages').insert({
          user_id: user.id,
          role: 'assistant',
          content: text,
        });
      },
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response('Error interno del servidor', { status: 500 });
  }
}
