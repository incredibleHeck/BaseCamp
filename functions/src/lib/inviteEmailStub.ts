import * as logger from 'firebase-functions/logger';

/**
 * Sprint 1: no outbound email transport. Sprint 2 will send the same template via SMTP/API.
 * Never log the full reset URL (treat as a secret).
 */
export async function sendInviteEmailStub(args: { to: string; role: string; inviteLink: string }): Promise<void> {
  const intro = `You have been invited to join BaseCamp as a ${args.role}. Click the link below to set your password and access your dashboard.`;
  logger.info('inviteStaffMember: email delivery stub (replace in Sprint 2)', {
    to: args.to,
    role: args.role,
    linkLength: args.inviteLink.length,
    bodyTemplateChars: intro.length,
  });
}
