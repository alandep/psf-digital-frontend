import { Component, OnInit, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-documentacao',
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
    MatCheckboxModule,
    MatChipsModule,
    MatListModule
  ],
  template: `
    <div class="documentacao-container">
      <mat-card class="documentacao-card">
        <mat-card-header>
          <div mat-card-avatar class="documentacao-avatar">
            <mat-icon>description</mat-icon>
          </div>
          <mat-card-title>Documentação & Certificados</mat-card-title>
          <mat-card-subtitle>Anexe e configure a documentação necessária</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="form" class="documentacao-form">
            
            <!-- Documentos Obrigatórios -->
            <mat-card class="docs-section">
              <mat-card-header>
                <mat-card-title>Documentos Obrigatórios</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="form-grid">
                  <mat-form-field appearance="outline">
                    <mat-label>Número DUE</mat-label>
                    <input matInput formControlName="dueNumber" required>
                  </mat-form-field>
                  
                  <mat-form-field appearance="outline">
                    <mat-label>Número da Fatura</mat-label>
                    <input matInput formControlName="invoiceNumber" required>
                  </mat-form-field>
                  
                  <mat-form-field appearance="outline">
                    <mat-label>Packing List</mat-label>
                    <input matInput formControlName="packingList" required>
                  </mat-form-field>
                </div>
              </mat-card-content>
            </mat-card>
            
            <!-- Certificados Opcionais -->
            <mat-card class="certs-section">
              <mat-card-header>
                <mat-card-title>Certificados Opcionais</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <mat-list>
                  <mat-list-item>
                    <mat-checkbox formControlName="certificateOrigin">
                      Certificado de Origem
                    </mat-checkbox>
                  </mat-list-item>
                  <mat-list-item>
                    <mat-checkbox formControlName="phytosanitaryCertificate">
                      Certificado Fitossanitário
                    </mat-checkbox>
                  </mat-list-item>
                  <mat-list-item>
                    <mat-checkbox formControlName="halalCertificate">
                      Certificado Halal
                    </mat-checkbox>
                  </mat-list-item>
                </mat-list>
              </mat-card-content>
            </mat-card>
            
            <div class="docs-summary">
              <mat-card class="summary-card">
                <mat-card-content>
                  <h4>Status da Documentação</h4>
                  <div class="summary-chips">
                    <mat-chip-set>
                      <mat-chip [color]="getRequiredDocsValid() ? 'primary' : 'warn'">
                        <mat-icon>{{ getRequiredDocsValid() ? 'check_circle' : 'warning' }}</mat-icon>
                        Documentos Obrigatórios
                      </mat-chip>
                      <mat-chip color="accent">
                        <mat-icon>add_circle</mat-icon>
                        {{ getOptionalDocsCount() }} Certificados Opcionais
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
    .documentacao-container {
      padding: 0;
    }
    
    .documentacao-card {
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    
    .documentacao-avatar {
      background: linear-gradient(135deg, #388e3c, #66bb6a);
      color: white;
    }
    
    .docs-section, .certs-section {
      margin-bottom: 20px;
      background: #f8f9fa;
    }
    
    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
    }
    
    .summary-card {
      background: #e8f5e8;
      border: 1px solid #4caf50;
    }
    
    .summary-chips {
      margin-top: 12px;
    }
  `]
})
export class DocumentacaoComponent implements OnInit {
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
      // Documentos obrigatórios
      dueNumber: ['', Validators.required],
      invoiceNumber: ['', Validators.required],
      packingList: ['', Validators.required],
      
      // Certificados opcionais
      certificateOrigin: [false],
      phytosanitaryCertificate: [false],
      halalCertificate: [false]
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
  
  getRequiredDocsValid(): boolean {
    return (this.form.get('dueNumber')?.valid ?? false) && 
           (this.form.get('invoiceNumber')?.valid ?? false) && 
           (this.form.get('packingList')?.valid ?? false);
  }
  
  getOptionalDocsCount(): number {
    let count = 0;
    if (this.form.get('certificateOrigin')?.value) count++;
    if (this.form.get('phytosanitaryCertificate')?.value) count++;
    if (this.form.get('halalCertificate')?.value) count++;
    return count;
  }
}