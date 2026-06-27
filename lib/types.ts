export type IconKeyword =
  | 'spark'
  | 'stack'
  | 'bolt'
  | 'check'
  | 'heart'
  | 'shield'
  | 'star'
  | 'grid';

export interface ColorPalette {
  bg: string;      // gradient start (hex)
  bg2: string;     // gradient end (hex)
  text: string;    // primary text color (hex)
  accent: string;  // accent / icon badge color (hex)
  card1: string;   // decorative floating card color 1 (hex)
  card2: string;   // decorative floating card color 2 (hex)
}

export interface ScreenshotContent {
  eyebrow: string;
  headline: string;
  supporting: string;
  icon: IconKeyword;
}

export interface ScreenshotItem extends ScreenshotContent {
  id: string;
  position: number;
  // Client-side only (during session)
  file?: File;
  dataUrl?: string;
  // Persisted
  storageUrl?: string;
  storagePath?: string;
}

export interface Batch {
  id: string;
  userId: string;
  palette: ColorPalette;
  screenshots: ScreenshotItem[];
  createdAt: string;
}

export type PlanName = 'starter' | 'pro' | 'studio';

export interface Plan {
  id: PlanName;
  name: string;
  price: number;
  credits: number;
  productEnvVar: string;
}

export const PLANS: Plan[] = [
  { id: 'starter', name: 'Starter', price: 9, credits: 30, productEnvVar: 'POLAR_PRODUCT_STARTER' },
  { id: 'pro', name: 'Pro', price: 19, credits: 150, productEnvVar: 'POLAR_PRODUCT_PRO' },
  { id: 'studio', name: 'Studio', price: 39, credits: 400, productEnvVar: 'POLAR_PRODUCT_STUDIO' },
];

export const ICON_KEYWORDS: IconKeyword[] = [
  'spark', 'stack', 'bolt', 'check', 'heart', 'shield', 'star', 'grid',
];

export const MAX_BATCH_SIZE = 10;

// Credit costs
export const CREDIT_COST_MOCKUP = 1;
export const CREDIT_COST_REVISION = 0.25;
