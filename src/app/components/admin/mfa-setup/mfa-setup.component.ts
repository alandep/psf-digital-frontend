import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { toDataURL } from 'qrcode';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { SECURITY_SERVICE } from '../../../services/security/security.token';

interface HttpLikeError {
  error?: { message?: string };
}

@Component({
  selector: 'app-mfa-setup',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    MatSnackBarModule,
  ],
  templateUrl: './mfa-setup.component.html',
  styleUrls: ['./mfa-setup.component.scss'],
})
export class MfaSetupComponent implements OnInit, OnDestroy {
  private security = inject(SECURITY_SERVICE);
  private snackBar = inject(MatSnackBar);
  private destroy$ = new Subject<void>();

  step = 1;
  secret = '';
  otpauthUri = '';
  qrDataUrl = '';
  qrError = false;
  code = '';
  errorMessage = '';
  enrollmentError = '';
  submitting = false;
  recoveryCodes: string[] = [];

  get secretGrouped(): string {
    return this.secret.replace(/\s+/g, '').replace(/(.{4})/g, '$1 ').trim();
  }

  ngOnInit(): void {
    this.security.startMfaEnrollment().pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        this.secret = res.secret;
        this.otpauthUri = res.otpauthUri;
        toDataURL(res.otpauthUri, { width: 220, margin: 1, errorCorrectionLevel: 'M' })
          .then((url) => (this.qrDataUrl = url))
          .catch(() => (this.qrError = true));
      },
      error: (err: HttpLikeError) => {
        this.enrollmentError =
          err?.error?.message || 'Não foi possível iniciar a configuração do autenticador.';
      },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  goToVerify(): void {
    this.errorMessage = '';
    this.step = 2;
  }

  onCodeInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '').slice(0, 6);
    input.value = digits;
    this.code = digits;
  }

  private copyText(text: string, successMessage: string): void {
    navigator.clipboard
      .writeText(text)
      .then(() => this.snackBar.open(successMessage, 'OK', { duration: 3000 }))
      .catch(() =>
        this.snackBar.open('Não foi possível copiar. Selecione e copie manualmente.', 'OK', { duration: 5000 })
      );
  }

  copySecret(): void {
    this.copyText(this.secret, 'Chave copiada.');
  }

  copyRecoveryCodes(): void {
    this.copyText(this.recoveryCodes.join('\n'), 'Códigos copiados.');
  }

  downloadRecoveryCodes(): void {
    const content = ['Códigos de recuperação EIP - guarde em local seguro', ...this.recoveryCodes].join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'eip-codigos-recuperacao.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  confirm(): void {
    this.errorMessage = '';
    if (this.code.length !== 6) {
      this.errorMessage = 'Informe os 6 dígitos do aplicativo.';
      return;
    }
    this.submitting = true;
    this.security.confirmMfaEnrollment(this.code).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        this.submitting = false;
        if (res.ok) {
          this.recoveryCodes = res.recoveryCodes ?? [];
          this.step = 3;
        } else {
          this.errorMessage = res.message ?? 'Código inválido. Tente novamente.';
        }
      },
      error: (err: HttpLikeError) => {
        this.submitting = false;
        this.errorMessage = err?.error?.message || 'Não foi possível confirmar o código. Tente novamente.';
      },
    });
  }
}
