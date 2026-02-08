/**
 * Anonimización de PII (Información Personal Identificable)
 * Detecta y reemplaza datos sensibles antes de enviar a OpenAI
 */

// Patrones para detectar PII
const patterns = {
  // Teléfonos argentinos y genéricos
  phone: /(\+?54\s?)?(\d{2,4}[\s-]?)?\d{4}[\s-]?\d{4}/g,

  // Emails
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,

  // DNI argentino (7-8 dígitos)
  dni: /\b\d{7,8}\b/g,

  // Direcciones (calle + número)
  address: /(?:calle|av\.?|avenida|pasaje|pje\.?)\s+[a-záéíóúñ\s]+\s+\d+/gi,

  // Nombres propios después de palabras clave
  nameAfterKeyword: /(?:me llamo|soy|mi nombre es|mi amigo|mi amiga|mi pareja|mi novio|mi novia|mi esposo|mi esposa|mi madre|mi padre|mi hermano|mi hermana|mi hijo|mi hija|doctor|dra?\.?)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)?)/gi,

  // URLs
  url: /https?:\/\/[^\s]+/g,

  // Tarjetas de crédito
  creditCard: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
};

// Placeholders para reemplazo
const placeholders: Record<string, string> = {
  phone: '[TELÉFONO]',
  email: '[EMAIL]',
  dni: '[DOCUMENTO]',
  address: '[DIRECCIÓN]',
  nameAfterKeyword: '$1 [NOMBRE]', // Mantiene la palabra clave
  url: '[URL]',
  creditCard: '[TARJETA]',
};

/**
 * Anonimiza texto reemplazando PII con placeholders
 */
export function anonymize(text: string): string {
  let result = text;

  // Aplicar cada patrón
  for (const [key, pattern] of Object.entries(patterns)) {
    const placeholder = placeholders[key];
    result = result.replace(pattern, placeholder);
  }

  return result;
}

/**
 * Verifica si el texto contiene PII
 */
export function containsPII(text: string): boolean {
  for (const pattern of Object.values(patterns)) {
    if (pattern.test(text)) {
      pattern.lastIndex = 0; // Reset regex state
      return true;
    }
    pattern.lastIndex = 0;
  }
  return false;
}
