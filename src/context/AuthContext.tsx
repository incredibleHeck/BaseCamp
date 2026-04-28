import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';

import { auth } from '../lib/firebase';
import type { UserData } from '../components/layout/Header';
import type { AuthCustomClaims } from '../types/domain';

/** Custom claims stamped by Cloud Functions (e.g. inviteStaffMember, adminSetPremiumClaim). */
export type TokenClaims = AuthCustomClaims;

type AuthContextValue = {
  user: UserData;
  /** From `getIdTokenResult().claims` after a forced `getIdToken(true)` (sign-in and `refreshTokenClaims`). */
  tokenClaims: TokenClaims;
  /** True on first pass before `getIdTokenResult` completes for the current user. */
  claimsLoading: boolean;
  /** Call after an invite or claim change to force-refresh the ID token and re-read claims. */
  refreshTokenClaims: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function parseTokenClaims(claims: Record<string, unknown>): TokenClaims {
  const org =
    typeof claims.organizationId === 'string' && claims.organizationId.trim()
      ? claims.organizationId.trim()
      : undefined;
  return {
    schoolId: typeof claims.schoolId === 'string' ? claims.schoolId : undefined,
    role: typeof claims.role === 'string' ? claims.role : undefined,
    organizationId: org,
    premiumTier: claims.premiumTier === true ? true : undefined,
  };
}

export function AuthProvider({
  user,
  children,
}: {
  user: UserData;
  children: React.ReactNode;
}) {
  const [tokenClaims, setTokenClaims] = useState<TokenClaims>({});
  const [claimsLoading, setClaimsLoading] = useState(true);

  const loadClaims = useCallback(async () => {
    const u = auth.currentUser;
    if (!u) {
      setTokenClaims({});
      setClaimsLoading(false);
      return;
    }
    setClaimsLoading(true);
    try {
      // Force server round-trip so custom claims (set after custom token ops) are current on sign-in and after refresh.
      await u.getIdToken(true);
      const result = await u.getIdTokenResult();
      setTokenClaims(parseTokenClaims((result.claims as Record<string, unknown>) ?? {}));
    } catch (e) {
      console.error('getIdTokenResult failed', e);
      setTokenClaims({});
    } finally {
      setClaimsLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        void loadClaims();
      } else {
        setTokenClaims({});
        setClaimsLoading(false);
      }
    });
    return () => unsubscribe();
  }, [loadClaims]);

  const refreshTokenClaims = useCallback(() => loadClaims(), [loadClaims]);

  const value: AuthContextValue = {
    user,
    tokenClaims,
    claimsLoading,
    refreshTokenClaims,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
