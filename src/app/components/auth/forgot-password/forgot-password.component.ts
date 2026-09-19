import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AUTH_FLOW_SERVICE } from '../../../services/auth-flow/auth-flow.token';

@Component({
  selector: 'app-forgot-password',
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
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  private authFlow = inject(AUTH_FLOW_SERVICE);

  isLoading = false;
  submitted = false;

  form = new FormGroup({
    identifier: new FormControl('', [Validators.required])
  });

  onSubmit(): void {
    if (this.form.invalid || this.isLoading) {
      this.form.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    const identifier = this.form.value.identifier ?? '';
    this.authFlow.requestPasswordReset(identifier).subscribe({
      next: () => {
        this.isLoading = false;
        // Anti-enumeration: always show the same neutral message.
        this.submitted = true;
      },
      error: () => {
        this.isLoading = false;
        this.submitted = true;
      }
    });
  }
}
