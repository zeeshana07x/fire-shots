import { Polar } from '@polar-sh/sdk';

export const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  server: (process.env.NODE_ENV === 'production' ? 'production' : 'sandbox') as 'sandbox' | 'production',
});

export const PLAN_PRODUCT_IDS: Record<string, string> = {
  starter: process.env.POLAR_PRODUCT_STARTER ?? '',
  pro: process.env.POLAR_PRODUCT_PRO ?? '',
  studio: process.env.POLAR_PRODUCT_STUDIO ?? '',
};

export const PLAN_CREDITS: Record<string, number> = {
  starter: 30,
  pro: 150,
  studio: 400,
};
