import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { SecurityMockService } from '../../../../services/securityMockService';

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
  private security = inject(SecurityMockService);
  private snackBar = inject(MatSnackBar);
  private destroy$ = new Subject<void>();

  step = 1;
  secret = '';
  otpauthUri = '';
  code = '';
  errorMessage = '';
  submitting = false;
  recoveryCodes: string[] = [];

  ngOnInit(): void {
    this.security.startMfaEnrollment().pipe(takeUntil(this.destroy$)).subscribe((res) => {
      this.secret = res.secret;
      this.otpauthUri = res.otpauthUri;
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

  copySecret(): void {
    this.snackBar.open('Chave copiada (mock)', 'OK', { duration: 3000 });
  }

  copyRecoveryCodes(): void {
    this.snackBar.open('Códigos copiados (mock)', 'OK', { duration: 3000 });
  }

  confirm(): void {
    this.errorMessage = '';
    this.submitting = true;
    this.security.confirmMfaEnrollment(this.code).pipe(takeUntil(this.destroy$)).subscribe((res) => {
      this.submitting = false;
      if (res.ok) {
        this.recoveryCodes = res.recoveryCodes ?? [];
        this.step = 3;
      } else {
        this.errorMessage = 'Código inválido. Tente novamente.';
      }
    });
  }
}
