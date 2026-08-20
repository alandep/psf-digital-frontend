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
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { BillOfLadingMockService } from '../../../../services/billOfLadingMockService';
import { ExportService } from '../../../../services/exportService';
import { BillOfLading, BLType, BLStatus, BLMetrics } from '../../../../types/bill-of-lading';

@Component({
  selector: 'app-bill-of-lading',
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
    MatTooltipModule,
    MatSnackBarModule
  ],
  templateUrl: './bill-of-lading.component.html',
  styleUrls: ['./bill-of-lading.component.scss']
})
export class BillOfLadingComponent implements OnInit, OnDestroy, AfterViewInit {

  private service = inject(BillOfLadingMockService);
  private exportService = inject(ExportService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource = new MatTableDataSource<BillOfLading>([]);
  metrics: BLMetrics | null = null;
  selectedBL: BillOfLading | null = null;
  filterForm!: FormGroup;

  displayedColumns: string[] = [
    'blNumber', 'type', 'shipper', 'consignee', 'vessel', 'voyage',
    'portLoading', 'portDischarge', 'containers', 'status', 'issueDate', 'actions'
  ];

  types: { value: BLType; label: string }[] = [];
  statuses: { value: BLStatus; label: string }[] = [];

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      searchText: [''],
      type: [''],
      status: ['']
    });
    this.types = this.service.getTypes();
    this.statuses = this.service.getStatuses();
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
      .subscribe(filters => this.loadData(filters));
  }

  private loadData(filters?: any): void {
    this.service.getBillsOfLading(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.dataSource.data = data;
      });
  }

  private loadMetrics(): void {
    this.service.getMetrics()
      .pipe(takeUntil(this.destroy$))
      .subscribe(m => this.metrics = m);
  }

  getStatusLabel(status: BLStatus): string {
    return this.statuses.find(s => s.value === status)?.label || status;
  }

  viewDetails(bl: BillOfLading): void {
    this.selectedBL = bl;
  }

  closeDetail(): void {
    this.selectedBL = null;
  }

  editBL(bl: BillOfLading): void {
    this.snackBar.open(`Editando BL: ${bl.blNumber}`, 'OK', { duration: 3000 });
  }

  openNewBLDialog(): void {
    this.snackBar.open('Criando novo Bill of Lading...', 'OK', { duration: 3000 });
  }

  exportCSV(): void {
    const columns = [
      { key: 'blNumber', label: 'BL Number' },
      { key: 'type', label: 'Tipo' },
      { key: 'shipper', label: 'Shipper' },
      { key: 'consignee', label: 'Consignee' },
      { key: 'vessel', label: 'Vessel' },
      { key: 'voyage', label: 'Voyage' },
      { key: 'portLoading', label: 'Porto Embarque' },
      { key: 'portDischarge', label: 'Porto Descarga' },
      { key: 'status', label: 'Status' },
      { key: 'issueDate', label: 'Data Emissão' },
    ];
    this.exportService.exportToCSV(this.dataSource.filteredData, columns, 'bills-of-lading');
    this.snackBar.open('CSV exportado com sucesso!', 'OK', { duration: 3000 });
  }

  exportPDF(): void {
    const columns = [
      { key: 'blNumber', label: 'BL Number' },
      { key: 'type', label: 'Tipo' },
      { key: 'shipper', label: 'Shipper' },
      { key: 'consignee', label: 'Consignee' },
      { key: 'vessel', label: 'Vessel' },
      { key: 'status', label: 'Status' },
    ];
    this.exportService.exportToPDF('Bills of Lading', this.dataSource.filteredData, columns, 'bills-of-lading');
  }
}
