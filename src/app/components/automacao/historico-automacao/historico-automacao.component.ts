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
import { HistoricoAutomacaoMockService } from '../../../../services/historicoAutomacaoMockService';
import { ExecucaoRegra, HistoricoMetrics, ExecucaoStatus } from '../../../../types/automacao-historico';
import { HasPermissionDirective } from '../../../directives/has-permission.directive';

@Component({
  selector: 'app-historico-automacao',
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
    MatTooltipModule,
    HasPermissionDirective
  ],
  templateUrl: './historico-automacao.component.html',
  styleUrls: ['./historico-automacao.component.scss']
})
export class HistoricoAutomacaoComponent implements OnInit, OnDestroy {

  private historicoService = inject(HistoricoAutomacaoMockService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private destroy$ = new Subject<void>();

  @ViewChild('historicoPaginator') historicoPaginator!: MatPaginator;
  @ViewChild('historicoSort') historicoSort!: MatSort;

  dataSource = new MatTableDataSource<ExecucaoRegra>([]);
  metrics: HistoricoMetrics = {
    totalExecucoes: 0, execucoesHoje: 0, sucessos: 0,
    falhas: 0, tempoMedio: 0, taxaSucesso: 0
  };
  filterForm!: FormGroup;
  isLoading = false;

  displayedColumns: string[] = [
    'startTime', 'ruleName', 'categoria', 'trigger', 'status',
    'duration', 'affectedEntities', 'output', 'error'
  ];

  statuses: ExecucaoStatus[] = ['SUCESSO', 'FALHA', 'PARCIAL', 'TIMEOUT', 'CANCELADA'];
  ruleNames: string[] = [];

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
      status: [''],
      ruleName: [''],
      periodo: ['']
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

    this.historicoService.getMetrics()
      .pipe(takeUntil(this.destroy$))
      .subscribe(metrics => this.metrics = metrics);

    this.historicoService.getExecucoes()
      .pipe(takeUntil(this.destroy$))
      .subscribe(execucoes => {
        this.dataSource.data = execucoes;
        this.ruleNames = [...new Set(execucoes.map(e => e.ruleName))];
        setTimeout(() => {
          this.dataSource.paginator = this.historicoPaginator;
          this.dataSource.sort = this.historicoSort;
        });
        this.isLoading = false;
      });
  }

  applyFilters(): void {
    const { status, ruleName, periodo } = this.filterForm.value;

    this.dataSource.filterPredicate = (data: ExecucaoRegra, filter: string) => {
      const filterObj = JSON.parse(filter);
      let match = true;

      if (filterObj.status) {
        match = match && data.status === filterObj.status;
      }
      if (filterObj.ruleName) {
        match = match && data.ruleName === filterObj.ruleName;
      }
      if (filterObj.periodo) {
        const now = new Date();
        const hours = parseInt(filterObj.periodo, 10);
        const cutoff = new Date(now.getTime() - hours * 60 * 60 * 1000);
        match = match && new Date(data.startTime) >= cutoff;
      }

      return match;
    };

    this.dataSource.filter = JSON.stringify({ status, ruleName, periodo });
  }

  clearFilters(): void {
    this.filterForm.reset({ status: '', ruleName: '', periodo: '' });
  }

  exportData(): void {
    this.snackBar.open('Exportando histórico de execuções...', 'OK', { duration: 3000 });
  }

  getStatusLabel(status: ExecucaoStatus): string {
    const labels: Record<ExecucaoStatus, string> = {
      'SUCESSO': 'Sucesso',
      'FALHA': 'Falha',
      'PARCIAL': 'Parcial',
      'TIMEOUT': 'Timeout',
      'CANCELADA': 'Cancelada'
    };
    return labels[status] || status;
  }

  formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}min`;
  }

  formatTempoMedio(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  }
}
