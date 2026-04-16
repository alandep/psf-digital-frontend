import { Component, OnInit, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

@Component({
  selector: 'app-produtos',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTableModule,
    MatDividerModule,
    MatChipsModule,
    MatAutocompleteModule
  ],
  template: `
    <div class="produtos-container">
      <mat-card class="produtos-card">
        <mat-card-header>
          <div mat-card-avatar class="produtos-avatar">
            <mat-icon>inventory_2</mat-icon>
          </div>
          <mat-card-title>Produtos & Especificações</mat-card-title>
          <mat-card-subtitle>Configure produtos, quantidades e especificações técnicas</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="form" class="produtos-form">
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Produto Principal</mat-label>
                <mat-select formControlName="productId" required>
                  <mat-option value="prod_001">Soja em Grão</mat-option>
                  <mat-option value="prod_002">Milho em Grão</mat-option>
                  <mat-option value="prod_003">Açúcar Cristal</mat-option>
                </mat-select>
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>Quantidade</mat-label>
                <input matInput type="number" formControlName="quantity" required>
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>Unidade</mat-label>
                <mat-select formControlName="unit" required>
                  <mat-option value="MT">Toneladas Métricas</mat-option>
                  <mat-option value="KG">Quilogramas</mat-option>
                  <mat-option value="TON">Toneladas</mat-option>
                </mat-select>
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>Preço Unitário (USD)</mat-label>
                <input matInput type="number" formControlName="unitPrice" required>
              </mat-form-field>
            </div>
            
            <div class="summary-info">
              <mat-card class="summary-card">
                <mat-card-content>
                  <h4>Resumo</h4>
                  <p><strong>Total:</strong> {{ getTotalValue() | currency:'USD':'symbol':'1.2-2' }}</p>
                  <p><strong>Status:</strong> 
                    <mat-chip [color]="form.valid ? 'primary' : 'warn'">
                      {{ form.valid ? 'Completo' : 'Pendente' }}
                    </mat-chip>
                  </p>
                </mat-card-content>
              </mat-card>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .produtos-container {
      padding: 0;
    }
    
    .produtos-card {
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    
    .produtos-avatar {
      background: linear-gradient(135deg, #1976d2, #42a5f5);
      color: white;
    }
    
    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    
    .summary-card {
      background: #f8f9fa;
      border: 1px solid #e0e0e0;
    }
  `]
})
export class ProdutosComponent implements OnInit {
  @Input() data: any = {};
  @Output() dataChanged = new EventEmitter<any>();

  private fb = inject(FormBuilder);
  
  form!: FormGroup;
  
  ngOnInit(): void {
    this.initializeForm();
    this.setupFormObservers();
  }
  
  private initializeForm(): void {
    this.form = this.fb.group({
      productId: ['', Validators.required],
      quantity: [0, [Validators.required, Validators.min(1)]],
      unit: ['MT', Validators.required],
      unitPrice: [0, [Validators.required, Validators.min(0.01)]]
    });
    
    if (this.data) {
      this.form.patchValue(this.data);
    }
  }
  
  private setupFormObservers(): void {
    this.form.valueChanges.subscribe(() => {
      this.emitFormData();
    });
  }
  
  private emitFormData(): void {
    const formData = {
      ...this.form.value,
      isValid: this.form.valid
    };
    
    this.dataChanged.emit(formData);
  }
  
  getTotalValue(): number {
    const quantity = this.form.get('quantity')?.value || 0;
    const unitPrice = this.form.get('unitPrice')?.value || 0;
    return quantity * unitPrice;
  }
}