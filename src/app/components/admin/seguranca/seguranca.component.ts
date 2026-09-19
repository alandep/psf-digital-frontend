import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { SecurityMockService } from '../../../../services/securityMockService';
import { ActiveSession, SecurityEvent, SecurityOverview } from '../../../../types/security';

@Component({
  selector: 'app-seguranca',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatListModule,
    MatDividerModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatTooltipModule,
  ],
  templateUrl: './seguranca.component.html',
  styleUrls: ['./seguranca.component.scss'],
})
export class SegurancaComponent implements OnInit, OnDestroy {
  private security = inject(SecurityMockService);
  private snackBar = inject(MatSnackBar);
  private destroy$ = new Subject<void>();

  isLoading = false;
  overview: SecurityOverview | null = null;
  sessions: ActiveSession[] = [];
  events: SecurityEvent[] = [];

  recoveryCodes: string[] = [];
  showRecoveryCodes = false;

  ngOnInit(): void {
    this.loadAll();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackById(_index: number, item: { id: string }): string {
    return item.id;
  }

  private loadAll(): void {
    this.isLoading = true;
    this.security.getOverview().pipe(takeUntil(this.destroy$)).subscribe((o) => {
      this.overview = o;
      this.isLoading = false;
    });
    this.loadSessions();
    this.security.getSecurityEvents().pipe(takeUntil(this.destroy$)).subscribe((e) => {
      this.events = e;
    });
  }

  private loadSessions(): void {
    this.security.getSessions().pipe(takeUntil(this.destroy$)).subscribe((s) => {
      this.sessions = s;
    });
  }

  changePassword(): void {
    this.snackBar.open('Enviamos instruções para alterar sua senha (mock)', 'OK', { duration: 4000 });
  }

  generateRecoveryCodes(): void {
    this.security.regenerateRecoveryCodes().pipe(takeUntil(this.destroy$)).subscribe((codes) => {
      this.recoveryCodes = codes;
      this.showRecoveryCodes = true;
      if (this.overview) {
        this.overview = { ...this.overview, recoveryCodesRemaining: codes.length };
      }
    });
  }

  copyRecoveryCodes(): void {
    this.snackBar.open('Códigos copiados (mock)', 'OK', { duration: 3000 });
  }

  revokeSession(session: ActiveSession): void {
    if (session.current) {
      return;
    }
    this.security.revokeSession(session.id).pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.loadSessions();
      this.snackBar.open('Sessão encerrada', 'OK', { duration: 3000 });
    });
  }

  revokeOtherSessions(): void {
    this.security.revokeOtherSessions().pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.loadSessions();
      this.snackBar.open('Todas as outras sessões foram encerradas', 'OK', { duration: 3000 });
    });
  }
}
