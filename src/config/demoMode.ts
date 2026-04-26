const DIAGNOSTICS_FIREBASE_PROJECT_ID = 'basecamp-diagnostics' as const;

/**
 * When the Vite build targets the diagnostics Firebase project, enable demo auth:
 * access-code teacher login, seed footer, linkedProfileId resolution, etc.
 * Pilot and other project IDs always get full staff (PIN / email+password) flows.
 */
export const isDemoHostedBuild =
  import.meta.env.VITE_FIREBASE_PROJECT_ID === DIAGNOSTICS_FIREBASE_PROJECT_ID;
