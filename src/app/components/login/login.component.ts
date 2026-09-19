import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthProfileService } from '../../../services/authProfileService';
import { AUTH_FLOW_SERVICE } from '../../services/auth-flow/auth-flow.token';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  private router = inject(Router);
  private authProfileService = inject(AuthProfileService);
  private authFlow = inject(AUTH_FLOW_SERVICE);

  // Sub-step within the identity flow managed by this component.
  step: 'cpf' | 'password' = 'cpf';

  hidePassword = true;
  isLoading = false;
  errorMessage = '';

  // Bound after identification; shown on the password step.
  userName = '';
  cpfMasked = '';

  cpfForm = new FormGroup({
    cpf: new FormControl('', [Validators.required, Validators.minLength(11)])
  });

  passwordForm = new FormGroup({
    password: new FormControl('', [Validators.required]),
    keepConnected: new FormControl(false)
  });

  onIdentify(): void {
    if (this.cpfForm.invalid || this.isLoading) {
      this.cpfForm.markAllAsTouched();
      return;
    }
    this.errorMessage = '';
    this.isLoading = true;
    const cpf = this.cpfForm.value.cpf ?? '';
    this.authFlow.identify(cpf).subscribe({
      next: (challenge) => {
        this.isLoading = false;
        if (challenge.state === 'PASSWORD_REQUIRED') {
          this.userName = challenge.userName ?? '';
          this.cpfMasked = challenge.cpfMasked ?? '';
          this.step = 'password';
        } else if (challenge.message) {
          this.errorMessage = challenge.message;
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Não foi possível continuar. Tente novamente.';
      }
    });
  }

  onVerifyPassword(): void {
    if (this.passwordForm.invalid || this.isLoading) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    this.errorMessage = '';
    this.isLoading = true;
    const cpf = this.authFlow.lastCpf ?? this.cpfForm.value.cpf ?? '';
    const password = this.passwordForm.value.password ?? '';
    this.authFlow.verifyPassword(cpf, password).subscribe({
      next: (challenge) => {
        this.isLoading = false;
        if (challenge.state === 'MFA_REQUIRED') {
          this.router.navigate(['/mfa']);
        } else if (challenge.state === 'ORGANIZATION_SELECTION_REQUIRED') {
          this.router.navigate(['/select-company']);
        } else if (challenge.message) {
          this.errorMessage = challenge.message;
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Senha incorreta. Tente novamente.';
      }
    });
  }

  backToCpf(): void {
    this.step = 'cpf';
    this.errorMessage = '';
    this.passwordForm.reset({ password: '', keepConnected: false });
  }

  // Demo bypass: load the mock access profile and go straight into the app.
  loginAsDemo(): void {
    if (this.isLoading) {
      return;
    }
    this.isLoading = true;
    this.authProfileService.loadProfile().subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/home-logged']);
      },
      error: () => {
        this.isLoading = false;
        this.router.navigate(['/home-logged']);
      }
    });
  }
}
