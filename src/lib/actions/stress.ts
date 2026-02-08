'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { anonymize } from '@/lib/utils/anonymize';
import type { DefenseMechanism } from '@/types/database';

export interface StressFormData {
  intensity: number;
  situation: string;
  physicalSymptoms: string[];
  thoughts: string;
  durationMinutes?: number;
}

export interface StressResult {
  success?: boolean;
  error?: string;
  analysis?: {
    defenseMechanism: DefenseMechanism | null;
    explanation: string;
    suggestions: string[];
  };
}

// Análisis simple de mecanismos de defensa basado en patrones de texto
function analyzeDefenseMechanism(situation: string, thoughts: string): {
  mechanism: DefenseMechanism | null;
  explanation: string;
  suggestions: string[];
} {
  const text = `${situation} ${thoughts}`.toLowerCase();

  // Patrones para detectar mecanismos de defensa
  const patterns: { mechanism: DefenseMechanism; keywords: string[]; explanation: string; suggestions: string[] }[] = [
    {
      mechanism: 'denial',
      keywords: ['no es para tanto', 'no pasa nada', 'estoy bien', 'no me afecta', 'no importa', 'da igual'],
      explanation: 'Parece que podrías estar minimizando el impacto de la situación. La negación es un mecanismo común para protegernos del dolor.',
      suggestions: ['Permítete sentir las emociones sin juzgarlas', 'Habla con alguien de confianza sobre lo que pasó', 'Escribe en un diario cómo te sientes realmente'],
    },
    {
      mechanism: 'projection',
      keywords: ['es su culpa', 'ellos siempre', 'me hacen', 'por culpa de', 'él/ella me', 'son ellos'],
      explanation: 'Podrías estar proyectando sentimientos propios hacia otros. Es más fácil ver en otros lo que nos cuesta aceptar en nosotros.',
      suggestions: ['Reflexiona sobre qué parte de la situación depende de ti', 'Pregúntate si has sentido algo similar antes', 'Practica la auto-observación sin juicio'],
    },
    {
      mechanism: 'rationalization',
      keywords: ['en realidad', 'tiene sentido porque', 'es lógico', 'obviamente', 'claramente', 'es mejor así'],
      explanation: 'Estás buscando explicaciones lógicas para justificar la situación. Racionalizar puede alejarte de tus verdaderas emociones.',
      suggestions: ['Permítete sentir antes de analizar', 'No todo necesita una explicación lógica', 'Explora qué emoción hay detrás del análisis'],
    },
    {
      mechanism: 'displacement',
      keywords: ['después me enojé con', 'lo pagué con', 'exploté con', 'le grité a', 'me desquité'],
      explanation: 'Parece que redirigiste tus emociones hacia alguien o algo más seguro. El desplazamiento ocurre cuando no podemos expresar emociones hacia su fuente original.',
      suggestions: ['Identifica la fuente real de tu frustración', 'Busca formas seguras de expresar emociones intensas', 'Practica técnicas de regulación emocional'],
    },
    {
      mechanism: 'repression',
      keywords: ['no quiero pensar', 'prefiero olvidar', 'no recuerdo bien', 'bloqueé', 'no sé por qué me siento así'],
      explanation: 'Podrías estar reprimiendo pensamientos o recuerdos difíciles. La represión es una forma de protección, pero las emociones tienden a resurgir.',
      suggestions: ['Explora estos sentimientos en un espacio seguro', 'Considera hablar con un profesional', 'Lleva un diario para procesar gradualmente'],
    },
    {
      mechanism: 'regression',
      keywords: ['quiero que me cuiden', 'no puedo solo', 'necesito ayuda', 'como cuando era', 'me siento pequeño'],
      explanation: 'En momentos de estrés, a veces volvemos a comportamientos de etapas anteriores. Es una forma de buscar seguridad.',
      suggestions: ['Reconoce que pedir ayuda es válido', 'Identifica qué necesitas específicamente', 'Practica el auto-cuidado activo'],
    },
    {
      mechanism: 'sublimation',
      keywords: ['fui a correr', 'me puse a', 'canalicé', 'trabajé en', 'creé', 'pinté', 'escribí'],
      explanation: 'Estás canalizando el estrés hacia actividades productivas. La sublimación es uno de los mecanismos más saludables.',
      suggestions: ['Sigue cultivando estas salidas creativas', 'Nota qué actividades te ayudan más', 'Establece una rutina de autocuidado'],
    },
  ];

  for (const pattern of patterns) {
    if (pattern.keywords.some(keyword => text.includes(keyword))) {
      return {
        mechanism: pattern.mechanism,
        explanation: pattern.explanation,
        suggestions: pattern.suggestions,
      };
    }
  }

  return {
    mechanism: null,
    explanation: 'No se identificó un patrón específico. Continúa explorando tus emociones.',
    suggestions: [
      'Tómate un momento para respirar profundamente',
      'Escribe más detalles sobre cómo te sientes',
      'Considera hablar con el asistente sobre esta situación',
    ],
  };
}

export async function saveStressLog(data: StressFormData): Promise<StressResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'No autenticado' };
  }

  // Analizar mecanismos de defensa
  const analysis = analyzeDefenseMechanism(data.situation, data.thoughts);

  // Anonimizar antes de guardar
  const situationAnonymized = anonymize(data.situation);
  const thoughtsAnonymized = anonymize(data.thoughts);

  const { error } = await supabase.from('stress_logs').insert({
    user_id: user.id,
    intensity: data.intensity,
    situation: data.situation,
    situation_anonymized: situationAnonymized,
    physical_symptoms: data.physicalSymptoms,
    thoughts: data.thoughts,
    thoughts_anonymized: thoughtsAnonymized,
    duration_minutes: data.durationMinutes || null,
    defense_mechanism: analysis.mechanism,
    defense_mechanism_explanation: analysis.explanation,
    coping_suggestions: analysis.suggestions,
  });

  if (error) {
    console.error('Error saving stress log:', error);
    return { error: 'Error al guardar el registro' };
  }

  revalidatePath('/stress');
  revalidatePath('/dashboard');
  revalidatePath('/analytics');

  return {
    success: true,
    analysis: {
      defenseMechanism: analysis.mechanism,
      explanation: analysis.explanation,
      suggestions: analysis.suggestions,
    },
  };
}

export async function getRecentStressLogs(limit: number = 10) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from('stress_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('occurred_at', { ascending: false })
    .limit(limit);

  return data || [];
}
