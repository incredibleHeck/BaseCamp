function isDiagnosticsHostingHostname(): boolean {
  if (typeof window === 'undefined') return false;
  const h = window.location.hostname;
  return h === 'basecamp-diagnostics.web.app' || h === 'basecamp-diagnostics.firebaseapp.com';
}

/**
 * Hosted investor/demo (basecamp-diagnostics) should always show access-code login + linkedProfileId
 * routing without relying on a build-time flag being set correctly.
 * Pilot / other projects: set VITE_ENABLE_DEMO_SEED=true only when you want that behaviour.
 */
export const isDemoHostedBuild =
  import.meta.env.VITE_ENABLE_DEMO_SEED === 'true' ||
  import.meta.env.VITE_FIREBASE_PROJECT_ID === 'basecamp-diagnostics' ||
  isDiagnosticsHostingHostname();
