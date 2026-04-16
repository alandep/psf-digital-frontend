import { Component, OnInit, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-logistica',
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
    MatChipsModule
  ],
  template: `
    <div class="logistica-container">
      <mat-card class="logistica-card">
        <mat-card-header>
          <div mat-card-avatar class="logistica-avatar">
            <mat-icon>local_shipping</mat-icon>
          </div>
          <mat-card-title>Logística & Transporte</mat-card-title>
          <mat-card-subtitle>Configure origem, destino e modalidades de transporte</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="form" class="logistica-form">
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Porto de Origem</mat-label>
                <mat-select formControlName="portOrigin" required>
                  <mat-option value="BRSSZ">Santos, SP</mat-option>
                  <mat-option value="BRPNG">Paranaguá, PR</mat-option>
                  <mat-option value="BRRIO">Rio de Janeiro, RJ</mat-option>
                </mat-select>
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>Porto de Destino</mat-label>
                <mat-select formControlName="portDestination" required>
                  <mat-option value="USNYC">New York, NY</mat-option>
                  <mat-option value="NLRTM">Rotterdam, NL</mat-option>
                  <mat-option value="BEANR">Antwerp, BE</mat-option>
                </mat-select>
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>Modo de Transporte</mat-label>
                <mat-select formControlName="transportMode" required>
                  <mat-option value="Marítimo">Marítimo</mat-option>
                  <mat-option value="Aéreo">Aéreo</mat-option>
                  <mat-option value="Terrestre">Terrestre</mat-option>
                  <mat-option value="Multimodal">Multimodal</mat-option>
                </mat-select>
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>ETD (Estimated Time of Departure)</mat-label>
                <input matInput type="date" formControlName="etd">
                <mat-icon matSuffix>schedule</mat-icon>
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>ETA (Estimated Time of Arrival)</mat-label>
                <input matInput type="date" formControlName="eta">
                <mat-icon matSuffix>schedule</mat-icon>
              </mat-form-field>
            </div>
            
            <div class="logistics-summary">
              <mat-card class="summary-card">
                <mat-card-content>
                  <h4>Resumo Logístico</h4>
                  <div class="summary-chips">
                    <mat-chip-set>
                      <mat-chip>
                        <mat-icon>trending_up</mat-icon>
                        {{ form.get('transportMode')?.value || 'Não selecionado' }}
                      </mat-chip>
                      <mat-chip [color]="form.valid ? 'primary' : 'warn'">
                        {{ form.valid ? 'Configurado' : 'Pendente' }}
                      </mat-chip>
                    </mat-chip-set>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .logistica-container {
      padding: 0;
    }
    
    .logistica-card {
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    
    .logistica-avatar {
      background: linear-gradient(135deg, #f57c00, #ffb74d);
      color: white;
    }
    
    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    
    .summary-card {
      background: #fff3e0;
      border: 1px solid #ffcc02;
    }
    
    .summary-chips {
      margin-top: 12px;
    }
  `]
})
export class LogisticaComponent implements OnInit {
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
      portOrigin: ['', Validators.required],
      portDestination: ['', Validators.required],
      transportMode: ['Marítimo', Validators.required],
      etd: [null],
      eta: [null]
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
}