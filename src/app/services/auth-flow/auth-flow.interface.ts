import { Observable } from 'rxjs';
import { AuthChallenge, AuthOrganization } from '../../../types/auth-flow';

// Gateway contract for the stepped identity flow. Mirrors the methods and
// state fields the auth components read on the existing mock service, so the
// components can depend on the token instead of the concrete mock.
export interface IAuthFlowService {
  // Flow-continuity state read by /mfa and /select-company after navigation.
  lastCpf: string | null;
  lastChallenge: AuthChallenge | null;
  readonly defaultOrganizations: AuthOrganization[];

  setLastCpf(cpf: string): void;
  setLastChallenge(challenge: AuthChallenge): void;
  reset(): void;

  // Flow steps.
  identify(cpf: string): Observable<AuthChallenge>;
  verifyPassword(cpf: string, password: string): Observable<AuthChallenge>;
  verifyMfa(code: string): Observable<AuthChallenge>;
  verifyRecoveryCode(code: string): Observable<AuthChallenge>;
  selectOrganization(orgId: string): Observable<AuthChallenge>;

  // Password recovery.
  requestPasswordReset(identifier: string): Observable<void>;
  resetPassword(token: string, newPassword: string): Observable<void>;
}
