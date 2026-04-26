import type { IdTokenResult } from 'firebase/auth';

/** Typed custom claims on Firebase ID tokens (merge with Firebase defaults). */
export type BasecampIdTokenClaims = IdTokenResult['claims'] & {
  premiumTier?: boolean;
};

declare module 'firebase/auth' {
  interface IdTokenResult {
    claims: BasecampIdTokenClaims;
  }
}

export {};
