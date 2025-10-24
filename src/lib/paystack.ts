import crypto from 'crypto';

const PAYSTACK_BASE = 'https://api.paystack.co';
const SECRET = process.env.PAYSTACK_SECRET_KEY || '';

async function paystackFetch(path: string, options: RequestInit = {}) {
  const url = `${PAYSTACK_BASE}${path}`;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${SECRET}`,
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  const res = await fetch(url, { ...options, headers });
  const text = await res.text();
  let json: any;
  try {
    json = JSON.parse(text || '{}');
  } catch (e) {
    json = { raw: text };
  }
  return { status: res.status, ok: res.ok, body: json };
}

export async function initializeTransaction({ amount, email, metadata }: { amount: number; email: string; metadata?: any; }) {
  // Paystack expects amount in the smallest currency unit (e.g., kobo or centimes)
  const payload = {
    amount: Math.round(amount * 100),
    email,
    currency: 'XOF',
    metadata: metadata || {},
  };

  return paystackFetch('/transaction/initialize', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function verifyTransaction(reference: string) {
  return paystackFetch(`/transaction/verify/${encodeURIComponent(reference)}`);
}

export async function createPlan({ name, amount, interval, currency = 'XOF', description }: { name: string; amount: number; interval: string; currency?: string; description?: string; }) {
  const payload = {
    name,
    amount: Math.round(amount * 100),
    interval,
    currency,
    description,
  };

  return paystackFetch('/plan', { method: 'POST', body: JSON.stringify(payload) });
}

export async function createSubscription({ customer, plan }: { customer: string; plan: string; }) {
  const payload = { customer, plan };
  return paystackFetch('/subscription', { method: 'POST', body: JSON.stringify(payload) });
}

export async function cancelSubscription(paystackSubscriptionId: string) {
  return paystackFetch(`/subscription/${encodeURIComponent(paystackSubscriptionId)}`, { method: 'DELETE' });
}

export function verifyWebhookSignature(rawBody: string, signature?: string) {
  if (!signature) return false;
  const secret = process.env.PAYSTACK_WEBHOOK_SECRET || SECRET;
  const hash = crypto.createHmac('sha512', secret).update(rawBody).digest('hex');
  return hash === signature;
}

export default {
  initializeTransaction,
  verifyTransaction,
  createPlan,
  createSubscription,
  cancelSubscription,
  verifyWebhookSignature,
};
