import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { RegisterDialogComponent } from '../register-dialog/register-dialog.component';
import { ForgotPasswordDialogComponent } from '../forgot-password-dialog/forgot-password-dialog.component';
import { NotificationService } from '../../../services/notification.service';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormControl } from '@angular/forms';
import { Observable, startWith, map } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatAutocompleteModule
  ],
  template: `
    <div class="dialog-header">
      <h2 mat-dialog-title>Login PSF Digital</h2>
      <button mat-icon-button 
              class="close-button" 
              (click)="onCancel()"
              aria-label="Fechar">
        <mat-icon>close</mat-icon>
      </button>
    </div>
    
    <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <!-- Autocomplete de cidades -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Cidade</mat-label>
          <mat-icon matPrefix>location_city</mat-icon>
          <input type="text"
                 matInput
                 [formControl]="cityControl"
                 [matAutocomplete]="auto"
                 placeholder="Selecione a cidade">
          <mat-autocomplete #auto="matAutocomplete">
            <mat-option *ngFor="let city of filteredCities$ | async" [value]="city">
              {{ city }}
            </mat-option>
          </mat-autocomplete>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>PSF</mat-label>
          <mat-icon matPrefix>business</mat-icon>
          <input matInput 
                 formControlName="psf" 
                 placeholder="Digite o código PSF"
                 maxlength="10">
          <mat-error *ngIf="loginForm.get('psf')?.hasError('required')">
            PSF é obrigatório
          </mat-error>
          <mat-error *ngIf="loginForm.get('psf')?.hasError('pattern')">
            PSF deve conter apenas números
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>CPF</mat-label>
          <mat-icon matPrefix>person</mat-icon>
          <input matInput 
                 formControlName="cpf" 
                 placeholder="000.000.000-00"
                 maxlength="14"
                 (input)="formatCpf($event)">
          <mat-error *ngIf="loginForm.get('cpf')?.hasError('required')">
            CPF é obrigatório
          </mat-error>
          <mat-error *ngIf="loginForm.get('cpf')?.hasError('pattern')">
            CPF inválido
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
          <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
            Senha é obrigatória
          </mat-error>
        </mat-form-field>

        <div class="login-options">
          <button type="button" 
                  mat-button 
                  color="primary" 
                  (click)="openForgotPasswordDialog()">
            <mat-icon>help_outline</mat-icon>
            Esqueci minha senha
          </button>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button type="button" (click)="onCancel()">
          <mat-icon>cancel</mat-icon>
          Cancelar
        </button>
        <button mat-raised-button 
                color="primary" 
                type="submit"
                [disabled]="loginForm.invalid || isLoading">
          <mat-icon>{{isLoading ? 'hourglass_empty' : 'login'}}</mat-icon>
          {{isLoading ? 'Entrando...' : 'Entrar'}}
        </button>
      </mat-dialog-actions>
    </form>

    <mat-divider></mat-divider>
    
    <div class="register-section">
      <p>Não tem uma conta?</p>
      <button mat-button color="accent" (click)="openRegisterDialog()">
        <mat-icon>person_add</mat-icon>
        Criar Conta
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

    .login-options {
      text-align: center;
      margin: 16px 0;
    }

    .register-section {
      text-align: center;
      padding: 16px;
    }

    .register-section p {
      margin-bottom: 8px;
      color: #666;
    }

    mat-dialog-content {
      min-width: 350px;
    }

    /* Ícones nos campos de input seguindo documentação */
    mat-form-field mat-icon[matPrefix] {
      color: #666 !important;
      margin-right: 12px !important;
      font-size: 20px !important;
      width: 20px !important;
      height: 20px !important;
    }

    /* Botões com ícones seguindo padrão oficial */
    .login-options button mat-icon,
    mat-dialog-actions button mat-icon,
    .register-section button mat-icon {
      margin-right: 8px !important;
      margin-left: 0 !important;
      font-size: 18px !important;
      width: 18px !important;
      height: 18px !important;
    }

    /* Garantir que os botões mostrem os ícones corretamente */
    .login-options button,
    mat-dialog-actions button,
    .register-section button {
      display: flex !important;
      align-items: center !important;
      font-family: 'Inter', sans-serif !important;
    }

    /* Ajuste para autocomplete */
    .mat-autocomplete-panel {
      font-family: 'Inter', sans-serif;
    }

    * {
      font-family: 'Inter', sans-serif;
    }
  `]
})
export class LoginDialogComponent {
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  
  loginForm: FormGroup;
  hidePassword = true;
  isLoading = false;

  // Mock de cidades de Minas Gerais
  cities: string[] = [
    'Belo Horizonte', 'Uberlândia', 'Contagem', 'Juiz de Fora', 'Betim', 'Montes Claros',
    'Ribeirão das Neves', 'Uberaba', 'Governador Valadares', 'Ipatinga', 'Sete Lagoas',
    'Divinópolis', 'Santa Luzia', 'Ibirité', 'Poços de Caldas', 'Patos de Minas',
    'Teófilo Otoni', 'Barbacena', 'Sabará', 'Varginha'
  ];
  cityControl = new FormControl('');
  filteredCities$: Observable<string[]>;

  constructor(
    private dialogRef: MatDialogRef<LoginDialogComponent>
  ) {
    this.loginForm = this.fb.group({
      psf: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      cpf: ['', [Validators.required, Validators.pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.filteredCities$ = this.cityControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterCities(value || ''))
    );
  }

  private _filterCities(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.cities.filter(city => city.toLowerCase().includes(filterValue));
  }

  formatCpf(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
      this.loginForm.patchValue({ cpf: value });
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.notificationService.showLoading({
        title: 'Autenticando...',
        message: 'Verificando suas credenciais.'
      });
      
      // Simular chamada de API
      setTimeout(() => {
        console.log('Login data:', this.loginForm.value);
        this.isLoading = false;
        this.notificationService.hideLoading();
        this.notificationService.showSuccess('Login realizado com sucesso!');
        this.notificationService.addNotification('Bem-vindo ao PSF Digital!', 'success');
        
        // Fechar o diálogo e redirecionar para home logada
        this.dialogRef.close({ success: true, data: this.loginForm.value });
        this.router.navigate(['/home-logged']);
      }, 2000);
    } else {
      this.notificationService.showWarning('Por favor, preencha todos os campos obrigatórios.');
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  openRegisterDialog(): void {
    this.dialogRef.close();
    this.dialog.open(RegisterDialogComponent, {
      width: '500px'
    });
  }

  openForgotPasswordDialog(): void {
    this.dialogRef.close();
    this.dialog.open(ForgotPasswordDialogComponent, {
      width: '400px'
    });
  }
}
