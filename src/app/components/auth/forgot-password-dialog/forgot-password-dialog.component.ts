import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatStepperModule } from '@angular/material/stepper';
import { CommonModule } from '@angular/common';
import { LoginDialogComponent } from '../login-dialog/login-dialog.component';

@Component({
  selector: 'app-forgot-password-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatRadioModule,
    MatStepperModule
  ],
  template: `
    <div class="dialog-header">
      <h2 mat-dialog-title>Recuperar Senha</h2>
      <button mat-icon-button 
              class="close-button" 
              (click)="onCancel()"
              aria-label="Fechar">
        <mat-icon>close</mat-icon>
      </button>
    </div>
    
    <mat-horizontal-stepper [linear]="true" #stepper>
      <!-- Passo 1: Identificação -->
      <mat-step [stepControl]="identificationForm">
        <form [formGroup]="identificationForm">
          <ng-template matStepLabel>Identificação</ng-template>
          
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>CPF</mat-label>
            <mat-icon matPrefix>person</mat-icon>
            <input matInput 
                   formControlName="cpf" 
                   placeholder="000.000.000-00"
                   maxlength="14"
                   (input)="formatCpf($event)">
            <mat-error *ngIf="identificationForm.get('cpf')?.hasError('required')">
              CPF é obrigatório
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>PSF</mat-label>
            <mat-icon matPrefix>business</mat-icon>
            <input matInput formControlName="psf" placeholder="Código do PSF">
            <mat-error *ngIf="identificationForm.get('psf')?.hasError('required')">
              PSF é obrigatório
            </mat-error>
          </mat-form-field>

          <div class="step-actions">
            <button mat-raised-button 
                    color="primary" 
                    matStepperNext
                    [disabled]="identificationForm.invalid"
                    (click)="validateUser()">
              <mat-icon>arrow_forward</mat-icon>
              Próximo
            </button>
          </div>
        </form>
      </mat-step>

      <!-- Passo 2: Método de Verificação -->
      <mat-step [stepControl]="verificationMethodForm">
        <form [formGroup]="verificationMethodForm">
          <ng-template matStepLabel>Método de Verificação</ng-template>
          
          <p>Escolha como deseja receber o código de verificação:</p>
          
          <mat-radio-group formControlName="method" class="verification-methods">
            <mat-radio-button value="email" class="verification-option">
              <div class="method-content">
                <mat-icon>email</mat-icon>
                <div>
                  <strong>E-mail</strong>
                  <p>Enviar código para {{maskedEmail}}</p>
                </div>
              </div>
            </mat-radio-button>
            
            <mat-radio-button value="sms" class="verification-option">
              <div class="method-content">
                <mat-icon>sms</mat-icon>
                <div>
                  <strong>SMS</strong>
                  <p>Enviar código para {{maskedPhone}}</p>
                </div>
              </div>
            </mat-radio-button>
          </mat-radio-group>

          <div class="step-actions">
            <button mat-button matStepperPrevious>
              <mat-icon>arrow_back</mat-icon>
              Voltar
            </button>
            <button mat-raised-button 
                    color="primary" 
                    matStepperNext
                    [disabled]="verificationMethodForm.invalid"
                    (click)="sendVerificationCode()">
              <mat-icon>send</mat-icon>
              Enviar Código
            </button>
          </div>
        </form>
      </mat-step>

      <!-- Passo 3: Código de Verificação -->
      <mat-step [stepControl]="verificationCodeForm">
        <form [formGroup]="verificationCodeForm">
          <ng-template matStepLabel>Código de Verificação</ng-template>
          
          <p>Digite o código de 6 dígitos enviado para:</p>
          <p><strong>{{getSelectedMethodText()}}</strong></p>
          
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Código de Verificação</mat-label>
            <mat-icon matPrefix>pin</mat-icon>
            <input matInput 
                   formControlName="code" 
                   placeholder="000000"
                   maxlength="6"
                   (input)="formatCode($event)">
            <mat-error *ngIf="verificationCodeForm.get('code')?.hasError('required')">
              Código é obrigatório
            </mat-error>
            <mat-error *ngIf="verificationCodeForm.get('code')?.hasError('pattern')">
              Código deve ter 6 dígitos
            </mat-error>
          </mat-form-field>

          <div class="resend-section">
            <p>Não recebeu o código?</p>
            <button mat-button color="primary" (click)="resendCode()" [disabled]="resendDisabled">
              <mat-icon>refresh</mat-icon>
              {{resendDisabled ? 'Reenviar em ' + countdown + 's' : 'Reenviar código'}}
            </button>
          </div>

          <div class="step-actions">
            <button mat-button matStepperPrevious>
              <mat-icon>arrow_back</mat-icon>
              Voltar
            </button>
            <button mat-raised-button 
                    color="primary" 
                    matStepperNext
                    [disabled]="verificationCodeForm.invalid"
                    (click)="verifyCode()">
              <mat-icon>verified</mat-icon>
              Verificar
            </button>
          </div>
        </form>
      </mat-step>

      <!-- Passo 4: Nova Senha -->
      <mat-step [stepControl]="newPasswordForm">
        <form [formGroup]="newPasswordForm">
          <ng-template matStepLabel>Nova Senha</ng-template>
          
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Nova Senha</mat-label>
            <mat-icon matPrefix>lock</mat-icon>
            <input matInput 
                   [type]="hideNewPassword ? 'password' : 'text'"
                   formControlName="newPassword">
            <button mat-icon-button matSuffix 
                    type="button"
                    (click)="hideNewPassword = !hideNewPassword">
              <mat-icon>{{hideNewPassword ? 'visibility' : 'visibility_off'}}</mat-icon>
            </button>
            <mat-error *ngIf="newPasswordForm.get('newPassword')?.hasError('required')">
              Nova senha é obrigatória
            </mat-error>
            <mat-error *ngIf="newPasswordForm.get('newPassword')?.hasError('minlength')">
              Senha deve ter pelo menos 8 caracteres
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Confirmar Nova Senha</mat-label>
            <mat-icon matPrefix>lock_outline</mat-icon>
            <input matInput 
                   [type]="hideConfirmPassword ? 'password' : 'text'"
                   formControlName="confirmPassword">
            <button mat-icon-button matSuffix 
                    type="button"
                    (click)="hideConfirmPassword = !hideConfirmPassword">
              <mat-icon>{{hideConfirmPassword ? 'visibility' : 'visibility_off'}}</mat-icon>
            </button>
            <mat-error *ngIf="newPasswordForm.get('confirmPassword')?.hasError('required')">
              Confirmação é obrigatória
            </mat-error>
            <mat-error *ngIf="newPasswordForm.hasError('passwordMismatch')">
              Senhas não coincidem
            </mat-error>
          </mat-form-field>

          <div class="step-actions">
            <button mat-button matStepperPrevious>
              <mat-icon>arrow_back</mat-icon>
              Voltar
            </button>
            <button mat-raised-button 
                    color="primary" 
                    [disabled]="newPasswordForm.invalid || isLoading"
                    (click)="resetPassword()">
              <mat-icon>{{isLoading ? 'hourglass_empty' : 'check'}}</mat-icon>
              {{isLoading ? 'Alterando...' : 'Alterar Senha'}}
            </button>
          </div>
        </form>
      </mat-step>
    </mat-horizontal-stepper>

    <mat-dialog-actions align="end" *ngIf="!showStepper">
      <button mat-button (click)="onCancel()">
        <mat-icon>cancel</mat-icon>
        Cancelar
      </button>
      <button mat-button color="primary" (click)="openLoginDialog()">
        <mat-icon>login</mat-icon>
        Voltar ao Login
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
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

    .verification-methods {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin: 20px 0;
    }

    .verification-option {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 16px;
      width: 100%;
    }

    .verification-option:hover {
      background-color: #f5f5f5;
    }

    .method-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .method-content mat-icon {
      color: #1976d2;
    }

    .method-content div p {
      margin: 4px 0 0 0;
      color: #666;
      font-size: 14px;
    }

    .step-actions {
      display: flex;
      justify-content: space-between;
      margin-top: 24px;
    }

    .resend-section {
      text-align: center;
      margin: 16px 0;
    }

    .resend-section p {
      margin-bottom: 8px;
      color: #666;
    }

    mat-dialog-content {
      min-width: 500px;
      max-height: 70vh;
      overflow-y: auto;
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
    .step-actions button mat-icon,
    .resend-section button mat-icon,
    mat-dialog-actions button mat-icon {
      margin-right: 8px !important;
      margin-left: 0 !important;
      font-size: 18px !important;
      width: 18px !important;
      height: 18px !important;
    }

    /* Garantir que os botões mostrem os ícones corretamente */
    .step-actions button,
    .resend-section button,
    mat-dialog-actions button {
      display: flex !important;
      align-items: center !important;
      font-family: 'Inter', sans-serif !important;
    }

    * {
      font-family: 'Inter', sans-serif;
    }
  `]
})
export class ForgotPasswordDialogComponent {
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);
  
  identificationForm: FormGroup;
  verificationMethodForm: FormGroup;
  verificationCodeForm: FormGroup;
  newPasswordForm: FormGroup;
  
  hideNewPassword = true;
  hideConfirmPassword = true;
  isLoading = false;
  showStepper = true;
  
  maskedEmail = 'user***@email.com';
  maskedPhone = '(11) 9****-9999';
  resendDisabled = false;
  countdown = 60;

  constructor(
    private dialogRef: MatDialogRef<ForgotPasswordDialogComponent>
  ) {
    this.identificationForm = this.fb.group({
      cpf: ['', [Validators.required]],
      psf: ['', [Validators.required]]
    });

    this.verificationMethodForm = this.fb.group({
      method: ['', [Validators.required]]
    });

    this.verificationCodeForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });

    this.newPasswordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('newPassword');
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
      this.identificationForm.patchValue({ cpf: value });
    }
  }

  formatCode(event: any): void {
    const value = event.target.value.replace(/\D/g, '').substring(0, 6);
    this.verificationCodeForm.patchValue({ code: value });
  }

  validateUser(): void {
    // Simular validação do usuário
    console.log('Validating user:', this.identificationForm.value);
  }

  sendVerificationCode(): void {
    const method = this.verificationMethodForm.value.method;
    console.log('Sending verification code via:', method);
    this.startCountdown();
  }

  verifyCode(): void {
    console.log('Verifying code:', this.verificationCodeForm.value.code);
  }

  resetPassword(): void {
    if (this.newPasswordForm.valid) {
      this.isLoading = true;
      
      setTimeout(() => {
        console.log('Password reset successful');
        this.isLoading = false;
        this.dialogRef.close({ success: true, message: 'Senha alterada com sucesso!' });
      }, 2000);
    }
  }

  resendCode(): void {
    this.sendVerificationCode();
  }

  startCountdown(): void {
    this.resendDisabled = true;
    this.countdown = 60;
    
    const interval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        this.resendDisabled = false;
        clearInterval(interval);
      }
    }, 1000);
  }

  getSelectedMethodText(): string {
    const method = this.verificationMethodForm.value.method;
    return method === 'email' ? this.maskedEmail : this.maskedPhone;
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
