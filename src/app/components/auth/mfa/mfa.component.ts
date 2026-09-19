import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthFlowMockService } from '../../../../services/authFlowMockService';

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
export class MfaComponent {
  private router = inject(Router);
  private authFlow = inject(AuthFlowMockService);

  isLoading = false;
  errorMessage = '';
  useRecovery = false;

  codeForm = new FormGroup({
    code: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(6)])
  });

  recoveryForm = new FormGroup({
    recoveryCode: new FormControl('', [Validators.required])
  });

  toggleRecovery(): void {
    this.useRecovery = !this.useRecovery;
    this.errorMessage = '';
  }

  onVerify(): void {
    if (this.codeForm.invalid || this.isLoading) {
      this.codeForm.markAllAsTouched();
      return;
    }
    this.errorMessage = '';
    this.isLoading = true;
    const code = this.codeForm.value.code ?? '';
    this.authFlow.verifyMfa(code).subscribe({
      next: (challenge) => {
        this.isLoading = false;
        if (challenge.state === 'ORGANIZATION_SELECTION_REQUIRED') {
          this.router.navigate(['/select-company']);
        } else {
          this.errorMessage = challenge.message ?? 'Código inválido. Tente novamente.';
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Não foi possível verificar o código.';
      }
    });
  }

  onVerifyRecovery(): void {
    if (this.recoveryForm.invalid || this.isLoading) {
      this.recoveryForm.markAllAsTouched();
      return;
    }
    this.errorMessage = '';
    this.isLoading = true;
    const code = this.recoveryForm.value.recoveryCode ?? '';
    this.authFlow.verifyRecoveryCode(code).subscribe({
      next: (challenge) => {
        this.isLoading = false;
        if (challenge.state === 'ORGANIZATION_SELECTION_REQUIRED') {
          this.router.navigate(['/select-company']);
        } else {
          this.errorMessage = challenge.message ?? 'Código de recuperação inválido.';
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Não foi possível verificar o código.';
      }
    });
  }
}
