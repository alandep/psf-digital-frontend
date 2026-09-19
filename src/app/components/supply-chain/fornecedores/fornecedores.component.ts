import { Component, OnInit, OnDestroy, inject, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

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
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';

import { SupplierMockService } from '../../../../services/supplierMockService';
import { ExportService } from '../../../../services/exportService';
import { Supplier, SupplierMetrics, SupplierCategory, QualificationStatus } from '../../../../types/supplier';
import { NovoFornecedorDialogComponent } from '../dialogs/novo-fornecedor-dialog.component';
import { SupplierDetailDialogComponent } from './supplier-detail-dialog/supplier-detail-dialog.component';
import { HasPermissionDirective } from '../../../directives/has-permission.directive';

@Component({
  selector: 'app-fornecedores',
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
    MatSnackBarModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatDialogModule,
    MatMenuModule,
    HasPermissionDirective
  ],
  templateUrl: './fornecedores.component.html',
  styleUrls: ['./fornecedores.component.scss']
})
export class FornecedoresComponent implements OnInit, OnDestroy, AfterViewInit {

  private service = inject(SupplierMockService);
  private exportService = inject(ExportService);
  private formBuilder = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  private destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  suppliers: Supplier[] = [];
  dataSource = new MatTableDataSource<Supplier>([]);
  metrics: SupplierMetrics | null = null;
  isLoading = false;

  filterForm!: FormGroup;

  displayedColumns: string[] = [
    'companyName', 'country', 'category', 'riskScore', 'qualificationStatus',
    'lastAuditDate', 'activeContracts'
  ];

  categories: SupplierCategory[] = [];
  statuses: QualificationStatus[] = [];
  countries: string[] = [];

  ngOnInit(): void {
    this.initForms();
    this.loadDropdownData();
    this.loadSuppliers();
    this.loadMetrics();
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
      qualificationStatus: ['']
    });
  }

  private loadDropdownData(): void {
    this.categories = this.service.getCategories();
    this.statuses = this.service.getStatuses();
    this.countries = this.service.getCountries();
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

  loadSuppliers(): void {
    this.isLoading = true;
    this.service.getSuppliers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.suppliers = data;
          this.dataSource.data = data;
          this.isLoading = false;
        },
        error: () => {
          this.snackBar.open('Erro ao carregar fornecedores', 'Fechar', { duration: 3000 });
          this.isLoading = false;
        }
      });
  }

  loadMetrics(): void {
    this.service.getMetrics()
      .pipe(takeUntil(this.destroy$))
      .subscribe(metrics => this.metrics = metrics);
  }

  applyFilters(): void {
    const filters = this.filterForm.value;
    let filtered = [...this.suppliers];

    if (filters.searchText) {
      const search = filters.searchText.toLowerCase();
      filtered = filtered.filter(s =>
        s.companyName.toLowerCase().includes(search) ||
        s.contactName.toLowerCase().includes(search) ||
        s.country.toLowerCase().includes(search)
      );
    }
    if (filters.category) {
      filtered = filtered.filter(s => s.category === filters.category);
    }
    if (filters.qualificationStatus) {
      filtered = filtered.filter(s => s.qualificationStatus === filters.qualificationStatus);
    }

    this.dataSource.data = filtered;
  }

  clearFilters(): void {
    this.filterForm.reset({ searchText: '', category: '', qualificationStatus: '' });
  }

  selectSupplier(supplier: Supplier): void {
    this.dialog.open(SupplierDetailDialogComponent, {
      width: '880px',
      maxWidth: '95vw',
      maxHeight: '92vh',
      panelClass: 'supplier-detail-panel',
      data: { supplier }
    });
  }

  openNewSupplierDialog(): void {
    const dialogRef = this.dialog.open(NovoFornecedorDialogComponent, {
      width: '700px',
      maxHeight: '90vh',
      panelClass: 'novo-usuario-panel'
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result) {
          this.service.createSupplier(result)
            .pipe(takeUntil(this.destroy$))
            .subscribe(newSupplier => {
              this.suppliers.push(newSupplier);
              this.dataSource.data = [...this.suppliers];
              this.loadMetrics();
              this.snackBar.open('Fornecedor criado com sucesso!', 'OK', { duration: 3000 });
            });
        }
      });
  }

  exportPDF(): void {
    const columns = [
      { key: 'companyName', label: 'Empresa' },
      { key: 'country', label: 'País' },
      { key: 'category', label: 'Categoria' },
      { key: 'riskScore', label: 'Score Risco' },
      { key: 'qualificationStatus', label: 'Status' },
      { key: 'activeContracts', label: 'Contratos' }
    ];
    this.exportService.exportToPDF('Gestão de Fornecedores', this.dataSource.data, columns, 'fornecedores');
  }

  exportCSV(): void {
    const columns = [
      { key: 'companyName', label: 'Empresa' },
      { key: 'taxId', label: 'CNPJ/Tax ID' },
      { key: 'country', label: 'País' },
      { key: 'category', label: 'Categoria' },
      { key: 'contactName', label: 'Contato' },
      { key: 'email', label: 'Email' },
      { key: 'riskScore', label: 'Score Risco' },
      { key: 'qualificationStatus', label: 'Status' },
      { key: 'activeContracts', label: 'Contratos Ativos' }
    ];
    this.exportService.exportToCSV(this.dataSource.data, columns, 'fornecedores');
  }

  // ================================
  // HELPERS
  // ================================

  getCategoryLabel(category: SupplierCategory): string {
    const map: Record<SupplierCategory, string> = {
      'RAW_MATERIAL': 'Matéria-Prima',
      'PACKAGING': 'Embalagem',
      'LOGISTICS': 'Logística',
      'SERVICES': 'Serviços',
      'EQUIPMENT': 'Equipamentos'
    };
    return map[category] || category;
  }

  getCategoryClass(category: SupplierCategory): string {
    return `cat-${category.toLowerCase().replace('_', '-')}`;
  }

  getStatusLabel(status: QualificationStatus): string {
    const map: Record<QualificationStatus, string> = {
      'QUALIFIED': 'Qualificado',
      'PENDING': 'Pendente',
      'CONDITIONAL': 'Condicional',
      'DISQUALIFIED': 'Desqualificado'
    };
    return map[status] || status;
  }

  getStatusClass(status: QualificationStatus): string {
    const map: Record<QualificationStatus, string> = {
      'QUALIFIED': 'status-qualified',
      'PENDING': 'status-pending',
      'CONDITIONAL': 'status-conditional',
      'DISQUALIFIED': 'status-disqualified'
    };
    return map[status] || '';
  }

  getScoreColor(score: number): string {
    if (score >= 70) return 'score-high';
    if (score >= 40) return 'score-medium';
    return 'score-low';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }
}
