import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { TipoPerfil } from '../usuarios.component';

interface DialogData {
  tiposPerfil: TipoPerfil[];
  perfilPreSelecionado?: string;
}

@Component({
  selector: 'app-usuario-create-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule
  ],
  template: `
    <div class="dialog-header">
      <h2 mat-dialog-title>
        <mat-icon>person_add</mat-icon>
        Criar Novo Usuário
      </h2>
      <button mat-icon-button [mat-dialog-close]="false">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <mat-dialog-content class="dialog-content">
      <form [formGroup]="userForm" class="user-form">
        
        <mat-form-field appearance="outline">
          <mat-label>Nome Completo</mat-label>
          <mat-icon matPrefix>person</mat-icon>
          <input matInput formControlName="nome" placeholder="Digite o nome completo">
          <mat-error *ngIf="userForm.get('nome')?.hasError('required')">
            Nome é obrigatório
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Email</mat-label>
          <mat-icon matPrefix>email</mat-icon>
          <input matInput type="email" formControlName="email" placeholder="usuario@psf.gov.br">
          <mat-error *ngIf="userForm.get('email')?.hasError('required')">
            Email é obrigatório
          </mat-error>
          <mat-error *ngIf="userForm.get('email')?.hasError('email')">
            Digite um email válido
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>CPF</mat-label>
          <mat-icon matPrefix>assignment_ind</mat-icon>
          <input matInput formControlName="cpf" 
                 placeholder="000.000.000-00"
                 (input)="onCpfInput($event)"
                 maxlength="14">
          <mat-error *ngIf="userForm.get('cpf')?.hasError('required')">
            CPF é obrigatório
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Telefone</mat-label>
          <mat-icon matPrefix>phone</mat-icon>
          <input matInput formControlName="telefone" 
                 placeholder="(00) 00000-0000"
                 (input)="onPhoneInput($event)"
                 maxlength="15">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Perfil de Acesso</mat-label>
          <mat-icon matPrefix>security</mat-icon>
          <mat-select formControlName="perfil">
            <mat-option *ngFor="let perfil of data.tiposPerfil" [value]="perfil.id">
              {{perfil.nome}} - {{perfil.descricao}}
            </mat-option>
          </mat-select>
          <mat-error *ngIf="userForm.get('perfil')?.hasError('required')">
            Perfil é obrigatório
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Senha Temporária</mat-label>
          <mat-icon matPrefix>lock</mat-icon>
          <input matInput type="password" formControlName="senha" 
                 placeholder="Mínimo 6 caracteres">
          <mat-error *ngIf="userForm.get('senha')?.hasError('required')">
            Senha é obrigatória
          </mat-error>
          <mat-error *ngIf="userForm.get('senha')?.hasError('minlength')">
            Senha deve ter no mínimo 6 caracteres
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Confirmar Senha</mat-label>
          <mat-icon matPrefix>lock_outline</mat-icon>
          <input matInput type="password" formControlName="confirmarSenha" 
                 placeholder="Digite a senha novamente">
          <mat-error *ngIf="userForm.get('confirmarSenha')?.hasError('required')">
            Confirmação de senha é obrigatória
          </mat-error>
          <mat-error *ngIf="userForm.hasError('senhasMismatch')">
            Senhas não coincidem
          </mat-error>
        </mat-form-field>

      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="dialog-actions">
      <button mat-button [mat-dialog-close]="false">
        <mat-icon>cancel</mat-icon>
        Cancelar
      </button>
      
      <button mat-raised-button 
              color="primary" 
              (click)="criarUsuario()"
              [disabled]="userForm.invalid || isLoading">
        <mat-icon>{{isLoading ? 'hourglass_empty' : 'save'}}</mat-icon>
        {{isLoading ? 'Criando...' : 'Criar Usuário'}}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px solid #e0e0e0;
    }

    .dialog-header h2 {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0;
      font-weight: 600;
      color: #1976d2;
      font-size: 1.5rem;
    }

    .dialog-content {
      min-width: 500px;
      padding: 0 8px !important;
    }

    .user-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .dialog-actions {
      padding: 24px 0 0 0;
      border-top: 1px solid #e0e0e0;
      gap: 16px;
      margin-top: 24px;
    }

    .dialog-actions button {
      min-width: 120px;
      height: 44px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    @media (max-width: 600px) {
      .dialog-content {
        min-width: auto;
        width: 100%;
      }
      
      .dialog-actions {
        flex-direction: column;
      }
      
      .dialog-actions button {
        width: 100%;
      }
    }
  `]
})
export class UsuarioCreateDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  
  userForm!: FormGroup;
  isLoading = false;

  constructor(
    private dialogRef: MatDialogRef<UsuarioCreateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.userForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      cpf: ['', Validators.required],
      telefone: [''],
      perfil: [this.data.perfilPreSelecionado || '', Validators.required],
      senha: ['', [Validators.required, Validators.minLength(6)]],
      confirmarSenha: ['', Validators.required]
    }, { validators: this.senhasMatchValidator });
  }

  private senhasMatchValidator(form: FormGroup) {
    const senha = form.get('senha');
    const confirmarSenha = form.get('confirmarSenha');
    
    if (senha && confirmarSenha && senha.value !== confirmarSenha.value) {
      return { senhasMismatch: true };
    }
    
    return null;
  }

  onCpfInput(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    
    if (value.length <= 11) {
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    
    this.userForm.get('cpf')?.setValue(value);
  }

  onPhoneInput(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    
    if (value.length <= 11) {
      value = value.replace(/(\d{2})(\d)/, '($1) $2');
      value = value.replace(/(\d{5})(\d)/, '$1-$2');
    }
    
    this.userForm.get('telefone')?.setValue(value);
  }

  criarUsuario(): void {
    if (this.userForm.valid) {
      this.isLoading = true;
      
      // Simular criação do usuário
      setTimeout(() => {
        this.isLoading = false;
        this.dialogRef.close(this.userForm.value);
      }, 2000);
    }
  }
}
