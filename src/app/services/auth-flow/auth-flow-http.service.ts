import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { IAuthFlowService } from './auth-flow.interface';
import { AuthChallenge, AuthOrganization, AuthState } from '../../../types/auth-flow';
import { environment } from '../../../environments/environment';

// Shape returned by AuthBffController. 'authenticationState' matches AuthState.
interface AuthBffResponse {
  authenticationState: AuthState;
  challengeId?: string;
  userName?: string;
  cpfMasked?: string;
  organizations?: AuthOrganization[];
  message?: string;
}

// HTTP gateway hitting the backend BFF /bff/auth/** endpoints. Maps responses
// into the same AuthChallenge shape the components expect from the mock and
// tracks challengeId/lastCpf between steps, just like the mock does.
@Injectable({ providedIn: 'root' })
export class AuthFlowHttpService implements IAuthFlowService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.bffBaseUrl + '/bff/auth';

  lastCpf: string | null = null;
  lastChallenge: AuthChallenge | null = null;

  // Organizations are only known after authentication in real mode; expose an
  // empty fallback so screens reached directly do not break.
  get defaultOrganizations(): AuthOrganization[] {
    return this.lastChallenge?.organizations ?? [];
  }

  setLastCpf(cpf: string): void {
    this.lastCpf = cpf;
  }

  setLastChallenge(challenge: AuthChallenge): void {
    this.lastChallenge = challenge;
  }

  reset(): void {
    this.lastCpf = null;
    this.lastChallenge = null;
  }

  // Maps a backend response into the front AuthChallenge and remembers it.
  private toChallenge(res: AuthBffResponse): AuthChallenge {
    const challenge: AuthChallenge = {
      state: res.authenticationState,
      cpfMasked: res.cpfMasked,
      userName: res.userName,
      organizations: res.organizations,
      challengeId: res.challengeId,
      message: res.message
    };
    this.setLastChallenge(challenge);
    return challenge;
  }

  private currentChallengeId(): string {
    return this.lastChallenge?.challengeId ?? '';
  }

  identify(cpf: string): Observable<AuthChallenge> {
    this.setLastCpf(cpf);
    return this.http
      .post<AuthBffResponse>(`${this.base}/identify`, { identifier: cpf })
      .pipe(map((res) => this.toChallenge(res)));
  }

  verifyPassword(_cpf: string, password: string): Observable<AuthChallenge> {
    return this.http
      .post<AuthBffResponse>(`${this.base}/login`, {
        challengeId: this.currentChallengeId(),
        password
      })
      .pipe(map((res) => this.toChallenge(res)));
  }

  verifyMfa(code: string): Observable<AuthChallenge> {
    return this.http
      .post<AuthBffResponse>(`${this.base}/mfa/verify`, {
        challengeId: this.currentChallengeId(),
        code
      })
      .pipe(map((res) => this.toChallenge(res)));
  }

  // The backend has no dedicated recovery-code step; reuse the MFA verify
  // endpoint so recovery codes flow through the same challenge.
  verifyRecoveryCode(code: string): Observable<AuthChallenge> {
    return this.verifyMfa(code);
  }

  selectOrganization(orgId: string): Observable<AuthChallenge> {
    return this.http
      .post<AuthBffResponse>(`${this.base}/select-organization`, {
        challengeId: this.currentChallengeId(),
        organizationId: orgId
      })
      .pipe(map((res) => this.toChallenge(res)));
  }

  // Anti-enumeration: resolve success even if the endpoint is unavailable.
  requestPasswordReset(identifier: string): Observable<void> {
    return this.http
      .post<void>(`${this.base}/password/forgot`, { identifier })
      .pipe(
        map(() => void 0),
        catchError(() => of(void 0))
      );
  }

  resetPassword(token: string, newPassword: string): Observable<void> {
    return this.http
      .post<void>(`${this.base}/password/reset`, { token, newPassword })
      .pipe(
        map(() => void 0),
        tap({ error: () => void 0 })
      );
  }
}
