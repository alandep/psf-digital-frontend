import { Component, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, takeUntil } from 'rxjs';

import { SECURITY_SERVICE } from '../../../../services/security/security.token';

type PasswordField = 'current' | 'next' | 'confirm';

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const next = group.get('newPassword')?.value as string | null;
  const confirm = group.get('confirmPassword')?.value as string | null;
  return next === confirm ? null : { mismatch: true };
}

@Component({
  selector: 'app-alterar-senha-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <h2 mat-dialog-title>Alterar senha</h2>
    <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
      <mat-dialog-content>
        <mat-form-field appearance="outline" class="full">
          <mat-label>Senha atual</mat-label>
          <input matInput [type]="visible.current ? 'text' : 'password'" formControlName="currentPassword"
                 autocomplete="current-password" required />
          <button mat-icon-button matSuffix type="button" (click)="toggle('current')"
                  [attr.aria-label]="visible.current ? 'Ocultar senha' : 'Mostrar senha'">
            <mat-icon>{{ visible.current ? 'visibility_off' : 'visibility' }}</mat-icon>
          </button>
          <mat-error>Informe a senha atual.</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full">
          <mat-label>Nova senha</mat-label>
          <input matInput [type]="visible.next ? 'text' : 'password'" formControlName="newPassword"
                 autocomplete="new-password" required />
          <button mat-icon-button matSuffix type="button" (click)="toggle('next')"
                  [attr.aria-label]="visible.next ? 'Ocultar senha' : 'Mostrar senha'">
            <mat-icon>{{ visible.next ? 'visibility_off' : 'visibility' }}</mat-icon>
          </button>
          <mat-hint>Mínimo de 8 caracteres, com letras e números.</mat-hint>
          <mat-error *ngIf="form.controls.newPassword.hasError('required')">Informe a nova senha.</mat-error>
          <mat-error *ngIf="form.controls.newPassword.hasError('minlength')">Use no mínimo 8 caracteres.</mat-error>
          <mat-error *ngIf="form.controls.newPassword.hasError('pattern') && !form.controls.newPassword.hasError('minlength')">
            A senha deve conter ao menos uma letra e um número.
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full">
          <mat-label>Confirmar nova senha</mat-label>
          <input matInput [type]="visible.confirm ? 'text' : 'password'" formControlName="confirmPassword"
                 autocomplete="new-password" required />
          <button mat-icon-button matSuffix type="button" (click)="toggle('confirm')"
                  [attr.aria-label]="visible.confirm ? 'Ocultar senha' : 'Mostrar senha'">
            <mat-icon>{{ visible.confirm ? 'visibility_off' : 'visibility' }}</mat-icon>
          </button>
          <mat-error *ngIf="form.controls.confirmPassword.hasError('required')">Confirme a nova senha.</mat-error>
        </mat-form-field>
        <p class="field-error" *ngIf="form.hasError('mismatch') && form.controls.confirmPassword.dirty">
          As senhas não coincidem.
        </p>

        <p class="server-error" role="alert" *ngIf="errorMessage">{{ errorMessage }}</p>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button type="button" (click)="cancel()" [disabled]="submitting">Cancelar</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || submitting">
          <mat-spinner *ngIf="submitting" diameter="18" class="btn-spinner"></mat-spinner>
          <span *ngIf="!submitting">Alterar senha</span>
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [`
    .full { width: 100%; }
    .field-error, .server-error { color: #c62828; font-size: 13px; margin: 0 0 8px; }
    .server-error { background: #ffebee; border-radius: 6px; padding: 8px 12px; }
    .btn-spinner { display: inline-block; }
  `]
})
export class AlterarSenhaDialogComponent implements OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly security = inject(SECURITY_SERVICE);
  private readonly dialogRef = inject(MatDialogRef<AlterarSenhaDialogComponent, boolean>);
  private readonly destroy$ = new Subject<void>();

  submitting = false;
  errorMessage = '';
  visible: Record<PasswordField, boolean> = { current: false, next: false, confirm: false };

  readonly form = this.fb.nonNullable.group(
    {
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d).+$/)]],
      confirmPassword: ['', [Validators.required]]
    },
    { validators: passwordsMatch }
  );

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggle(field: PasswordField): void {
    this.visible[field] = !this.visible[field];
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  submit(): void {
    if (this.form.invalid || this.submitting) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting = true;
    this.errorMessage = '';
    const { currentPassword, newPassword } = this.form.getRawValue();
    this.security
      .changePassword(currentPassword, newPassword)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.submitting = false;
          if (res.ok) {
            this.dialogRef.close(true);
          } else {
            this.errorMessage = res.message || 'Não foi possível alterar a senha.';
          }
        },
        error: (err: { error?: { message?: string } }) => {
          this.submitting = false;
          this.errorMessage = err?.error?.message || 'Não foi possível alterar a senha. Tente novamente.';
        }
      });
  }
}
