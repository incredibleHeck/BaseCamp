import React, { createContext, useContext } from 'react';

import type { UserData } from '../components/layout/Header';

type AuthContextValue = {
  user: UserData;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  user,
  children,
}: {
  user: UserData;
  children: React.ReactNode;
}) {
  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
}

/**
 * Authenticated session for the logged-in user (Firebase + Firestore profile).
 * Only available under AuthProvider (wrapped around the main shell in App).
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

