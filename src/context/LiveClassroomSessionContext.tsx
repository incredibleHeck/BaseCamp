import React, { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

function newSessionId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `live_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export type LiveClassroomSessionValue = {
  isLiveSessionActive: boolean;
  /** RTDB `live_sessions/{id}`; null when no session. */
  activeSessionId: string | null;
  setActiveSessionId: (id: string | null) => void;
  setLiveSessionActive: (active: boolean) => void;
  /**
   * Starts a new session: sets an id and marks active. Pass `id` to use a pre-created one.
   * @returns the session id
   */
  beginLiveSession: (id?: string) => string;
  endLiveSession: () => void;
};

const LiveClassroomSessionContext = createContext<LiveClassroomSessionValue | null>(null);

export function LiveClassroomSessionProvider({ children }: { children: ReactNode }) {
  const [isLiveSessionActive, setLiveSessionActive] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const beginLiveSession = useCallback((id?: string) => {
    const sid = (id && id.trim()) || newSessionId();
    setActiveSessionId(sid);
    setLiveSessionActive(true);
    return sid;
  }, []);

  const endLiveSession = useCallback(() => {
    setActiveSessionId(null);
    setLiveSessionActive(false);
  }, []);

  const value = useMemo(
    (): LiveClassroomSessionValue => ({
      isLiveSessionActive,
      activeSessionId,
      setActiveSessionId,
      setLiveSessionActive,
      beginLiveSession,
      endLiveSession,
    }),
    [isLiveSessionActive, activeSessionId, beginLiveSession, endLiveSession]
  );

  return (
    <LiveClassroomSessionContext.Provider value={value}>{children}</LiveClassroomSessionContext.Provider>
  );
}

export function useLiveClassroomSession(): LiveClassroomSessionValue {
  const ctx = useContext(LiveClassroomSessionContext);
  if (!ctx) {
    throw new Error('useLiveClassroomSession must be used within LiveClassroomSessionProvider');
  }
  return ctx;
}
