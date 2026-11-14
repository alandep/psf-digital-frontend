import { Observable } from 'rxjs';
import { ActiveSession, SecurityEvent, SecurityOverview } from '../../../types/security';

// Gateway contract for the authenticated self-service security screens.
export interface ISecurityService {
  getOverview(): Observable<SecurityOverview>;
  getSessions(): Observable<ActiveSession[]>;
  revokeSession(id: string): Observable<void>;
  revokeOtherSessions(): Observable<void>;
  getSecurityEvents(): Observable<SecurityEvent[]>;
  regenerateRecoveryCodes(): Observable<string[]>;
  startMfaEnrollment(): Observable<{ secret: string; otpauthUri: string }>;
  confirmMfaEnrollment(code: string): Observable<{ ok: boolean; recoveryCodes?: string[]; message?: string }>;
  disableMfa(code: string): Observable<void>;
  changePassword(currentPassword: string, newPassword: string): Observable<{ ok: boolean; message?: string }>;
}
