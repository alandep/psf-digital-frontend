import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthFlowMockService } from '../../../../services/authFlowMockService';

// Group validator: the two password fields must match.
function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const pwd = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return pwd === confirm ? null : { mismatch: true };
}

@Component({
  selector: 'app-reset-password',
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
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent {
  private authFlow = inject(AuthFlowMockService);

  isLoading = false;
  success = false;
  hidePassword = true;
  hideConfirm = true;

  form = new FormGroup({
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
    confirmPassword: new FormControl('', [Validators.required])
  }, { validators: passwordsMatch });

  onSubmit(): void {
    if (this.form.invalid || this.isLoading) {
      this.form.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    const password = this.form.value.password ?? '';
    this.authFlow.resetPassword('mock-token', password).subscribe({
      next: () => {
        this.isLoading = false;
        this.success = true;
      },
      error: () => {
        this.isLoading = false;
        this.success = true;
      }
    });
  }
}
