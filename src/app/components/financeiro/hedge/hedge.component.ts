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
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { HedgeMockService } from '../../../../services/hedgeMockService';
import { ExportService } from '../../../../services/exportService';
import {
  HedgeContract,
  HedgeType,
  HedgeStatus,
  HedgeKPIs,
  ExposureSummary,
  HedgeFilters
} from '../../../../types/hedge';

@Component({
  selector: 'app-hedge',
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
    MatDividerModule,
    MatDialogModule
  ],
  templateUrl: './hedge.component.html',
  styleUrls: ['./hedge.component.scss']
})
export class HedgeComponent implements OnInit, OnDestroy, AfterViewInit {

  private hedgeService = inject(HedgeMockService);
  private exportService = inject(ExportService);
  private formBuilder = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  private destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  contracts: HedgeContract[] = [];
  dataSource = new MatTableDataSource<HedgeContract>([]);
  kpis: HedgeKPIs | null = null;
  exposure: ExposureSummary | null = null;

  isLoading = false;

  filterForm!: FormGroup;

  displayedColumns: string[] = [
    'contractNumber', 'bank', 'type', 'notionalValue', 'currencyPair',
    'strikeRate', 'maturityDate', 'markToMarket', 'status', 'actions'
  ];

  banks: string[] = [];
  types: HedgeType[] = [];
  statuses: HedgeStatus[] = [];
  currencyPairs: string[] = [];

  ngOnInit(): void {
    this.initForm();
    this.loadDropdownData();
    this.loadContracts();
    this.loadKPIs();
    this.loadExposure();
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

  private initForm(): void {
    this.filterForm = this.formBuilder.group({
      searchText: [''],
      type: [''],
      status: [''],
      bank: [''],
      currencyPair: ['']
    });
  }

  private loadDropdownData(): void {
    this.banks = this.hedgeService.getBanks();
    this.types = this.hedgeService.getTypes();
    this.statuses = this.hedgeService.getStatuses();
    this.currencyPairs = this.hedgeService.getCurrencyPairs();
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

  loadContracts(): void {
    this.isLoading = true;
    this.hedgeService.getContracts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.contracts = data;
          this.dataSource.data = data;
          this.isLoading = false;
        },
        error: () => {
          this.snackBar.open('Erro ao carregar contratos de hedge', 'Fechar', { duration: 3000 });
          this.isLoading = false;
        }
      });
  }

  loadKPIs(): void {
    this.hedgeService.getKPIs()
      .pipe(takeUntil(this.destroy$))
      .subscribe(kpis => this.kpis = kpis);
  }

  loadExposure(): void {
    this.hedgeService.getExposureSummary()
      .pipe(takeUntil(this.destroy$))
      .subscribe(exp => this.exposure = exp);
  }

  applyFilters(): void {
    const filters: HedgeFilters = this.filterForm.value;
    this.hedgeService.getContracts(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.contracts = data;
        this.dataSource.data = data;
      });
  }

  clearFilters(): void {
    this.filterForm.reset({ searchText: '', type: '', status: '', bank: '', currencyPair: '' });
  }

  openNovoHedgeDialog(): void {
    import('../dialogs/novo-hedge-dialog.component').then(m => {
      this.dialog.open(m.NovoHedgeDialogComponent, {
        width: '700px',
        panelClass: 'novo-usuario-panel'
      }).afterClosed().subscribe(result => {
        if (result) {
          this.snackBar.open('Novo contrato de hedge registrado!', 'OK', { duration: 3000 });
          this.loadContracts();
          this.loadKPIs();
          this.loadExposure();
        }
      });
    });
  }

  exportCSV(): void {
    const columns = [
      { key: 'contractNumber', label: 'Contrato' },
      { key: 'bank', label: 'Banco' },
      { key: 'type', label: 'Tipo' },
      { key: 'notionalValue', label: 'Valor Nocional' },
      { key: 'currencyPair', label: 'Par' },
      { key: 'strikeRate', label: 'Taxa Strike' },
      { key: 'maturityDate', label: 'Vencimento' },
      { key: 'markToMarket', label: 'MtM' },
      { key: 'status', label: 'Status' }
    ];
    this.exportService.exportToCSV(this.dataSource.filteredData, columns, 'hedge-contracts');
    this.snackBar.open('Exportação CSV concluída!', 'OK', { duration: 2000 });
  }

  exportPDF(): void {
    const columns = [
      { key: 'contractNumber', label: 'Contrato' },
      { key: 'bank', label: 'Banco' },
      { key: 'type', label: 'Tipo' },
      { key: 'notionalValue', label: 'Valor Nocional' },
      { key: 'currencyPair', label: 'Par' },
      { key: 'strikeRate', label: 'Taxa Strike' },
      { key: 'maturityDate', label: 'Vencimento' },
      { key: 'markToMarket', label: 'MtM' }
    ];
    this.exportService.exportToPDF('Relatório Hedge Cambial', this.dataSource.filteredData, columns, 'hedge-report');
  }

  isMaturityCritical(contract: HedgeContract): boolean {
    const now = new Date();
    const maturity = new Date(contract.maturityDate);
    const diff = maturity.getTime() - now.getTime();
    return diff <= 7 * 24 * 60 * 60 * 1000 && diff > 0 && contract.status === 'ATIVO';
  }

  getRowClass(contract: HedgeContract): string {
    return this.isMaturityCritical(contract) ? 'row-critical' : '';
  }

  getTypeLabel(type: HedgeType): string {
    const map: Record<HedgeType, string> = {
      'NDF': 'NDF',
      'FORWARD': 'Forward',
      'OPTION_CALL': 'Opção Call',
      'OPTION_PUT': 'Opção Put',
      'SWAP': 'Swap'
    };
    return map[type] || type;
  }

  getStatusColor(status: HedgeStatus): string {
    const map: Record<HedgeStatus, string> = {
      'ATIVO': 'status-ativo',
      'LIQUIDADO': 'status-liquidado',
      'VENCIDO': 'status-vencido',
      'CANCELADO': 'status-cancelado',
      'EM_NEGOCIACAO': 'status-negociacao'
    };
    return map[status] || '';
  }

  getMtmClass(value: number): string {
    if (value > 0) return 'mtm-positive';
    if (value < 0) return 'mtm-negative';
    return '';
  }

  formatCurrency(value: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(value);
  }

  formatBRL(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  formatPercent(value: number): string {
    return value.toFixed(1) + '%';
  }
}
