/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string
  /** Diagnostics / demo: when "1" and build targets `basecamp-diagnostics`, treat premium claim as true (still gated by curriculum). */
  readonly VITE_FORCE_PREMIUM_TIER?: string
  /** Realtime Database URL (Firebase Console → Realtime Database). When unset, `rtdb` is null. */
  readonly VITE_FIREBASE_DATABASE_URL?: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
