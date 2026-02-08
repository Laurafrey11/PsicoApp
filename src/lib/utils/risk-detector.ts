/**
 * Detector de riesgo para activar Lockdown Mode
 * Detecta lenguaje suicida o de autolesión
 */

// Keywords de alto riesgo (español)
const highRiskKeywords = [
  // Suicidio directo
  'quiero morir',
  'quiero matarme',
  'me quiero matar',
  'voy a matarme',
  'voy a suicidarme',
  'me voy a suicidar',
  'pienso en suicidarme',
  'pienso en matarme',
  'no quiero vivir',
  'no quiero seguir viviendo',
  'mejor si estuviera muerto',
  'mejor si estuviera muerta',
  'estaría mejor muerto',
  'estaría mejor muerta',
  'todos estarían mejor sin mí',
  'nadie me extrañaría',
  'no vale la pena vivir',
  'la vida no tiene sentido',
  'acabar con todo',
  'acabar con mi vida',
  'terminar con todo',
  'terminar con mi vida',
  'quitarme la vida',
  'me quiero quitar la vida',

  // Autolesión
  'cortarme',
  'hacerme daño',
  'lastimarme',
  'autolesionarme',
  'me corto',
  'me hago daño',
  'me lastimo',

  // Métodos
  'pastillas para morir',
  'sobredosis',
  'tirarme',
  'saltar',
  'ahorcarme',
  'colgarme',
];

// Keywords de riesgo moderado
const moderateRiskKeywords = [
  'no puedo más',
  'estoy desesperado',
  'estoy desesperada',
  'no veo salida',
  'todo es inútil',
  'soy una carga',
  'nadie me entiende',
  'estoy solo',
  'estoy sola',
  'me siento vacío',
  'me siento vacía',
  'no tengo motivos',
  'para qué seguir',
  'no tiene sentido',
  'ojalá no existiera',
  'desaparecer',
  'no despertar',
];

export type RiskLevel = 'none' | 'moderate' | 'high' | 'critical';

export interface RiskDetectionResult {
  level: RiskLevel;
  detectedKeywords: string[];
  shouldActivateLockdown: boolean;
}

/**
 * Detecta nivel de riesgo en un mensaje
 */
export function detectRisk(text: string): RiskDetectionResult {
  const lowerText = text.toLowerCase();
  const detectedKeywords: string[] = [];

  // Buscar keywords de alto riesgo
  for (const keyword of highRiskKeywords) {
    if (lowerText.includes(keyword)) {
      detectedKeywords.push(keyword);
    }
  }

  if (detectedKeywords.length > 0) {
    return {
      level: detectedKeywords.length >= 2 ? 'critical' : 'high',
      detectedKeywords,
      shouldActivateLockdown: true,
    };
  }

  // Buscar keywords de riesgo moderado
  for (const keyword of moderateRiskKeywords) {
    if (lowerText.includes(keyword)) {
      detectedKeywords.push(keyword);
    }
  }

  if (detectedKeywords.length >= 2) {
    return {
      level: 'moderate',
      detectedKeywords,
      shouldActivateLockdown: true,
    };
  }

  if (detectedKeywords.length === 1) {
    return {
      level: 'moderate',
      detectedKeywords,
      shouldActivateLockdown: false,
    };
  }

  return {
    level: 'none',
    detectedKeywords: [],
    shouldActivateLockdown: false,
  };
}

/**
 * Verifica rápidamente si hay riesgo crítico
 */
export function hasHighRisk(text: string): boolean {
  const lowerText = text.toLowerCase();
  return highRiskKeywords.some((keyword) => lowerText.includes(keyword));
}
