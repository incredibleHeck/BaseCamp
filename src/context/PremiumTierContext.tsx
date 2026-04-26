import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useSchoolConfig } from '../hooks/useSchoolConfig';
import { isDemoHostedBuild } from '../config/demoMode';
import { readPremiumTierClaim } from '../types/authClaims';
import { resolveEffectivePremiumTier } from '../utils/resolveEffectivePremiumTier';
import type { UserData } from '../components/layout/Header';
import type { School } from '../types/domain';

const DEMO_FORCE_PREMIUM =
  isDemoHostedBuild && typeof import.meta.env !== 'undefined' && import.meta.env.VITE_FORCE_PREMIUM_TIER === '1';

type PremiumTierValue = {
  isPremiumTier: boolean;
  /** True once ID token was read and (if user has a school) school config finished loading. */
  isReady: boolean;
  /** School `curriculumType` when resolved; undefined if no school or not yet loaded. */
  curriculumType: School['curriculumType'] | undefined;
  /** Token claim (or diagnostics `VITE_FORCE_PREMIUM_TIER` when enabled). */
  effectivePremiumClaim: boolean;
};

const PremiumTierContext = createContext<PremiumTierValue | null>(null);

type PremiumTierProviderProps = {
  user: UserData;
  children: React.ReactNode;
};

/**
 * Resolves `isPremiumTier` from Firebase custom claims and the tenant's `curriculumType`.
 * Without a `schoolId`, premium is false. While school config is loading, `isReady` is false
 * and `isPremiumTier` is false.
 */
export function PremiumTierProvider({ user, children }: PremiumTierProviderProps) {
  const schoolId = user.schoolId?.trim() || undefined;
  const { school, loading: schoolLoading } = useSchoolConfig(schoolId);
  const [tokenReady, setTokenReady] = useState(false);
  const [tokenPremium, setTokenPremium] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setTokenPremium(false);
        setTokenReady(true);
        return;
      }
      try {
        const result = await u.getIdTokenResult(true);
        setTokenPremium(readPremiumTierClaim(result.claims as object));
      } catch {
        setTokenPremium(false);
      } finally {
        setTokenReady(true);
      }
    });
    return () => unsubscribe();
  }, []);

  const effectivePremiumClaim = DEMO_FORCE_PREMIUM || tokenPremium;
  const hasSchoolId = Boolean(schoolId);
  const isReady = tokenReady && (!hasSchoolId || !schoolLoading);

  const value = useMemo((): PremiumTierValue => {
    const curriculumType = hasSchoolId ? school?.curriculumType : undefined;
    const isPremiumTier =
      isReady &&
      resolveEffectivePremiumTier({
        premiumClaim: effectivePremiumClaim,
        curriculumType,
        hasSchoolId,
      });
    return {
      isPremiumTier,
      isReady,
      curriculumType,
      effectivePremiumClaim,
    };
  }, [isReady, hasSchoolId, school, effectivePremiumClaim]);

  return <PremiumTierContext.Provider value={value}>{children}</PremiumTierContext.Provider>;
}

export function usePremiumTier(): PremiumTierValue {
  const ctx = useContext(PremiumTierContext);
  if (!ctx) {
    throw new Error('usePremiumTier must be used within a PremiumTierProvider');
  }
  return ctx;
}
