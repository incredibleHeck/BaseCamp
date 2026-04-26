const RESEND_API_URL = 'https://api.resend.com/emails';

export type SendTransactionalEmailArgs = {
  to: string;
  subject: string;
  html: string;
  text: string;
  apiKey: string;
  /** Resend `from`: email or `"Display Name <email@domain>"`. */
  from: string;
};

/**
 * Sends one message via Resend HTTP API (no extra npm dependency).
 */
export async function sendTransactionalEmail(args: SendTransactionalEmailArgs): Promise<{ id?: string }> {
  const { to, subject, html, text, apiKey, from } = args;
  if (!apiKey.trim()) {
    throw new Error('RESEND_API_KEY is not configured');
  }
  if (!from.trim()) {
    throw new Error('TRANSACTIONAL_FROM_EMAIL is not configured');
  }

  const res = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey.trim()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: from.trim(),
      to: [to.trim()],
      subject,
      html,
      text,
    }),
  });

  let body: Record<string, unknown> = {};
  try {
    body = (await res.json()) as Record<string, unknown>;
  } catch {
    /* ignore */
  }

  if (!res.ok) {
    const msg =
      typeof body.message === 'string'
        ? body.message
        : typeof body.name === 'string'
          ? body.name
          : res.statusText;
    throw new Error(`Resend error (${res.status}): ${msg}`);
  }

  const id = body.id;
  return { id: typeof id === 'string' ? id : undefined };
}

/** `from` header for Resend using env (set in Firebase Console for the function). */
export function transactionalFromHeader(): string {
  const email = process.env.TRANSACTIONAL_FROM_EMAIL?.trim();
  const name = process.env.TRANSACTIONAL_FROM_NAME?.trim();
  if (!email) return '';
  if (name) return `${name} <${email}>`;
  return email;
}
