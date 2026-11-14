import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { ISecurityService } from './security.interface';
import { environment } from '../../../environments/environment';
import { ActiveSession, MfaStatus, SecurityEvent, SecurityOverview } from '../../../types/security';

interface OverviewDto {
  passwordChangedAt: string | null;
  mfaStatus: MfaStatus;
  authenticatorConfigured: boolean;
  recoveryCodesRemaining: number;
  emailMfa: boolean;
  emailMasked: string;
}

interface SessionDto {
  id: string;
  device: string;
  os: string;
  ip: string;
  current: boolean;
  lastSeen: string;
  createdAt: string;
}

interface EventDto {
  id: string;
  type: string;
  label: string;
  ip: string;
  occurredAt: string;
}

interface ErrorBody {
  code?: string;
  message?: string;
}

/** Real HTTP gateway for the authenticated self-service security screens. */
@Injectable({ providedIn: 'root' })
export class SecurityHttpService implements ISecurityService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.bffBaseUrl}/bff/seguranca`;

  getOverview(): Observable<SecurityOverview> {
    return this.http.get<OverviewDto>(`${this.api}/overview`).pipe(
      map(d => ({
        passwordChangedAt: d.passwordChangedAt ? new Date(d.passwordChangedAt) : null,
        mfaStatus: d.mfaStatus,
        authenticatorConfigured: d.authenticatorConfigured,
        recoveryCodesRemaining: d.recoveryCodesRemaining,
        emailMfa: d.emailMfa,
        emailMasked: d.emailMasked
      }))
    );
  }

  getSessions(): Observable<ActiveSession[]> {
    return this.http.get<SessionDto[]>(`${this.api}/sessions`).pipe(
      map(list => (list ?? []).map(s => ({
        id: s.id,
        device: s.device,
        os: s.os,
        location: s.ip || 'IP desconhecido',
        current: s.current,
        lastSeen: this.relativeTime(s.lastSeen)
      })))
    );
  }

  revokeSession(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/sessions/${encodeURIComponent(id)}`);
  }

  revokeOtherSessions(): Observable<void> {
    return this.http.post<{ revoked: number }>(`${this.api}/sessions/revoke-others`, {}).pipe(map(() => void 0));
  }

  getSecurityEvents(): Observable<SecurityEvent[]> {
    return this.http.get<EventDto[]>(`${this.api}/events`).pipe(
      map(list => (list ?? []).map(e => ({
        id: e.id,
        type: e.type,
        label: e.label,
        ip: e.ip,
        occurredAt: new Date(e.occurredAt)
      })))
    );
  }

  regenerateRecoveryCodes(): Observable<string[]> {
    return this.http.post<{ recoveryCodes: string[] }>(`${this.api}/mfa/recovery-codes`, {}).pipe(
      map(r => r.recoveryCodes ?? [])
    );
  }

  startMfaEnrollment(): Observable<{ secret: string; otpauthUri: string }> {
    return this.http.post<{ secret: string; otpauthUri: string }>(`${this.api}/mfa/totp/enroll`, {});
  }

  confirmMfaEnrollment(code: string): Observable<{ ok: boolean; recoveryCodes?: string[]; message?: string }> {
    return this.http
      .post<{ ok: boolean; recoveryCodes?: string[] }>(`${this.api}/mfa/totp/confirm`, { code })
      .pipe(catchError(err => this.mapValidationError(err)));
  }

  disableMfa(code: string): Observable<void> {
    return this.http.post<{ ok: boolean }>(`${this.api}/mfa/totp/disable`, { code }).pipe(map(() => void 0));
  }

  changePassword(currentPassword: string, newPassword: string): Observable<{ ok: boolean; message?: string }> {
    return this.http
      .post<{ ok: boolean; message?: string }>(`${this.api}/password`, { currentPassword, newPassword })
      .pipe(catchError(err => this.mapValidationError(err)));
  }

  private mapValidationError(err: unknown): Observable<{ ok: boolean; message?: string }> {
    if (err instanceof HttpErrorResponse && (err.status === 422 || err.status === 400)) {
      const body = err.error as ErrorBody | null;
      return of({ ok: false, message: body?.message });
    }
    return throwError(() => err);
  }

  private relativeTime(iso: string): string {
    const date = new Date(iso);
    if (isNaN(date.getTime())) return '';
    const now = new Date();
    const diffMin = Math.floor((now.getTime() - date.getTime()) / 60000);
    if (diffMin < 1) return 'Agora';
    if (diffMin < 60) return `Há ${diffMin} min`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `Há ${diffH} h`;
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    if (
      date.getFullYear() === yesterday.getFullYear() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getDate() === yesterday.getDate()
    ) {
      return 'Ontem';
    }
    return this.formatDateTime(date);
  }

  private formatDateTime(d: Date): string {
    const p = (n: number): string => String(n).padStart(2, '0');
    return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
  }
}
