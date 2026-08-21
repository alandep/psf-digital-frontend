import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import {
  Transportadora,
  ModalType,
  CarrierStatus
} from '../../../../../types/transportadoras';

export interface TransportadoraFormDialogData {
  modals: ModalType[];
  states: string[];
  statuses: CarrierStatus[];
}

@Component({
  selector: 'app-transportadora-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    MatDialogModule
  ],
  templateUrl: './transportadora-form-dialog.component.html',
  styleUrls: ['./transportadora-form-dialog.component.scss']
})
export class TransportadoraFormDialogComponent {

  private formBuilder = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<TransportadoraFormDialogComponent>);

  form: FormGroup;

  modals: ModalType[];
  states: string[];
  statuses: CarrierStatus[];

  constructor(@Inject(MAT_DIALOG_DATA) public data: TransportadoraFormDialogData) {
    this.modals = data.modals || [];
    this.states = data.states || [];
    this.statuses = data.statuses || [];

    this.form = this.formBuilder.group({
      razaoSocial: ['', Validators.required],
      nomeFantasia: ['', Validators.required],
      cnpj: ['', Validators.required],
      modalPrincipal: ['RODOVIÁRIO', Validators.required],
      country: ['Brasil'],
      state: [''],
      city: [''],
      address: [''],
      commercialContact: [''],
      phone: [''],
      email: ['', Validators.email],
      website: [''],
      status: ['HOMOLOGAÇÃO', Validators.required],
      costPerTon: [0]
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value;
    const result: Partial<Transportadora> = {
      ...value,
      costPerTon: Number(value.costPerTon) || 0,
      aiScore: 0,
      avgSLA: 0,
      overallRating: 0,
      totalDeliveries: 0,
      onTimeRate: 0
    };

    this.dialogRef.close(result);
  }
}
