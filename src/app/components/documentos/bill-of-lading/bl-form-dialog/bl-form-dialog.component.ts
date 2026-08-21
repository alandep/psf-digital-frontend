import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { BillOfLading, BLType, BLStatus } from '../../../../../types/bill-of-lading';

export interface BlFormDialogData {
  mode: 'create' | 'edit';
  bl?: BillOfLading;
  types: { value: BLType; label: string }[];
  statuses: { value: BLStatus; label: string }[];
}

@Component({
  selector: 'app-bl-form-dialog',
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
    MatTooltipModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  template: `
    <div class="bl-form-dialog">
      <!-- Hero Header (Portos identity) -->
      <div class="dialog-hero">
        <div class="hero-title">
          <mat-icon class="hero-icon">sailing</mat-icon>
          <div class="hero-text">
            <h2>{{ mode === 'create' ? 'Novo Bill of Lading' : 'Editar Bill of Lading' }}</h2>
            <p class="hero-subtitle">
              {{ mode === 'create' ? 'Preencha os dados do conhecimento de embarque' : (form.value.blNumber || '') }}
            </p>
          </div>
        </div>
        <div class="hero-actions">
          <button mat-icon-button mat-dialog-close matTooltip="Fechar" class="hero-btn">
            <mat-icon>close</mat-icon>
          </button>
        </div>
      </div>

      <!-- Content -->
      <mat-dialog-content class="dialog-body">
        <form [formGroup]="form" class="bl-form">
          <!-- Identificação -->
          <h4 class="form-section-title">Identificação</h4>
          <div class="form-grid">
            <mat-form-field appearance="outline">
              <mat-label>Nº BL</mat-label>
              <input matInput formControlName="blNumber" placeholder="BL-2025-00001">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Tipo</mat-label>
              <mat-select formControlName="type">
                <mat-option *ngFor="let t of data.types" [value]="t.value">{{ t.label }}</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Status</mat-label>
              <mat-select formControlName="status">
                <mat-option *ngFor="let s of data.statuses" [value]="s.value">{{ s.label }}</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Data Emissão</mat-label>
              <input matInput [matDatepicker]="issuePicker" formControlName="issueDate">
              <mat-datepicker-toggle matIconSuffix [for]="issuePicker"></mat-datepicker-toggle>
              <mat-datepicker #issuePicker></mat-datepicker>
            </mat-form-field>
          </div>

          <!-- Partes -->
          <h4 class="form-section-title">Partes</h4>
          <div class="form-grid">
            <mat-form-field appearance="outline">
              <mat-label>Shipper</mat-label>
              <input matInput formControlName="shipper">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Consignee</mat-label>
              <input matInput formControlName="consignee">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Notify Party</mat-label>
              <input matInput formControlName="notifyParty">
            </mat-form-field>
          </div>

          <!-- Transporte -->
          <h4 class="form-section-title">Transporte</h4>
          <div class="form-grid">
            <mat-form-field appearance="outline">
              <mat-label>Vessel</mat-label>
              <input matInput formControlName="vessel">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Voyage</mat-label>
              <input matInput formControlName="voyage">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Porto Embarque</mat-label>
              <input matInput formControlName="portLoading">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Porto Descarga</mat-label>
              <input matInput formControlName="portDischarge">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Termos de Frete</mat-label>
              <mat-select formControlName="freightTerms">
                <mat-option value="PREPAID">PREPAID</mat-option>
                <mat-option value="COLLECT">COLLECT</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Peso Bruto (kg)</mat-label>
              <input matInput type="number" formControlName="grossWeight">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Medição (m³)</mat-label>
              <input matInput type="number" formControlName="measurement">
            </mat-form-field>
          </div>

          <!-- Carga -->
          <h4 class="form-section-title">Carga</h4>
          <div class="form-grid">
            <mat-form-field appearance="outline" class="full-span">
              <mat-label>Containers (separados por vírgula)</mat-label>
              <input matInput formControlName="containers" placeholder="MSKU1234567, MSKU7654321">
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-span">
              <mat-label>Observações</mat-label>
              <textarea matInput formControlName="observations" rows="3"></textarea>
            </mat-form-field>
          </div>
        </form>
      </mat-dialog-content>

      <!-- Footer -->
      <mat-dialog-actions align="end" class="dialog-footer">
        <button mat-stroked-button mat-dialog-close>Cancelar</button>
        <button mat-raised-button color="primary" [disabled]="form.invalid" (click)="onSave()">
          <mat-icon>save</mat-icon> Salvar
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styleUrls: ['./bl-form-dialog.component.scss']
})
export class BlFormDialogComponent {
  form: FormGroup;
  mode: 'create' | 'edit';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: BlFormDialogData,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<BlFormDialogComponent>
  ) {
    this.mode = data.mode;
    const bl = data.bl;
    this.form = this.fb.group({
      blNumber: [bl?.blNumber || '', Validators.required],
      type: [bl?.type || 'OBL', Validators.required],
      status: [bl?.status || 'DRAFT', Validators.required],
      shipper: [bl?.shipper || '', Validators.required],
      consignee: [bl?.consignee || '', Validators.required],
      notifyParty: [bl?.notifyParty || ''],
      vessel: [bl?.vessel || ''],
      voyage: [bl?.voyage || ''],
      portLoading: [bl?.portLoading || ''],
      portDischarge: [bl?.portDischarge || ''],
      freightTerms: [bl?.freightTerms || 'PREPAID'],
      issueDate: [bl?.issueDate ? new Date(bl.issueDate) : new Date()],
      grossWeight: [bl?.grossWeight ?? 0],
      measurement: [bl?.measurement ?? 0],
      containers: [(bl?.containers || []).join(', ')],
      observations: [bl?.observations || ''],
    });
  }

  onSave(): void {
    if (this.form.invalid) {
      return;
    }
    const v = this.form.value;
    const containers = (v.containers || '')
      .split(',')
      .map((c: string) => c.trim())
      .filter((c: string) => c.length > 0);

    const result: Partial<BillOfLading> = {
      ...(this.data.bl || {}),
      blNumber: v.blNumber,
      type: v.type,
      status: v.status,
      shipper: v.shipper,
      consignee: v.consignee,
      notifyParty: v.notifyParty,
      vessel: v.vessel,
      voyage: v.voyage,
      portLoading: v.portLoading,
      portDischarge: v.portDischarge,
      freightTerms: v.freightTerms,
      issueDate: v.issueDate,
      grossWeight: Number(v.grossWeight) || 0,
      measurement: Number(v.measurement) || 0,
      containers,
      observations: v.observations,
    };
    this.dialogRef.close(result);
  }
}
