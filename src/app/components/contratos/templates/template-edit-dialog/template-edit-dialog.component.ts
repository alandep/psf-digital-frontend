import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ContractTemplate, TemplateFilterOptions } from '../../../../../types/contractTemplates';

interface DialogData {
  template?: ContractTemplate;
  filterOptions: TemplateFilterOptions;
  isEditMode: boolean;
}

@Component({
  selector: 'app-template-edit-dialog',
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
    MatDatepickerModule,
    MatNativeDateModule,
    MatTabsModule,
    MatSlideToggleModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './template-edit-dialog.component.html',
  styleUrls: ['./template-edit-dialog.component.scss']
})
export class TemplateEditDialogComponent implements OnInit {
  templateForm: FormGroup;
  selectedTabIndex = 0;
  isEditMode: boolean;
  isSaving = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<TemplateEditDialogComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.isEditMode = data.isEditMode;
    this.templateForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.isEditMode && this.data.template) {
      this.loadTemplateData(this.data.template);
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      // Aba Geral
      template_name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      contract_type: ['export', Validators.required],
      version: [1.0, Validators.required],
      organization_standard: ['GAFTA', Validators.required],
      active: [true],

      // Aba Comercial
      commodity: ['SOJA', Validators.required],
      quantity_min: [5000, [Validators.required, Validators.min(1)]],
      quantity_max: [10000, [Validators.required, Validators.min(1)]],
      default_price: [450.00, [Validators.required, Validators.min(0)]],
      incoterm: ['FOB', Validators.required],
      commodity_grade: [''],

      // Aba Financeiro
      currency: ['USD', Validators.required],
      payment_terms: ['LC_SIGHT', Validators.required],
      payment_days: [30, [Validators.min(0)]],
      price_type: ['FIXED'],

      // Aba Logística
      port_origin: [''],
      port_destination: [''],
      shipment_period_start: [30],
      shipment_period_end: [60],
      shipment_type: ['MARITIME'],
      partial_shipment_allowed: [true],
      transshipment_allowed: [false],

      // Aba Cláusulas
      contract_text_template: [''],
      quality_specification: [''],
      force_majeure_clause: [''],
      arbitration_clause: ['LONDON'],

      // Aba IA
      ai_enabled: [true],
      ai_auto_fill: [false],
      ai_risk_analysis: [true],
      ai_suggest_incoterm: [true],
      ai_generate_contract_text: [false],
      ai_compliance_check: [true]
    });
  }

  private loadTemplateData(template: ContractTemplate): void {
    // Carregar dados básicos
    this.templateForm.patchValue({
      template_name: template.template_name,
      description: template.description,
      contract_type: template.contract_type,
      version: template.version,
      organization_standard: template.organization_standard,
      active: template.active,
      commodity: template.commodity,
      currency: template.currency
    });

    // Carregar configurações de IA se existirem
    if (template.ai_config) {
      this.templateForm.patchValue({
        ai_enabled: template.ai_config.ai_enabled,
        ai_auto_fill: template.ai_config.ai_auto_fill,
        ai_risk_analysis: template.ai_config.ai_risk_analysis,
        ai_suggest_incoterm: template.ai_config.ai_suggest_incoterm,
        ai_generate_contract_text: template.ai_config.ai_generate_contract_text,
        ai_compliance_check: template.ai_config.ai_compliance_check
      });
    }

    // Carregar outras configurações comerciais e logísticas
    this.templateForm.patchValue({
      quantity_min: template.quantity_min || 5000,
      quantity_max: template.quantity_max || 10000,
      default_price: template.default_price || 450.00,
      incoterm: template.incoterm || 'FOB',
      payment_terms: template.payment_terms || 'LC_SIGHT',
      payment_days: template.payment_days || 30,
      shipment_type: template.shipment_type || 'MARITIME',
      partial_shipment_allowed: template.partial_shipment_allowed,
      transshipment_allowed: template.transshipment_allowed
    });
  }

  public onValidate(): void {
    if (this.templateForm.valid) {
      this.snackBar.open('✅ Template válido! Todos os campos obrigatórios foram preenchidos.', 'Fechar', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    } else {
      this.markFormGroupTouched(this.templateForm);
      this.snackBar.open('❌ Template inválido! Verifique os campos obrigatórios.', 'Fechar', {
        duration: 4000,
        panelClass: ['error-snackbar']
      });
      // Ir para a primeira aba com erro
      this.goToFirstErrorTab();
    }
  }

  public onSave(): void {
    if (this.templateForm.invalid) {
      this.onValidate();
      return;
    }

    this.isSaving = true;

    // Simular salvamento
    setTimeout(() => {
      const formData = this.templateForm.value;
      
      const templateData: Partial<ContractTemplate> = {
        template_id: this.isEditMode ? this.data.template?.template_id : undefined,
        template_name: formData.template_name,
        description: formData.description,
        contract_type: formData.contract_type,
        version: formData.version,
        organization_standard: formData.organization_standard,
        commodity: formData.commodity,
        currency: formData.currency,
        active: formData.active,
        ai_config: {
          ai_enabled: formData.ai_enabled,
          ai_auto_fill: formData.ai_auto_fill,
          ai_risk_analysis: formData.ai_risk_analysis,
          ai_suggest_incoterm: formData.ai_suggest_incoterm,
          ai_generate_contract_text: formData.ai_generate_contract_text,
          ai_compliance_check: formData.ai_compliance_check
        },
        created_at: this.isEditMode ? this.data.template?.created_at : new Date(),
        updated_at: new Date(),
        created_by: this.isEditMode ? this.data.template?.created_by : 'current_user'
      };

      this.isSaving = false;
      this.dialogRef.close(templateData);
    }, 1500);
  }

  public onCancel(): void {
    this.dialogRef.close();
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  private goToFirstErrorTab(): void {
    const tabErrors = [
      // Aba 0: Geral
      ['template_name', 'contract_type', 'version', 'organization_standard'],
      // Aba 1: Comercial  
      ['commodity', 'quantity_min', 'quantity_max', 'default_price', 'incoterm'],
      // Aba 2: Financeiro
      ['currency', 'payment_terms'],
      // Aba 3: Logística
      ['shipment_type'],
      // Aba 4: Cláusulas (sem campos obrigatórios)
      [],
      // Aba 5: IA
      []
    ];

    for (let i = 0; i < tabErrors.length; i++) {
      const tabFields = tabErrors[i];
      const hasError = tabFields.some(field => {
        const control = this.templateForm.get(field);
        return control && control.invalid;
      });

      if (hasError) {
        this.selectedTabIndex = i;
        break;
      }
    }
  }

  // Getters para facilitar acesso aos controles no template
  get templateNameControl() { return this.templateForm.get('template_name'); }
  get commodityControl() { return this.templateForm.get('commodity'); }
  get quantityMinControl() { return this.templateForm.get('quantity_min'); }
  get quantityMaxControl() { return this.templateForm.get('quantity_max'); }
  get aiEnabledControl() { return this.templateForm.get('ai_enabled'); }
}