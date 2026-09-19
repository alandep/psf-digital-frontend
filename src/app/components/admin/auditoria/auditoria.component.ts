import { Component, OnInit, OnDestroy, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { animate, state, style, transition, trigger } from '@angular/animations';

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
import { AuditoriaMockService } from '../../../../services/auditoriaMockService';
import { AuditEntry, AuditMetrics, AuditAction, AuditModule } from '../../../../types/admin-auditoria';
import { HasPermissionDirective } from '../../../directives/has-permission.directive';

@Component({
  selector: 'app-auditoria',
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
  templateUrl: './auditoria.component.html',
  styleUrls: ['./auditoria.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed,void', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class AuditoriaComponent implements OnInit, OnDestroy {

  private auditoriaService = inject(AuditoriaMockService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private destroy$ = new Subject<void>();

  @ViewChild('auditPaginator') auditPaginator!: MatPaginator;
  @ViewChild('auditSort') auditSort!: MatSort;

  dataSource = new MatTableDataSource<AuditEntry>([]);
  metrics: AuditMetrics = {
    totalEvents: 0, eventsToday: 0, uniqueUsers: 0,
    criticalActions: 0, mostActiveModule: '', lastEvent: new Date()
  };
  filterForm!: FormGroup;
  expandedEntry: AuditEntry | null = null;
  isLoading = false;

  displayedColumns: string[] = [
    'timestamp', 'user', 'action', 'module', 'entity', 'description', 'ipAddress', 'actions'
  ];

  actions: AuditAction[] = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'APPROVE', 'REJECT', 'EXPORT', 'IMPORT', 'SIGN'];
  modules: AuditModule[] = ['EXPORTAÇÕES', 'CONTRATOS', 'DOCUMENTOS', 'FINANCEIRO', 'COMPLIANCE', 'LOGÍSTICA', 'USUÁRIOS', 'CONFIGURAÇÕES', 'PRODUTOS', 'LOTES'];
  uniqueUsers: string[] = [];

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
      action: [''],
      module: [''],
      user: ['']
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

    this.auditoriaService.getMetrics()
      .pipe(takeUntil(this.destroy$))
      .subscribe(metrics => this.metrics = metrics);

    this.auditoriaService.getEntries()
      .pipe(takeUntil(this.destroy$))
      .subscribe(entries => {
        this.dataSource.data = entries;
        this.uniqueUsers = [...new Set(entries.map(e => e.user))];
        setTimeout(() => {
          this.dataSource.paginator = this.auditPaginator;
          this.dataSource.sort = this.auditSort;
        });
        this.isLoading = false;
      });
  }

  applyFilters(): void {
    const { searchText, action, module, user } = this.filterForm.value;

    this.dataSource.filterPredicate = (data: AuditEntry, filter: string) => {
      const filterObj = JSON.parse(filter);
      let match = true;

      if (filterObj.searchText) {
        const search = filterObj.searchText.toLowerCase();
        match = match && (
          data.user.toLowerCase().includes(search) ||
          data.entity.toLowerCase().includes(search) ||
          data.description.toLowerCase().includes(search) ||
          data.entityId.toLowerCase().includes(search)
        );
      }
      if (filterObj.action) {
        match = match && data.action === filterObj.action;
      }
      if (filterObj.module) {
        match = match && data.module === filterObj.module;
      }
      if (filterObj.user) {
        match = match && data.user === filterObj.user;
      }

      return match;
    };

    this.dataSource.filter = JSON.stringify({ searchText, action, module, user });
  }

  clearFilters(): void {
    this.filterForm.reset({ searchText: '', action: '', module: '', user: '' });
  }

  toggleExpand(entry: AuditEntry): void {
    this.expandedEntry = this.expandedEntry === entry ? null : entry;
  }

  exportAudit(): void {
    this.snackBar.open('Exportando trilha de auditoria...', 'OK', { duration: 3000 });
  }

  getActionLabel(action: AuditAction): string {
    const labels: Record<AuditAction, string> = {
      'CREATE': 'Criação',
      'UPDATE': 'Atualização',
      'DELETE': 'Exclusão',
      'LOGIN': 'Login',
      'LOGOUT': 'Logout',
      'APPROVE': 'Aprovação',
      'REJECT': 'Rejeição',
      'EXPORT': 'Exportação',
      'IMPORT': 'Importação',
      'SIGN': 'Assinatura'
    };
    return labels[action] || action;
  }

  formatTimeAgo(date: Date): string {
    if (!date) return '—';
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes}min atrás`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h atrás`;
    const days = Math.floor(hours / 24);
    return `${days}d atrás`;
  }
}
