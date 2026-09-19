// MOCK identity state-machine service. In-memory, dependency-free (only
// @angular/core + rxjs). Every method simulates network latency via delay().
// To wire a real backend later, replace each method body with an HTTP call
// returning the same AuthChallenge shape. No other file needs to change.

import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { AuthChallenge, AuthOrganization } from '../types/auth-flow';

const LATENCY = 500;

@Injectable({ providedIn: 'root' })
export class AuthFlowMockService {
  // Flow continuity: the in-progress CPF and the latest challenge are kept here
  // so /mfa and /select-company can read them after a navigation.
  lastCpf: string | null = null;
  lastChallenge: AuthChallenge | null = null;

  // The mock organizations available to the demo user.
  private readonly mockOrgs: AuthOrganization[] = [
    { id: 'org-1', razaoSocial: 'Agro Export Brasil Ltda', cnpjMasked: '••.•••.•••/0001-••', role: 'Administrador' },
    { id: 'org-2', razaoSocial: 'Trading XYZ Ltda', cnpjMasked: '••.•••.•••/0001-••', role: 'Financeiro' },
    { id: 'org-3', razaoSocial: 'Sul Grãos Comex ME', cnpjMasked: '••.•••.•••/0002-••', role: 'Operações' }
  ];

  // Default orgs list, used as a fallback when a screen is reached directly.
  get defaultOrganizations(): AuthOrganization[] {
    return this.mockOrgs.map((o) => ({ ...o }));
  }

  setLastCpf(cpf: string): void {
    this.lastCpf = cpf;
  }

  setLastChallenge(challenge: AuthChallenge): void {
    this.lastChallenge = challenge;
  }

  // Masks a CPF, keeping only the last 2 digits visible: '•••.•••.•89-••'.
  private maskCpf(cpf: string): string {
    const digits = (cpf || '').replace(/\D/g, '');
    const last2 = digits.slice(-2).padStart(2, '•');
    return `•••.•••.•${last2}-••`;
  }

  // STEP: identification. Accepts any non-empty CPF.
  identify(cpf: string): Observable<AuthChallenge> {
    const challenge: AuthChallenge = {
      state: 'PASSWORD_REQUIRED',
      cpfMasked: this.maskCpf(cpf),
      userName: 'Alan Franco'
    };
    this.setLastCpf(cpf);
    this.setLastChallenge(challenge);
    return of(challenge).pipe(delay(LATENCY));
  }

  // STEP: password. Accepts any non-empty password. Mock user always has MFA on.
  verifyPassword(_cpf: string, _password: string): Observable<AuthChallenge> {
    const challenge: AuthChallenge = {
      state: 'MFA_REQUIRED',
      challengeId: 'mock-challenge',
      userName: 'Alan Franco'
    };
    this.setLastChallenge(challenge);
    return of(challenge).pipe(delay(LATENCY));
  }

  // STEP: MFA. A 6-digit code advances to organization selection; anything
  // else is rejected with a message.
  verifyMfa(code: string): Observable<AuthChallenge> {
    const digits = (code || '').replace(/\D/g, '');
    if (digits.length === 6) {
      const challenge: AuthChallenge = {
        state: 'ORGANIZATION_SELECTION_REQUIRED',
        organizations: this.defaultOrganizations
      };
      this.setLastChallenge(challenge);
      return of(challenge).pipe(delay(LATENCY));
    }
    const challenge: AuthChallenge = {
      state: 'MFA_REQUIRED',
      message: 'Código inválido. Tente novamente.'
    };
    return of(challenge).pipe(delay(LATENCY));
  }

  // STEP: recovery code. Any non-empty code advances to organization selection.
  verifyRecoveryCode(code: string): Observable<AuthChallenge> {
    const trimmed = (code || '').trim();
    if (trimmed.length > 0) {
      const challenge: AuthChallenge = {
        state: 'ORGANIZATION_SELECTION_REQUIRED',
        organizations: this.defaultOrganizations
      };
      this.setLastChallenge(challenge);
      return of(challenge).pipe(delay(LATENCY));
    }
    const challenge: AuthChallenge = {
      state: 'MFA_REQUIRED',
      message: 'Código de recuperação inválido.'
    };
    return of(challenge).pipe(delay(LATENCY));
  }

  // STEP: organization selection. Always authenticates in mock mode.
  selectOrganization(_orgId: string): Observable<AuthChallenge> {
    const challenge: AuthChallenge = { state: 'AUTHENTICATED' };
    this.setLastChallenge(challenge);
    return of(challenge).pipe(delay(LATENCY));
  }

  // Password reset request. Always succeeds (anti-enumeration handled by UI).
  requestPasswordReset(_identifier: string): Observable<void> {
    return of(void 0).pipe(delay(LATENCY));
  }

  // Password reset confirmation. Always succeeds in mock mode.
  resetPassword(_token: string, _newPassword: string): Observable<void> {
    return of(void 0).pipe(delay(LATENCY));
  }

  // Clears any in-progress flow state.
  reset(): void {
    this.lastCpf = null;
    this.lastChallenge = null;
  }
}
