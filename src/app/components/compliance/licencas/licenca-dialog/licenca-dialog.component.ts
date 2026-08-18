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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';

// Types
import { LicenseType } from '../../../../../types/licencas';

export interface LicencaDialogData {
  licenseTypes: LicenseType[];
  regulatoryBodies: string[];
  countries: string[];
}

@Component({
  selector: 'app-licenca-dialog',
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
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule
  ],
  templateUrl: './licenca-dialog.component.html',
  styleUrls: ['./licenca-dialog.component.scss']
})
export class LicencaDialogComponent {
  private dialogRef = inject(MatDialogRef<LicencaDialogComponent>);
  public data: LicencaDialogData = inject(MAT_DIALOG_DATA);
  private formBuilder = inject(FormBuilder);

  // Form
  licenseForm!: FormGroup;

  // Companies for select
  companies: string[] = [
    'Agro Export Brasil Ltda',
    'Brazilian Commodities SA',
    'Export Excellence Corp'
  ];

  // Products for select
  products: string[] = [
    'Soja em Grãos',
    'Milho',
    'Café Arábica',
    'Açúcar Cristal',
    'Carne Bovina'
  ];

  constructor() {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.licenseForm = this.formBuilder.group({
      // Dados Gerais
      licenseNumber: [{ value: this.generateLicenseNumber(), disabled: true }],
      licenseType: ['', Validators.required],
      company: ['', Validators.required],
      productName: ['', Validators.required],
      destinationCountry: ['', Validators.required],
      regulatoryBody: ['', Validators.required],
      issueDate: [new Date()],
      expiryDate: [null, Validators.required],
      responsibleUser: ['', Validators.required],
      observations: [''],

      // Vinculações
      linkedExportNumber: [''],
      linkedProductCode: [''],
      linkedContractNumber: ['']
    });
  }

  private generateLicenseNumber(): string {
    const now = new Date();
    const year = now.getFullYear();
    const seq = String(Math.floor(Math.random() * 99999) + 1).padStart(5, '0');
    return `LIC-${year}-${seq}`;
  }

  close(): void {
    this.dialogRef.close(null);
  }

  save(): void {
    if (this.licenseForm.invalid) return;
    const formValue = this.licenseForm.getRawValue();
    this.dialogRef.close(formValue);
  }
}
