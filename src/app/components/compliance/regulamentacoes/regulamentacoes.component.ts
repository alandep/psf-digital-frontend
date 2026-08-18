import { Component, OnInit, OnDestroy, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

// Angular Material Components
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatMenuModule } from '@angular/material/menu';

// Services and Types
import { RegulamentacoesMockService } from '../../../../services/regulamentacoesMockService';
import {
  Regulamentacao, RegulationRequirement, CountryProductMatrix,
  ImpactAnalysis, NonConformity, RegulationTimelineEvent,
  RegulationAIInsights, RegulamentacaoMetrics, RegulamentacaoFilters,
  RegulationType, RegulationStatus, RegulationCategory, Criticality
} from '../../../../types/regulamentacoes';

@Component({
  selector: 'app-regulamentacoes',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatTabsModule,
    MatListModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatDividerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatMenuModule
  ],
  templateUrl: './regulamentacoes.component.html',
  styleUrls: ['./regulamentacoes.component.scss']
})
export class RegulamentacoesComponent implements OnInit, OnDestroy {

  // Services
  private service = inject(RegulamentacoesMockService);
  private formBuilder = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  // Destroy subject
  private destroy$ = new Subject<void>();

  // ViewChild
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Data State
  regulations: Regulamentacao[] = [];
  dataSource = new MatTableDataSource<Regulamentacao>([]);
  selectedRegulation: Regulamentacao | null = null;
  requirements: RegulationRequirement[] = [];
  matrix: CountryProductMatrix[] = [];
  impactAnalysis: ImpactAnalysis | null = null;
  nonConformities: NonConformity[] = [];
  timeline: RegulationTimelineEvent[] = [];
  aiInsights: RegulationAIInsights | null = null;
  metrics: RegulamentacaoMetrics | null = null;

  // UI State
  isLoading = false;
  isDetailOpen = false;

  // Forms
  filterForm!: FormGroup;

  // Table columns
  displayedColumns: string[] = [
    'code', 'title', 'country', 'regulatoryBody', 'category',
    'criticality', 'status', 'effectiveStartDate', 'riskScore',
    'affectedOperations', 'aiAnalyzed', 'actions'
  ];

  // Dropdown data
  categories: RegulationCategory[] = [];
  types: RegulationType[] = [];
  statuses: RegulationStatus[] = [];
  criticalities: Criticality[] = [];
  countries: string[] = [];
  bodies: string[] = [];

  ngOnInit(): void {
    this.initForms();
    this.loadDropdownData();
    this.loadRegulations();
    this.loadMetrics();
    this.loadMatrix();
    this.setupFilterListeners();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private initForms(): void {
    this.filterForm = this.formBuilder.group({
      searchText: [''],
      category: [''],
      regulationType: [''],
      status: [''],
      criticality: [''],
      country: [''],
      regulatoryBody: [''],
      dateStart: [null],
      dateEnd: [null]
    });
  }

  private loadDropdownData(): void {
    this.categories = this.service.getCategories();
    this.types = this.service.getTypes();
    this.statuses = this.service.getStatuses();
    this.criticalities = this.service.getCriticalities();
    this.countries = this.service.getCountries();
    this.bodies = this.service.getBodies();
  }

  private setupFilterListeners(): void {
    this.filterForm.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => this.applyFilters());
  }

  loadRegulations(): void {
    this.isLoading = true;
    this.service.getRegulations()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.regulations = data;
          this.dataSource.data = data;
          this.isLoading = false;
        },
        error: () => {
          this.snackBar.open('Erro ao carregar regulamentações', 'Fechar', { duration: 3000 });
          this.isLoading = false;
        }
      });
  }

  loadMetrics(): void {
    this.service.getMetrics()
      .pipe(takeUntil(this.destroy$))
      .subscribe(metrics => this.metrics = metrics);
  }

  loadMatrix(): void {
    this.service.getCountryProductMatrix()
      .pipe(takeUntil(this.destroy$))
      .subscribe(matrix => this.matrix = matrix);
  }

  applyFilters(): void {
    const filters: RegulamentacaoFilters = this.filterForm.value;
    this.service.getRegulations(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.regulations = data;
        this.dataSource.data = data;
      });
  }

  clearFilters(): void {
    this.filterForm.reset({
      searchText: '',
      category: '',
      regulationType: '',
      status: '',
      criticality: '',
      country: '',
      regulatoryBody: '',
      dateStart: null,
      dateEnd: null
    });
  }

  selectRegulation(regulation: Regulamentacao): void {
    this.selectedRegulation = regulation;
    this.isDetailOpen = true;
    this.loadRegulationDetails(regulation.id);
  }

  private loadRegulationDetails(regulationId: string): void {
    this.service.getRequirements(regulationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(req => this.requirements = req);

    this.service.getImpactAnalysis(regulationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(impact => this.impactAnalysis = impact);

    this.service.getNonConformities(regulationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(nc => this.nonConformities = nc);

    this.service.getTimeline(regulationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(tl => this.timeline = tl);

    this.service.getAIInsights(regulationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(insights => this.aiInsights = insights);
  }

  closeDetail(): void {
    this.isDetailOpen = false;
    this.selectedRegulation = null;
    this.requirements = [];
    this.impactAnalysis = null;
    this.nonConformities = [];
    this.timeline = [];
    this.aiInsights = null;
  }

  createRegulation(): void {
    this.snackBar.open('Funcionalidade de criação será implementada na Fase 2', 'OK', { duration: 3000 });
  }

  analyzeImpact(): void {
    this.snackBar.open('Análise de impacto em andamento...', 'OK', { duration: 2000 });
  }

  exportPDF(): void {
    this.snackBar.open('Exportando relatório regulatório em PDF...', 'OK', { duration: 2000 });
  }

  // ================================
  // HELPER METHODS FOR TEMPLATE
  // ================================

  getCategoryLabel(category: RegulationCategory): string {
    const map: Record<RegulationCategory, string> = {
      'ADUANEIRA': 'Aduaneira',
      'FISCAL': 'Fiscal',
      'SANITÁRIA': 'Sanitária',
      'FITOSSANITÁRIA': 'Fitossanitária',
      'AMBIENTAL': 'Ambiental',
      'CAMBIAL': 'Cambial',
      'SEGURANÇA_ALIMENTAR': 'Seg. Alimentar',
      'QUALIDADE': 'Qualidade',
      'ESG': 'ESG',
      'CERTIFICAÇÕES': 'Certificações',
      'ROTULAGEM': 'Rotulagem',
      'EMBALAGEM': 'Embalagem'
    };
    return map[category] || category;
  }

  getCategoryClass(category: RegulationCategory): string {
    const map: Record<RegulationCategory, string> = {
      'ADUANEIRA': 'cat-aduaneira',
      'FISCAL': 'cat-fiscal',
      'SANITÁRIA': 'cat-sanitaria',
      'FITOSSANITÁRIA': 'cat-fitossanitaria',
      'AMBIENTAL': 'cat-ambiental',
      'CAMBIAL': 'cat-cambial',
      'SEGURANÇA_ALIMENTAR': 'cat-seguranca',
      'QUALIDADE': 'cat-qualidade',
      'ESG': 'cat-esg',
      'CERTIFICAÇÕES': 'cat-certificacoes',
      'ROTULAGEM': 'cat-rotulagem',
      'EMBALAGEM': 'cat-embalagem'
    };
    return map[category] || '';
  }

  getCriticalityLabel(criticality: Criticality): string {
    const map: Record<Criticality, string> = {
      'LOW': 'Baixo',
      'MEDIUM': 'Médio',
      'HIGH': 'Alto',
      'CRITICAL': 'Crítico'
    };
    return map[criticality] || criticality;
  }

  getCriticalityClass(criticality: Criticality): string {
    const map: Record<Criticality, string> = {
      'LOW': 'crit-low',
      'MEDIUM': 'crit-medium',
      'HIGH': 'crit-high',
      'CRITICAL': 'crit-critical'
    };
    return map[criticality] || '';
  }

  getStatusLabel(status: RegulationStatus): string {
    const map: Record<RegulationStatus, string> = {
      'DRAFT': 'Rascunho',
      'UNDER_REVIEW': 'Em Revisão',
      'ACTIVE': 'Ativa',
      'SUSPENDED': 'Suspensa',
      'REVOKED': 'Revogada',
      'EXPIRED': 'Expirada',
      'REPLACED': 'Substituída',
      'ARCHIVED': 'Arquivada'
    };
    return map[status] || status;
  }

  getStatusClass(status: RegulationStatus): string {
    const map: Record<RegulationStatus, string> = {
      'DRAFT': 'status-draft',
      'UNDER_REVIEW': 'status-review',
      'ACTIVE': 'status-active',
      'SUSPENDED': 'status-suspended',
      'REVOKED': 'status-revoked',
      'EXPIRED': 'status-expired',
      'REPLACED': 'status-replaced',
      'ARCHIVED': 'status-archived'
    };
    return map[status] || '';
  }

  getTypeLabel(type: RegulationType): string {
    const map: Record<RegulationType, string> = {
      'LAW': 'Lei',
      'DECREE': 'Decreto',
      'RESOLUTION': 'Resolução',
      'ORDINANCE': 'Portaria',
      'NORMATIVE_INSTRUCTION': 'Instrução Normativa',
      'TECHNICAL_STANDARD': 'Norma Técnica',
      'TRADE_AGREEMENT': 'Acordo Comercial',
      'INTERNAL_POLICY': 'Política Interna',
      'CLIENT_REQUIREMENT': 'Requisito Cliente',
      'OTHER': 'Outro'
    };
    return map[type] || type;
  }

  getScoreColor(score: number): string {
    if (score >= 80) return 'score-critical';
    if (score >= 60) return 'score-high';
    if (score >= 40) return 'score-medium';
    return 'score-low';
  }

  getMatrixAllowedClass(allowed: string): string {
    const map: Record<string, string> = {
      'SIM': 'allowed-sim',
      'CONDICIONAL': 'allowed-condicional',
      'NÃO': 'allowed-nao'
    };
    return map[allowed] || '';
  }

  getMatrixComplianceClass(status: string): string {
    const map: Record<string, string> = {
      'CONFORME': 'compliance-conforme',
      'PENDENTE': 'compliance-pendente',
      'NÃO_CONFORME': 'compliance-nao-conforme'
    };
    return map[status] || '';
  }

  getMatrixComplianceLabel(status: string): string {
    const map: Record<string, string> = {
      'CONFORME': 'Conforme',
      'PENDENTE': 'Pendente',
      'NÃO_CONFORME': 'Não Conforme'
    };
    return map[status] || status;
  }

  getNcStatusLabel(status: string): string {
    const map: Record<string, string> = {
      'ABERTA': 'Aberta',
      'EM_TRATAMENTO': 'Em Tratamento',
      'RESOLVIDA': 'Resolvida',
      'CANCELADA': 'Cancelada'
    };
    return map[status] || status;
  }

  getNcStatusClass(status: string): string {
    const map: Record<string, string> = {
      'ABERTA': 'nc-aberta',
      'EM_TRATAMENTO': 'nc-tratamento',
      'RESOLVIDA': 'nc-resolvida',
      'CANCELADA': 'nc-cancelada'
    };
    return map[status] || '';
  }

  getAlertIcon(severity: string): string {
    const map: Record<string, string> = {
      'LOW': 'info',
      'MEDIUM': 'warning',
      'HIGH': 'error',
      'CRITICAL': 'dangerous'
    };
    return map[severity] || 'info';
  }

  getAlertClass(severity: string): string {
    return `alert-${severity.toLowerCase()}`;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }
}
