import { Component, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { HEDGE_SERVICE } from '../../../../services/finance/hedge-service.token';
import { apiErrorMessage } from '../../../../services/finance/finance-utils';
import { HedgeContract, HedgeInstrumento } from '../../../../../types/hedge';

@Component({
  selector: 'app-hedge-create-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  template: `
    <h2 mat-dialog-title>Novo hedge</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="hedge-create-form" (ngSubmit)="save()" id="hedge-create-form">
        <mat-form-field appearance="outline">
          <mat-label>Instrumento</mat-label>
          <mat-select formControlName="instrumento" required>
            <mat-option *ngFor="let i of instrumentos" [value]="i.value">{{ i.label }}</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Moeda</mat-label>
          <mat-select formControlName="moeda" required>
            <mat-option *ngFor="let m of moedas" [value]="m">{{ m }}</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Nocional</mat-label>
          <input matInput type="number" min="0.01" step="0.01" formControlName="notional" required>
          <mat-error *ngIf="form.controls.notional.invalid">Informe um valor maior que zero</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Strike (opcional)</mat-label>
          <input matInput type="number" min="0.0001" step="0.0001" formControlName="strike">
          <mat-error *ngIf="form.controls.strike.invalid">O strike deve ser maior que zero</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Vencimento</mat-label>
          <input matInput [matDatepicker]="pickerVenc" formControlName="vencimento">
          <mat-datepicker-toggle matIconSuffix [for]="pickerVenc"></mat-datepicker-toggle>
          <mat-datepicker #pickerVenc></mat-datepicker>
        </mat-form-field>

        <p class="error" *ngIf="errorMessage" role="alert">{{ errorMessage }}</p>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button type="button" (click)="cancel()" [disabled]="saving">Cancelar</button>
      <button mat-raised-button color="primary" type="submit" form="hedge-create-form"
              [disabled]="form.invalid || saving">
        <mat-icon>save</mat-icon> Salvar
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .hedge-create-form { display: grid; gap: 4px; min-width: 320px; padding-top: 8px; }
    .error { color: #c62828; margin: 0; }
  `]
})
export class HedgeCreateDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<HedgeCreateDialogComponent, HedgeContract>);
  private readonly hedgeService = inject(HEDGE_SERVICE);
  private readonly destroyRef = inject(DestroyRef);

  readonly instrumentos: { value: HedgeInstrumento; label: string }[] = [
    { value: 'NDF', label: 'NDF' },
    { value: 'SWAP', label: 'Swap' },
    { value: 'OPCAO', label: 'Opção' }
  ];
  readonly moedas = ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'ARS', 'CAD', 'AUD', 'CHF'];

  saving = false;
  errorMessage = '';

  readonly form = this.fb.group({
    instrumento: this.fb.control<HedgeInstrumento>('NDF', Validators.required),
    moeda: this.fb.control('USD', Validators.required),
    notional: this.fb.control<number | null>(null, [Validators.required, Validators.min(0.01)]),
    strike: this.fb.control<number | null>(null, Validators.min(0.0001)),
    vencimento: this.fb.control<Date | null>(null)
  });

  save(): void {
    if (this.form.invalid || this.saving) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.saving = true;
    this.errorMessage = '';
    this.hedgeService
      .createContract({
        instrumento: v.instrumento ?? 'NDF',
        moeda: v.moeda ?? 'USD',
        notional: Number(v.notional),
        strike: v.strike != null && String(v.strike) !== '' ? Number(v.strike) : null,
        vencimento: v.vencimento
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (created) => this.dialogRef.close(created),
        error: (err) => {
          this.saving = false;
          this.errorMessage = apiErrorMessage(err, 'Erro ao criar o hedge');
        }
      });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
