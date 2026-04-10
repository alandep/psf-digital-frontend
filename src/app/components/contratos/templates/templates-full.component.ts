import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { ContractTemplatesMockService } from '../../../../services/contractTemplatesMockService';
import { 
  ContractTemplate, 
  TemplateFilters, 
  TemplateFilterOptions,
  CONTRACT_TYPE_LABELS,
  COMMODITY_LABELS,
  CURRENCY_LABELS,
  INCOTERM_LABELS,
  ORGANIZATION_STANDARD_LABELS
} from '../../../../types/contractTemplates';

@Component({
  selector: 'app-templates-full',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatMenuModule,
    MatDividerModule
  ],
  template: `
    <div class="templates-container" style="padding: 24px; background: linear-gradient(135deg, #e8f4fd 0%, #c3dafe 100%); min-height: 100vh;">
      
      <!-- Header -->
      <div class="header-section" style="margin-bottom: 24px;">
        <h1 style="display: flex; align-items: center; gap: 12px; color: #1565c0; margin: 0;">
          <mat-icon style="font-size: 32px; color: #2196f3;">content_copy</mat-icon>
          Templates de Contratos
        </h1>
        <p style="color: #666; margin: 8px 0 0 0;">Gestão de modelos reutilizáveis de contratos EIP</p>
      </div>

      <!-- KPIs -->
      <div class="kpis-section" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-bottom: 24px;">
        
        <mat-card class="kpi-card">
          <mat-card-content style="padding: 20px;">
            <div style="display: flex; align-items: center; gap: 16px;">
              <div style="background: #e3f2fd; padding: 12px; border-radius: 12px;">
                <mat-icon style="color: #2196f3; font-size: 24px;">library_books</mat-icon>
              </div>
              <div>
                <div style="font-size: 14px; color: #666; margin-bottom: 4px;">Templates Totais</div>
                <div style="font-size: 28px; font-weight: bold; color: #2196f3;">{{totalTemplates}}</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="kpi-card">
          <mat-card-content style="padding: 20px;">
            <div style="display: flex; align-items: center; gap: 16px;">
              <div style="background: #e8f5e8; padding: 12px; border-radius: 12px;">
                <mat-icon style="color: #4caf50; font-size: 24px;">check_circle</mat-icon>
              </div>
              <div>
                <div style="font-size: 14px; color: #666; margin-bottom: 4px;">Templates Ativos</div>
                <div style="font-size: 28px; font-weight: bold; color: #4caf50;">{{activeTemplates}}</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="kpi-card">
          <mat-card-content style="padding: 20px;">
            <div style="display: flex; align-items: center; gap: 16px;">
              <div style="background: #fff3e0; padding: 12px; border-radius: 12px;">
                <mat-icon style="color: #ff9800; font-size: 24px;">psychology</mat-icon>
              </div>
              <div>
                <div style="font-size: 14px; color: #666; margin-bottom: 4px;">Com IA Habilitada</div>
                <div style="font-size: 28px; font-weight: bold; color: #ff9800;">{{templatesComIA}}</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="kpi-card">
          <mat-card-content style="padding: 20px;">
            <div style="display: flex; align-items: center; gap: 16px;">
              <div style="background: #f3e5f5; padding: 12px; border-radius: 12px;">
                <mat-icon style="color: #9c27b0; font-size: 24px;">public</mat-icon>
              </div>
              <div>
                <div style="font-size: 14px; color: #666; margin-bottom: 4px;">Commodities</div>
                <div style="font-size: 28px; font-weight: bold; color: #9c27b0;">{{uniqueCommodities}}</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

      </div>

      <!-- Filtros -->
      <mat-card *ngIf="filterOptions" style="margin-bottom: 24px;">
        <mat-card-header>
          <mat-card-title style="display: flex; align-items: center; gap: 8px; color: #2196f3;">
            <mat-icon>filter_list</mat-icon>
            Filtros para Templates
          </mat-card-title>
          <mat-card-subtitle>Refine sua busca nos templates de contratos</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="filtroForm" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; margin-top: 16px;">
            
            <!-- Busca geral -->
            <mat-form-field appearance="outline">
              <mat-label>Busca geral</mat-label>
              <input matInput formControlName="search" placeholder="Nome, código ou descrição">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <!-- Commodity -->
            <mat-form-field appearance="outline">
              <mat-label>Commodity</mat-label>
              <mat-select formControlName="commodity" multiple>
                <mat-option *ngFor="let commodity of filterOptions.commodities" [value]="commodity.value">
                  {{commodity.label}}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <!-- Status -->
            <mat-form-field appearance="outline">
              <mat-label>Status</mat-label>
              <mat-select formControlName="active">
                <mat-option [value]="null">Todos</mat-option>
                <mat-option [value]="true">Ativos</mat-option>
                <mat-option [value]="false">Inativos</mat-option>
              </mat-select>
            </mat-form-field>

            <!-- Botões de filtro -->
            <div style="display: flex; gap: 8px; align-items: end;">
              <button mat-raised-button color="primary" (click)="applyFilters()" [disabled]="isLoading">
                <mat-icon>search</mat-icon>
                Filtrar
              </button>
              <button mat-button (click)="clearFilters()" [disabled]="isLoading">
                <mat-icon>clear</mat-icon>
                Limpar
              </button>
            </div>

          </form>
        </mat-card-content>
      </mat-card>

      <!-- Loading -->
      <div *ngIf="isLoading" style="display: flex; flex-direction: column; align-items: center; padding: 40px;">
        <mat-progress-spinner mode="indeterminate" diameter="50" color="accent"></mat-progress-spinner>
        <p style="margin-top: 16px; color: #666;">Carregando templates...</p>
      </div>

      <!-- Lista de Templates -->
      <mat-card *ngIf="!isLoading">
        <mat-card-header>
          <mat-card-title style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <mat-icon style="color: #2196f3;">content_copy</mat-icon>
              <span>Templates de Contratos</span>
              <mat-chip-listbox>
                <mat-chip style="background: #2196f3; color: white;">{{totalTemplates}} templates</mat-chip>
              </mat-chip-listbox>
            </div>
            <button mat-raised-button 
                    color="primary" 
                    (click)="showTemplateCreationInfo()">
              <mat-icon>add</mat-icon>
              Novo Template
            </button>
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          
          <!-- Grid de templates -->
          <div style="display: grid; gap: 20px; margin-top: 20px;">
            
            <div *ngFor="let template of templates" 
                 class="template-card"
                 style="padding: 24px; border: 2px solid #e3f2fd; border-radius: 16px; background: linear-gradient(135deg, #f8fdff 0%, #f0f8ff 100%); transition: all 0.3s ease;">
              
              <!-- Header do template -->
              <div style="display: grid; grid-template-columns: 1fr auto; gap: 16px; align-items: start; margin-bottom: 20px;">
                
                <!-- Info principal -->
                <div>
                  <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                    <h3 style="margin: 0; font-size: 20px; color: #1565c0;">{{template.template_name}}</h3>
                    <mat-chip [style.background]="template.active ? '#4caf50' : '#f44336'" 
                             style="color: white; font-weight: bold;">
                      <mat-icon style="margin-right: 4px; font-size: 16px;">
                        {{template.active ? 'check_circle' : 'cancel'}}
                      </mat-icon>
                      {{template.active ? 'ATIVO' : 'INATIVO'}}
                    </mat-chip>
                    
                    <!-- Badge de IA -->
                    <mat-chip *ngIf="template.ai_config.ai_enabled" 
                             style="background: #ff9800; color: white; font-size: 12px;">
                      <mat-icon style="margin-right: 4px; font-size: 14px;">psychology</mat-icon>
                      IA Habilitada
                    </mat-chip>
                  </div>
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; color: #555; font-size: 14px;">
                    <div><strong>Código:</strong> {{template.template_code}}</div>
                    <div><strong>Versão:</strong> {{template.version}}</div>
                    <div><strong>Commodity:</strong> {{getCommodityLabel(template.commodity)}}</div>
                    <div><strong>Tipo:</strong> {{getContractTypeLabel(template.contract_type)}}</div>
                  </div>
                  <div style="margin-top: 8px; color: #666; font-size: 13px;">
                    {{template.description}}
                  </div>
                </div>

                <!-- Menu de ações -->
                <div style="display: flex; gap: 8px;">
                  <button mat-fab 
                          color="primary" 
                          (click)="showEditInfo(template)"
                          matTooltip="Editar template"
                          style="transform: scale(0.8);">
                    <mat-icon>edit</mat-icon>
                  </button>
                  
                  <button mat-icon-button 
                          [matMenuTriggerFor]="templateMenu"
                          matTooltip="Mais ações"
                          style="color: #666;">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  
                  <mat-menu #templateMenu="matMenu">
                    <button mat-menu-item (click)="viewTemplate(template)">
                      <mat-icon>visibility</mat-icon>
                      Ver Detalhes
                    </button>
                    <button mat-menu-item (click)="duplicateTemplate(template)">
                      <mat-icon>content_copy</mat-icon>
                      Duplicar
                    </button>
                    <button mat-menu-item (click)="createVersion(template)">
                      <mat-icon>update</mat-icon>
                      Nova Versão
                    </button>
                    <button mat-menu-item (click)="generateContract(template)">
                      <mat-icon>description</mat-icon>
                      Gerar Contrato
                    </button>
                    <mat-divider></mat-divider>
                    <button mat-menu-item (click)="validateTemplate(template)">
                      <mat-icon>check_circle</mat-icon>
                      Validar Template
                    </button>
                    <button mat-menu-item (click)="analyzeRisk(template)">
                      <mat-icon>warning</mat-icon>
                      Analisar Riscos
                    </button>
                    <button mat-menu-item (click)="toggleActive(template)" 
                            [style.color]="template.active ? '#f44336' : '#4caf50'">
                      <mat-icon>{{template.active ? 'toggle_off' : 'toggle_on'}}</mat-icon>
                      {{template.active ? 'Desativar' : 'Ativar'}}
                    </button>
                    <mat-divider></mat-divider>
                    <button mat-menu-item (click)="deleteTemplate(template)" style="color: #f44336;">
                      <mat-icon>delete</mat-icon>
                      Excluir
                    </button>
                  </mat-menu>
                </div>
              </div>

              <!-- Detalhes comerciais -->
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 16px;">
                
                <div class="detail-item" style="background: white; padding: 12px; border-radius: 8px; text-align: center;">
                  <div style="font-size: 11px; color: #666; margin-bottom: 4px;">Incoterm</div>
                  <div style="font-weight: bold; font-size: 14px; color: #2196f3;">
                    {{template.incoterm}}
                  </div>
                </div>

                <div class="detail-item" style="background: white; padding: 12px; border-radius: 8px; text-align: center;">
                  <div style="font-size: 11px; color: #666; margin-bottom: 4px;">Moeda</div>
                  <div style="font-weight: bold; font-size: 14px; color: #4caf50;">
                    {{template.currency}}
                  </div>
                </div>

                <div class="detail-item" style="background: white; padding: 12px; border-radius: 8px; text-align: center;">
                  <div style="font-size: 11px; color: #666; margin-bottom: 4px;">Quantidade</div>
                  <div style="font-weight: bold; font-size: 12px;">
                    {{formatNumber(template.quantity_min)}}-{{formatNumber(template.quantity_max)}} {{template.quantity_unit}}
                  </div>
                </div>

                <div class="detail-item" style="background: white; padding: 12px; border-radius: 8px; text-align: center;">
                  <div style="font-size: 11px; color: #666; margin-bottom: 4px;">Pagamento</div>
                  <div style="font-weight: bold; font-size: 12px;">{{template.payment_terms.substring(0, 15)}}...</div>
                </div>
              </div>

              <!-- Footer com origem/destino -->
              <div style="background: white; padding: 12px; border-radius: 8px; border-left: 3px solid #2196f3;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                  <mat-icon style="font-size: 14px; color: #2196f3;">flight_takeoff</mat-icon>
                  <span style="font-weight: bold; color: #2196f3; font-size: 12px;">LOGÍSTICA</span>
                </div>
                <div style="display: grid; grid-template-columns: 1fr auto 1fr; gap: 12px; align-items: center; font-size: 12px;">
                  <div style="text-align: left;">
                    <div style="font-weight: bold;">{{template.port_origin.substring(0, 15)}}...</div>
                    <div style="color: #666;">Origem</div>
                  </div>
                  <mat-icon style="color: #2196f3; font-size: 16px;">arrow_forward</mat-icon>
                  <div style="text-align: right;">
                    <div style="font-weight: bold;">{{template.port_destination.substring(0, 15)}}...</div>
                    <div style="color: #666;">Destino</div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <!-- Estado vazio -->
          <div *ngIf="templates.length === 0" 
               style="text-align: center; padding: 60px 20px; color: #666;">
            <mat-icon style="font-size: 64px; color: #ccc; margin-bottom: 16px;">content_copy</mat-icon>
            <h3 style="margin: 0 0 8px 0; color: #999;">Nenhum template encontrado</h3>
            <p style="margin: 0 0 16px 0;">Crie seu primeiro template ou ajuste os filtros.</p>
            <button mat-raised-button color="primary" (click)="showTemplateCreationInfo()">
              <mat-icon>add</mat-icon>
              Criar Primeiro Template
            </button>
          </div>

        </mat-card-content>
      </mat-card>

    </div>
  `,
  styles: [`
    .templates-container {
      background: linear-gradient(135deg, #e8f4fd 0%, #c3dafe 100%);
      min-height: 100vh;
    }
    
    .template-card:hover {
      box-shadow: 0 8px 24px rgba(33, 150, 243, 0.2);
      transform: translateY(-2px);
      border-color: #2196f3;
    }
    
    .kpi-card {
      transition: transform 0.2s ease;
    }
    .kpi-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.1);
    }
    
    .detail-item {
      transition: transform 0.2s ease;
    }
    .detail-item:hover {
      transform: scale(1.05);
    }
  `]
})
export class TemplatesFullComponent implements OnInit {
  private readonly templatesService = inject(ContractTemplatesMockService);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);

  public templates: ContractTemplate[] = [];
  public filterOptions: TemplateFilterOptions | null = null;
  public isLoading = false;
  
  // KPIs
  public totalTemplates = 0;
  public activeTemplates = 0;
  public templatesComIA = 0;
  public uniqueCommodities = 0;

  public filtroForm: FormGroup;

  constructor() {
    console.log('🚀 TemplatesFullComponent inicializado!');
    
    this.filtroForm = this.fb.group({
      search: [''],
      commodity: [[]],
      active: [null]
    });
  }

  ngOnInit(): void {
    console.log('📊 Carregando templates de contratos...');
    this.loadData();
  }

  private loadData(): void {
    this.isLoading = true;
    
    // Carregar opções de filtro
    this.templatesService.getFilterOptions().subscribe({
      next: (options) => {
        console.log('✅ Opções de filtro carregadas:', options);
        this.filterOptions = options;
      },
      error: (error) => {
        console.error('❌ Erro ao carregar opções de filtro:', error);
      }
    });

    // Carregar templates
    this.loadTemplates();
  }

  private loadTemplates(additionalFilters?: Partial<TemplateFilters>): void {
    this.isLoading = true;
    
    const filters: TemplateFilters = {
      ...additionalFilters
    };
    
    this.templatesService.getTemplates(filters).subscribe({
      next: (templates) => {
        console.log('✅ Templates carregados:', templates);
        this.templates = templates;
        this.calculateKPIs();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Erro ao carregar templates:', error);
        this.isLoading = false;
        this.snackBar.open('Erro ao carregar templates', 'Fechar', { duration: 3000 });
      }
    });
  }

  private calculateKPIs(): void {
    this.totalTemplates = this.templates.length;
    this.activeTemplates = this.templates.filter(t => t.active).length;
    this.templatesComIA = this.templates.filter(t => t.ai_config.ai_enabled).length;
    this.uniqueCommodities = new Set(this.templates.map(t => t.commodity)).size;
  }

  public applyFilters(): void {
    const formValue = this.filtroForm.value;
    
    const filters: TemplateFilters = {
      search: formValue.search || undefined,
      commodity: formValue.commodity?.length ? formValue.commodity : undefined,
      active: formValue.active
    };

    console.log('🔍 Aplicando filtros para templates:', filters);
    this.loadTemplates(filters);
  }

  public clearFilters(): void {
    this.filtroForm.reset({
      search: '',
      commodity: [],
      active: null
    });
    
    this.loadTemplates();
  }

  public showTemplateCreationInfo(): void {
    this.snackBar.open('🚀 Funcionalidade completa de criação de templates será implementada em breve!', 'Fechar', { 
      duration: 5000,
      panelClass: ['info-snackbar']
    });
  }

  public showEditInfo(template: ContractTemplate): void {
    this.snackBar.open(`✏️ Edição do template "${template.template_name}" será implementada em breve!`, 'Fechar', { 
      duration: 4000 
    });
  }

  public viewTemplate(template: ContractTemplate): void {
    console.log('👁️ Visualizando template:', template.template_name);
    this.snackBar.open(`Visualizando ${template.template_name}`, 'Fechar', { duration: 3000 });
  }

  public duplicateTemplate(template: ContractTemplate): void {
    console.log('📄 Duplicando template:', template.template_name);
    
    const newName = prompt(`Digite o nome para a cópia do template:`, `${template.template_name} - Cópia`);
    if (newName && newName.trim()) {
      this.templatesService.duplicateTemplate(template.template_id!, newName.trim()).subscribe({
        next: (duplicated) => {
          this.snackBar.open('Template duplicado com sucesso!', 'Fechar', { duration: 3000 });
          this.loadTemplates();
        },
        error: (error) => {
          console.error('❌ Erro ao duplicar template:', error);
          this.snackBar.open('Erro ao duplicar template', 'Fechar', { duration: 3000 });
        }
      });
    }
  }

  public createVersion(template: ContractTemplate): void {
    console.log('🔄 Criando nova versão:', template.template_name);
    
    this.templatesService.createVersion(template.template_id!).subscribe({
      next: (newVersion) => {
        this.snackBar.open(`Nova versão ${newVersion.version} criada!`, 'Fechar', { duration: 3000 });
        this.loadTemplates();
      },
      error: (error) => {
        console.error('❌ Erro ao criar versão:', error);
        this.snackBar.open('Erro ao criar nova versão', 'Fechar', { duration: 3000 });
      }
    });
  }

  public generateContract(template: ContractTemplate): void {
    console.log('📄 Gerando contrato do template:', template.template_name);
    this.snackBar.open('Funcionalidade de geração de contrato em desenvolvimento', 'Fechar', { duration: 3000 });
  }

  public validateTemplate(template: ContractTemplate): void {
    console.log('✅ Validando template:', template.template_name);
    
    this.templatesService.validateTemplate(template).subscribe({
      next: (result) => {
        if (result.isValid) {
          this.snackBar.open('✅ Template válido!', 'Fechar', { duration: 3000 });
        } else {
          this.snackBar.open(`⚠️ ${result.errors.length} erros encontrados`, 'Fechar', { duration: 5000 });
        }
      },
      error: (error) => {
        console.error('❌ Erro na validação:', error);
        this.snackBar.open('Erro ao validar template', 'Fechar', { duration: 3000 });
      }
    });
  }

  public analyzeRisk(template: ContractTemplate): void {
    console.log('⚠️ Analisando riscos do template:', template.template_name);
    
    this.templatesService.analyzeRisk(template).subscribe({
      next: (analysis) => {
        const riskLevel = analysis.overallRisk;
        const message = `Risco ${riskLevel.toUpperCase()}: ${analysis.risks.length} riscos identificados`;
        this.snackBar.open(message, 'Fechar', { duration: 5000 });
      },
      error: (error) => {
        console.error('❌ Erro na análise de risco:', error);
        this.snackBar.open('Erro ao analisar riscos', 'Fechar', { duration: 3000 });
      }
    });
  }

  public toggleActive(template: ContractTemplate): void {
    const newStatus = !template.active;
    console.log(`🔄 ${newStatus ? 'Ativando' : 'Desativando'} template:`, template.template_name);
    
    this.templatesService.updateTemplate(template.template_id!, { active: newStatus }).subscribe({
      next: () => {
        this.snackBar.open(`Template ${newStatus ? 'ativado' : 'desativado'} com sucesso!`, 'Fechar', { duration: 3000 });
        this.loadTemplates();
      },
      error: (error) => {
        console.error('❌ Erro ao alterar status:', error);
        this.snackBar.open('Erro ao alterar status do template', 'Fechar', { duration: 3000 });
      }
    });
  }

  public deleteTemplate(template: ContractTemplate): void {
    if (confirm(`Tem certeza que deseja excluir o template "${template.template_name}"?`)) {
      console.log('🗑️ Excluindo template:', template.template_name);
      
      this.templatesService.deleteTemplate(template.template_id!).subscribe({
        next: () => {
          this.snackBar.open('Template excluído com sucesso!', 'Fechar', { duration: 3000 });
          this.loadTemplates();
        },
        error: (error) => {
          console.error('❌ Erro ao excluir template:', error);
          this.snackBar.open('Erro ao excluir template', 'Fechar', { duration: 3000 });
        }
      });
    }
  }

  // ========== HELPER METHODS ==========

  public getContractTypeLabel(type: string): string {
    return CONTRACT_TYPE_LABELS[type as keyof typeof CONTRACT_TYPE_LABELS] || type;
  }

  public getCommodityLabel(commodity: string): string {
    return COMMODITY_LABELS[commodity as keyof typeof COMMODITY_LABELS] || commodity;
  }

  public formatNumber(value: number): string {
    return new Intl.NumberFormat('pt-BR').format(value || 0);
  }
}