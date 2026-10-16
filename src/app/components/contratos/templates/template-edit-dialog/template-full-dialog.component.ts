import { Component, Inject, inject } from '@angular/core';
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
import { AI_SERVICE } from '../../../../services/ai/ai-service.token';
import { IAiService } from '../../../../services/ai/ai-service.interface';
import { AiAnalyzeRequest, AiAnalysisResult } from '../../../../../types/ai-hub';

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
      <div mat-dialog-title class="dialog-header">
        <div class="dialog-header__left">
          <div class="dialog-header__badge">
            <mat-icon>{{ isEditMode ? 'edit' : 'add_circle' }}</mat-icon>
          </div>
          <h2 class="dialog-header__title">{{ isEditMode ? 'Editar' : 'Criar' }} Template de Contrato</h2>
          @if (isEditMode && templateForm.get('active')?.value) {
            <span class="dialog-header__chip">Ativo</span>
          }
        </div>
        <button mat-icon-button mat-dialog-close class="dialog-header__close" aria-label="Fechar">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- CONTENT WITH TABS -->
      <mat-dialog-content class="dialog-content" style="padding: 0;">
        
        <mat-tab-group [(selectedIndex)]="selectedTabIndex" style="min-height: 320px;">
          
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

                  <div class="dialog-grid-2" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
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

                  <div class="dialog-grid-2" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
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

                  <div class="dialog-grid-2" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <mat-form-field appearance="outline">
                      <mat-label>Quantidade Mínima (TM) *</mat-label>
                      <input matInput type="number" formControlName="quantity_min" placeholder="5000">
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Quantidade Máxima (TM) *</mat-label>
                      <input matInput type="number" formControlName="quantity_max" placeholder="10000">
                    </mat-form-field>
                  </div>

                  <div class="dialog-grid-2" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
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
                  
                  <div class="dialog-grid-2" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
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

                  <div class="dialog-grid-2" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
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
                  
                  <div class="dialog-grid-2" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <mat-form-field appearance="outline">
                      <mat-label>Porto/Local Origem</mat-label>
                      <input matInput formControlName="port_origin" placeholder="Santos, SP">
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Porto/Local Destino</mat-label>
                      <input matInput formControlName="port_destination" placeholder="Shanghai, China">
                    </mat-form-field>
                  </div>

                  <div class="dialog-grid-2" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <mat-form-field appearance="outline">
                      <mat-label>Início do Período (dias)</mat-label>
                      <input matInput type="number" formControlName="shipment_period_start" placeholder="30">
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Fim do Período (dias)</mat-label>
                      <input matInput type="number" formControlName="shipment_period_end" placeholder="60">
                    </mat-form-field>
                  </div>

                  <div class="dialog-grid-2" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
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
                        <div class="dialog-grid-2" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                          <div>
                            <mat-slide-toggle formControlName="ai_auto_fill">Preenchimento Automático</mat-slide-toggle>
                            <p style="font-size: 12px; color: #666; margin: 4px 0 0 0;">IA sugere valores baseados em templates similares</p>
                          </div>
                          <div>
                            <mat-slide-toggle formControlName="ai_risk_analysis">Análise de Riscos</mat-slide-toggle>
                            <p style="font-size: 12px; color: #666; margin: 4px 0 0 0;">Identifica potenciais riscos nos termos</p>
                          </div>
                        </div>

                        <div class="dialog-grid-2" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
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

                      <div style="margin-top: 16px; display: grid; gap: 16px;">
                        <h4 style="margin: 0; color: #1976d2;">Ações de IA (agentes GCP)</h4>
                        <p style="font-size: 12px; color: #666; margin: 0;">As ações usam os agentes de IA reais (Vertex/GCP). O "Preenchimento Automático" permanece como preferência salva no template.</p>

                        @if (templateForm.get('ai_risk_analysis')?.value) {
                          <div style="display: flex; flex-direction: column; gap: 8px;">
                            <button mat-stroked-button type="button" (click)="analisarRiscos()" [disabled]="aiRunning['risco']" aria-label="Analisar riscos com IA">
                              <mat-icon>warning</mat-icon> Analisar Riscos
                            </button>
                            @if (aiRunning['risco']) { <mat-spinner diameter="20"></mat-spinner> }
                            @if (aiResults.risco) { <div style="white-space: pre-wrap; background:#f7f7f9; border:1px solid #e0e0e0; border-radius:8px; padding:12px; font-size:0.9rem;">{{ aiResults.risco }}</div> }
                          </div>
                        }
                        @if (templateForm.get('ai_compliance_check')?.value) {
                          <div style="display: flex; flex-direction: column; gap: 8px;">
                            <button mat-stroked-button type="button" (click)="verificarConformidade()" [disabled]="aiRunning['conformidade']" aria-label="Verificar conformidade com IA">
                              <mat-icon>verified</mat-icon> Verificar Conformidade
                            </button>
                            @if (aiRunning['conformidade']) { <mat-spinner diameter="20"></mat-spinner> }
                            @if (aiResults.conformidade) { <div style="white-space: pre-wrap; background:#f7f7f9; border:1px solid #e0e0e0; border-radius:8px; padding:12px; font-size:0.9rem;">{{ aiResults.conformidade }}</div> }
                          </div>
                        }
                        @if (templateForm.get('ai_suggest_incoterm')?.value) {
                          <div style="display: flex; flex-direction: column; gap: 8px;">
                            <button mat-stroked-button type="button" (click)="sugerirIncoterm()" [disabled]="aiRunning['incoterm']" aria-label="Sugerir incoterm com IA">
                              <mat-icon>lightbulb</mat-icon> Sugerir Incoterm
                            </button>
                            @if (aiRunning['incoterm']) { <mat-spinner diameter="20"></mat-spinner> }
                            @if (aiResults.incoterm) { <div style="white-space: pre-wrap; background:#f7f7f9; border:1px solid #e0e0e0; border-radius:8px; padding:12px; font-size:0.9rem;">{{ aiResults.incoterm }}</div> }
                          </div>
                        }
                        @if (templateForm.get('ai_generate_contract_text')?.value) {
                          <div style="display: flex; flex-direction: column; gap: 8px;">
                            <button mat-stroked-button type="button" (click)="gerarTextoContratual()" [disabled]="aiRunning['texto']" aria-label="Gerar texto contratual com IA">
                              <mat-icon>article</mat-icon> Gerar Texto Contratual
                            </button>
                            @if (aiRunning['texto']) { <mat-spinner diameter="20"></mat-spinner> }
                            @if (aiResults.texto) {
                              <div style="white-space: pre-wrap; background:#f7f7f9; border:1px solid #e0e0e0; border-radius:8px; padding:12px; font-size:0.9rem;">{{ aiResults.texto }}</div>
                              <button mat-button color="primary" type="button" (click)="aplicarTextoGerado()">Usar este texto nas Cláusulas</button>
                            }
                          </div>
                        }
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
      display: flex;
      flex-direction: column;
      max-height: 90vh;
      min-width: 0;
      width: 100%;
      max-width: 1200px;
    }

    @media (min-width: 800px) {
      .template-dialog-container {
        min-width: 800px;
      }
    }

    /* ===== Portos gradient hero header ===== */
    .dialog-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 18px 24px;
      margin: 0;
      background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
      color: white;
      flex-shrink: 0;
    }

    .dialog-header__left {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .dialog-header__badge {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .dialog-header__badge mat-icon {
      color: white;
      font-size: 24px;
      width: 24px;
      height: 24px;
      line-height: 24px;
    }

    .dialog-header__title {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: white;
    }

    .dialog-header__chip {
      display: inline-flex;
      align-items: center;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 500;
      color: white;
      background: rgba(255, 255, 255, 0.22);
      border: 1px solid rgba(255, 255, 255, 0.4);
    }

    .dialog-header__close {
      color: white;
    }

    .dialog-content {
      flex: 1 1 auto;
      overflow-y: auto;
      min-height: 0;
    }

    .dialog-actions {
      flex-shrink: 0;
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

    /* ===== Responsive: collapse 2-col grids on small screens ===== */
    @media (max-width: 768px) {
      .template-dialog-container {
        min-width: 0;
      }

      .dialog-grid-2 {
        grid-template-columns: 1fr !important;
      }
    }
  `]
})
export class TemplateFullDialogComponent {
  templateForm: FormGroup;
  selectedTabIndex = 0;
  isEditMode: boolean;
  isSaving = false;

  // Serviço de IA real (roteia para o BFF /bff/ai/analisar quando
  // environment.realApis.ai === true; os agentes Vertex/GCP respondem).
  private readonly ai = inject<IAiService>(AI_SERVICE);

  // Estado por capacidade: controla spinner/disabled de cada ação de IA.
  aiRunning: { [k: string]: boolean } = {};
  // Resultados retornados pelos agentes de IA, exibidos na aba IA.
  aiResults: { risco?: string; conformidade?: string; incoterm?: string; texto?: string } = {};

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

  // === AÇÕES DE IA (agentes reais Vertex/GCP via AI_SERVICE) ===

  // Monta um resumo pt-BR do template atual a partir do formulário. Esse texto
  // é o contexto enviado como `input` aos agentes de IA. Apenas campos
  // preenchidos entram no resumo.
  private construirResumoTemplate(): string {
    const form = this.templateForm.getRawValue();
    const partes: string[] = [];

    const add = (label: string, value: unknown): void => {
      if (value !== null && value !== undefined && String(value).trim() !== '') {
        partes.push(`${label}: ${value}`);
      }
    };

    add('Tipo', form.contract_type);
    add('Padrão', form.organization_standard);

    const commodity = form.commodity_grade
      ? `${form.commodity} (${form.commodity_grade})`
      : form.commodity;
    add('Commodity', commodity);

    if (form.quantity_min || form.quantity_max) {
      add('Quantidade', `${form.quantity_min ?? ''}-${form.quantity_max ?? ''}`);
    }

    if (form.default_price) {
      add('Preço', `${form.default_price} ${form.currency ?? ''}`.trim());
    }

    add('Incoterm', form.incoterm);

    if (form.payment_terms) {
      const pagamento = form.payment_days
        ? `${form.payment_terms} (${form.payment_days} dias)`
        : `${form.payment_terms}`;
      add('Pagamento', pagamento);
    }

    if (form.shipment_type || form.port_origin || form.port_destination) {
      const rota = [form.port_origin, form.port_destination].filter(Boolean).join('→');
      const embarque = [form.shipment_type, rota].filter(Boolean).join(' ');
      add('Embarque', embarque);
    }

    const clausulas = [
      form.contract_text_template,
      form.quality_specification,
      form.force_majeure_clause,
      form.arbitration_clause
    ]
      .filter(c => c !== null && c !== undefined && String(c).trim() !== '')
      .join(' | ');
    add('Cláusulas', clausulas);

    return partes.join('; ');
  }

  // Executa uma análise de IA genérica e direciona o resultado para o campo
  // correspondente em aiResults. Centraliza o padrão loading/next/error.
  private executarAcaoIa(
    key: string,
    campo: 'risco' | 'conformidade' | 'incoterm' | 'texto',
    req: AiAnalyzeRequest
  ): void {
    this.aiRunning[key] = true;
    this.aiResults[campo] = undefined;

    this.ai.analisar(req).subscribe({
      next: (res: AiAnalysisResult) => {
        this.aiResults[campo] = res.output;
        this.aiRunning[key] = false;
      },
      error: (err: unknown) => {
        this.aiRunning[key] = false;
        this.snackBar.open(this.mensagemErroIa(err), 'Fechar', { duration: 4000 });
      }
    });
  }

  public analisarRiscos(): void {
    const input =
      'Analise os riscos jurídicos e comerciais deste template de contrato de exportação e liste mitigações.\n\n' +
      this.construirResumoTemplate();
    this.executarAcaoIa('risco', 'risco', { task: 'RISK_ANALYSIS', input });
  }

  public verificarConformidade(): void {
    const standard = this.templateForm.get('organization_standard')?.value;
    const input =
      'Verifique a conformidade deste template de contrato com padrões internacionais (' +
      standard +
      ', Incoterms, cláusulas de arbitragem) e aponte não conformidades.\n\n' +
      this.construirResumoTemplate();
    this.executarAcaoIa('conformidade', 'conformidade', { task: 'RISK_ANALYSIS', input });
  }

  public sugerirIncoterm(): void {
    const input =
      'Sugira o Incoterm mais adequado (e justifique em 2-3 linhas) para uma exportação com estas características. Responda em pt-BR.\n\n' +
      this.construirResumoTemplate();
    this.executarAcaoIa('incoterm', 'incoterm', { task: 'CHAT', input });
  }

  public gerarTextoContratual(): void {
    const input =
      'Gere um texto/cláusulas de contrato de exportação (em pt-BR) coerente com os parâmetros abaixo. Seja objetivo e use linguagem jurídica adequada.\n\n' +
      this.construirResumoTemplate();
    this.executarAcaoIa('texto', 'texto', { task: 'CHAT', input });
  }

  // Aplica o texto gerado pela IA ao campo de cláusulas do template.
  public aplicarTextoGerado(): void {
    if (!this.aiResults.texto) {
      return;
    }
    this.templateForm.patchValue({ contract_text_template: this.aiResults.texto });
    this.snackBar.open('Texto contratual aplicado às cláusulas do template.', 'Fechar', {
      duration: 3000
    });
  }

  // Mapeia o Erro_IA (já normalizado pelo errorInterceptor) para uma mensagem
  // simples pt-BR exibida via snackBar, sem fallback mock (Req 14.11).
  private mensagemErroIa(err: unknown): string {
    const e = err as { status?: number; code?: string; message?: string };
    if (e?.status === 402 || e?.code === 'AI_QUOTA_EXCEEDED') {
      return 'Seus créditos de IA acabaram. Compre créditos para continuar.';
    }
    switch (e?.status) {
      case 403:
        return 'Acesso negado: você não tem permissão para usar a IA.';
      case 422:
        return 'A resposta da IA foi inválida para a solicitação enviada.';
      case 429:
        return 'Limite de uso de IA atingido. Aguarde e tente novamente.';
      case 502:
      case 503:
        return 'O serviço de IA está temporariamente indisponível. Tente novamente em instantes.';
      case 504:
        return 'O serviço de IA demorou para responder. Tente novamente.';
      default:
        return e?.message || 'Erro na classificação com IA.';
    }
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