import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { Subject, takeUntil } from 'rxjs';

// Interfaces
interface CertificationDialogData {
  certification?: any;
  isCreating?: boolean;
  isEditing?: boolean;
  certificationTypes?: string[];
  productCategories?: string[];
  destinationCountries?: string[];
  issuingAuthorities?: string[];
  certificationCategories?: string[];
  countryCompliances?: any[];
  aiSuggestions?: any[];
}

@Component({
  selector: 'app-certification-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatTabsModule,
    MatSlideToggleModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDividerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatAutocompleteModule,
    MatProgressBarModule,
    MatListModule,
    MatExpansionModule,
    DragDropModule
  ],
  templateUrl: './certification-dialog.component.html',
  styleUrls: ['./certification-dialog.component.scss']
})
export class CertificationDialogComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  certificationForm!: FormGroup;
  selectedTabIndex = 0;
  isLoading = false;

  // Dados do diálogo
  certification: any;
  isCreating: boolean = false;
  isEditing: boolean = false;
  certificationTypes: string[] = [];
  productCategories: string[] = [];
  destinationCountries: string[] = [];
  issuingAuthorities: string[] = [];
  certificationCategories: string[] = [];
  countryCompliances: any[] = [];
  aiSuggestions: any[] = [];

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<CertificationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CertificationDialogData | null
  ) {
    // Inicializar dados do diálogo com valores padrão seguros
    this.certification = data?.certification || null;
    this.isCreating = data?.isCreating ?? true; // Default to true for new certification
    this.isEditing = data?.isEditing ?? false;
    
    this.certificationTypes = data?.certificationTypes || ['SANITARIO', 'ORIGEM', 'LOGISTICO', 'COMERCIAL'];
    this.productCategories = data?.productCategories || ['ALIMENTOS', 'BEBIDAS', 'COSMÉTICOS'];
    this.destinationCountries = data?.destinationCountries || [];
    this.issuingAuthorities = data?.issuingAuthorities || ['ANVISA', 'RECEITA FEDERAL'];
    this.certificationCategories = data?.certificationCategories || ['SANITARIO', 'ORIGEM'];
    this.countryCompliances = data?.countryCompliances || [];
    this.aiSuggestions = data?.aiSuggestions || [];

    this.initializeForm();
  }

  ngOnInit(): void {
    if (this.certification && (this.isEditing || !this.isCreating)) {
      this.populateForm(this.certification);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.certificationForm = this.fb.group({
      // TAB 1: Identificação
      identification: this.fb.group({
        product_id: ['', Validators.required],
        product_name: ['', Validators.required],
        certification_type: ['', Validators.required],
        certification_category: ['', Validators.required],
        description: ['']
      }),

      // TAB 2: Certificado
      certificate: this.fb.group({
        certification_number: ['', Validators.required],
        issuing_authority: ['', Validators.required],
        issuing_country: ['', Validators.required],
        issue_date: ['', Validators.required],
        expiry_date: [''],
        digital_signature: [false]
      }),

      // TAB 3: Integração Export
      export_integration: this.fb.group({
        export_id: [''],
        shipment_id: [''],
        due_number: [''],
        auto_attach_to_export: [false]
      }),

      // TAB 4: IA & Automação
      ai_automation: this.fb.group({
        ai_generated: [false],
        ai_document_extracted: [false],
        ai_compliance_check: [true],
        ai_confidence_score: [0],
        ai_risk_score: [0],
        ai_risk_level: ['LOW']
      }),

      // Auditoria
      audit: this.fb.group({
        created_at: [{ value: new Date().toISOString(), disabled: true }],
        created_by: [{ value: 'Sistema', disabled: true }],
        updated_at: [{ value: new Date().toISOString(), disabled: true }],
        updated_by: [{ value: 'Sistema', disabled: true }]
      })
    });
  }

  private populateForm(certification: any): void {
    if (certification) {
      this.certificationForm.patchValue({
        identification: {
          product_id: certification.product_id || '',
          product_name: certification.product_name || '',
          certification_type: certification.certification_type || '',
          certification_category: certification.certification_category || '',
          description: certification.description || ''
        },
        certificate: {
          certification_number: certification.certification_number || '',
          issuing_authority: certification.issuing_authority || '',
          issuing_country: certification.issuing_country || '',
          issue_date: certification.issue_date || '',
          expiry_date: certification.expiry_date || '',
          digital_signature: certification.digital_signature || false
        },
        export_integration: {
          export_id: certification.export_id || '',
          shipment_id: certification.shipment_id || '',
          due_number: certification.due_number || '',
          auto_attach_to_export: certification.auto_attach_to_export || false
        },
        ai_automation: {
          ai_generated: certification.ai_generated || false,
          ai_document_extracted: certification.ai_document_extracted || false,
          ai_compliance_check: certification.ai_compliance_check || true,
          ai_confidence_score: certification.ai_confidence_score || 0,
          ai_risk_score: certification.ai_risk_score || 0,
          ai_risk_level: certification.ai_risk_level || 'LOW'
        }
      });
    }
  }

  // Validação do formulário
  get isFormValid(): boolean {
    return this.certificationForm.valid;
  }

  // Salvar certificação
  saveCertification(): void {
    if (this.isFormValid && !this.isLoading) {
      this.isLoading = true;
      
      // Simular delay de processamento
      setTimeout(() => {
        const formData = {
          ...this.certificationForm.value,
          certification_id: this.certification?.certification_id || this.generateId(),
          certification_status: this.isCreating ? 'PENDING' : this.certification?.certification_status || 'PENDING',
          created_at: this.isCreating ? new Date().toISOString() : this.certification?.created_at,
          updated_at: new Date().toISOString()
        };

        this.dialogRef.close(formData);
        this.isLoading = false;
      }, 1500);
    } else {
      this.showMessage('Por favor, preencha todos os campos obrigatórios', 'error');
    }
  }

  // Cancelar diálogo
  onCancel(): void {
    this.dialogRef.close();
  }

  // Upload de documento com OCR
  processDocumentOCR(event?: any): void {
    this.showMessage('Processamento OCR + IA iniciado...', 'info');
    
    // Simular processamento OCR
    setTimeout(() => {
      // Simular dados extraídos
      const extractedData = {
        certification_number: 'CERT-' + Math.random().toString(36).substr(2, 9),
        issuing_authority: 'INMETRO',
        issuing_country: 'Brasil',
        issue_date: new Date().toISOString().split('T')[0],
        ai_confidence_score: 0.92,
        ai_document_extracted: true
      };

      this.certificationForm.patchValue({
        certificate: extractedData,
        ai_automation: {
          ai_confidence_score: extractedData.ai_confidence_score,
          ai_document_extracted: true
        }
      });

      this.showMessage('Documento processado com sucesso! Dados extraídos automaticamente.', 'success');
    }, 2000);
  }

  // Utilitários
  private generateId(): string {
    return 'cert_' + Math.random().toString(36).substr(2, 9);
  }

  formatPercentage(value: number): string {
    return (value * 100).toFixed(0) + '%';
  }

  formatDate(date: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('pt-BR');
  }

  getRiskColor(riskLevel: string): string {
    switch (riskLevel?.toUpperCase()) {
      case 'LOW': return 'primary';
      case 'MEDIUM': return 'accent';
      case 'HIGH': return 'warn';
      default: return 'primary';
    }
  }

  getComplianceColor(status: string): string {
    switch (status?.toUpperCase()) {
      case 'OK': return 'green';
      case 'WARNING': return 'orange';
      case 'ERROR': return 'red';
      default: return 'grey';
    }
  }

  trackByCertId(index: number, item: any): any {
    return item.certification_id || index;
  }

  private showMessage(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 4000,
      panelClass: [`snack-${type}`]
    });
  }
}