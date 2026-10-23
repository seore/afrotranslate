// Typed view of PremiumContext.js for TypeScript screens.

import type { PurchasesOffering, PurchasesPackage } from 'react-native-purchases';

import { usePremium } from '../PremiumContext';

export interface PremiumValue {
  isPremium: boolean;
  loading: boolean;
  offering: PurchasesOffering | null;
  offeringsStatus: 'loading' | 'ready' | 'error';
  introEligibility: Record<string, boolean>;
  refreshOfferings: () => Promise<void>;
  purchasePremium: (
    pkg: PurchasesPackage,
    options?: { silent?: boolean },
  ) => Promise<{ status: 'success' | 'cancelled' | 'pending' | 'error' }>;
  restorePurchases: (options?: { silent?: boolean }) => Promise<{ status: 'restored' | 'none' | 'error' }>;
}

export function usePremiumStatus(): PremiumValue {
  return usePremium() as unknown as PremiumValue;
}
