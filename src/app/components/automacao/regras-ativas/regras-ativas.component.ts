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
import { MatChipsModule } from '@angular/material/chips';

// Services and Types
import { RegrasAtivasMockService } from '../../../../services/regrasAtivasMockService';
import { RegraAutomacao, RegrasMetrics, RegraCategoria, RegraTrigger, RegraStatus } from '../../../../types/automacao-regras';

@Component({
  selector: 'app-regras-ativas',
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
    MatChipsModule
  ],
  templateUrl: './regras-ativas.component.html',
  styleUrls: ['./regras-ativas.component.scss']
})
export class RegrasAtivasComponent implements OnInit, OnDestroy {

  private regrasService = inject(RegrasAtivasMockService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private destroy$ = new Subject<void>();

  @ViewChild('regrasPaginator') regrasPaginator!: MatPaginator;
  @ViewChild('regrasSort') regrasSort!: MatSort;

  dataSource = new MatTableDataSource<RegraAutomacao>([]);
  metrics: RegrasMetrics = {
    totalRegras: 0, ativas: 0, pausadas: 0,
    comErro: 0, execucoesHoje: 0, taxaSucessoMedia: 0
  };
  filterForm!: FormGroup;
  isLoading = false;

  displayedColumns: string[] = [
    'name', 'categoria', 'trigger', 'status', 'condition', 'action',
    'lastExecution', 'executionCount', 'successRate', 'priority', 'actions'
  ];

  categorias: RegraCategoria[] = ['DOCUMENTOS', 'NOTIFICAÇÕES', 'COMPLIANCE', 'FINANCEIRO', 'LOGÍSTICA', 'EXPORTAÇÕES', 'QUALIDADE'];
  triggers: RegraTrigger[] = ['EVENTO', 'AGENDAMENTO', 'CONDIÇÃO', 'MANUAL', 'WEBHOOK'];
  statuses: RegraStatus[] = ['ATIVA', 'PAUSADA', 'DESATIVADA', 'ERRO'];

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
      categoria: [''],
      trigger: [''],
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

    this.regrasService.getMetrics()
      .pipe(takeUntil(this.destroy$))
      .subscribe(metrics => this.metrics = metrics);

    this.regrasService.getRegras()
      .pipe(takeUntil(this.destroy$))
      .subscribe(regras => {
        this.dataSource.data = regras;
        setTimeout(() => {
          this.dataSource.paginator = this.regrasPaginator;
          this.dataSource.sort = this.regrasSort;
        });
        this.isLoading = false;
      });
  }

  applyFilters(): void {
    const { searchText, categoria, trigger, status } = this.filterForm.value;

    this.dataSource.filterPredicate = (data: RegraAutomacao, filter: string) => {
      const filterObj = JSON.parse(filter);
      let match = true;

      if (filterObj.searchText) {
        const search = filterObj.searchText.toLowerCase();
        match = match && (
          data.name.toLowerCase().includes(search) ||
          data.description.toLowerCase().includes(search) ||
          data.condition.toLowerCase().includes(search) ||
          data.action.toLowerCase().includes(search)
        );
      }
      if (filterObj.categoria) {
        match = match && data.categoria === filterObj.categoria;
      }
      if (filterObj.trigger) {
        match = match && data.trigger === filterObj.trigger;
      }
      if (filterObj.status) {
        match = match && data.status === filterObj.status;
      }

      return match;
    };

    this.dataSource.filter = JSON.stringify({ searchText, categoria, trigger, status });
  }

  clearFilters(): void {
    this.filterForm.reset({ searchText: '', categoria: '', trigger: '', status: '' });
  }

  novaRegra(): void {
    this.snackBar.open('Abrindo formulário de nova regra...', 'OK', { duration: 3000 });
  }

  toggleRegra(regra: RegraAutomacao): void {
    const newStatus = regra.status === 'ATIVA' ? 'PAUSADA' : 'ATIVA';
    this.snackBar.open(`Regra "${regra.name}" ${newStatus === 'ATIVA' ? 'ativada' : 'pausada'}`, 'OK', { duration: 3000 });
  }

  editRegra(regra: RegraAutomacao): void {
    this.snackBar.open(`Editando regra "${regra.name}"...`, 'OK', { duration: 3000 });
  }

  getStatusLabel(status: RegraStatus): string {
    const labels: Record<RegraStatus, string> = {
      'ATIVA': 'Ativa',
      'PAUSADA': 'Pausada',
      'DESATIVADA': 'Desativada',
      'ERRO': 'Erro'
    };
    return labels[status] || status;
  }

  getCategoriaLabel(categoria: RegraCategoria): string {
    const labels: Record<RegraCategoria, string> = {
      'DOCUMENTOS': 'Documentos',
      'NOTIFICAÇÕES': 'Notificações',
      'COMPLIANCE': 'Compliance',
      'FINANCEIRO': 'Financeiro',
      'LOGÍSTICA': 'Logística',
      'EXPORTAÇÕES': 'Exportações',
      'QUALIDADE': 'Qualidade'
    };
    return labels[categoria] || categoria;
  }

  getTriggerLabel(trigger: RegraTrigger): string {
    const labels: Record<RegraTrigger, string> = {
      'EVENTO': 'Evento',
      'AGENDAMENTO': 'Agendamento',
      'CONDIÇÃO': 'Condição',
      'MANUAL': 'Manual',
      'WEBHOOK': 'Webhook'
    };
    return labels[trigger] || trigger;
  }
}
