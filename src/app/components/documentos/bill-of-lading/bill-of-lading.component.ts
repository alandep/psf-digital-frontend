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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

import { BillOfLadingMockService } from '../../../../services/billOfLadingMockService';
import { ExportService } from '../../../../services/exportService';
import { BillOfLading, BLType, BLStatus, BLMetrics, BLFilters } from '../../../../types/bill-of-lading';
import { BlDetailDialogComponent, BlDetailDialogData } from './bl-detail-dialog/bl-detail-dialog.component';
import { BlFormDialogComponent, BlFormDialogData } from './bl-form-dialog/bl-form-dialog.component';

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
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule
  ],
  templateUrl: './bill-of-lading.component.html',
  styleUrls: ['./bill-of-lading.component.scss']
})
export class BillOfLadingComponent implements OnInit, OnDestroy, AfterViewInit {

  private service = inject(BillOfLadingMockService);
  private exportService = inject(ExportService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
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
      status: [''],
      dateStart: [null],
      dateEnd: [null]
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
    const dialogRef = this.dialog.open(BlDetailDialogComponent, {
      width: '760px',
      maxWidth: '92vw',
      maxHeight: '90vh',
      autoFocus: false,
      panelClass: 'bl-detail-dialog-panel',
      data: { bl, statuses: this.statuses } as BlDetailDialogData,
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        this.selectedBL = null;
        if (result === 'edit') {
          this.editBL(bl);
        }
      });
  }

  editBL(bl: BillOfLading): void {
    const dialogRef = this.dialog.open(BlFormDialogComponent, {
      width: '880px',
      maxWidth: '92vw',
      maxHeight: '90vh',
      autoFocus: false,
      panelClass: 'bl-form-dialog-panel',
      data: { mode: 'edit', bl, types: this.types, statuses: this.statuses } as BlFormDialogData,
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result: Partial<BillOfLading> | undefined) => {
        if (!result) {
          return;
        }
        const data = this.dataSource.data.slice();
        const index = data.findIndex(item => item.id === bl.id);
        if (index !== -1) {
          data[index] = { ...data[index], ...result, updatedAt: new Date() } as BillOfLading;
          this.dataSource.data = data;
          this.snackBar.open(`BL ${result.blNumber} atualizado com sucesso!`, 'OK', { duration: 3000 });
        }
      });
  }

  openNewBLDialog(): void {
    const dialogRef = this.dialog.open(BlFormDialogComponent, {
      width: '880px',
      maxWidth: '92vw',
      maxHeight: '90vh',
      autoFocus: false,
      panelClass: 'bl-form-dialog-panel',
      data: { mode: 'create', types: this.types, statuses: this.statuses } as BlFormDialogData,
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result: Partial<BillOfLading> | undefined) => {
        if (!result) {
          return;
        }
        const now = new Date();
        const generatedId = `bl-${Date.now()}`;
        const generatedNumber = `BL-2025-${String(this.dataSource.data.length + 1).padStart(5, '0')}`;
        const newBL: BillOfLading = {
          id: generatedId,
          blNumber: result.blNumber || generatedNumber,
          type: result.type || 'OBL',
          shipper: result.shipper || '',
          consignee: result.consignee || '',
          notifyParty: result.notifyParty || '',
          vessel: result.vessel || '',
          voyage: result.voyage || '',
          portLoading: result.portLoading || '',
          portDischarge: result.portDischarge || '',
          placeDelivery: result.placeDelivery || result.portDischarge || '',
          containers: result.containers || [],
          description: result.description || '',
          grossWeight: result.grossWeight || 0,
          measurement: result.measurement || 0,
          freightTerms: result.freightTerms || 'PREPAID',
          status: result.status || 'DRAFT',
          issueDate: result.issueDate || now,
          shippedOnBoard: null,
          linkedExportId: result.linkedExportId || '',
          linkedInvoiceId: result.linkedInvoiceId || '',
          createdAt: now,
          updatedAt: now,
          createdBy: 'admin@empresa.com',
          observations: result.observations || '',
        };
        this.dataSource.data = [newBL, ...this.dataSource.data];
        this.snackBar.open(`BL ${newBL.blNumber} criado com sucesso!`, 'OK', { duration: 3000 });
      });
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
