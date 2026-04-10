import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

// Angular Material imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';

import { EmbarqueMockService } from '../../../../../services/embarqueMockService';
import { Embarque, Container, Rota, PortoInfo } from '../../../../../types/embarque';

// Interface para logs de auditoria
interface AuditLogChange {
  field: string;
  old_value: string | null;
  new_value: string;
}

interface AuditLog {
  id: number;
  action: string;
  description: string;
  user: string;
  user_name: string;
  timestamp: Date;
  details: string;
  ip_address?: string;
  user_agent?: string;
  browser_info?: string;
  changes?: AuditLogChange[];
}

@Component({
  selector: 'app-embarque-form',
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
    MatTabsModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatExpansionModule,
    MatChipsModule,
    MatDividerModule,
    MatTooltipModule,
    MatMenuModule,
    MatGridListModule,
    MatProgressBarModule,
    MatTableModule
  ],
  templateUrl: './embarque-form.component.html',
  styleUrls: ['./embarque-form.component.scss']
})
export class EmbarqueFormComponent implements OnInit {
  embarqueForm!: FormGroup;
  loading = false;
  saving = false;
  embarqueId: string | null = null;
  isEditing = false;
  activeTab = 'geral';
  activeTabIndex = 0; // Para mat-tab-group
  
  embarque: Embarque | null = null;
  rotas: Rota[] = [];
  portos: PortoInfo[] = [];
  
  // Opções para selects
  unitOptions = ['MT', 'KG', 'TON'];
  incotermOptions = ['FOB', 'CIF', 'CFR'];
  transportModeOptions = ['Marítimo', 'Rodoviário', 'Ferroviário'];
  freightTypeOptions = ['FCL', 'LCL', 'Bulk'];
  containerTypeOptions = ['20GP', '40HQ', 'Bulk'];
  statusOptions = ['Planned', 'Booked', 'In Transit', 'Delivered', 'Delayed'];
  trackingStatusOptions = ['On Time', 'Delayed', 'Risk'];
  vigiAgroStatusOptions = ['Pending', 'Approved', 'Rejected'];

  // Estado das abas - agora usado para referência, mas mat-tab-group gerencia as tabs
  tabs = [
    { id: 'geral', label: 'Geral', icon: 'info' },
    { id: 'transporte', label: 'Transporte', icon: 'local_shipping' },
    { id: 'containers', label: 'Containers', icon: 'inventory_2' },
    { id: 'portos', label: 'Portos & Rota', icon: 'public' },
    { id: 'datas', label: 'Datas & Tracking', icon: 'event' },
    { id: 'documentacao', label: 'Documentação', icon: 'description' },
    { id: 'ia', label: 'IA & Automação', icon: 'smart_toy' },
    { id: 'financeiro', label: 'Financeiro', icon: 'payments' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private embarqueService: EmbarqueMockService
  ) {
    this.createForm();
  }

  ngOnInit() {
    this.embarqueId = this.route.snapshot.paramMap.get('id');
    this.isEditing = !!this.embarqueId;
    
    this.loadAuxiliaryData();
    
    if (this.isEditing && this.embarqueId) {
      this.loadEmbarque(this.embarqueId);
    }
  }

  createForm() {
    this.embarqueForm = this.fb.group({
      // ABA 1 - Geral
      shipment_number: ['', Validators.required],
      contract_id: ['', Validators.required],
      exporter_name: ['', Validators.required],
      importer_name: ['', Validators.required],
      commodity: ['', Validators.required],
      quantity: [null, [Validators.required, Validators.min(0)]],
      unit: ['MT', Validators.required],
      incoterm: ['FOB', Validators.required],

      // ABA 2 - Transporte
      transport_mode: ['Marítimo', Validators.required],
      vessel_name: [''],
      vessel_imo: [''],
      shipping_company: [''],
      booking_number: ['', Validators.required],
      bill_of_lading: [''],
      freight_type: ['FCL', Validators.required],

      // ABA 3 - Containers
      containers: this.fb.array([]),

      // ABA 4 - Portos & Rota
      port_origin: ['', Validators.required],
      port_destination: ['', Validators.required],
      transshipment_port: [''],
      route_description: [''],

      // ABA 5 - Datas & Tracking
      etd: [''],
      eta: [''],
      ata: [''],
      delay_days: [0],
      tracking_url: [''],

      // ABA 6 - Documentação Aduaneira
      due_number: [''],
      ruc_number: [''],
      invoice_number: [''],
      packing_list_number: [''],
      certificate_phytosanitary: [''],
      mapa_clearance: [false],
      vigiagro_status: ['Pending'],

      // ABA 7 - IA & Automação
      ai_route_suggestion: [''],
      ai_port_suggestion: [''],
      ai_eta_prediction: [''],
      ai_delay_risk_score: [0],
      ai_cost_optimization: [0],
      ai_best_shipping_company: [''],
      ai_auto_tracking: [true],
      ai_alert_delay: [false],
      ai_alert_weather: [false],
      ai_alert_customs: [false],
      ai_optimize_route: [false],
      ai_optimize_cost: [false],
      ai_optimize_carbon: [false],
      ai_optimize_time: [false],
      ai_auto_docs: [false],
      ai_auto_booking: [false],
      ai_auto_compliance: [false],

      // ABA 8 - Financeiro
      freight_cost: [0],
      insurance_cost: [0],
      port_charges: [0],
      total_logistic_cost: [0],
      payment_status: ['pendente'],
      payment_due_date: [''],
      amount_paid: [0],
      initial_budget: [0],
      actual_cost: [0],
      budget_variation: [0],
      gross_revenue: [0],
      gross_margin: [0],
      net_profit: [0],

      // Órgãos Governamentais
      mapa_required: [false],
      anvisa_required: [false],
      anvisa_clearance: [false],
      ibama_required: [false],
      ibama_clearance: [false],

      // Automação Documentária
      auto_generate_invoice: [false],
      auto_submit_siscomex: [false],
      auto_notify_client: [false],

      // Status
      shipment_status: ['Planned'],
      tracking_status: ['On Time']
    });

    // Adicionar pelo menos um container
    this.addContainer();
  }

  loadAuxiliaryData() {
    this.embarqueService.getRotas().subscribe((rotas: Rota[]) => {
      this.rotas = rotas;
    });

    this.embarqueService.getPortos().subscribe((portos: PortoInfo[]) => {
      this.portos = portos;
    });
  }

  loadEmbarque(id: string) {
    this.loading = true;
    this.embarqueService.getEmbarqueById(id).subscribe({
      next: (embarque: Embarque | undefined) => {
        if (embarque) {
          this.embarque = embarque;
          this.populateForm(embarque);
        } else {
          this.router.navigate(['/home-logged/logistica/embarque']);
        }
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Erro ao carregar embarque:', error);
        this.router.navigate(['/home-logged/logistica/embarque']);
        this.loading = false;
      }
    });
  }

  populateForm(embarque: Embarque) {
    // Remover containers existentes
    while (this.containersArray.length !== 0) {
      this.containersArray.removeAt(0);
    }

    // Adicionar containers do embarque
    if (embarque.containers && embarque.containers.length > 0) {
      embarque.containers.forEach((container: Container) => {
        this.addContainer(container);
      });
    } else {
      this.addContainer();
    }

    // Preencher o formulário (exceto containers que já foram tratados)
    const formData = { ...embarque };
    delete formData.containers;
    
    this.embarqueForm.patchValue(formData);
  }

  get containersArray(): FormArray {
    return this.embarqueForm.get('containers') as FormArray;
  }

  addContainer(container?: Container) {
    const containerForm = this.fb.group({
      container_number: [container?.container_number || '', Validators.required],
      container_type: [container?.container_type || '40HQ', Validators.required],
      seal_number: [container?.seal_number || ''],
      tare_weight: [container?.tare_weight || 0],
      gross_weight: [container?.gross_weight || 0],
      net_weight: [container?.net_weight || 0],
      stuffing_date: [container?.stuffing_date ? new Date(container.stuffing_date).toISOString().split('T')[0] : '']
    });

    this.containersArray.push(containerForm);
  }

  removeContainer(index: number) {
    this.containersArray.removeAt(index);
  }

  onTabChange(tabId: string) {
    this.activeTab = tabId;
  }

  onPortOriginChange() {
    const origem = this.embarqueForm.get('port_origin')?.value;
    const destino = this.embarqueForm.get('port_destination')?.value;
    
    if (origem && destino) {
      this.generateAIRouteSuggestion(origem, destino);
    }
  }

  onPortDestinationChange() {
    const origem = this.embarqueForm.get('port_origin')?.value;
    const destino = this.embarqueForm.get('port_destination')?.value;
    
    if (origem && destino) {
      this.generateAIRouteSuggestion(origem, destino);
    }
  }

  generateAIRouteSuggestion(origem: string, destino: string) {
    const commodity = this.embarqueForm.get('commodity')?.value || 'Geral';
    
    this.embarqueService.getAIRouteSuggestion(origem, destino, commodity).subscribe({
      next: (suggestion: any) => {
        this.embarqueForm.patchValue({
          ai_route_suggestion: suggestion.rota_recomendada,
          ai_eta_prediction: new Date(Date.now() + suggestion.tempo_estimado * 24 * 60 * 60 * 1000),
          ai_delay_risk_score: suggestion.risco_atraso,
          ai_cost_optimization: suggestion.economia_estimada
        });
      },
      error: (error: any) => {
        console.error('Erro ao obter sugestão de rota IA:', error);
      }
    });
  }

  calculateTotalLogisticCost() {
    const freight = this.embarqueForm.get('freight_cost')?.value || 0;
    const insurance = this.embarqueForm.get('insurance_cost')?.value || 0;
    const port = this.embarqueForm.get('port_charges')?.value || 0;
    
    const total = freight + insurance + port;
    this.embarqueForm.patchValue({ total_logistic_cost: total });
  }

  async generateDocuments() {
    if (!this.embarqueId) return;
    
    try {
      const documents = await this.embarqueService.generateDocuments(this.embarqueId).toPromise();
      console.log('Documentos gerados:', documents);
      // TODO: Mostrar documentos gerados em modal ou nova aba
    } catch (error) {
      console.error('Erro ao gerar documentos:', error);
    }
  }

  onSubmit() {
    // Primeiro, verificar se o formulário é válido
    if (this.embarqueForm.invalid) {
      this.markFormGroupTouched(this.embarqueForm);
      this.showFormValidationErrors();
      return;
    }

    this.saving = true;
    const formData = this.embarqueForm.value;

    // Preparar dados para envio
    const embarqueData: Partial<Embarque> = {
      ...formData,
      container_count: formData.containers?.length || 0
    };

    const operation = this.isEditing 
      ? this.embarqueService.updateEmbarque(this.embarqueId!, embarqueData)
      : this.embarqueService.createEmbarque(embarqueData);

    operation.subscribe({
      next: (embarque: Embarque) => {
        this.saving = false;
        this.router.navigate(['/home-logged/logistica/embarque']);
      },
      error: (error: any) => {
        console.error('Erro ao salvar embarque:', error);
        this.saving = false;
      }
    });
  }

  // Método para mostrar erros de validação
  showFormValidationErrors() {
    console.log('=== VALIDAÇÃO DO FORMULÁRIO ===');
    console.log('Formulário válido:', this.embarqueForm.valid);
    console.log('Erros do formulário:', this.embarqueForm.errors);
    
    // Verificar cada campo obrigatório
    const requiredFields = [
      'shipment_number', 'contract_id', 'exporter_name', 'importer_name',
      'commodity', 'quantity', 'unit', 'incoterm', 'transport_mode',
      'booking_number', 'freight_type', 'port_origin', 'port_destination'
    ];

    const invalidFields: string[] = [];
    
    requiredFields.forEach(fieldName => {
      const field = this.embarqueForm.get(fieldName);
      if (field && field.invalid) {
        invalidFields.push(fieldName);
        console.log(`Campo ${fieldName}: ${field.errors ? JSON.stringify(field.errors) : 'válido'}`);
      }
    });

    // Verificar containers (FormArray)
    const containersArray = this.embarqueForm.get('containers') as FormArray;
    if (containersArray && containersArray.invalid) {
      console.log('FormArray containers inválido');
      containersArray.controls.forEach((control, index) => {
        if (control.invalid) {
          console.log(`Container ${index} inválido:`, control.errors);
          if (control instanceof FormGroup) {
            Object.keys(control.controls).forEach(controlName => {
              const containerControl = control.get(controlName);
              if (containerControl && containerControl.invalid) {
                console.log(`  - ${controlName}: ${JSON.stringify(containerControl.errors)}`);
              }
            });
          }
        }
      });
    }

    if (invalidFields.length > 0) {
      console.log('Campos obrigatórios não preenchidos:', invalidFields);
    }
  }

  // Método para verificar se o formulário está válido para salvar
  canSaveForm(): boolean {
    // Validação básica dos campos obrigatórios
    const requiredFields = [
      'shipment_number', 'contract_id', 'exporter_name', 'importer_name',
      'commodity', 'quantity', 'unit', 'incoterm', 'transport_mode',
      'booking_number', 'freight_type', 'port_origin', 'port_destination'
    ];

    // Verificar campos básicos
    const invalidBasicFields = requiredFields.some(fieldName => {
      const field = this.embarqueForm.get(fieldName);
      return field && (field.invalid || !field.value);
    });

    if (invalidBasicFields) {
      return false;
    }

    // Verificar se há pelo menos um container válido
    const containersArray = this.embarqueForm.get('containers') as FormArray;
    const hasValidContainer = containersArray && containersArray.length > 0 && 
      containersArray.controls.some(containerControl => {
        const containerNumber = containerControl.get('container_number')?.value;
        const containerType = containerControl.get('container_type')?.value;
        return containerNumber && containerType;
      });

    return hasValidContainer;
  }

  onCancel() {
    this.router.navigate(['/home-logged/logistica/embarque']);
  }

  private markFormGroupTouched(formGroup: FormGroup | FormArray) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      control?.markAsTouched({ onlySelf: true });

      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.embarqueForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.embarqueForm.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) return 'Campo obrigatório';
      if (field.errors['min']) return 'Valor deve ser maior que zero';
      if (field.errors['email']) return 'Email inválido';
    }
    return '';
  }

  // ================================
  // MÉTODOS MOCK PARA FUNCIONALIDADES AVANÇADAS
  // ================================

  // Métodos para formatação de data/hora
  formatDateTime(date?: Date | string): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  // Métodos IA e Automação
  runAiAnalysis(): void {
    console.log('Mock: Executando análise completa IA');
    // TODO: Implementar análise IA completa
  }

  enableFullAutomation(): void {
    console.log('Mock: Habilitando automação total');
    // TODO: Implementar automação total
  }

  // Métodos Financeiros
  calculateBudgetVariation(): void {
    const initial = this.embarqueForm.get('initial_budget')?.value || 0;
    const actual = this.embarqueForm.get('total_logistic_cost')?.value || 0;
    const variation = actual - initial;
    this.embarqueForm.patchValue({ 
      actual_cost: actual,
      budget_variation: variation 
    });
  }

  getBudgetUsagePercentage(): number {
    const initial = this.embarqueForm.get('initial_budget')?.value || 1;
    const actual = this.embarqueForm.get('total_logistic_cost')?.value || 0;
    return Math.round((actual / initial) * 100);
  }

  calculateMargins(): void {
    const revenue = this.embarqueForm.get('gross_revenue')?.value || 0;
    const cost = this.embarqueForm.get('total_logistic_cost')?.value || 0;
    const grossMargin = revenue > 0 ? ((revenue - cost) / revenue) * 100 : 0;
    const netProfit = revenue - cost;
    
    this.embarqueForm.patchValue({
      gross_margin: grossMargin.toFixed(2),
      net_profit: netProfit
    });
  }

  getPercentageOfTotal(field: string): number {
    const value = this.embarqueForm.get(field)?.value || 0;
    const total = this.embarqueForm.get('total_logistic_cost')?.value || 1;
    return (value / total) * 100;
  }

  isPaymentOverdue(): boolean {
    const dueDate = this.embarqueForm.get('payment_due_date')?.value;
    return dueDate ? new Date(dueDate) < new Date() : false;
  }

  getGrossMargin(): number {
    return Number(this.embarqueForm.get('gross_margin')?.value) || 0;
  }

  // Métodos para Documentação e Siscomex
  getSiscomexStatusColor(statusType: string): string {
    // Mock implementation
    const statuses: { [key: string]: string } = {
      'due_status': 'success',
      'lpco_status': 'warning'
    };
    return statuses[statusType] || 'secondary';
  }

  checkDueStatus(): void {
    console.log('Mock: Verificando status DU-E no Siscomex');
    // TODO: Implementar verificação de status DU-E
  }

  checkLpcoStatus(): void {
    console.log('Mock: Verificando status LPCO no Siscomex');
    // TODO: Implementar verificação de status LPCO
  }

  getChannelColor(): string {
    // Mock implementation - retorna cor baseada no canal
    return 'info';
  }

  registerOnSiscomex(): void {
    console.log('Mock: Registrando embarque no Siscomex');
    // TODO: Implementar registro no Siscomex
  }

  syncWithSiscomex(): void {
    console.log('Mock: Sincronizando com Siscomex');
    // TODO: Implementar sincronização com Siscomex
  }

  // Métodos para Status de Órgãos
  getMapaStatusColor(): string {
    return this.embarqueForm.get('mapa_clearance')?.value ? 'success' : 'warning';
  }

  getMapaStatus(): string {
    const required = this.embarqueForm.get('mapa_required')?.value;
    const cleared = this.embarqueForm.get('mapa_clearance')?.value;
    
    if (!required) return 'Não Aplicável';
    return cleared ? 'Liberado' : 'Pendente';
  }

  getAnvisaStatusColor(): string {
    return this.embarqueForm.get('anvisa_clearance')?.value ? 'success' : 'warning';
  }

  getAnvisaStatus(): string {
    const required = this.embarqueForm.get('anvisa_required')?.value;
    const cleared = this.embarqueForm.get('anvisa_clearance')?.value;
    
    if (!required) return 'Não Aplicável';
    return cleared ? 'Liberado' : 'Pendente';
  }

  getIbamaStatusColor(): string {
    return this.embarqueForm.get('ibama_clearance')?.value ? 'success' : 'warning';
  }

  getIbamaStatus(): string {
    const required = this.embarqueForm.get('ibama_required')?.value;
    const cleared = this.embarqueForm.get('ibama_clearance')?.value;
    
    if (!required) return 'Não Aplicável';
    return cleared ? 'Liberado' : 'Pendente';
  }

  // Métodos para Documentos
  viewDocument(type: string): void {
    console.log(`Mock: Visualizando documento ${type}`);
    // TODO: Implementar visualização de documentos
  }

  uploadDocument(type: string): void {
    console.log(`Mock: Upload de documento ${type}`);
    // TODO: Implementar upload de documentos
  }

  checkCertificateStatus(): void {
    console.log('Mock: Verificando status do certificado');
    // TODO: Implementar verificação de certificado
  }

  // Métodos de Auditoria
  refreshAuditLog(): void {
    console.log('Mock: Atualizando log de auditoria');
    this.loadAuditLogs();
  }

  exportAuditLog(): void {
    console.log('Mock: Exportando log de auditoria');
    // TODO: Implementar exportação de log de auditoria
  }

  loadMoreAuditLogs(): void {
    console.log('Mock: Carregando mais logs de auditoria');
    // TODO: Implementar carregamento de mais logs
    this.hasMoreAuditLogs = false; // Simular fim dos logs
  }

  getActionChipClass(action: string): string {
    switch (action) {
      case 'CREATE': return 'chip-success';
      case 'UPDATE': return 'chip-info';
      case 'DELETE': return 'chip-danger';
      case 'APPROVE': return 'chip-success';
      case 'REJECT': return 'chip-warning';
      case 'EXPORT': return 'chip-primary';
      default: return 'chip-secondary';
    }
  }

  // Propriedades para Auditoria - Mock Data
  auditLogs: AuditLog[] = [
    {
      id: 1,
      action: 'CREATE',
      description: 'Embarque criado no sistema',
      user: 'João Silva',
      user_name: 'João Silva',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      details: 'Embarque SHIP-2024-001 criado via interface web',
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      browser_info: 'Chrome 91.0 - Windows 10',
      changes: [
        { field: 'Status', old_value: null, new_value: 'Planned' },
        { field: 'Exportador', old_value: null, new_value: 'ABC Exportadora' }
      ]
    },
    {
      id: 2,
      action: 'UPDATE',
      description: 'Atualizado status do embarque',
      user: 'Maria Santos',
      user_name: 'Maria Santos',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
      details: 'Status alterado de "Planned" para "Booked"',
      ip_address: '10.0.0.45',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      browser_info: 'Chrome 91.0 - Windows 10',
      changes: [
        { field: 'Status', old_value: 'Planned', new_value: 'Booked' },
        { field: 'Data de Embarque', old_value: '2024-04-10', new_value: '2024-04-12' }
      ]
    },
    {
      id: 3,
      action: 'APPROVE',
      description: 'Documentação aprovada',
      user: 'Sistema Automático',
      user_name: 'Sistema Automático',
      timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 min ago
      details: 'DU-E aprovada automaticamente pelo sistema IA',
      ip_address: 'localhost',
      user_agent: 'System/1.0',
      browser_info: 'Sistema Interno',
      changes: [
        { field: 'Status DU-E', old_value: 'Pendente', new_value: 'Aprovado' }
      ]
    }
  ];

  hasMoreAuditLogs = true;

  private loadAuditLogs(): void {
    // Mock implementation - simula carregamento de logs
    console.log('Mock: Carregando logs de auditoria');
  }

  // Método formatDate
  formatDate(date?: Date | string): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR');
  }

  // Método para obter dados do breakdown de custos
  getCostBreakdownData(): any[] {
    const freightCost = this.embarqueForm.get('freight_cost')?.value || 0;
    const insuranceCost = this.embarqueForm.get('insurance_cost')?.value || 0;
    const portCharges = this.embarqueForm.get('port_charges')?.value || 0;
    const totalCost = this.embarqueForm.get('total_logistic_cost')?.value || 1;

    return [
      {
        item: 'Frete Oceânico',
        value: freightCost,
        percentage: (freightCost / totalCost) * 100,
        status: 'Confirmado',
        statusColor: 'success'
      },
      {
        item: 'Seguro',
        value: insuranceCost,
        percentage: (insuranceCost / totalCost) * 100,
        status: 'Confirmado',
        statusColor: 'success'
      },
      {
        item: 'Taxas Portuárias',
        value: portCharges,
        percentage: (portCharges / totalCost) * 100,
        status: 'Estimado',
        statusColor: 'warning'
      },
      {
        item: 'Total',
        value: totalCost,
        percentage: 100,
        status: 'Calculado',
        statusColor: 'primary'
      }
    ];
  }

  // Método para obter dados de rastreamento de documentos
  getDocumentTrackingData(): any[] {
    return [
      {
        name: 'Invoice',
        number: this.embarqueForm.get('invoice_number')?.value || '-',
        status: 'Enviado',
        statusColor: 'success',
        uploadDate: this.embarque?.invoice_upload_date ? this.formatDate(this.embarque.invoice_upload_date) : '-',
        lastCheck: this.embarque?.invoice_last_check ? this.formatDateTime(this.embarque.invoice_last_check) : '-',
        icon: 'receipt',
        actionIcon: 'visibility',
        actionColor: 'primary',
        actionTooltip: 'Visualizar documento',
        action: () => this.viewDocument('invoice')
      },
      {
        name: 'Packing List',
        number: this.embarqueForm.get('packing_list_number')?.value || '-',
        status: 'Enviado',
        statusColor: 'success',
        uploadDate: this.embarque?.packing_upload_date ? this.formatDate(this.embarque.packing_upload_date) : '-',
        lastCheck: this.embarque?.packing_last_check ? this.formatDateTime(this.embarque.packing_last_check) : '-',
        icon: 'list_alt',
        actionIcon: 'visibility',
        actionColor: 'primary',
        actionTooltip: 'Visualizar documento',
        action: () => this.viewDocument('packing')
      },
      {
        name: 'Bill of Lading',
        number: this.embarqueForm.get('bill_of_lading')?.value || '-',
        status: 'Pendente',
        statusColor: 'warn',
        uploadDate: '-',
        lastCheck: '-',
        icon: 'local_shipping',
        actionIcon: 'upload',
        actionColor: 'accent',
        actionTooltip: 'Upload documento',
        action: () => this.uploadDocument('bl')
      },
      {
        name: 'Certificado Fitossanitário',
        number: this.embarqueForm.get('certificate_phytosanitary')?.value || '-',
        status: 'Em Análise',
        statusColor: 'primary',
        uploadDate: this.embarque?.certificate_upload_date ? this.formatDate(this.embarque.certificate_upload_date) : '-',
        lastCheck: this.embarque?.certificate_last_check ? this.formatDateTime(this.embarque.certificate_last_check) : '-',
        icon: 'eco',
        actionIcon: 'refresh',
        actionColor: 'primary',
        actionTooltip: 'Verificar status',
        action: () => this.checkCertificateStatus()
      }
    ];
  }

  // Método para verificar se existem alertas financeiros
  hasFinancialAlerts(): boolean {
    return this.getBudgetUsagePercentage() > 100 || 
           this.isPaymentOverdue() || 
           this.getGrossMargin() < 10;
  }

  // TrackBy function para performance do ngFor
  trackByIndex(index: number, item: any): number {
    return index;
  }
}