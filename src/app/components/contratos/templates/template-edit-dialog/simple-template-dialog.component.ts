import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

interface DialogData {
  template?: any;
  isEditMode: boolean;
}

@Component({
  selector: 'app-template-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatSnackBarModule
  ],
  template: `
    <div mat-dialog-title style="display: flex; align-items: center; gap: 12px;">
      <mat-icon style="color: #2196f3;">{{ isEditMode ? 'edit' : 'add' }}</mat-icon>
      <h2 style="margin: 0;">{{ isEditMode ? 'Editar' : 'Criar' }} Template de Contrato</h2>
      <div style="flex: 1;"></div>
      <button mat-icon-button mat-dialog-close>
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <mat-dialog-content style="max-width: 600px; min-height: 400px; padding: 20px;">
      <form [formGroup]="templateForm" style="display: flex; flex-direction: column; gap: 16px;">
        
        <mat-form-field appearance="outline">
          <mat-label>Nome do Template *</mat-label>
          <input matInput formControlName="template_name" placeholder="Ex: Exportação Soja China CIF">
          @if (templateForm.get('template_name')?.hasError('required') && templateForm.get('template_name')?.touched) {
            <mat-error>Nome é obrigatório</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Descrição</mat-label>
          <textarea matInput formControlName="description" rows="3" placeholder="Descrição do template"></textarea>
        </mat-form-field>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <mat-form-field appearance="outline">
            <mat-label>Tipo de Contrato *</mat-label>
            <mat-select formControlName="contract_type">
              <mat-option value="export">Exportação</mat-option>
              <mat-option value="import">Importação</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Commodity *</mat-label>
            <mat-select formControlName="commodity">
              <mat-option value="SOJA">Soja</mat-option>
              <mat-option value="MILHO">Milho</mat-option>
              <mat-option value="ACUCAR">Açúcar</mat-option>
              <mat-option value="CAFE">Café</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <mat-form-field appearance="outline">
            <mat-label>Moeda *</mat-label>
            <mat-select formControlName="currency">
              <mat-option value="USD">USD - Dólar</mat-option>
              <mat-option value="EUR">EUR - Euro</mat-option>
              <mat-option value="BRL">BRL - Real</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Preço Base</mat-label>
            <input matInput type="number" formControlName="default_price" placeholder="450.00">
          </mat-form-field>
        </div>

        <mat-slide-toggle formControlName="active">
          Template Ativo
        </mat-slide-toggle>

      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end" style="padding: 16px; gap: 12px;">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-raised-button color="primary" 
              [disabled]="templateForm.invalid || isSaving"
              (click)="onSave()">
        {{ isSaving ? 'Salvando...' : (isEditMode ? 'Atualizar' : 'Criar') }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .mat-mdc-form-field {
      width: 100%;
    }
    
    .mat-mdc-dialog-content {
      overflow: visible !important;
    }
  `]
})
export class TemplateEditDialogComponent {
  templateForm: FormGroup;
  isEditMode: boolean;
  isSaving = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<TemplateEditDialogComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.isEditMode = data.isEditMode;
    this.templateForm = this.createForm();

    if (this.isEditMode && data.template) {
      this.loadTemplate(data.template);
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      template_name: ['', [Validators.required]],
      description: [''],
      contract_type: ['export', [Validators.required]],
      commodity: ['SOJA', [Validators.required]],
      currency: ['USD', [Validators.required]],
      default_price: [450],
      active: [true]
    });
  }

  private loadTemplate(template: any): void {
    this.templateForm.patchValue({
      template_name: template.template_name,
      description: template.description,
      contract_type: template.contract_type,
      commodity: template.commodity,
      currency: template.currency,
      default_price: template.default_price,
      active: template.active
    });
  }

  onSave(): void {
    if (this.templateForm.invalid) {
      this.templateForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;

    // Simular salvamento
    setTimeout(() => {
      const templateData = {
        ...this.templateForm.value,
        template_id: this.isEditMode ? this.data.template?.template_id : undefined,
        created_at: this.isEditMode ? this.data.template?.created_at : new Date(),
        updated_at: new Date()
      };

      this.snackBar.open(
        `Template ${this.isEditMode ? 'atualizado' : 'criado'} com sucesso!`, 
        'Fechar', 
        { duration: 3000 }
      );

      this.isSaving = false;
      this.dialogRef.close(templateData);
    }, 1000);
  }
}