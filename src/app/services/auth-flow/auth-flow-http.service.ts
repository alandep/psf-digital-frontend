import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { IAuthFlowService } from './auth-flow.interface';
import { AuthChallenge, AuthOrganization, AuthState, MfaMethod } from '../../../types/auth-flow';
import { environment } from '../../../environments/environment';

// Shape returned by AuthBffController. 'authenticationState' matches AuthState.
interface AuthBffResponse {
  authenticationState: AuthState;
  challengeId?: string;
  userName?: string;
  cpfMasked?: string;
  organizations?: AuthOrganization[];
  message?: string;
  mfaMethods?: MfaMethod[];
  emailMasked?: string;
  resendAvailableInSeconds?: number;
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
      challengeId: res.challengeId ?? this.lastChallenge?.challengeId,
      message: res.message,
      // Keep MFA metadata across steps (e.g. resend/verify answers may omit it).
      mfaMethods: res.mfaMethods ?? this.lastChallenge?.mfaMethods,
      emailMasked: res.emailMasked ?? this.lastChallenge?.emailMasked,
      resendAvailableInSeconds: res.resendAvailableInSeconds
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

  verifyMfa(code: string, method?: MfaMethod): Observable<AuthChallenge> {
    return this.http
      .post<AuthBffResponse>(`${this.base}/mfa/verify`, {
        challengeId: this.currentChallengeId(),
        code,
        ...(method ? { method } : {})
      })
      .pipe(map((res) => this.toChallenge(res)));
  }

  sendEmailCode(): Observable<AuthChallenge> {
    return this.http
      .post<AuthBffResponse>(`${this.base}/mfa/email/send`, { challengeId: this.currentChallengeId() })
      .pipe(map((res) => this.toChallenge(res)));
  }

  // Recovery codes go through the same verify endpoint with method RECOVERY.
  verifyRecoveryCode(code: string): Observable<AuthChallenge> {
    return this.verifyMfa(code, 'RECOVERY');
  }

  selectOrganization(orgId: string): Observable<AuthChallenge> {
    return this.http
      .post<AuthBffResponse>(`${this.base}/select-organization`, {
        challengeId: this.currentChallengeId(),
        organizationId: orgId
      })
      .pipe(map((res) => this.toChallenge(res)));
  }

  // Anti-enumeration: the backend always answers 200 with a neutral message;
  // in dev it also returns the activation link (no email delivery yet).
  requestPasswordReset(identifier: string): Observable<{ message?: string; activationLink?: string }> {
    return this.http
      .post<{ message?: string; activationLink?: string }>(`${this.base}/password/forgot`, { identifier })
      .pipe(catchError(() => of({})));
  }

  // Redeems the token and sets the new password. Errors propagate so the UI can
  // show invalid/expired/used token messages.
  resetPassword(token: string, newPassword: string): Observable<{ ok?: boolean; message?: string }> {
    return this.http.post<{ ok?: boolean; message?: string }>(`${this.base}/password/reset`, { token, newPassword });
  }
}
