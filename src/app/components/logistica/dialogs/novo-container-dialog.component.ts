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
  selector: 'app-novo-container-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatIconModule
  ],
  template: `
    <div class="dialog-wrapper">
      <div class="dialog-header">
        <mat-icon>inventory_2</mat-icon>
        <div>
          <h2>Novo Container</h2>
          <p>Adicionar container ao rastreamento</p>
        </div>
      </div>
      <div class="dialog-body">
        <form [formGroup]="form" class="dialog-form">
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Número do Container</mat-label>
              <input matInput formControlName="containerNumber" placeholder="ABCD1234567">
              @if (form.get('containerNumber')?.hasError('pattern')) {
                <mat-error>Formato: 4 letras + 7 dígitos (ex: MSCU1234567)</mat-error>
              }
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Tamanho</mat-label>
              <mat-select formControlName="size">
                <mat-option value="20FT">20FT</mat-option>
                <mat-option value="40FT">40FT</mat-option>
                <mat-option value="40HC">40HC</mat-option>
                <mat-option value="45HC">45HC</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Tipo</mat-label>
              <mat-select formControlName="type">
                <mat-option value="DRY">Dry</mat-option>
                <mat-option value="REEFER">Reefer</mat-option>
                <mat-option value="OPEN_TOP">Open Top</mat-option>
                <mat-option value="FLAT_RACK">Flat Rack</mat-option>
                <mat-option value="TANK">Tank</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Navio</mat-label>
              <mat-select formControlName="vessel">
                <mat-option value="MV Santos Star">MV Santos Star</mat-option>
                <mat-option value="MV Atlantic Breeze">MV Atlantic Breeze</mat-option>
                <mat-option value="MV Copacabana Bay">MV Copacabana Bay</mat-option>
                <mat-option value="MV Tropical Harvest">MV Tropical Harvest</mat-option>
                <mat-option value="MV Rio Grande Express">MV Rio Grande Express</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Booking Ref</mat-label>
              <input matInput formControlName="bookingRef">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Commodity</mat-label>
              <input matInput formControlName="commodity">
            </mat-form-field>
          </div>
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Shipper</mat-label>
              <input matInput formControlName="shipper">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Consignee</mat-label>
              <input matInput formControlName="consignee">
            </mat-form-field>
          </div>
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Free Days</mat-label>
              <input matInput type="number" formControlName="freeDays">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Taxa Demurrage (USD/dia)</mat-label>
              <input matInput type="number" formControlName="demurrageRate">
            </mat-form-field>
          </div>
        </form>
      </div>
      <div class="dialog-footer">
        <button mat-button (click)="onCancel()">Cancelar</button>
        <button mat-raised-button color="primary" [disabled]="form.invalid" (click)="onSubmit()">Adicionar Container</button>
      </div>
    </div>
  `,
  styles: [`
    .dialog-wrapper { display: flex; flex-direction: column; height: 100%; }
    .dialog-header { display: flex; align-items: center; gap: 16px; padding: 24px 24px 16px; border-bottom: 1px solid #e0e0e0; mat-icon { font-size: 32px; width: 32px; height: 32px; color: #5d4037; } h2 { margin: 0; font-size: 1.3rem; } p { margin: 4px 0 0; color: #666; font-size: 0.85rem; } }
    .dialog-body { flex: 1; padding: 24px; overflow-y: auto; }
    .dialog-form { display: flex; flex-direction: column; gap: 8px; }
    .form-row { display: flex; gap: 16px; mat-form-field { flex: 1; } }
    .dialog-footer { display: flex; justify-content: flex-end; gap: 12px; padding: 16px 24px; flex-shrink: 0; background: #fafafa; border-top: 1px solid #e0e0e0; }
  `]
})
export class NovoContainerDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<NovoContainerDialogComponent>);

  form: FormGroup = this.fb.group({
    containerNumber: ['', [Validators.required, Validators.pattern(/^[A-Z]{4}\d{7}$/)]],
    size: ['40HC', Validators.required],
    type: ['DRY', Validators.required],
    vessel: ['', Validators.required],
    bookingRef: ['', Validators.required],
    commodity: ['', Validators.required],
    shipper: ['', Validators.required],
    consignee: ['', Validators.required],
    freeDays: [14, [Validators.required, Validators.min(1)]],
    demurrageRate: [150, [Validators.required, Validators.min(0)]]
  });

  onSubmit(): void { if (this.form.valid) this.dialogRef.close(this.form.value); }
  onCancel(): void { this.dialogRef.close(); }
}
