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
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';

import { CrmMockService } from '../../../../services/crmMockService';
import { ExportService } from '../../../../services/exportService';
import { Customer, CrmMetrics, CustomerSegment } from '../../../../types/crm';
import { NovoClienteDialogComponent } from '../dialogs/novo-cliente-dialog.component';

@Component({
  selector: 'app-visao-360',
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
    MatSnackBarModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatDialogModule,
    MatMenuModule
  ],
  templateUrl: './visao-360.component.html',
  styleUrls: ['./visao-360.component.scss']
})
export class Visao360Component implements OnInit, OnDestroy, AfterViewInit {

  private service = inject(CrmMockService);
  private exportService = inject(ExportService);
  private formBuilder = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  private destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  customers: Customer[] = [];
  dataSource = new MatTableDataSource<Customer>([]);
  selectedCustomer: Customer | null = null;
  metrics: CrmMetrics | null = null;
  isLoading = false;
  isDetailOpen = false;

  filterForm!: FormGroup;

  displayedColumns: string[] = [
    'companyName', 'tradeName', 'taxId', 'country', 'segment',
    'primaryContact', 'totalRevenue', 'activeContracts', 'riskScore', 'lastInteractionDate'
  ];

  segments: CustomerSegment[] = [];
  countries: string[] = [];

  ngOnInit(): void {
    this.initForms();
    this.loadDropdownData();
    this.loadCustomers();
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
      country: [''],
      segment: ['']
    });
  }

  private loadDropdownData(): void {
    this.segments = this.service.getSegments();
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

  loadCustomers(): void {
    this.isLoading = true;
    this.service.getCustomers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.customers = data;
          this.dataSource.data = data;
          this.isLoading = false;
        },
        error: () => {
          this.snackBar.open('Erro ao carregar clientes', 'Fechar', { duration: 3000 });
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
    let filtered = [...this.customers];

    if (filters.searchText) {
      const search = filters.searchText.toLowerCase();
      filtered = filtered.filter(c =>
        c.companyName.toLowerCase().includes(search) ||
        c.tradeName.toLowerCase().includes(search) ||
        c.taxId.toLowerCase().includes(search) ||
        c.primaryContact.toLowerCase().includes(search)
      );
    }
    if (filters.country) {
      filtered = filtered.filter(c => c.country === filters.country);
    }
    if (filters.segment) {
      filtered = filtered.filter(c => c.segment === filters.segment);
    }

    this.dataSource.data = filtered;
  }

  clearFilters(): void {
    this.filterForm.reset({ searchText: '', country: '', segment: '' });
  }

  selectCustomer(customer: Customer): void {
    this.selectedCustomer = customer;
    this.isDetailOpen = true;
  }

  closeDetail(): void {
    this.isDetailOpen = false;
    this.selectedCustomer = null;
  }

  openNewCustomerDialog(): void {
    const dialogRef = this.dialog.open(NovoClienteDialogComponent, {
      width: '700px',
      maxHeight: '90vh',
      panelClass: 'novo-usuario-panel'
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result) {
          this.service.createCustomer(result)
            .pipe(takeUntil(this.destroy$))
            .subscribe(newCustomer => {
              this.customers.push(newCustomer);
              this.dataSource.data = [...this.customers];
              this.loadMetrics();
              this.snackBar.open('Cliente criado com sucesso!', 'OK', { duration: 3000 });
            });
        }
      });
  }

  exportPDF(): void {
    const columns = [
      { key: 'companyName', label: 'Empresa' },
      { key: 'tradeName', label: 'Nome Fantasia' },
      { key: 'country', label: 'País' },
      { key: 'segment', label: 'Segmento' },
      { key: 'totalRevenue', label: 'Receita Total' },
      { key: 'activeContracts', label: 'Contratos' },
      { key: 'riskScore', label: 'Score Risco' }
    ];
    this.exportService.exportToPDF('Clientes — Visão 360', this.dataSource.data, columns, 'clientes-360');
  }

  exportCSV(): void {
    const columns = [
      { key: 'companyName', label: 'Empresa' },
      { key: 'tradeName', label: 'Nome Fantasia' },
      { key: 'taxId', label: 'CNPJ/Tax ID' },
      { key: 'country', label: 'País' },
      { key: 'segment', label: 'Segmento' },
      { key: 'primaryContact', label: 'Contato Principal' },
      { key: 'totalRevenue', label: 'Receita Total' },
      { key: 'activeContracts', label: 'Contratos Ativos' },
      { key: 'riskScore', label: 'Score Risco' }
    ];
    this.exportService.exportToCSV(this.dataSource.data, columns, 'clientes-360');
  }

  // ================================
  // HELPERS
  // ================================

  getSegmentLabel(segment: CustomerSegment): string {
    const map: Record<CustomerSegment, string> = {
      'AGRO': 'Agro',
      'INDUSTRIAL': 'Industrial',
      'TRADING': 'Trading',
      'RETAIL': 'Varejo',
      'SERVICES': 'Serviços'
    };
    return map[segment] || segment;
  }

  getSegmentClass(segment: CustomerSegment): string {
    return `seg-${segment.toLowerCase()}`;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'USD' }).format(value);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  getScoreColor(score: number): string {
    if (score >= 70) return 'score-high';
    if (score >= 40) return 'score-medium';
    return 'score-low';
  }
}
