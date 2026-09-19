// MOCK: In-memory signup/trial flow. No backend calls. To wire a real API,
// replace the of(...) bodies with HttpClient requests returning the same shapes.
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import {
  SignupAccount,
  SignupCompany,
  TrialResult,
} from '../types/signup';

// Exact test CNPJ that simulates the "empresa já cadastrada" path (§48).
const TAKEN_CNPJ = '11.111.111/0001-11';

@Injectable({ providedIn: 'root' })
export class SignupMockService {
  // Stores the last successful trial so the /trial landing can read it.
  lastTrial: TrialResult | null = null;

  /**
   * MOCK: Checks if a company (by CNPJ) can be registered.
   * Returns available:false ONLY for the exact test CNPJ, to demo §48.
   */
  checkCnpj(cnpj: string): Observable<{ available: boolean }> {
    const normalized = (cnpj || '').trim();
    const available = normalized !== TAKEN_CNPJ;
    return of({ available }).pipe(delay(500));
  }

  /**
   * MOCK: Starts a 14-day trial and returns the resulting organization.
   */
  startTrial(
    account: SignupAccount,
    company: SignupCompany,
    goals: string[]
  ): Observable<TrialResult> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14);
    const result: TrialResult = {
      organizationId: 'org-trial-1',
      trialStatus: 'ACTIVE',
      expiresAt,
      nextAction: 'START_ONBOARDING',
    };
    this.lastTrial = result;
    return of(result).pipe(delay(500));
  }
}
