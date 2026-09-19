// MOCK: Cookie consent state (§65). Dependency-free; persisted in localStorage.
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CookieConsent } from '../types/cookie-consent';

const CONSENT_KEY = 'eip_cookie_consent';

@Injectable({ providedIn: 'root' })
export class CookieConsentService {
  private consentSubject = new BehaviorSubject<CookieConsent | null>(this.read());
  readonly consent$: Observable<CookieConsent | null> = this.consentSubject.asObservable();

  get hasDecided(): boolean {
    return this.consentSubject.value !== null;
  }

  get current(): CookieConsent | null {
    return this.consentSubject.value;
  }

  acceptAll(): void {
    this.persist({
      essential: true,
      analytics: true,
      preferences: true,
      marketing: true,
      decidedAt: new Date().toISOString(),
    });
  }

  rejectNonEssential(): void {
    this.persist({
      essential: true,
      analytics: false,
      preferences: false,
      marketing: false,
      decidedAt: new Date().toISOString(),
    });
  }

  save(partial: { analytics: boolean; preferences: boolean; marketing: boolean }): void {
    this.persist({
      essential: true,
      analytics: partial.analytics,
      preferences: partial.preferences,
      marketing: partial.marketing,
      decidedAt: new Date().toISOString(),
    });
  }

  reopen(): void {
    try {
      localStorage.removeItem(CONSENT_KEY);
    } catch {
      // ignore storage errors
    }
    this.consentSubject.next(null);
  }

  private persist(consent: CookieConsent): void {
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
    } catch {
      // ignore storage errors
    }
    this.consentSubject.next(consent);
  }

  private read(): CookieConsent | null {
    try {
      const raw = localStorage.getItem(CONSENT_KEY);
      if (!raw) {
        return null;
      }
      const parsed = JSON.parse(raw) as CookieConsent;
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch {
      return null;
    }
  }
}
