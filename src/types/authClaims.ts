/** Firebase Auth custom claim for Premium tier (set only via Admin SDK / Cloud Functions). */
export const PREMIUM_TIER_CLAIM_KEY = 'premiumTier' as const;

export function readPremiumTierClaim(claims: object | undefined): boolean {
  if (!claims || typeof claims !== 'object') return false;
  const v = (claims as Record<string, unknown>)[PREMIUM_TIER_CLAIM_KEY];
  return v === true;
}
