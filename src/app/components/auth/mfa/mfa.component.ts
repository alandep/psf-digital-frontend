import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription, timer } from 'rxjs';
import { take } from 'rxjs/operators';
import { AUTH_FLOW_SERVICE } from '../../../services/auth-flow/auth-flow.token';
import { AuthProfileService } from '../../../../services/authProfileService';
import { AuthChallenge, MfaMethod } from '../../../../types/auth-flow';
import { environment } from '../../../../environments/environment';

const DEFAULT_RESEND_SECONDS = 60;

@Component({
  selector: 'app-mfa',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './mfa.component.html',
  styleUrls: ['./mfa.component.scss']
})
export class MfaComponent implements OnInit {
  private router = inject(Router);
  private authFlow = inject(AUTH_FLOW_SERVICE);
  private authProfileService = inject(AuthProfileService);
  private destroyRef = inject(DestroyRef);
  private countdownSub?: Subscription;
  private emailSent = false;

  isLoading = false;
  isSending = false;
  errorMessage = '';
  infoMessage = '';

  methods: MfaMethod[] = ['TOTP'];
  mode: MfaMethod = 'TOTP';
  emailMasked = '';
  resendIn = 0;

  readonly methodLabels: Record<MfaMethod, string> = {
    TOTP: 'Aplicativo autenticador',
    EMAIL: 'Código por e-mail',
    RECOVERY: 'Código de recuperação'
  };

  codeForm = new FormGroup({
    code: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(6)])
  });

  recoveryForm = new FormGroup({
    recoveryCode: new FormControl('', [Validators.required])
  });

  ngOnInit(): void {
    const challenge = this.authFlow.lastChallenge;
    if (environment.realApis?.auth && (!challenge || !challenge.challengeId)) {
      this.router.navigate(['/login']);
      return;
    }
    this.methods = challenge?.mfaMethods?.length ? challenge.mfaMethods : ['TOTP'];
    this.mode = this.methods[0];
    this.emailMasked = challenge?.emailMasked ?? '';
    if (this.mode === 'EMAIL') {
      // The server already sent the e-mail code when e-mail is the only/first method.
      this.emailSent = true;
      this.startCountdown(challenge?.resendAvailableInSeconds ?? DEFAULT_RESEND_SECONDS);
    }
  }

  get subtitle(): string {
    switch (this.mode) {
      case 'EMAIL':
        return this.emailMasked
          ? `Enviamos um código de 6 dígitos para ${this.emailMasked}. Ele vale por 10 minutos.`
          : 'Enviamos um código de 6 dígitos para o seu e-mail. Ele vale por 10 minutos.';
      case 'RECOVERY':
        return 'Informe um dos seus códigos de recuperação (formato XXXX-XXXX).';
      default:
        return 'Abra seu aplicativo autenticador e informe o código de 6 dígitos.';
    }
  }

  get canResend(): boolean {
    return this.resendIn <= 0 && !this.isSending && !this.isLoading;
  }

  selectMode(method: MfaMethod): void {
    if (method === this.mode) {
      return;
    }
    this.mode = method;
    this.errorMessage = '';
    this.infoMessage = '';
    this.codeForm.reset({ code: '' });
    this.recoveryForm.reset({ recoveryCode: '' });
    if (method === 'EMAIL' && !this.emailSent) {
      this.sendEmail();
    }
  }

  onCodeInput(): void {
    const control = this.codeForm.controls.code;
    const digits = (control.value ?? '').replace(/\D/g, '').slice(0, 6);
    if (digits !== control.value) {
      control.setValue(digits);
    }
  }

  sendEmail(): void {
    if (this.isSending) {
      return;
    }
    this.errorMessage = '';
    this.infoMessage = '';
    this.isSending = true;
    this.authFlow.sendEmailCode().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (challenge) => {
        this.isSending = false;
        this.emailSent = true;
        this.emailMasked = challenge.emailMasked ?? this.emailMasked;
        this.infoMessage = challenge.message ?? 'Código enviado para o seu e-mail.';
        this.startCountdown(challenge.resendAvailableInSeconds ?? DEFAULT_RESEND_SECONDS);
        this.handleTerminalState(challenge);
      },
      error: (err: { error?: { message?: string } }) => {
        this.isSending = false;
        this.errorMessage = err?.error?.message ?? 'Não foi possível enviar o código por e-mail.';
      }
    });
  }

  onVerify(): void {
    if (this.codeForm.invalid || this.isLoading) {
      this.codeForm.markAllAsTouched();
      return;
    }
    this.submit(this.codeForm.value.code ?? '', this.mode, 'Código inválido. Tente novamente.');
  }

  onVerifyRecovery(): void {
    if (this.recoveryForm.invalid || this.isLoading) {
      this.recoveryForm.markAllAsTouched();
      return;
    }
    const code = (this.recoveryForm.value.recoveryCode ?? '').trim().toUpperCase();
    this.submit(code, 'RECOVERY', 'Código de recuperação inválido.');
  }

  private submit(code: string, method: MfaMethod, fallbackError: string): void {
    this.errorMessage = '';
    this.infoMessage = '';
    this.isLoading = true;
    this.authFlow.verifyMfa(code, method).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (challenge) => {
        this.isLoading = false;
        if (this.handleTerminalState(challenge)) {
          return;
        }
        this.errorMessage = challenge.message ?? fallbackError;
        this.codeForm.reset({ code: '' });
        this.recoveryForm.reset({ recoveryCode: '' });
      },
      error: (err: { error?: { message?: string } }) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message ?? 'Não foi possível verificar o código.';
      }
    });
  }

  // Returns true when the challenge led to navigation (flow left this screen).
  private handleTerminalState(challenge: AuthChallenge): boolean {
    switch (challenge.state) {
      case 'AUTHENTICATED':
        this.enterApp();
        return true;
      case 'ORGANIZATION_SELECTION_REQUIRED':
        this.router.navigate(['/select-company']);
        return true;
      case 'IDENTIFICATION_REQUIRED': {
        const authMessage = challenge.message;
        this.authFlow.reset();
        this.router.navigate(['/login'], { state: { authMessage } });
        return true;
      }
      default:
        return false;
    }
  }

  private startCountdown(seconds: number): void {
    this.countdownSub?.unsubscribe();
    this.resendIn = seconds;
    if (seconds <= 0) {
      return;
    }
    this.countdownSub = timer(1000, 1000)
      .pipe(take(seconds), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.resendIn = Math.max(0, this.resendIn - 1);
      });
  }

  // Reuse the select-company pattern: load the access profile, then navigate.
  private enterApp(): void {
    this.authProfileService.loadProfile().subscribe({
      next: () => this.router.navigate(['/home-logged']),
      error: () => this.router.navigate(['/home-logged'])
    });
  }
}
