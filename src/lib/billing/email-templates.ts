interface InvoiceEmailData {
  userName: string;
  invoiceNumber: string;
  periodStart: string;
  periodEnd: string;
  totalTokens: number;
  amountUsd: number;
  dueDate: string;
  payUrl: string;
}

interface ReceiptEmailData {
  userName: string;
  invoiceNumber: string;
  amountUsd: number;
  paidAt: string;
}

interface OverdueEmailData {
  userName: string;
  invoiceNumber: string;
  amountUsd: number;
  dueDate: string;
  payUrl: string;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Argentina/Buenos_Aires',
  });
}

function formatTokens(tokens: number): string {
  return tokens.toLocaleString('es-AR');
}

const baseStyles = `
  font-family: Arial, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background: #0a0a0f;
  color: #e4e4e7;
`;

const headerStyle = `
  color: #06b6d4;
  border-bottom: 2px solid #06b6d4;
  padding-bottom: 10px;
`;

const cardStyle = `
  background: #12121a;
  border: 1px solid #27272a;
  border-radius: 12px;
  padding: 20px;
  margin: 20px 0;
`;

const buttonStyle = `
  display: inline-block;
  background: linear-gradient(135deg, #06b6d4, #2dd4bf);
  color: #0a0a0f;
  font-weight: bold;
  text-decoration: none;
  padding: 14px 32px;
  border-radius: 12px;
  font-size: 16px;
`;

export function invoiceEmailHtml(data: InvoiceEmailData): string {
  return `
    <div style="${baseStyles}">
      <h2 style="${headerStyle}">Factura Mensual - Ego-Core</h2>

      <p style="color: #a1a1aa;">Hola ${data.userName},</p>
      <p style="color: #a1a1aa;">Tu resumen de uso mensual está listo.</p>

      <div style="${cardStyle}">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #71717a;">Factura N°:</td>
            <td style="padding: 8px 0; font-weight: bold; color: #e4e4e7;">${data.invoiceNumber}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #71717a;">Período:</td>
            <td style="padding: 8px 0; color: #e4e4e7;">${formatDate(data.periodStart)} - ${formatDate(data.periodEnd)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #71717a;">Tokens consumidos:</td>
            <td style="padding: 8px 0; color: #e4e4e7;">${formatTokens(data.totalTokens)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #71717a;">Vencimiento:</td>
            <td style="padding: 8px 0; color: #e4e4e7;">${formatDate(data.dueDate)}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; color: #71717a; font-size: 18px; border-top: 1px solid #27272a;">Total:</td>
            <td style="padding: 12px 0; font-weight: bold; font-size: 24px; color: #06b6d4; border-top: 1px solid #27272a;">USD $${data.amountUsd.toFixed(2)}</td>
          </tr>
        </table>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.payUrl}" style="${buttonStyle}">Pagar factura</a>
      </div>

      <p style="color: #71717a; font-size: 12px; text-align: center; margin-top: 40px;">
        Tenés 4 días para realizar el pago. Pasado ese plazo, el acceso al chat con IA se restringirá temporalmente.
      </p>
      <p style="color: #52525b; font-size: 11px; text-align: center;">
        Este email fue generado automáticamente por Ego-Core.
      </p>
    </div>
  `;
}

export function receiptEmailHtml(data: ReceiptEmailData): string {
  return `
    <div style="${baseStyles}">
      <h2 style="${headerStyle}">Recibo de Pago - Ego-Core</h2>

      <p style="color: #a1a1aa;">Hola ${data.userName},</p>
      <p style="color: #a1a1aa;">Tu pago ha sido procesado exitosamente.</p>

      <div style="${cardStyle}">
        <div style="text-align: center; margin-bottom: 16px;">
          <span style="font-size: 48px; color: #22c55e;">&#10003;</span>
        </div>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #71717a;">Factura N°:</td>
            <td style="padding: 8px 0; color: #e4e4e7;">${data.invoiceNumber}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #71717a;">Monto pagado:</td>
            <td style="padding: 8px 0; font-weight: bold; color: #22c55e;">USD $${data.amountUsd.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #71717a;">Fecha de pago:</td>
            <td style="padding: 8px 0; color: #e4e4e7;">${formatDate(data.paidAt)}</td>
          </tr>
        </table>
      </div>

      <p style="color: #a1a1aa; text-align: center;">Gracias por tu pago. Tu acceso está completamente activo.</p>

      <p style="color: #52525b; font-size: 11px; text-align: center; margin-top: 40px;">
        Este email fue generado automáticamente por Ego-Core.
      </p>
    </div>
  `;
}

export function overdueEmailHtml(data: OverdueEmailData): string {
  return `
    <div style="${baseStyles}">
      <h2 style="color: #f59e0b; border-bottom: 2px solid #f59e0b; padding-bottom: 10px;">
        Factura Vencida - Acción Requerida
      </h2>

      <p style="color: #a1a1aa;">Hola ${data.userName},</p>
      <p style="color: #fbbf24;">Tu factura <strong>${data.invoiceNumber}</strong> venció el ${formatDate(data.dueDate)} y aún no ha sido pagada.</p>

      <div style="${cardStyle}; border-color: #f59e0b;">
        <p style="color: #fbbf24; font-size: 18px; text-align: center; margin: 0;">
          Monto adeudado: <strong style="font-size: 24px;">USD $${data.amountUsd.toFixed(2)}</strong>
        </p>
      </div>

      <p style="color: #f87171;">El acceso al chat con IA ha sido restringido hasta que se realice el pago.</p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.payUrl}" style="${buttonStyle}">Pagar ahora</a>
      </div>

      <p style="color: #52525b; font-size: 11px; text-align: center; margin-top: 40px;">
        Este email fue generado automáticamente por Ego-Core.
      </p>
    </div>
  `;
}
