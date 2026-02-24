import { Component, inject, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { Cidade } from '../cidades.component';

interface DialogData {
  cidade: Cidade | null;
  isEdit: boolean;
}

@Component({
  selector: 'app-cidade-edit-dialog',
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
        <mat-icon>{{data.isEdit ? 'edit' : 'add'}}</mat-icon>
        {{data.isEdit ? 'Editar' : 'Nova'}} Cidade
      </h2>
      <button mat-icon-button 
              class="close-button" 
              (click)="onCancel()"
              aria-label="Fechar">
        <mat-icon>close</mat-icon>
      </button>
    </div>
    
    <form [formGroup]="cidadeForm" (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>ID</mat-label>
          <mat-icon matPrefix>tag</mat-icon>
          <input matInput 
                 formControlName="id" 
                 readonly
                 placeholder="Gerado automaticamente">
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Descrição da Cidade</mat-label>
          <mat-icon matPrefix>location_city</mat-icon>
          <input matInput 
                 formControlName="descricao" 
                 placeholder="Digite o nome da cidade"
                 maxlength="100">
          <mat-error *ngIf="cidadeForm.get('descricao')?.hasError('required')">
            Descrição é obrigatória
          </mat-error>
          <mat-error *ngIf="cidadeForm.get('descricao')?.hasError('minlength')">
            Descrição deve ter pelo menos 2 caracteres
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Data de Cadastro</mat-label>
          <mat-icon matPrefix>calendar_today</mat-icon>
          <input matInput 
                 formControlName="dataCadastro" 
                 readonly
                 placeholder="Data atual">
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Status</mat-label>
          <mat-icon matPrefix>info</mat-icon>
          <mat-select formControlName="status">
            <mat-option value="Ativo">
              <mat-icon>check_circle</mat-icon>
              Ativo
            </mat-option>
            <mat-option value="Inativo">
              <mat-icon>cancel</mat-icon>
              Inativo
            </mat-option>
          </mat-select>
          <mat-error *ngIf="cidadeForm.get('status')?.hasError('required')">
            Status é obrigatório
          </mat-error>
        </mat-form-field>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button 
                type="button" 
                (click)="onCancel()"
                class="cancel-button">
          <mat-icon>cancel</mat-icon>
          Cancelar
        </button>
        <button mat-raised-button 
                color="primary" 
                type="submit"
                [disabled]="cidadeForm.invalid || isLoading"
                class="save-button">
          <mat-icon>{{isLoading ? 'hourglass_empty' : 'save'}}</mat-icon>
          {{isLoading ? 'Salvando...' : 'Salvar'}}
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [`
    * {
      font-family: 'Inter', sans-serif;
    }

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

    .dialog-header h2 mat-icon {
      font-size: 1.5rem;
      width: 1.5rem;
      height: 1.5rem;
    }

    .close-button {
      color: #666;
      transition: all 0.3s ease;
    }

    .close-button:hover {
      color: #333;
      background-color: rgba(0, 0, 0, 0.04);
      transform: rotate(90deg);
    }

    .full-width {
      width: 100%;
      margin-bottom: 20px;
    }

    mat-dialog-content {
      min-width: 450px;
      max-height: 70vh;
      overflow-y: auto;
      padding: 0 24px;
    }

    mat-form-field mat-icon[matPrefix] {
      color: #666 !important;
      margin-right: 12px !important;
      font-size: 20px !important;
      width: 20px !important;
      height: 20px !important;
    }

    mat-dialog-actions {
      padding: 24px;
      border-top: 1px solid #e0e0e0;
      gap: 12px;
    }

    .cancel-button,
    .save-button {
      display: flex !important;
      align-items: center !important;
      font-family: 'Inter', sans-serif !important;
      font-weight: 500;
      height: 44px;
      padding: 0 24px;
      border-radius: 8px;
      transition: all 0.3s ease;
    }

    .cancel-button mat-icon,
    .save-button mat-icon {
      margin-right: 8px !important;
      margin-left: 0 !important;
      font-size: 18px !important;
      width: 18px !important;
      height: 18px !important;
    }

    .save-button {
      box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
    }

    .save-button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(25, 118, 210, 0.4);
    }

    .save-button:disabled {
      opacity: 0.6;
      transform: none;
      box-shadow: none;
    }

    /* Personalização do select */
    .mat-mdc-select-value mat-icon {
      margin-right: 8px;
      vertical-align: middle;
    }

    /* Responsivo */
    @media (max-width: 768px) {
      mat-dialog-content {
        min-width: 300px;
        padding: 0 16px;
      }

      mat-dialog-actions {
        padding: 16px;
        flex-direction: column-reverse;
        gap: 8px;
      }

      .cancel-button,
      .save-button {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class CidadeEditDialogComponent {
  private fb = inject(FormBuilder);
  
  cidadeForm: FormGroup;
  isLoading = false;

  constructor(
    private dialogRef: MatDialogRef<CidadeEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.cidadeForm = this.fb.group({
      id: [{ value: data.cidade?.id || 'Novo', disabled: true }],
      descricao: [
        data.cidade?.descricao || '', 
        [Validators.required, Validators.minLength(2), Validators.maxLength(100)]
      ],
      dataCadastro: [{ 
        value: data.cidade?.dataCadastro ? 
          data.cidade.dataCadastro.toLocaleString('pt-BR') : 
          new Date().toLocaleString('pt-BR'), 
        disabled: true 
      }],
      status: [data.cidade?.status || 'Ativo', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.cidadeForm.valid) {
      this.isLoading = true;
      
      // Simular chamada de API
      setTimeout(() => {
        const formValue = this.cidadeForm.getRawValue();
        console.log('Dados da cidade:', formValue);
        this.isLoading = false;
        this.dialogRef.close({ 
          success: true, 
          data: formValue,
          isEdit: this.data.isEdit 
        });
      }, 1500);
    } else {
      // Marcar todos os campos como touched para mostrar erros
      Object.keys(this.cidadeForm.controls).forEach(key => {
        this.cidadeForm.get(key)?.markAsTouched();
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
