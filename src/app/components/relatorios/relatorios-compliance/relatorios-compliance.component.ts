import { Component, OnInit, OnDestroy, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

// Services and Types
import { RelatorioComplianceMockService } from '../../../../services/relatorioComplianceMockService';
import { ExportService } from '../../../../services/exportService';
import { ComplianceReport, ComplianceMetrics, ComplianceByArea, ComplianceLevel } from '../../../../types/relatorio-compliance';

@Component({
  selector: 'app-relatorios-compliance',
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
    MatSnackBarModule,
    MatProgressBarModule,
    MatTooltipModule
  ],
  templateUrl: './relatorios-compliance.component.html',
  styleUrls: ['./relatorios-compliance.component.scss']
})
export class RelatoriosComplianceComponent implements OnInit, OnDestroy {

  private complianceService = inject(RelatorioComplianceMockService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private exportService = inject(ExportService);
  private destroy$ = new Subject<void>();

  @ViewChild('compliancePaginator') compliancePaginator!: MatPaginator;
  @ViewChild('complianceSort') complianceSort!: MatSort;

  dataSource = new MatTableDataSource<ComplianceReport>([]);
  metrics: ComplianceMetrics = {
    totalRequirements: 0, conformeCount: 0, parcialCount: 0,
    naoConformeCount: 0, naoAvaliadoCount: 0, overallScore: 0,
    criticalRisks: 0, pendingActions: 0
  };
  areaBreakdowns: ComplianceByArea[] = [];
  filterForm!: FormGroup;
  isLoading = false;

  displayedColumns: string[] = [
    'area', 'requirement', 'regulation', 'status', 'riskScore',
    'responsible', 'dueDate', 'lastAssessment', 'actions'
  ];

  areas: string[] = ['Aduaneiro', 'Fiscal', 'Sanitário', 'Ambiental', 'Cambial', 'Documental', 'Trabalhista', 'Segurança'];
  statuses: ComplianceLevel[] = ['CONFORME', 'PARCIAL', 'NÃO_CONFORME', 'NÃO_AVALIADO'];

  ngOnInit(): void {
    this.initForm();
    this.loadData();
    this.setupFilterListeners();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm(): void {
    this.filterForm = this.fb.group({
      searchText: [''],
      area: [''],
      status: ['']
    });
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

  private loadData(): void {
    this.isLoading = true;

    this.complianceService.getMetrics()
      .pipe(takeUntil(this.destroy$))
      .subscribe(metrics => this.metrics = metrics);

    this.complianceService.getAreaBreakdowns()
      .pipe(takeUntil(this.destroy$))
      .subscribe(areas => this.areaBreakdowns = areas);

    this.complianceService.getReports()
      .pipe(takeUntil(this.destroy$))
      .subscribe(reports => {
        this.dataSource.data = reports;
        setTimeout(() => {
          this.dataSource.paginator = this.compliancePaginator;
          this.dataSource.sort = this.complianceSort;
        });
        this.isLoading = false;
      });
  }

  applyFilters(): void {
    const { searchText, area, status } = this.filterForm.value;

    this.dataSource.filterPredicate = (data: ComplianceReport, filter: string) => {
      const filterObj = JSON.parse(filter);
      let match = true;

      if (filterObj.searchText) {
        const search = filterObj.searchText.toLowerCase();
        match = match && (
          data.requirement.toLowerCase().includes(search) ||
          data.regulation.toLowerCase().includes(search) ||
          data.responsible.toLowerCase().includes(search) ||
          data.area.toLowerCase().includes(search)
        );
      }
      if (filterObj.area) {
        match = match && data.area === filterObj.area;
      }
      if (filterObj.status) {
        match = match && data.status === filterObj.status;
      }

      return match;
    };

    this.dataSource.filter = JSON.stringify({ searchText, area, status });
  }

  clearFilters(): void {
    this.filterForm.reset({ searchText: '', area: '', status: '' });
  }

  exportPDF(): void {
    const columns = [
      { key: 'area', label: 'Área' },
      { key: 'requirement', label: 'Requisito' },
      { key: 'regulation', label: 'Regulamentação' },
      { key: 'status', label: 'Status' },
      { key: 'riskScore', label: 'Score de Risco' },
      { key: 'responsible', label: 'Responsável' },
      { key: 'dueDate', label: 'Data Limite' },
      { key: 'lastAssessment', label: 'Última Avaliação' },
      { key: 'actions', label: 'Ações' },
      { key: 'observations', label: 'Observações' }
    ];
    this.exportService.exportToPDF('Relatório de Compliance', this.dataSource.filteredData, columns, 'relatorio-compliance');
    this.snackBar.open('Relatório PDF gerado com sucesso!', 'OK', { duration: 3000 });
  }

  exportExcel(): void {
    const columns = [
      { key: 'area', label: 'Área' },
      { key: 'requirement', label: 'Requisito' },
      { key: 'regulation', label: 'Regulamentação' },
      { key: 'status', label: 'Status' },
      { key: 'riskScore', label: 'Score de Risco' },
      { key: 'responsible', label: 'Responsável' },
      { key: 'dueDate', label: 'Data Limite' },
      { key: 'lastAssessment', label: 'Última Avaliação' },
      { key: 'actions', label: 'Ações' },
      { key: 'observations', label: 'Observações' }
    ];
    this.exportService.exportToCSV(this.dataSource.filteredData, columns, 'relatorio-compliance');
    this.snackBar.open('Arquivo CSV exportado com sucesso!', 'OK', { duration: 3000 });
  }

  getStatusLabel(status: ComplianceLevel): string {
    const labels: Record<ComplianceLevel, string> = {
      'CONFORME': 'Conforme',
      'PARCIAL': 'Parcial',
      'NÃO_CONFORME': 'Não Conforme',
      'NÃO_AVALIADO': 'Não Avaliado'
    };
    return labels[status] || status;
  }

  getAreaBarWidth(area: ComplianceByArea, type: 'conforme' | 'parcial' | 'naoConforme'): number {
    if (area.total === 0) return 0;
    const value = type === 'conforme' ? area.conforme :
                  type === 'parcial' ? area.parcial : area.naoConforme;
    return (value / area.total) * 100;
  }
}
