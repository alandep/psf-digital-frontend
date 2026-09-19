import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-novo-cenario-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './novo-cenario-dialog.component.html',
  styleUrls: ['./novo-cenario-dialog.component.scss']
})
export class NovoCenarioDialogComponent {
  private dialogRef = inject(MatDialogRef<NovoCenarioDialogComponent>);
  private fb = inject(FormBuilder);

  form: FormGroup;
  tipos = ['OTIMISTA', 'BASE', 'CONSERVADOR', 'ADVERSO'];
  riscos = ['Baixo', 'Médio', 'Alto', 'Crítico'];

  constructor() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      tipo: ['BASE', Validators.required],
      product: ['', Validators.required],
      country: ['', Validators.required],
      volume: [0, [Validators.required, Validators.min(0)]],
      exchangeRate: [5.0, [Validators.required, Validators.min(0)]],
      margin: [0, Validators.required],
      marginPercent: [0, Validators.required],
      revenue: [0, [Validators.required, Validators.min(0)]],
      riskLevel: ['Baixo', Validators.required]
    });
  }

  cancel(): void {
    this.dialogRef.close(null);
  }

  save(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}
