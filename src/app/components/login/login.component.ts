import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

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
    MatProgressSpinnerModule,
    ReactiveFormsModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  private router = inject(Router);

  hidePassword = true;
  isLoading = false;

  loginForm = new FormGroup({
    cpf: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required])
  });

  onLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.authenticateAndNavigate();
  }

  loginAsDemo(): void {
    // Bypass validation: pre-fill demo credentials and navigate straight to the app.
    this.loginForm.patchValue({
      cpf: '000.000.000-00',
      password: 'demo'
    });
    this.authenticateAndNavigate();
  }

  private authenticateAndNavigate(): void {
    if (this.isLoading) {
      return;
    }
    this.isLoading = true;
    // Auth is mocked: simulate a brief authentication delay, then navigate.
    setTimeout(() => {
      this.isLoading = false;
      this.router.navigate(['/home-logged']);
    }, 800);
  }
}
