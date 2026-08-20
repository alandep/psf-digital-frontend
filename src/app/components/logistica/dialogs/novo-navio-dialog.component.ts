import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-novo-navio-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatIconModule
  ],
  template: `
    <div class="dialog-wrapper">
      <div class="dialog-header">
        <mat-icon>directions_boat</mat-icon>
        <div>
          <h2>Rastrear Novo Navio</h2>
          <p>Adicionar embarcação ao monitoramento</p>
        </div>
      </div>
      <div class="dialog-body">
        <form [formGroup]="form" class="dialog-form">
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Nome do Navio</mat-label>
              <input matInput formControlName="vesselName">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Número IMO</mat-label>
              <input matInput formControlName="imoNumber">
            </mat-form-field>
          </div>
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Bandeira</mat-label>
              <mat-select formControlName="flag">
                <mat-option value="Brasil">Brasil</mat-option>
                <mat-option value="Panamá">Panamá</mat-option>
                <mat-option value="Libéria">Libéria</mat-option>
                <mat-option value="Ilhas Marshall">Ilhas Marshall</mat-option>
                <mat-option value="Bahamas">Bahamas</mat-option>
                <mat-option value="Singapura">Singapura</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Tipo</mat-label>
              <mat-select formControlName="vesselType">
                <mat-option value="BULK_CARRIER">Graneleiro</mat-option>
                <mat-option value="CONTAINER_SHIP">Porta-contêiner</mat-option>
                <mat-option value="TANKER">Petroleiro</mat-option>
                <mat-option value="REEFER">Frigorífico</mat-option>
                <mat-option value="RORO">Ro-Ro</mat-option>
                <mat-option value="GENERAL_CARGO">Carga Geral</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Capacidade</mat-label>
              <input matInput type="number" formControlName="capacity">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Unidade</mat-label>
              <mat-select formControlName="capacityUnit">
                <mat-option value="DWT">DWT</mat-option>
                <mat-option value="TEU">TEU</mat-option>
                <mat-option value="MT">MT</mat-option>
                <mat-option value="CEU">CEU</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Operador</mat-label>
              <input matInput formControlName="operator">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Número da Viagem</mat-label>
              <input matInput formControlName="voyageNumber">
            </mat-form-field>
          </div>
        </form>
      </div>
      <div class="dialog-footer">
        <button mat-button (click)="onCancel()">Cancelar</button>
        <button mat-raised-button color="primary" [disabled]="form.invalid" (click)="onSubmit()">Adicionar Navio</button>
      </div>
    </div>
  `,
  styles: [`
    .dialog-wrapper { display: flex; flex-direction: column; height: 100%; }
    .dialog-header { display: flex; align-items: center; gap: 16px; padding: 24px 24px 16px; border-bottom: 1px solid #e0e0e0; mat-icon { font-size: 32px; width: 32px; height: 32px; color: #37474f; } h2 { margin: 0; font-size: 1.3rem; } p { margin: 4px 0 0; color: #666; font-size: 0.85rem; } }
    .dialog-body { flex: 1; padding: 24px; overflow-y: auto; }
    .dialog-form { display: flex; flex-direction: column; gap: 8px; }
    .form-row { display: flex; gap: 16px; mat-form-field { flex: 1; } }
    .dialog-footer { display: flex; justify-content: flex-end; gap: 12px; padding: 16px 24px; flex-shrink: 0; background: #fafafa; border-top: 1px solid #e0e0e0; }
  `]
})
export class NovoNavioDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<NovoNavioDialogComponent>);

  form: FormGroup = this.fb.group({
    vesselName: ['', Validators.required],
    imoNumber: ['', [Validators.required, Validators.pattern(/^\d{7}$/)]],
    flag: ['', Validators.required],
    vesselType: ['', Validators.required],
    capacity: [null, [Validators.required, Validators.min(1)]],
    capacityUnit: ['DWT', Validators.required],
    operator: ['', Validators.required],
    voyageNumber: ['']
  });

  onSubmit(): void { if (this.form.valid) this.dialogRef.close(this.form.value); }
  onCancel(): void { this.dialogRef.close(); }
}
