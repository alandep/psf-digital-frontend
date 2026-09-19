// MOCK security service. In-memory, dependency-free (only @angular/core + rxjs).
// Backs the Segurança (§74), MFA enrollment (§40) and sessions (§73) screens.
// State is mutable so actions (revoke, regenerate, enroll) persist within the
// session. Replace method bodies with HTTP calls to wire a real backend later.

import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import {
  ActiveSession,
  SecurityEvent,
  SecurityOverview,
} from '../types/security';

const LATENCY = 400;

@Injectable({ providedIn: 'root' })
export class SecurityMockService {
  private overview: SecurityOverview = {
    passwordChangedAt: this.daysAgo(90),
    mfaStatus: 'ENABLED',
    authenticatorConfigured: true,
    recoveryCodesRemaining: 6,
  };

  private sessions: ActiveSession[] = [
    { id: 'sess-1', device: 'Chrome', os: 'Windows', location: 'Uberlândia, Brasil', current: true, lastSeen: 'Agora' },
    { id: 'sess-2', device: 'iPhone', os: 'iOS', location: 'Brasil', current: false, lastSeen: 'Há 2 horas' },
    { id: 'sess-3', device: 'Edge', os: 'Windows', location: 'São Paulo, Brasil', current: false, lastSeen: 'Ontem' },
  ];

  private daysAgo(days: number): Date {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d;
  }

  private hoursAgo(hours: number): Date {
    const d = new Date();
    d.setHours(d.getHours() - hours);
    return d;
  }

  getOverview(): Observable<SecurityOverview> {
    return of({ ...this.overview }).pipe(delay(LATENCY));
  }

  getSessions(): Observable<ActiveSession[]> {
    return of(this.sessions.map((s) => ({ ...s }))).pipe(delay(LATENCY));
  }

  revokeSession(id: string): Observable<void> {
    this.sessions = this.sessions.filter((s) => s.id !== id || s.current);
    return of(void 0).pipe(delay(LATENCY));
  }

  revokeOtherSessions(): Observable<void> {
    this.sessions = this.sessions.filter((s) => s.current);
    return of(void 0).pipe(delay(LATENCY));
  }

  getSecurityEvents(): Observable<SecurityEvent[]> {
    const events: SecurityEvent[] = [
      { id: 'ev-1', type: 'LOGIN_SUCCEEDED', label: 'Login realizado', ip: '187.45.12.90', occurredAt: this.hoursAgo(1) },
      { id: 'ev-2', type: 'MFA_SUCCEEDED', label: 'MFA verificado', ip: '187.45.12.90', occurredAt: this.hoursAgo(1) },
      { id: 'ev-3', type: 'ORGANIZATION_SWITCHED', label: 'Empresa alternada', ip: '187.45.12.90', occurredAt: this.hoursAgo(26) },
      { id: 'ev-4', type: 'LOGIN_FAILED', label: 'Tentativa de login falhou', ip: '201.33.90.14', occurredAt: this.daysAgo(2) },
      { id: 'ev-5', type: 'PASSWORD_RESET_REQUESTED', label: 'Recuperação de senha solicitada', ip: '187.45.12.90', occurredAt: this.daysAgo(4) },
      { id: 'ev-6', type: 'RECOVERY_CODE_USED', label: 'Código de recuperação usado', ip: '189.12.44.7', occurredAt: this.daysAgo(6) },
    ];
    events.sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());
    return of(events).pipe(delay(LATENCY));
  }

  private buildCodes(): string[] {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const codes: string[] = [];
    for (let i = 0; i < 8; i++) {
      let block = '';
      for (let j = 0; j < 8; j++) {
        if (j === 4) block += '-';
        block += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      codes.push(block);
    }
    return codes;
  }

  regenerateRecoveryCodes(): Observable<string[]> {
    const codes = this.buildCodes();
    this.overview.recoveryCodesRemaining = 8;
    return of(codes).pipe(delay(LATENCY));
  }

  startMfaEnrollment(): Observable<{ secret: string; otpauthUri: string }> {
    const secret = 'JBSWY3DPEHPK3PXP';
    return of({
      secret,
      otpauthUri: `otpauth://totp/EIP:alan@empresa?secret=${secret}&issuer=EIP`,
    }).pipe(delay(LATENCY));
  }

  confirmMfaEnrollment(code: string): Observable<{ ok: boolean; recoveryCodes?: string[] }> {
    const digits = (code || '').replace(/\D/g, '');
    if (digits.length === 6) {
      const recoveryCodes = this.buildCodes();
      this.overview.mfaStatus = 'ENABLED';
      this.overview.authenticatorConfigured = true;
      this.overview.recoveryCodesRemaining = 8;
      return of({ ok: true, recoveryCodes }).pipe(delay(LATENCY));
    }
    return of({ ok: false }).pipe(delay(LATENCY));
  }
}
