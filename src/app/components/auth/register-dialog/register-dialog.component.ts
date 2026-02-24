import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CommonModule } from '@angular/common';
import { LoginDialogComponent } from '../login-dialog/login-dialog.component';

@Component({
  selector: 'app-register-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatCheckboxModule
  ],
  template: `
    <div class="dialog-header">
      <h2 mat-dialog-title>Criar Conta</h2>
      <button mat-icon-button 
              class="close-button" 
              (click)="onCancel()"
              aria-label="Fechar">
        <mat-icon>close</mat-icon>
      </button>
    </div>
    
    <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nome Completo</mat-label>
          <mat-icon matPrefix>person</mat-icon>
          <input matInput formControlName="fullName" placeholder="Digite seu nome completo">
          <mat-error *ngIf="registerForm.get('fullName')?.hasError('required')">
            Nome é obrigatório
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>CPF</mat-label>
          <mat-icon matPrefix>badge</mat-icon>
          <input matInput 
                 formControlName="cpf" 
                 placeholder="000.000.000-00"
                 maxlength="14"
                 (input)="formatCpf($event)">
          <mat-error *ngIf="registerForm.get('cpf')?.hasError('required')">
            CPF é obrigatório
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>E-mail</mat-label>
          <mat-icon matPrefix>email</mat-icon>
          <input matInput formControlName="email" type="email" placeholder="seu@email.com">
          <mat-error *ngIf="registerForm.get('email')?.hasError('required')">
            E-mail é obrigatório
          </mat-error>
          <mat-error *ngIf="registerForm.get('email')?.hasError('email')">
            E-mail inválido
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Telefone</mat-label>
          <mat-icon matPrefix>phone</mat-icon>
          <input matInput 
                 formControlName="phone" 
                 placeholder="(11) 99999-9999"
                 maxlength="15"
                 (input)="formatPhone($event)">
          <mat-error *ngIf="registerForm.get('phone')?.hasError('required')">
            Telefone é obrigatório
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>PSF</mat-label>
          <mat-icon matPrefix>business</mat-icon>
          <input matInput formControlName="psf" placeholder="Código do PSF">
          <mat-error *ngIf="registerForm.get('psf')?.hasError('required')">
            PSF é obrigatório
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Senha</mat-label>
          <mat-icon matPrefix>lock</mat-icon>
          <input matInput 
                 [type]="hidePassword ? 'password' : 'text'"
                 formControlName="password">
          <button mat-icon-button matSuffix 
                  type="button"
                  (click)="hidePassword = !hidePassword">
            <mat-icon>{{hidePassword ? 'visibility' : 'visibility_off'}}</mat-icon>
          </button>
          <mat-error *ngIf="registerForm.get('password')?.hasError('required')">
            Senha é obrigatória
          </mat-error>
          <mat-error *ngIf="registerForm.get('password')?.hasError('minlength')">
            Senha deve ter pelo menos 8 caracteres
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Confirmar Senha</mat-label>
          <mat-icon matPrefix>lock_outline</mat-icon>
          <input matInput 
                 [type]="hideConfirmPassword ? 'password' : 'text'"
                 formControlName="confirmPassword">
          <button mat-icon-button matSuffix 
                  type="button"
                  (click)="hideConfirmPassword = !hideConfirmPassword">
            <mat-icon>{{hideConfirmPassword ? 'visibility' : 'visibility_off'}}</mat-icon>
          </button>
          <mat-error *ngIf="registerForm.get('confirmPassword')?.hasError('required')">
            Confirmação é obrigatória
          </mat-error>
          <mat-error *ngIf="registerForm.hasError('passwordMismatch')">
            Senhas não coincidem
          </mat-error>
        </mat-form-field>

        <mat-checkbox formControlName="acceptTerms" class="full-width">
          Aceito os <a href="#" target="_blank">termos de uso</a> e 
          <a href="#" target="_blank">política de privacidade</a>
        </mat-checkbox>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button type="button" (click)="onCancel()">
          <mat-icon>cancel</mat-icon>
          Cancelar
        </button>
        <button mat-raised-button 
                color="primary" 
                type="submit"
                [disabled]="registerForm.invalid || isLoading">
          <mat-icon>{{isLoading ? 'hourglass_empty' : 'person_add'}}</mat-icon>
          {{isLoading ? 'Criando...' : 'Criar Conta'}}
        </button>
      </mat-dialog-actions>
    </form>

    <div class="login-section">
      <p>Já tem uma conta?</p>
      <button mat-button color="primary" (click)="openLoginDialog()">
        <mat-icon>login</mat-icon>
        Fazer Login
      </button>
    </div>
  `,
  styles: [`
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .dialog-header h2 {
      margin: 0;
      font-family: 'Inter', sans-serif;
      font-weight: 600;
    }

    .close-button {
      position: relative;
      top: -8px;
      right: -8px;
      color: #666;
    }

    .close-button:hover {
      color: #333;
      background-color: rgba(0, 0, 0, 0.04);
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .login-section {
      text-align: center;
      padding: 16px;
    }

    .login-section p {
      margin-bottom: 8px;
      color: #666;
    }

    mat-dialog-content {
      min-width: 450px;
      max-height: 70vh;
      overflow-y: auto;
    }

    a {
      color: #1976d2;
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }

    /* Ícones nos campos de input */
    mat-form-field mat-icon[matPrefix] {
      color: #666 !important;
      margin-right: 12px !important;
      font-size: 20px !important;
      width: 20px !important;
      height: 20px !important;
    }

    /* Botões com ícones seguindo padrão oficial */
    mat-dialog-actions button mat-icon,
    .login-section button mat-icon {
      margin-right: 8px !important;
      margin-left: 0 !important;
      font-size: 18px !important;
      width: 18px !important;
      height: 18px !important;
    }

    /* Garantir que os botões mostrem os ícones corretamente */
    mat-dialog-actions button,
    .login-section button {
      display: flex !important;
      align-items: center !important;
      font-family: 'Inter', sans-serif !important;
    }

    * {
      font-family: 'Inter', sans-serif;
    }
  `]
})
export class RegisterDialogComponent {
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);
  
  registerForm: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;
  isLoading = false;

  constructor(
    private dialogRef: MatDialogRef<RegisterDialogComponent>
  ) {
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      cpf: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      psf: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  formatCpf(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
      this.registerForm.patchValue({ cpf: value });
    }
  }

  formatPhone(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      value = value.replace(/(\d{2})(\d)/, '($1) $2');
      value = value.replace(/(\d{5})(\d)/, '$1-$2');
      this.registerForm.patchValue({ phone: value });
    }
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      
      // Simular chamada de API
      setTimeout(() => {
        console.log('Register data:', this.registerForm.value);
        this.isLoading = false;
        this.dialogRef.close({ success: true, data: this.registerForm.value });
      }, 2000);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  openLoginDialog(): void {
    this.dialogRef.close();
    this.dialog.open(LoginDialogComponent, {
      width: '400px'
    });
  }
}
