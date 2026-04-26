import type { School } from '../types/domain';

export type ResolvePremiumArgs = {
  /** True when the ID token carries the premium claim (or diagnostics override applied upstream). */
  premiumClaim: boolean;
  /** Only defined when the user has a school; used with school doc. */
  curriculumType: School['curriculumType'];
  /** Users without a school (e.g. school administrator, super admin) are never premium in this sprint. */
  hasSchoolId: boolean;
};

/**
 * Premium UI is allowed only when the token authorizes it and the tenant curriculum
 * includes Cambridge (or blended), not GES-only.
 */
export function resolveEffectivePremiumTier(args: ResolvePremiumArgs): boolean {
  if (!args.premiumClaim || !args.hasSchoolId) return false;
  const ct = args.curriculumType;
  return ct === 'cambridge' || ct === 'both';
}
