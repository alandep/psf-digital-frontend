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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

import { PackingListMockService } from '../../../../services/packingListMockService';
import { ExportService } from '../../../../services/exportService';
import { PackingList, PackingListStatus, PackingListMetrics, PackingListFilters } from '../../../../types/packing-list';
import { PackingListDetailDialogComponent, PackingListDetailDialogData } from './packing-list-detail-dialog/packing-list-detail-dialog.component';

@Component({
  selector: 'app-packing-list',
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
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule
  ],
  templateUrl: './packing-list.component.html',
  styleUrls: ['./packing-list.component.scss']
})
export class PackingListComponent implements OnInit, OnDestroy, AfterViewInit {

  private service = inject(PackingListMockService);
  private exportService = inject(ExportService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource = new MatTableDataSource<PackingList>([]);
  selectedItem: PackingList | null = null;
  metrics: PackingListMetrics | null = null;
  isLoading = false;

  filterForm!: FormGroup;

  displayedColumns: string[] = [
    'packingListNumber', 'linkedInvoice', 'exporter', 'buyer', 'totalPackages',
    'totalGrossWeight', 'totalNetWeight', 'status', 'actions'
  ];

  statuses: { value: PackingListStatus; label: string }[] = [];
  buyers: string[] = [];

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      searchText: [''],
      status: [''],
      buyer: [''],
      dateStart: [null],
      dateEnd: [null]
    });
    this.statuses = this.service.getStatuses();
    this.buyers = this.service.getBuyers();
    this.loadData();
    this.loadMetrics();
    this.setupFilterListeners();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupFilterListeners(): void {
    this.filterForm.valueChanges
      .pipe(takeUntil(this.destroy$), debounceTime(300), distinctUntilChanged())
      .subscribe(() => this.applyFilters());
  }

  loadData(): void {
    this.isLoading = true;
    this.service.getPackingLists()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.dataSource.data = data;
          this.isLoading = false;
        },
        error: () => {
          this.snackBar.open('Erro ao carregar packing lists', 'Fechar', { duration: 3000 });
          this.isLoading = false;
        }
      });
  }

  loadMetrics(): void {
    this.service.getMetrics()
      .pipe(takeUntil(this.destroy$))
      .subscribe(m => this.metrics = m);
  }

  applyFilters(): void {
    const filters: PackingListFilters = {
      searchText: this.filterForm.value.searchText || '',
      status: this.filterForm.value.status || '',
      buyer: this.filterForm.value.buyer || '',
      dateStart: this.filterForm.value.dateStart,
      dateEnd: this.filterForm.value.dateEnd
    };
    this.service.getPackingLists(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.dataSource.data = data);
  }

  clearFilters(): void {
    this.filterForm.reset({ searchText: '', status: '', buyer: '', dateStart: null, dateEnd: null });
  }

  selectItem(item: PackingList): void {
    this.selectedItem = item;
    const dialogRef = this.dialog.open(PackingListDetailDialogComponent, {
      width: '720px',
      maxWidth: '92vw',
      maxHeight: '90vh',
      autoFocus: false,
      panelClass: 'packing-list-detail-dialog-panel',
      data: { item, statuses: this.statuses } as PackingListDetailDialogData,
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.selectedItem = null;
      });
  }

  exportCSV(): void {
    const columns = [
      { key: 'packingListNumber', label: 'Número' },
      { key: 'linkedInvoice', label: 'Invoice' },
      { key: 'exporter', label: 'Exportador' },
      { key: 'buyer', label: 'Comprador' },
      { key: 'totalPackages', label: 'Volumes' },
      { key: 'totalGrossWeight', label: 'Peso Bruto (kg)' },
      { key: 'totalNetWeight', label: 'Peso Líquido (kg)' },
      { key: 'status', label: 'Status' }
    ];
    this.exportService.exportToCSV(this.dataSource.filteredData, columns, 'packing-lists');
    this.snackBar.open('Exportação CSV concluída!', 'OK', { duration: 2000 });
  }

  exportPDF(): void {
    const columns = [
      { key: 'packingListNumber', label: 'Número' },
      { key: 'linkedInvoice', label: 'Invoice' },
      { key: 'buyer', label: 'Comprador' },
      { key: 'totalPackages', label: 'Volumes' },
      { key: 'totalGrossWeight', label: 'Peso Bruto' },
      { key: 'status', label: 'Status' }
    ];
    this.exportService.exportToPDF('Relatório Packing Lists', this.dataSource.filteredData, columns, 'packing-lists-report');
  }

  getStatusLabel(status: PackingListStatus): string {
    const map: Record<PackingListStatus, string> = {
      'RASCUNHO': 'Rascunho',
      'PENDENTE_VALIDACAO': 'Pendente Validação',
      'VALIDADO': 'Validado',
      'APROVADO': 'Aprovado',
      'VINCULADO_EMBARQUE': 'Vinculado Embarque',
      'FINALIZADO': 'Finalizado'
    };
    return map[status] || status;
  }

  getStatusColor(status: PackingListStatus): string {
    const map: Record<PackingListStatus, string> = {
      'RASCUNHO': 'status-draft',
      'PENDENTE_VALIDACAO': 'status-pending',
      'VALIDADO': 'status-validated',
      'APROVADO': 'status-approved',
      'VINCULADO_EMBARQUE': 'status-linked',
      'FINALIZADO': 'status-finished'
    };
    return map[status] || '';
  }

  formatWeight(value: number): string {
    return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value) + ' kg';
  }
}
