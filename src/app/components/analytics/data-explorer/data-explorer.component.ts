import { Component, OnInit, OnDestroy, inject, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

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

import { DataExplorerMockService } from '../../../../services/dataExplorerMockService';
import { ExportService } from '../../../../services/exportService';
import { DatasetInfo, QueryResult, SavedQuery, ViewMode } from '../../../../types/data-explorer';
import { HasPermissionDirective } from '../../../directives/has-permission.directive';

@Component({
  selector: 'app-data-explorer',
  standalone: true,
  imports: [
    HasPermissionDirective,
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
  templateUrl: './data-explorer.component.html',
  styleUrls: ['./data-explorer.component.scss']
})
export class DataExplorerComponent implements OnInit, OnDestroy, AfterViewInit {

  private service = inject(DataExplorerMockService);
  private exportService = inject(ExportService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  queryForm!: FormGroup;
  datasets: DatasetInfo[] = [];
  savedQueries: SavedQuery[] = [];
  queryResults: QueryResult[] = [];
  resultsDataSource = new MatTableDataSource<QueryResult>([]);
  viewMode: ViewMode = 'TABLE';
  hasExecuted = false;
  resultColumns = ['label', 'value', 'percentage'];

  currentDimensions: string[] = [];
  currentMetrics: string[] = [];
  currentFilters: string[] = [];
  maxValue = 0;

  ngOnInit(): void {
    this.queryForm = this.fb.group({
      dataset: ['EXPORTACOES', Validators.required],
      groupBy: ['', Validators.required],
      metric: ['SUM', Validators.required],
      metricField: ['', Validators.required],
      filterField: [''],
      filterValue: ['']
    });

    this.datasets = this.service.getDatasets();
    this.loadSavedQueries();
    this.onDatasetChange();
  }

  ngAfterViewInit(): void {
    this.resultsDataSource.paginator = this.paginator;
    this.resultsDataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onDatasetChange(): void {
    const ds = this.datasets.find(d => d.type === this.queryForm.get('dataset')?.value);
    if (ds) {
      this.currentDimensions = ds.dimensions;
      this.currentMetrics = ds.metrics;
      this.currentFilters = ds.filterFields;
      this.queryForm.patchValue({
        groupBy: ds.dimensions[0] || '',
        metricField: ds.metrics[0] || ''
      });
    }
  }

  executeQuery(): void {
    const config = this.queryForm.value;
    this.service.executeQuery(config)
      .pipe(takeUntil(this.destroy$))
      .subscribe(results => {
        this.queryResults = results;
        this.resultsDataSource.data = results;
        this.maxValue = Math.max(...results.map(r => r.value));
        this.hasExecuted = true;
        this.snackBar.open(`Consulta executada: ${results.length} resultados`, 'OK', { duration: 3000 });
      });
  }

  loadSavedQuery(query: SavedQuery): void {
    this.queryForm.patchValue(query.config);
    this.onDatasetChange();
    this.executeQuery();
  }

  setViewMode(mode: ViewMode): void {
    this.viewMode = mode;
  }

  getBarWidth(value: number): number {
    return this.maxValue > 0 ? (value / this.maxValue) * 100 : 0;
  }

  exportResults(): void {
    if (this.queryResults.length === 0) {
      this.snackBar.open('Execute uma consulta antes de exportar', 'OK', { duration: 3000 });
      return;
    }
    const columns = [
      { key: 'label', label: 'Grupo' },
      { key: 'value', label: 'Valor' },
      { key: 'percentage', label: 'Percentual (%)' },
    ];
    this.exportService.exportToCSV(this.queryResults, columns, 'data-explorer-results');
    this.snackBar.open('Resultados exportados com sucesso!', 'OK', { duration: 3000 });
  }

  private loadSavedQueries(): void {
    this.service.getSavedQueries()
      .pipe(takeUntil(this.destroy$))
      .subscribe(queries => this.savedQueries = queries);
  }
}
