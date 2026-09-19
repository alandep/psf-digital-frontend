// MOCK: Cookie consent categories (§65). Frontend-only, persisted in localStorage.
export interface CookieConsent {
  essential: true; // always true, cannot be disabled
  analytics: boolean;
  preferences: boolean;
  marketing: boolean;
  decidedAt: string; // ISO timestamp when the user made a choice
}
