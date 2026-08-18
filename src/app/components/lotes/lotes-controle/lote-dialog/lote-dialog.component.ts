import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// Angular Material
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';

// Types
import {
  Lote,
  LoteStatus,
  AILotScore,
  QualityInspection,
  StockMovement
} from '../../../../../types/lotes';

export interface LoteDialogData {
  lot: Lote | null;
  mode: 'view' | 'create' | 'edit';
  products: string[];
  harvests: string[];
  warehouses: { id: string; name: string }[];
  countries: string[];
  qualityInspections: QualityInspection[];
  movementHistory: StockMovement[];
  aiInsights: AILotScore | null;
}

@Component({
  selector: 'app-lote-dialog',
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
    MatTabsModule,
    MatListModule,
    MatDividerModule,
    MatProgressBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule
  ],
  templateUrl: './lote-dialog.component.html',
  styleUrls: ['./lote-dialog.component.scss']
})
export class LoteDialogComponent {
  private dialogRef = inject(MatDialogRef<LoteDialogComponent>);
  public data: LoteDialogData = inject(MAT_DIALOG_DATA);
  private formBuilder = inject(FormBuilder);

  // Forms
  createForm!: FormGroup;
  qualityForm!: FormGroup;

  constructor() {
    this.initializeForms();

    if (this.data.mode === 'edit' && this.data.lot) {
      this.populateEditForm(this.data.lot);
    }
  }

  private initializeForms(): void {
    this.createForm = this.formBuilder.group({
      productId: ['', Validators.required],
      productName: ['', Validators.required],
      harvest: ['', Validators.required],
      warehouseId: ['', Validators.required],
      warehouseName: ['', Validators.required],
      quantity: [null, [Validators.required, Validators.min(1)]],
      expiryDate: [null, Validators.required],
      destinationCountry: ['', Validators.required],
      section: ['', Validators.required],
      row: ['', Validators.required],
      position: ['', Validators.required]
    });

    this.qualityForm = this.formBuilder.group({
      humidity: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      impurity: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      protein: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      pH: [null, [Validators.required, Validators.min(0), Validators.max(14)]],
      weight: [null, [Validators.required, Validators.min(0)]],
      temperature: [null, [Validators.required, Validators.min(-40), Validators.max(60)]],
      color: ['', Validators.required],
      odor: ['', Validators.required],
      pestPresence: [false],
      labResults: [''],
      inspectedBy: ['', Validators.required]
    });
  }

  private populateEditForm(lot: Lote): void {
    this.createForm.patchValue({
      productId: lot.productId,
      productName: lot.productName,
      harvest: lot.harvest,
      warehouseId: lot.warehouseId,
      warehouseName: lot.warehouseName,
      quantity: lot.quantity,
      expiryDate: lot.expiryDate,
      destinationCountry: lot.destinationCountry,
      section: lot.physicalLocation.section,
      row: lot.physicalLocation.row,
      position: lot.physicalLocation.position
    });
  }

  // ================================
  // ACTIONS
  // ================================

  close(): void {
    this.dialogRef.close(null);
  }

  saveLot(): void {
    if (this.createForm.invalid) return;

    const formValue = this.createForm.value;
    this.dialogRef.close({
      action: this.data.mode === 'create' ? 'create' : 'update',
      data: {
        productId: formValue.productId,
        productName: formValue.productName,
        harvest: formValue.harvest,
        warehouseId: formValue.warehouseId,
        warehouseName: formValue.warehouseName,
        quantity: formValue.quantity,
        expiryDate: formValue.expiryDate,
        destinationCountry: formValue.destinationCountry,
        physicalLocation: {
          warehouseId: formValue.warehouseId,
          section: formValue.section,
          row: formValue.row,
          position: formValue.position
        }
      }
    });
  }

  saveQualityInspection(): void {
    if (this.qualityForm.invalid || !this.data.lot) return;

    const formValue = this.qualityForm.value;
    this.dialogRef.close({
      action: 'quality_inspection',
      data: {
        loteId: this.data.lot.id,
        humidity: formValue.humidity,
        impurity: formValue.impurity,
        protein: formValue.protein,
        pH: formValue.pH,
        weight: formValue.weight,
        temperature: formValue.temperature,
        color: formValue.color,
        odor: formValue.odor,
        pestPresence: formValue.pestPresence,
        labResults: formValue.labResults,
        inspectedBy: formValue.inspectedBy,
        inspectedAt: new Date()
      }
    });
  }

  // ================================
  // UTILITY METHODS
  // ================================

  formatDate(date: Date | string | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  }

  formatQuantity(value: number | undefined): string {
    if (value === undefined || value === null) return '-';
    return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(value) + ' kg';
  }

  getStatusColor(status: LoteStatus): string {
    switch (status) {
      case 'DISPONÍVEL': return 'green';
      case 'BLOQUEADO': return 'red';
      case 'QUARENTENA': return 'orange';
      case 'EM_TRÂNSITO': return 'blue';
      case 'RESERVADO': return 'purple';
      case 'ESGOTADO': return 'grey';
      default: return 'grey';
    }
  }

  getScoreColor(score: number): string {
    if (score >= 80) return 'green';
    if (score >= 50) return 'yellow';
    return 'red';
  }

  getSeverityColor(severity: string): string {
    switch (severity) {
      case 'CRITICAL': return 'red';
      case 'HIGH': return 'orange';
      case 'MEDIUM': return 'yellow';
      case 'LOW': return 'green';
      default: return 'grey';
    }
  }

  getMovementIcon(movementType: string): string {
    switch (movementType) {
      case 'ENTRY': return 'login';
      case 'BLOCK': return 'block';
      case 'UNBLOCK': return 'lock_open';
      case 'RESERVE': return 'bookmark';
      case 'EXPORT': return 'flight_takeoff';
      case 'TRANSFER': return 'swap_horiz';
      case 'STATUS_CHANGE': return 'sync';
      default: return 'history';
    }
  }

  getDialogTitle(): string {
    if (this.data.mode === 'create') return 'Novo Lote';
    if (this.data.mode === 'edit' && this.data.lot) return `Editar ${this.data.lot.loteNumber}`;
    if (this.data.lot) return this.data.lot.loteNumber;
    return 'Lote';
  }

  getDialogIcon(): string {
    if (this.data.mode === 'create') return 'add_circle';
    if (this.data.mode === 'edit') return 'edit';
    return 'inventory_2';
  }
}
