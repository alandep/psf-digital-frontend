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

import { SancoesMockService } from '../../../../services/sancoesMockService';
import { ExportService } from '../../../../services/exportService';
import {
  SanctionEntity, SanctionListType, EntityType,
  ScreeningStatus, SancoesMetrics
} from '../../../../types/sancoes';
import { HasPermissionDirective } from '../../../directives/has-permission.directive';

@Component({
  selector: 'app-sancoes',
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
    HasPermissionDirective
  ],
  templateUrl: './sancoes.component.html',
  styleUrls: ['./sancoes.component.scss']
})
export class SancoesComponent implements OnInit, OnDestroy, AfterViewInit {

  private service = inject(SancoesMockService);
  private exportService = inject(ExportService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource = new MatTableDataSource<SanctionEntity>([]);
  metrics: SancoesMetrics | null = null;
  filterForm!: FormGroup;

  displayedColumns: string[] = [
    'entityName', 'entityType', 'listMatched', 'matchConfidence',
    'country', 'status', 'lastChecked', 'actions'
  ];

  listTypes: { value: SanctionListType; label: string }[] = [];
  screeningStatuses: { value: ScreeningStatus; label: string }[] = [];
  entityTypes: { value: EntityType; label: string }[] = [];

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      searchText: [''],
      listType: [''],
      status: [''],
      entityType: ['']
    });
    this.listTypes = this.service.getListTypes();
    this.screeningStatuses = this.service.getStatuses();
    this.entityTypes = this.service.getEntityTypes();
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
    this.service.getEntities(filters)
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

  getListLabel(type: SanctionListType): string {
    return this.listTypes.find(l => l.value === type)?.label || type;
  }

  getStatusLabel(status: ScreeningStatus): string {
    return this.screeningStatuses.find(s => s.value === status)?.label || status;
  }

  getEntityTypeLabel(type: EntityType): string {
    return this.entityTypes.find(et => et.value === type)?.label || type;
  }

  viewEntity(entity: SanctionEntity): void {
    this.snackBar.open(`Exibindo detalhes de "${entity.entityName}".`, 'Fechar', { duration: 3000 });
  }

  recheck(entity: SanctionEntity): void {
    this.snackBar.open(`Re-verificando "${entity.entityName}" nas listas de sanções...`, 'Fechar', { duration: 3000 });
  }

  runNewScreening(): void {
    this.snackBar.open('Nova verificação de sanções iniciada.', 'Fechar', { duration: 3000 });
  }

  exportCSV(): void {
    const columns = [
      { key: 'entityName', label: 'Entidade' },
      { key: 'entityType', label: 'Tipo' },
      { key: 'listMatched', label: 'Lista' },
      { key: 'matchConfidence', label: 'Confiança (%)' },
      { key: 'country', label: 'País' },
      { key: 'status', label: 'Status' },
      { key: 'lastChecked', label: 'Última Verificação' },
    ];
    this.exportService.exportToCSV(this.dataSource.filteredData, columns, 'sancoes-screening');
    this.snackBar.open('CSV exportado com sucesso!', 'OK', { duration: 3000 });
  }

  exportPDF(): void {
    const columns = [
      { key: 'entityName', label: 'Entidade' },
      { key: 'listMatched', label: 'Lista' },
      { key: 'matchConfidence', label: 'Confiança (%)' },
      { key: 'country', label: 'País' },
      { key: 'status', label: 'Status' },
    ];
    this.exportService.exportToPDF('Sanções - Screening', this.dataSource.filteredData, columns, 'sancoes-screening');
  }
}
