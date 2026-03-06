import type { BillingProvider } from './provider';
import { PlaceholderBillingProvider } from './providers/placeholder';

let _provider: BillingProvider | undefined;

function createProvider(): BillingProvider {
  const providerName = process.env.BILLING_PROVIDER || 'placeholder';
  if (providerName === 'stripe') {
    const key = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const priceMonthly = process.env.STRIPE_PRICE_MONTHLY;
    const priceAnnual = process.env.STRIPE_PRICE_ANNUAL;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    if (!key || !webhookSecret || !priceMonthly || !priceAnnual) {
      throw new Error(
        'STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_MONTHLY, STRIPE_PRICE_ANNUAL required'
      );
    }
    const { StripeBillingProvider } = require('./providers/stripe');
    return new StripeBillingProvider(
      key,
      webhookSecret,
      priceMonthly,
      priceAnnual,
      appUrl
    ) as BillingProvider;
  }
  return new PlaceholderBillingProvider();
}

export function getBillingProvider(): BillingProvider {
  if (!_provider) _provider = createProvider();
  return _provider;
}
