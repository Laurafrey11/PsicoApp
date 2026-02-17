export const COST_PER_MILLION_TOKENS = 70; // USD

export function calculateCost(tokens: number): number {
  return Math.round((tokens / 1_000_000) * COST_PER_MILLION_TOKENS * 100) / 100;
}

export function generateInvoiceNumber(userId: string, date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const userHash = userId.substring(0, 8).toUpperCase();
  return `INV-${year}${month}-${userHash}`;
}

/**
 * Calcula el período de facturación basado en la fecha de registro del usuario.
 * El ciclo se repite mensualmente desde el día de registro.
 */
export function getBillingPeriod(registrationDate: Date, referenceDate: Date = new Date()): {
  start: Date;
  end: Date;
} {
  const regDay = registrationDate.getDate();

  // Calcular el inicio del período actual
  const start = new Date(referenceDate);
  start.setHours(0, 0, 0, 0);
  start.setDate(regDay);

  // Si el día de registro ya pasó este mes, el período empezó este mes
  // Si no, empezó el mes anterior
  if (start > referenceDate) {
    start.setMonth(start.getMonth() - 1);
  }

  // Handle months with fewer days (e.g., reg on 31st, current month has 30 days)
  if (start.getDate() !== regDay) {
    // Month doesn't have that day, use last day of previous month
    start.setDate(0);
  }

  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);
  end.setMilliseconds(-1); // End of last day of period

  return { start, end };
}

/**
 * Verifica si hoy es el aniversario de facturación del usuario.
 */
export function isBillingAnniversary(registrationDate: Date, today: Date = new Date()): boolean {
  return registrationDate.getDate() === today.getDate();
}
