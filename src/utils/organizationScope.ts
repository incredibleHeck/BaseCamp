/**
 * B2B multi-tenant: `organizationId` is the only network scope field on Firestore documents.
 */
export function effectiveOrganizationId(
  record: { organizationId?: string } | null | undefined
): string | undefined {
  const o = record?.organizationId;
  return typeof o === 'string' && o.trim() ? o.trim() : undefined;
}
