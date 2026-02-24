import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
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
    ReactiveFormsModule
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>Export Intelligence Platform</mat-card-title>
          <mat-card-subtitle>Acesse sua conta</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onLogin()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>CPF</mat-label>
              <input matInput formControlName="cpf" placeholder="Digite seu CPF">
              <mat-error *ngIf="loginForm.get('cpf')?.hasError('required')">
                CPF é obrigatório
              </mat-error>
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Senha</mat-label>
              <input matInput 
                     [type]="hidePassword ? 'password' : 'text'" 
                     formControlName="password" 
                     placeholder="Digite sua senha">
              <button mat-icon-button matSuffix 
                      (click)="hidePassword = !hidePassword" 
                      [attr.aria-label]="'Hide password'" 
                      [attr.aria-pressed]="hidePassword"
                      type="button">
                <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
              <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                Senha é obrigatória
              </mat-error>
            </mat-form-field>
          </form>
        </mat-card-content>
        
        <mat-card-actions align="end">
          <button mat-button color="primary" (click)="onLogin()">Entrar</button>
          <button mat-raised-button color="primary" (click)="onLogin()">Acessar como Demo</button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }
    
    .login-card {
      max-width: 400px;
      width: 100%;
    }
    
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
    
    mat-card-header {
      margin-bottom: 20px;
    }
  `]
})
export class LoginComponent {
  private router = inject(Router);
  
  hidePassword = true;
  
  loginForm = new FormGroup({
    cpf: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required])
  });
  
  onLogin() {
    if (this.loginForm.valid) {
      // Simular login bem-sucedido
      this.router.navigate(['/home-logged']);
    }
  }
}
