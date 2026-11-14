import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { SECURITY_SERVICE } from '../../../services/security/security.token';
import { ActiveSession, SecurityEvent, SecurityOverview } from '../../../../types/security';
import { AlterarSenhaDialogComponent } from './alterar-senha-dialog/alterar-senha-dialog.component';

interface HttpLikeError {
  error?: { message?: string };
}

@Component({
  selector: 'app-seguranca',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './seguranca.component.html',
  styleUrls: ['./seguranca.component.scss'],
})
export class SegurancaComponent implements OnInit, OnDestroy {
  private security = inject(SECURITY_SERVICE);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private destroy$ = new Subject<void>();

  isLoading = false;
  overview: SecurityOverview | null = null;
  sessions: ActiveSession[] = [];
  events: SecurityEvent[] = [];

  recoveryCodes: string[] = [];
  showRecoveryCodes = false;

  showDisableForm = false;
  disableCode = '';
  disabling = false;
  disableError = '';

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

  private notifyError(err: HttpLikeError, fallback: string): void {
    this.isLoading = false;
    this.snackBar.open(err?.error?.message || fallback, 'OK', { duration: 5000 });
  }

  private loadAll(): void {
    this.loadOverview();
    this.loadSessions();
    this.security.getSecurityEvents().pipe(takeUntil(this.destroy$)).subscribe({
      next: (e) => {
        this.events = e;
      },
      error: (err: HttpLikeError) => this.notifyError(err, 'Não foi possível carregar o histórico de segurança.'),
    });
  }

  private loadOverview(): void {
    this.isLoading = true;
    this.security.getOverview().pipe(takeUntil(this.destroy$)).subscribe({
      next: (o) => {
        this.overview = o;
        this.isLoading = false;
      },
      error: (err: HttpLikeError) => this.notifyError(err, 'Não foi possível carregar as informações de segurança.'),
    });
  }

  private loadSessions(): void {
    this.security.getSessions().pipe(takeUntil(this.destroy$)).subscribe({
      next: (s) => {
        this.sessions = s;
      },
      error: (err: HttpLikeError) => this.notifyError(err, 'Não foi possível carregar as sessões.'),
    });
  }

  changePassword(): void {
    this.dialog
      .open<AlterarSenhaDialogComponent, void, boolean>(AlterarSenhaDialogComponent, {
        width: '440px',
        maxWidth: '92vw',
      })
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((changed) => {
        if (changed) {
          this.snackBar.open('Senha alterada com sucesso.', 'OK', { duration: 4000 });
          this.loadOverview();
        }
      });
  }

  generateRecoveryCodes(): void {
    this.security.regenerateRecoveryCodes().pipe(takeUntil(this.destroy$)).subscribe({
      next: (codes) => {
        this.recoveryCodes = codes;
        this.showRecoveryCodes = true;
        if (this.overview) {
          this.overview = { ...this.overview, recoveryCodesRemaining: codes.length };
        }
      },
      error: (err: HttpLikeError) => this.notifyError(err, 'Não foi possível gerar novos códigos.'),
    });
  }

  copyRecoveryCodes(): void {
    navigator.clipboard
      .writeText(this.recoveryCodes.join('\n'))
      .then(() => this.snackBar.open('Códigos copiados.', 'OK', { duration: 3000 }))
      .catch(() =>
        this.snackBar.open('Não foi possível copiar. Selecione e copie manualmente.', 'OK', { duration: 5000 })
      );
  }

  toggleDisableForm(): void {
    this.showDisableForm = !this.showDisableForm;
    this.disableCode = '';
    this.disableError = '';
  }

  confirmDisableMfa(): void {
    const code = this.disableCode.trim();
    if (!code || this.disabling) {
      return;
    }
    this.disabling = true;
    this.disableError = '';
    this.security.disableMfa(code).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.disabling = false;
        this.showDisableForm = false;
        this.disableCode = '';
        this.showRecoveryCodes = false;
        this.recoveryCodes = [];
        this.loadOverview();
        this.snackBar.open('Aplicativo autenticador desativado.', 'OK', { duration: 4000 });
      },
      error: (err: HttpLikeError) => {
        this.disabling = false;
        this.disableError = err?.error?.message || 'Não foi possível desativar o autenticador.';
      },
    });
  }

  revokeSession(session: ActiveSession): void {
    if (session.current) {
      return;
    }
    this.security.revokeSession(session.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.loadSessions();
        this.snackBar.open('Sessão encerrada', 'OK', { duration: 3000 });
      },
      error: (err: HttpLikeError) => this.notifyError(err, 'Não foi possível encerrar a sessão.'),
    });
  }

  revokeOtherSessions(): void {
    this.security.revokeOtherSessions().pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.loadSessions();
        this.snackBar.open('Todas as outras sessões foram encerradas', 'OK', { duration: 3000 });
      },
      error: (err: HttpLikeError) => this.notifyError(err, 'Não foi possível encerrar as outras sessões.'),
    });
  }
}
