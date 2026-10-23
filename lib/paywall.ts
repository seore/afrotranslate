// ================================================================
// lib/paywall.ts - Plan ordering and wording for the paywall.
// Every price and trial length comes from the store data RevenueCat
// returns; nothing here hard-codes an amount or currency. Uses
// structural types so it can be tested from Node with plain objects.
// ================================================================

export interface IntroPriceLike {
  price: number;
  priceString: string;
  periodUnit: string;
  periodNumberOfUnits: number;
}

export interface PackageLike {
  identifier: string;
  packageType: string;
  product: {
    identifier: string;
    title: string;
    price: number;
    priceString: string;
    pricePerMonthString?: string | null;
    introPrice: IntroPriceLike | null;
  };
}

const ORDER = ['ANNUAL', 'MONTHLY', 'LIFETIME'];

const PLAN_NAMES: Record<string, string> = {
  ANNUAL: 'Yearly',
  MONTHLY: 'Monthly',
  LIFETIME: 'Lifetime',
  SIX_MONTH: '6 months',
  THREE_MONTH: '3 months',
  TWO_MONTH: '2 months',
  WEEKLY: 'Weekly',
};

const PERIOD_SUFFIX: Record<string, string> = {
  ANNUAL: '/year',
  MONTHLY: '/month',
  SIX_MONTH: '/6 months',
  THREE_MONTH: '/3 months',
  TWO_MONTH: '/2 months',
  WEEKLY: '/week',
};

/** Annual, monthly, lifetime first (in that order), then anything else the offering adds. */
export function orderPackages<T extends PackageLike>(packages: T[]): T[] {
  const rank = (p: T) => {
    const i = ORDER.indexOf(p.packageType);
    return i === -1 ? ORDER.length : i;
  };
  return [...packages].sort((a, b) => rank(a) - rank(b));
}

/** Annual if offered, otherwise the first plan. */
export function defaultPackage<T extends PackageLike>(packages: T[]): T | undefined {
  return packages.find((p) => p.packageType === 'ANNUAL') ?? orderPackages(packages)[0];
}

export function planName(pkg: PackageLike): string {
  return PLAN_NAMES[pkg.packageType] ?? pkg.product.title;
}

export function isSubscription(pkg: PackageLike): boolean {
  return pkg.packageType !== 'LIFETIME';
}

/** "£39.99/year", or just the price for lifetime and unknown periods. */
export function priceLabel(pkg: PackageLike): string {
  return `${pkg.product.priceString}${PERIOD_SUFFIX[pkg.packageType] ?? ''}`;
}

/** Whole-percent saving of annual vs 12 × monthly, or null if not meaningful. */
export function annualSavingsPercent(packages: PackageLike[]): number | null {
  const annual = packages.find((p) => p.packageType === 'ANNUAL');
  const monthly = packages.find((p) => p.packageType === 'MONTHLY');
  if (!annual || !monthly || monthly.product.price <= 0) return null;
  const saving = Math.round((1 - annual.product.price / (monthly.product.price * 12)) * 100);
  return saving >= 5 ? saving : null;
}

function periodText(unit: string, count: number): string {
  const name = { DAY: 'day', WEEK: 'week', MONTH: 'month', YEAR: 'year' }[unit] ?? unit.toLowerCase();
  return `${count}-${name}`;
}

/** The free-trial offer this user can actually get, or null. */
export function freeTrial(pkg: PackageLike, eligibility: Record<string, boolean>): IntroPriceLike | null {
  const intro = pkg.product.introPrice;
  if (!intro || intro.price !== 0) return null;
  return eligibility[pkg.product.identifier] ? intro : null;
}

/** e.g. "7-day free trial". */
export function trialBadge(intro: IntroPriceLike): string {
  return `${periodText(intro.periodUnit, intro.periodNumberOfUnits)} free trial`;
}

/** Subscription terms shown under the purchase button (App Store Guideline 3.1.2). */
export function disclosure(pkg: PackageLike, trial: IntroPriceLike | null): string {
  if (!isSubscription(pkg)) return `One-time payment of ${pkg.product.priceString}. No subscription.`;
  const renew = `Renews automatically at ${priceLabel(pkg)} until cancelled. Cancel anytime in your Apple ID settings at least 24 hours before the end of the current period.`;
  if (!trial) return `${priceLabel(pkg)}. ${renew}`;
  return `${trialBadge(trial)}, then ${priceLabel(pkg)}. Payment is charged to your Apple ID when the trial ends unless you cancel at least 24 hours before. ${renew}`;
}

export function ctaLabel(pkg: PackageLike, trial: IntroPriceLike | null): string {
  if (trial) return 'Start free trial';
  return isSubscription(pkg) ? 'Subscribe' : 'Unlock lifetime access';
}
