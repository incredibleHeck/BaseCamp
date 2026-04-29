const DIAGNOSTICS_FIREBASE_PROJECT_ID = 'basecamp-diagnostics' as const;

/**
 * True when the Vite bundle targets the diagnostics Firebase project (`basecamp-diagnostics`),
 * e.g. `vite build --mode diagnostics`. Used for branding (BaseCamp Diagnostics) and diagnostics-only toggles.
 */
export const isDemoHostedBuild =
  import.meta.env.VITE_FIREBASE_PROJECT_ID === DIAGNOSTICS_FIREBASE_PROJECT_ID;
