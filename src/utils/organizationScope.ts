/**
 * B2B org model: `organizationId` is canonical; `districtId` is legacy and read as fallback
 * until data is backfilled. Document ids (`schools/{schoolId}`) stay stable.
 */
export function effectiveOrganizationId(
  v: { organizationId?: string; districtId?: string } | null | undefined
): string | undefined {
  const a = v?.organizationId?.trim();
  if (a) return a;
  const b = v?.districtId?.trim();
  return b || undefined;
}
