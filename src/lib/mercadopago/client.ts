import { MercadoPagoConfig, Preference, Payment, PreApproval } from 'mercadopago';

let configInstance: MercadoPagoConfig | null = null;

function getConfig(): MercadoPagoConfig {
  if (configInstance) return configInstance;

  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error('Missing MERCADOPAGO_ACCESS_TOKEN environment variable');
  }

  configInstance = new MercadoPagoConfig({ accessToken });
  return configInstance;
}

export function getPreferenceClient(): Preference {
  return new Preference(getConfig());
}

export function getPaymentClient(): Payment {
  return new Payment(getConfig());
}

export function getPreApprovalClient(): PreApproval {
  return new PreApproval(getConfig());
}
