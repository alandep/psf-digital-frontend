import { Component, OnInit, OnDestroy, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject, forkJoin, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

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

// Services and Types
import { LicencasMockService } from '../../../../services/licencasMockService';
import { LicencaDialogComponent } from './licenca-dialog/licenca-dialog.component';
import { LicencaDetailDialogComponent } from './licenca-detail-dialog/licenca-detail-dialog.component';
import {
  Licenca,
  LicenseType,
  LicenseStatus,
  RiskLevel,
  ComplianceValidation,
  CountryRequirement,
  RegulatoryRestriction,
  ActionPlan,
  LicenseTimelineEvent,
  LicenseAIInsights,
  LicenseMetrics,
  LicenseFilters
} from '../../../../types/licencas';
import { HasPermissionDirective } from '../../../directives/has-permission.directive';

@Component({
  selector: 'app-licencas',
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
    MatDialogModule,
    HasPermissionDirective
  ],
  templateUrl: './licencas.component.html',
  styleUrls: ['./licencas.component.scss']
})
export class LicencasComponent implements OnInit, OnDestroy {

  // Services
  private licencasService = inject(LicencasMockService);
  private formBuilder = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  // Destroy subject
  private destroy$ = new Subject<void>();

  // ViewChild
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Data State
  licenses: Licenca[] = [];
  dataSource = new MatTableDataSource<Licenca>([]);
  selectedLicense: Licenca | null = null;
  validations: ComplianceValidation[] = [];
  countryRequirements: CountryRequirement[] = [];
  restrictions: RegulatoryRestriction[] = [];
  actionPlans: ActionPlan[] = [];
  timeline: LicenseTimelineEvent[] = [];
  aiInsights: LicenseAIInsights | null = null;
  metrics: LicenseMetrics | null = null;

  // UI State
  isLoading = false;
  showRestrictions = true;

  // Forms
  filterForm!: FormGroup;

  // Table columns
  displayedColumns: string[] = [
    'licenseNumber', 'licenseType', 'company', 'productName',
    'destinationCountry', 'regulatoryBody', 'status', 'expiryDate',
    'aiComplianceScore', 'riskLevel', 'actions'
  ];

  // Dropdown data
  licenseTypes: LicenseType[] = [];
  statuses: LicenseStatus[] = [];
  regulatoryBodies: string[] = [];
  countries: string[] = [];
  riskLevels: RiskLevel[] = [];

  ngOnInit(): void {
    this.initForms();
    this.loadDropdownData();
    this.loadLicenses();
    this.loadMetrics();
    this.loadRestrictions();
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
      licenseType: [''],
      status: [''],
      regulatoryBody: [''],
      destinationCountry: [''],
      riskLevel: [''],
      expiryStart: [null],
      expiryEnd: [null]
    });
  }

  private loadDropdownData(): void {
    this.licenseTypes = this.licencasService.getLicenseTypes();
    this.statuses = this.licencasService.getStatuses();
    this.regulatoryBodies = this.licencasService.getRegulatoryBodies();
    this.countries = this.licencasService.getCountries();
    this.riskLevels = this.licencasService.getRiskLevels();
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

  loadLicenses(): void {
    this.isLoading = true;
    this.licencasService.getLicenses()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.licenses = data;
          this.dataSource.data = data;
          this.isLoading = false;
        },
        error: () => {
          this.snackBar.open('Erro ao carregar licenças', 'Fechar', { duration: 3000 });
          this.isLoading = false;
        }
      });
  }

  loadMetrics(): void {
    this.licencasService.getMetrics()
      .pipe(takeUntil(this.destroy$))
      .subscribe(metrics => this.metrics = metrics);
  }

  loadRestrictions(): void {
    this.licencasService.getRestrictions()
      .pipe(takeUntil(this.destroy$))
      .subscribe(restrictions => this.restrictions = restrictions);
  }

  applyFilters(): void {
    const filters: LicenseFilters = this.filterForm.value;
    this.licencasService.getLicenses(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.licenses = data;
        this.dataSource.data = data;
      });
  }

  clearFilters(): void {
    this.filterForm.reset({
      searchText: '',
      licenseType: '',
      status: '',
      regulatoryBody: '',
      destinationCountry: '',
      riskLevel: '',
      expiryStart: null,
      expiryEnd: null
    });
  }

  selectLicense(license: Licenca): void {
    this.selectedLicense = license;
    forkJoin({
      validations: this.licencasService.getValidations(license.id),
      countryRequirements: this.licencasService.getCountryRequirements(license.destinationCountry),
      actionPlans: this.licencasService.getActionPlans(license.id),
      timeline: this.licencasService.getTimeline(license.id),
      aiInsights: this.licencasService.getAIInsights(license.id)
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe(details => {
        this.validations = details.validations;
        this.countryRequirements = details.countryRequirements;
        this.actionPlans = details.actionPlans;
        this.timeline = details.timeline;
        this.aiInsights = details.aiInsights;

        this.dialog.open(LicencaDetailDialogComponent, {
          width: '1000px',
          maxWidth: '95vw',
          maxHeight: '92vh',
          panelClass: 'licenca-detail-panel',
          data: {
            license,
            validations: details.validations,
            countryRequirements: details.countryRequirements,
            restrictions: this.restrictions,
            actionPlans: details.actionPlans,
            timeline: details.timeline,
            aiInsights: details.aiInsights
          }
        });
      });
  }

  createLicense(): void {
    const dialogRef = this.dialog.open(LicencaDialogComponent, {
      width: '90vw',
      maxWidth: '900px',
      height: '85vh',
      maxHeight: '750px',
      disableClose: false,
      panelClass: 'licenca-dialog-container',
      data: {
        licenseTypes: this.licenseTypes,
        regulatoryBodies: this.regulatoryBodies,
        countries: this.countries
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        this.licencasService.createLicense(result)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.snackBar.open('Licença criada com sucesso!', 'OK', { duration: 3000 });
              this.loadLicenses();
              this.loadMetrics();
              this.isLoading = false;
            },
            error: () => {
              this.snackBar.open('Erro ao criar licença', 'Fechar', { duration: 5000 });
              this.isLoading = false;
            }
          });
      }
    });
  }

  renewLicense(license: Licenca): void {
    this.licencasService.renewLicense(license.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open(`Licença ${license.licenseNumber} enviada para renovação`, 'OK', { duration: 3000 });
          this.loadLicenses();
          this.loadMetrics();
        },
        error: () => {
          this.snackBar.open('Erro ao solicitar renovação', 'Fechar', { duration: 3000 });
        }
      });
  }

  validateExport(): void {
    this.licencasService.validateExport('EXP-001')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          const msg = result.canProceed
            ? `Validação OK (Score: ${result.score}) - ${result.issues.length} alertas`
            : `Exportação BLOQUEADA - ${result.issues.length} não conformidades`;
          this.snackBar.open(msg, 'OK', { duration: 5000 });
        },
        error: () => {
          this.snackBar.open('Erro na validação', 'Fechar', { duration: 3000 });
        }
      });
  }

  exportPDF(): void {
    this.snackBar.open('Exportando relatório de compliance em PDF...', 'OK', { duration: 2000 });
  }

  syncData(): void {
    this.snackBar.open('Sincronizando dados regulatórios...', 'OK', { duration: 2000 });
    this.loadLicenses();
    this.loadMetrics();
    this.loadRestrictions();
  }

  // ================================
  // HELPER METHODS FOR TEMPLATE
  // ================================

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  getLicenseTypeLabel(type: LicenseType): string {
    const map: Record<LicenseType, string> = {
      'EXPORTAÇÃO': 'Exportação',
      'REGISTRO_ESPECIAL': 'Reg. Especial',
      'SANITÁRIA': 'Sanitária',
      'FITOSSANITÁRIA': 'Fitossanitária',
      'AMBIENTAL': 'Ambiental',
      'PRODUTOS_CONTROLADOS': 'Prod. Controlados',
      'OUTRAS': 'Outras'
    };
    return map[type] || type;
  }

  getLicenseTypeClass(type: LicenseType): string {
    const map: Record<LicenseType, string> = {
      'EXPORTAÇÃO': 'type-exportacao',
      'REGISTRO_ESPECIAL': 'type-registro',
      'SANITÁRIA': 'type-sanitaria',
      'FITOSSANITÁRIA': 'type-fitossanitaria',
      'AMBIENTAL': 'type-ambiental',
      'PRODUTOS_CONTROLADOS': 'type-controlados',
      'OUTRAS': 'type-outras'
    };
    return map[type] || '';
  }

  getStatusColor(status: LicenseStatus): string {
    const map: Record<LicenseStatus, string> = {
      'VÁLIDA': 'status-valida',
      'VENCIDA': 'status-vencida',
      'PENDENTE': 'status-pendente',
      'EM_RENOVAÇÃO': 'status-renovacao',
      'SUSPENSA': 'status-suspensa',
      'CANCELADA': 'status-cancelada'
    };
    return map[status] || '';
  }

  getRiskClass(risk: RiskLevel): string {
    const map: Record<RiskLevel, string> = {
      'MUITO_BAIXO': 'risk-muito-baixo',
      'BAIXO': 'risk-baixo',
      'MÉDIO': 'risk-medio',
      'ALTO': 'risk-alto',
      'CRÍTICO': 'risk-critico'
    };
    return map[risk] || '';
  }

  getRiskLabel(risk: RiskLevel): string {
    const map: Record<RiskLevel, string> = {
      'MUITO_BAIXO': 'Muito Baixo',
      'BAIXO': 'Baixo',
      'MÉDIO': 'Médio',
      'ALTO': 'Alto',
      'CRÍTICO': 'Crítico'
    };
    return map[risk] || risk;
  }

  getValidationStatusClass(status: string): string {
    const map: Record<string, string> = {
      'CONFORME': 'val-conforme',
      'NÃO_CONFORME': 'val-nao-conforme',
      'PENDENTE': 'val-pendente',
      'EM_ANÁLISE': 'val-analise'
    };
    return map[status] || '';
  }

  getActionPriorityClass(priority: string): string {
    const map: Record<string, string> = {
      'BAIXA': 'priority-baixa',
      'MÉDIA': 'priority-media',
      'ALTA': 'priority-alta',
      'CRÍTICA': 'priority-critica'
    };
    return map[priority] || '';
  }

  getActionStatusLabel(status: string): string {
    const map: Record<string, string> = {
      'ABERTO': 'Aberto',
      'EM_ANDAMENTO': 'Em Andamento',
      'CONCLUÍDO': 'Concluído',
      'CANCELADO': 'Cancelado'
    };
    return map[status] || status;
  }

  getScoreColor(score: number): string {
    if (score >= 85) return 'score-excellent';
    if (score >= 70) return 'score-good';
    if (score >= 50) return 'score-average';
    return 'score-poor';
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

  isExpired(license: Licenca): boolean {
    return license.status === 'VENCIDA';
  }

  isExpiringSoon(license: Licenca): boolean {
    if (license.status !== 'VÁLIDA') return false;
    const expiryDate = new Date(license.expiryDate);
    const now = new Date();
    const diff = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 30;
  }
}
