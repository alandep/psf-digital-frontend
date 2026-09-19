import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { IAuthFlowService } from './auth-flow.interface';
import { AuthChallenge, AuthOrganization } from '../../../types/auth-flow';
import { AuthFlowMockService } from '../../../services/authFlowMockService';

// Adapter that delegates entirely to the existing in-memory mock service.
// Preserves current behavior exactly when realApis.auth is false.
@Injectable({ providedIn: 'root' })
export class AuthFlowMockAdapter implements IAuthFlowService {
  private readonly mock = inject(AuthFlowMockService);

  get lastCpf(): string | null {
    return this.mock.lastCpf;
  }
  set lastCpf(value: string | null) {
    this.mock.lastCpf = value;
  }

  get lastChallenge(): AuthChallenge | null {
    return this.mock.lastChallenge;
  }
  set lastChallenge(value: AuthChallenge | null) {
    this.mock.lastChallenge = value;
  }

  get defaultOrganizations(): AuthOrganization[] {
    return this.mock.defaultOrganizations;
  }

  setLastCpf(cpf: string): void {
    this.mock.setLastCpf(cpf);
  }

  setLastChallenge(challenge: AuthChallenge): void {
    this.mock.setLastChallenge(challenge);
  }

  reset(): void {
    this.mock.reset();
  }

  identify(cpf: string): Observable<AuthChallenge> {
    return this.mock.identify(cpf);
  }

  verifyPassword(cpf: string, password: string): Observable<AuthChallenge> {
    return this.mock.verifyPassword(cpf, password);
  }

  verifyMfa(code: string): Observable<AuthChallenge> {
    return this.mock.verifyMfa(code);
  }

  verifyRecoveryCode(code: string): Observable<AuthChallenge> {
    return this.mock.verifyRecoveryCode(code);
  }

  selectOrganization(orgId: string): Observable<AuthChallenge> {
    return this.mock.selectOrganization(orgId);
  }

  requestPasswordReset(identifier: string): Observable<void> {
    return this.mock.requestPasswordReset(identifier);
  }

  resetPassword(token: string, newPassword: string): Observable<void> {
    return this.mock.resetPassword(token, newPassword);
  }
}
