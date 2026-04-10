import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

interface DialogData {
  template?: any;
  isEditMode: boolean;
}

@Component({
  selector: 'app-template-full-dialog',
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
    MatSlideToggleModule,
    MatChipsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="template-dialog-container" style="width: 100%; max-width: 1200px;">
      <!-- HEADER -->
      <div mat-dialog-title class="dialog-header" style="display: flex; align-items: center; justify-content: space-between; padding: 16px 24px; border-bottom: 1px solid #e0e0e0;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <mat-icon color="primary" style="font-size: 28px;">{{ isEditMode ? 'edit' : 'add_circle' }}</mat-icon>
          <h2 style="margin: 0; font-size: 24px; font-weight: 500;">{{ isEditMode ? 'Editar' : 'Criar' }} Template de Contrato</h2>
          @if (isEditMode && templateForm.get('active')?.value) {
            <mat-chip color="primary" selected>Ativo</mat-chip>
          }
        </div>
        <button mat-icon-button mat-dialog-close>
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- CONTENT WITH TABS -->
      <mat-dialog-content class="dialog-content" style="max-height: 70vh; overflow-y: auto; padding: 0;">
        
        <mat-tab-group [(selectedIndex)]="selectedTabIndex" style="min-height: 500px;">
          
          <!-- ABA 1: GERAL -->
          <mat-tab label="🏷️ Geral">
            <div style="padding: 24px;">
              <form [formGroup]="templateForm">
                <div style="display: grid; gap: 16px;">
                  
                  <mat-form-field appearance="outline">
                    <mat-label>Nome do Template *</mat-label>
                    <input matInput formControlName="template_name" placeholder="Ex: Exportação Soja China CIF">
                    @if (templateForm.get('template_name')?.hasError('required') && templateForm.get('template_name')?.touched) {
                      <mat-error>Nome é obrigatório</mat-error>
                    }
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Descrição</mat-label>
                    <textarea matInput formControlName="description" rows="3" placeholder="Descrição detalhada do template"></textarea>
                  </mat-form-field>

                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <mat-form-field appearance="outline">
                      <mat-label>Tipo de Contrato *</mat-label>
                      <mat-select formControlName="contract_type">
                        <mat-option value="export">Exportação</mat-option>
                        <mat-option value="import">Importação</mat-option>
                      </mat-select>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Versão *</mat-label>
                      <input matInput formControlName="version" placeholder="1.0">
                    </mat-form-field>
                  </div>

                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <mat-form-field appearance="outline">
                      <mat-label>Padrão Organizacional *</mat-label>
                      <mat-select formControlName="organization_standard">
                        <mat-option value="GAFTA">GAFTA</mat-option>
                        <mat-option value="FOSFA">FOSFA</mat-option>
                        <mat-option value="ICC">ICC</mat-option>
                        <mat-option value="ANEC">ANEC</mat-option>
                      </mat-select>
                    </mat-form-field>

                    <div style="display: flex; align-items: center; padding-top: 8px;">
                      <mat-slide-toggle formControlName="active">Template Ativo</mat-slide-toggle>
                    </div>
                  </div>

                </div>
              </form>
            </div>
          </mat-tab>

          <!-- ABA 2: COMERCIAL -->
          <mat-tab label="💼 Comercial">
            <div style="padding: 24px;">
              <form [formGroup]="templateForm">
                <div style="display: grid; gap: 16px;">
                  
                  <mat-form-field appearance="outline">
                    <mat-label>Commodity *</mat-label>
                    <mat-select formControlName="commodity">
                      <mat-option value="SOJA">Soja</mat-option>
                      <mat-option value="MILHO">Milho</mat-option>
                      <mat-option value="ACUCAR">Açúcar</mat-option>
                      <mat-option value="CAFE">Café</mat-option>
                      <mat-option value="ALGODAO">Algodão</mat-option>
                    </mat-select>
                  </mat-form-field>

                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <mat-form-field appearance="outline">
                      <mat-label>Quantidade Mínima (TM) *</mat-label>
                      <input matInput type="number" formControlName="quantity_min" placeholder="5000">
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Quantidade Máxima (TM) *</mat-label>
                      <input matInput type="number" formControlName="quantity_max" placeholder="10000">
                    </mat-form-field>
                  </div>

                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <mat-form-field appearance="outline">
                      <mat-label>Preço Padrão *</mat-label>
                      <input matInput type="number" formControlName="default_price" placeholder="450.00">
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Incoterm *</mat-label>
                      <mat-select formControlName="incoterm">
                        <mat-option value="FOB">FOB - Free on Board</mat-option>
                        <mat-option value="CIF">CIF - Cost, Insurance and Freight</mat-option>
                        <mat-option value="CFR">CFR - Cost and Freight</mat-option>
                        <mat-option value="FAS">FAS - Free Alongside Ship</mat-option>
                      </mat-select>
                    </mat-form-field>
                  </div>

                  <mat-form-field appearance="outline">
                    <mat-label>Especificações do Produto</mat-label>
                    <textarea matInput formControlName="commodity_grade" rows="3" placeholder="Especificações técnicas, qualidade, etc."></textarea>
                  </mat-form-field>

                </div>
              </form>
            </div>
          </mat-tab>

          <!-- ABA 3: FINANCEIRO -->
          <mat-tab label="💰 Financeiro">
            <div style="padding: 24px;">
              <form [formGroup]="templateForm">
                <div style="display: grid; gap: 16px;">
                  
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <mat-form-field appearance="outline">
                      <mat-label>Moeda *</mat-label>
                      <mat-select formControlName="currency">
                        <mat-option value="USD">USD - Dólar Americano</mat-option>
                        <mat-option value="EUR">EUR - Euro</mat-option>
                        <mat-option value="BRL">BRL - Real Brasileiro</mat-option>
                      </mat-select>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Termos de Pagamento *</mat-label>
                      <mat-select formControlName="payment_terms">
                        <mat-option value="LC_SIGHT">LC à Vista</mat-option>
                        <mat-option value="LC_30D">LC 30 dias</mat-option>
                        <mat-option value="LC_60D">LC 60 dias</mat-option>
                        <mat-option value="CAD">Pagamento contra documentos</mat-option>
                      </mat-select>
                    </mat-form-field>
                  </div>

                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <mat-form-field appearance="outline">
                      <mat-label>Dias para Pagamento</mat-label>
                      <input matInput type="number" formControlName="payment_days" placeholder="30">
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Tipo de Preço</mat-label>
                      <mat-select formControlName="price_type">
                        <mat-option value="FIXED">Preço Fixo</mat-option>
                        <mat-option value="FLOATING">Preço Flutuante</mat-option>
                        <mat-option value="TO_BE_FIXED">A Fixar</mat-option>
                      </mat-select>
                    </mat-form-field>
                  </div>

                  <mat-form-field appearance="outline">
                    <mat-label>Condições Financeiras Especiais</mat-label>
                    <textarea matInput rows="3" placeholder="Condições especiais de pagamento, descontos, etc."></textarea>
                  </mat-form-field>

                </div>
              </form>
            </div>
          </mat-tab>

          <!-- ABA 4: LOGÍSTICA -->
          <mat-tab label="🚛 Logística">
            <div style="padding: 24px;">
              <form [formGroup]="templateForm">
                <div style="display: grid; gap: 16px;">
                  
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <mat-form-field appearance="outline">
                      <mat-label>Porto/Local Origem</mat-label>
                      <input matInput formControlName="port_origin" placeholder="Santos, SP">
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Porto/Local Destino</mat-label>
                      <input matInput formControlName="port_destination" placeholder="Shanghai, China">
                    </mat-form-field>
                  </div>

                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <mat-form-field appearance="outline">
                      <mat-label>Início do Período (dias)</mat-label>
                      <input matInput type="number" formControlName="shipment_period_start" placeholder="30">
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Fim do Período (dias)</mat-label>
                      <input matInput type="number" formControlName="shipment_period_end" placeholder="60">
                    </mat-form-field>
                  </div>

                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <mat-form-field appearance="outline">
                      <mat-label>Tipo de Envio</mat-label>
                      <mat-select formControlName="shipment_type">
                        <mat-option value="MARITIME">Marítimo</mat-option>
                        <mat-option value="ROAD">Rodoviário</mat-option>
                        <mat-option value="RAIL">Ferroviário</mat-option>
                        <mat-option value="AIR">Aéreo</mat-option>
                      </mat-select>
                    </mat-form-field>

                    <div style="display: flex; flex-direction: column; gap: 8px; padding-top: 8px;">
                      <mat-slide-toggle formControlName="partial_shipment_allowed">Embarque Parcial Permitido</mat-slide-toggle>
                      <mat-slide-toggle formControlName="transshipment_allowed">Transbordo Permitido</mat-slide-toggle>
                    </div>
                  </div>

                </div>
              </form>
            </div>
          </mat-tab>

          <!-- ABA 5: CLÁUSULAS -->
          <mat-tab label="📜 Cláusulas">
            <div style="padding: 24px;">
              <form [formGroup]="templateForm">
                <div style="display: grid; gap: 16px;">
                  
                  <mat-form-field appearance="outline">
                    <mat-label>Template do Texto Contratual</mat-label>
                    <textarea matInput formControlName="contract_text_template" rows="4" placeholder="Template base para o texto do contrato..."></textarea>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Especificações de Qualidade</mat-label>
                    <textarea matInput formControlName="quality_specification" rows="3" placeholder="Especificações de qualidade, tolerâncias, inspeção..."></textarea>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Cláusulas de Force Majeure</mat-label>
                    <textarea matInput formControlName="force_majeure_clause" rows="3" placeholder="Condições de força maior, eventos cobertos..."></textarea>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Cláusulas de Arbitragem</mat-label>
                    <mat-select formControlName="arbitration_clause">
                      <mat-option value="LONDON">Londres</mat-option>
                      <mat-option value="PARIS">Paris</mat-option>
                      <mat-option value="SINGAPORE">Singapura</mat-option>
                      <mat-option value="SAO_PAULO">São Paulo</mat-option>
                    </mat-select>
                  </mat-form-field>

                </div>
              </form>
            </div>
          </mat-tab>

          <!-- ABA 6: IA -->
          <mat-tab label="🤖 IA">
            <div style="padding: 24px;">
              <form [formGroup]="templateForm">
                <div style="display: grid; gap: 20px;">
                  
                  <div style="display: flex; align-items: center;">
                    <mat-slide-toggle formControlName="ai_enabled">Análise de IA Habilitada</mat-slide-toggle>
                  </div>

                  @if (templateForm.get('ai_enabled')?.value) {
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #2196f3;">
                      <h3 style="margin-top: 0; color: #1976d2;">Configurações de Inteligência Artificial</h3>
                      
                      <div style="display: grid; gap: 16px;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                          <div>
                            <mat-slide-toggle formControlName="ai_auto_fill">Preenchimento Automático</mat-slide-toggle>
                            <p style="font-size: 12px; color: #666; margin: 4px 0 0 0;">IA sugere valores baseados em templates similares</p>
                          </div>
                          <div>
                            <mat-slide-toggle formControlName="ai_risk_analysis">Análise de Riscos</mat-slide-toggle>
                            <p style="font-size: 12px; color: #666; margin: 4px 0 0 0;">Identifica potenciais riscos nos termos</p>
                          </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                          <div>
                            <mat-slide-toggle formControlName="ai_suggest_incoterm">Sugestão de Incoterms</mat-slide-toggle>
                            <p style="font-size: 12px; color: #666; margin: 4px 0 0 0;">Sugere incoterms baseados no destino</p>
                          </div>
                          <div>
                            <mat-slide-toggle formControlName="ai_generate_contract_text">Geração de Texto Contratual</mat-slide-toggle>
                            <p style="font-size: 12px; color: #666; margin: 4px 0 0 0;">Gera cláusulas automaticamente</p>
                          </div>
                        </div>

                        <div>
                          <mat-slide-toggle formControlName="ai_compliance_check">Verificação de Conformidade</mat-slide-toggle>
                          <p style="font-size: 12px; color: #666; margin: 4px 0 0 0;">Verifica conformidade com padrões internacionais</p>
                        </div>
                      </div>
                    </div>
                  }

                </div>
              </form>
            </div>
          </mat-tab>

        </mat-tab-group>

      </mat-dialog-content>

      <!-- FOOTER ACTIONS -->
      <mat-dialog-actions class="dialog-actions" style="display: flex; justify-content: space-between; padding: 16px 24px; border-top: 1px solid #e0e0e0;">
        <div>
          <button mat-button mat-dialog-close>Cancelar</button>
        </div>
        <div style="display: flex; gap: 12px; align-items: center;">
          <button mat-button (click)="onValidate()" [disabled]="templateForm.invalid">
            <mat-icon>check_circle</mat-icon>
            Validar
          </button>
          <button mat-raised-button color="primary" (click)="onSave()" [disabled]="templateForm.invalid || isSaving">
            @if (isSaving) {
              <mat-spinner diameter="20" style="margin-right: 8px;"></mat-spinner>
            } @else {
              <mat-icon>save</mat-icon>
            }
            {{ isEditMode ? 'Atualizar' : 'Criar' }} Template
          </button>
        </div>
      </mat-dialog-actions>

    </div>
  `,
  styles: [`
    .template-dialog-container {
      min-width: 800px;
      max-width: 1200px;
    }
    
    .dialog-header h2 {
      color: #333;
    }
    
    .dialog-content {
      min-height: 500px;
    }
    
    .mat-mdc-form-field {
      width: 100%;
    }
    
    .mat-mdc-tab-group {
      --mdc-tab-indicator-active-indicator-color: #1976d2;
    }
    
    .mat-mdc-slide-toggle {
      --mdc-switch-selected-track-color: #1976d2;
    }
    
    .mat-mdc-dialog-content {
      overflow: visible !important;
      max-height: none !important;
    }
  `]
})
export class TemplateFullDialogComponent {
  templateForm: FormGroup;
  selectedTabIndex = 0;
  isEditMode: boolean;
  isSaving = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<TemplateFullDialogComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.isEditMode = data.isEditMode;
    this.templateForm = this.createForm();

    if (this.isEditMode && data.template) {
      this.loadTemplate(data.template);
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      // Aba Geral
      template_name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      contract_type: ['export', [Validators.required]],
      version: ['1.0', [Validators.required]],
      organization_standard: ['GAFTA', [Validators.required]],
      active: [true],

      // Aba Comercial
      commodity: ['SOJA', [Validators.required]],
      quantity_min: [5000, [Validators.required, Validators.min(1)]],
      quantity_max: [10000, [Validators.required, Validators.min(1)]],
      default_price: [450, [Validators.required, Validators.min(0)]],
      incoterm: ['FOB', [Validators.required]],
      commodity_grade: [''],

      // Aba Financeiro
      currency: ['USD', [Validators.required]],
      payment_terms: ['LC_SIGHT', [Validators.required]],
      payment_days: [30],
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

  private loadTemplate(template: any): void {
    this.templateForm.patchValue({
      template_name: template.template_name || '',
      description: template.description || '',
      contract_type: template.contract_type || 'export',
      version: template.version || '1.0',
      organization_standard: template.organization_standard || 'GAFTA',
      active: template.active !== false,
      commodity: template.commodity || 'SOJA',
      currency: template.currency || 'USD',
      quantity_min: template.quantity_min || 5000,
      quantity_max: template.quantity_max || 10000,
      default_price: template.default_price || 450,
      incoterm: template.incoterm || 'FOB',
      payment_terms: template.payment_terms || 'LC_SIGHT'
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
  }

  onValidate(): void {
    if (this.templateForm.valid) {
      this.snackBar.open('✅ Template válido! Todos os campos obrigatórios foram preenchidos.', 'Fechar', {
        duration: 3000
      });
    } else {
      this.templateForm.markAllAsTouched();
      this.snackBar.open('❌ Template inválido! Verifique os campos obrigatórios.', 'Fechar', {
        duration: 4000
      });
      this.goToFirstErrorTab();
    }
  }

  onSave(): void {
    if (this.templateForm.invalid) {
      this.onValidate();
      return;
    }

    this.isSaving = true;

    // Simular salvamento
    setTimeout(() => {
      const formData = this.templateForm.value;
      
      const templateData = {
        ...formData,
        template_id: this.isEditMode ? this.data.template?.template_id : undefined,
        created_at: this.isEditMode ? this.data.template?.created_at : new Date(),
        updated_at: new Date(),
        ai_config: {
          ai_enabled: formData.ai_enabled,
          ai_auto_fill: formData.ai_auto_fill,
          ai_risk_analysis: formData.ai_risk_analysis,
          ai_suggest_incoterm: formData.ai_suggest_incoterm,
          ai_generate_contract_text: formData.ai_generate_contract_text,
          ai_compliance_check: formData.ai_compliance_check
        }
      };

      this.snackBar.open(
        `✅ Template ${this.isEditMode ? 'atualizado' : 'criado'} com sucesso!`, 
        'Fechar', 
        { duration: 3000 }
      );

      this.isSaving = false;
      this.dialogRef.close(templateData);
    }, 1500);
  }

  private goToFirstErrorTab(): void {
    const tabErrors = [
      ['template_name', 'contract_type', 'version', 'organization_standard'],
      ['commodity', 'quantity_min', 'quantity_max', 'default_price', 'incoterm'],
      ['currency', 'payment_terms'],
      [],
      [],
      []
    ];

    for (let i = 0; i < tabErrors.length; i++) {
      const hasError = tabErrors[i].some(field => {
        const control = this.templateForm.get(field);
        return control && control.invalid;
      });

      if (hasError) {
        this.selectedTabIndex = i;
        break;
      }
    }
  }
}