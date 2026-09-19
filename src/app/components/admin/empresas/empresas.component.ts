import { Component, OnInit, OnDestroy, ViewChild, inject, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

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
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

// Services and Types
import { EmpresasMockService } from '../../../../services/empresasMockService';
import { Empresa, EmpresaMetrics, EmpresaStatus, EmpresaTipo } from '../../../../types/admin-empresas';

// Dialogs
import { NovaEmpresaDialogComponent } from './nova-empresa-dialog/nova-empresa-dialog.component';
import { EditarEmpresaDialogComponent } from './editar-empresa-dialog/editar-empresa-dialog.component';
import { ConfirmarAcaoDialogComponent, ConfirmDialogData } from '../usuarios/confirmar-acao-dialog/confirmar-acao-dialog.component';
import { HasPermissionDirective } from '../../../directives/has-permission.directive';

@Component({
  selector: 'app-empresas',
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
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule,
    HasPermissionDirective
  ],
  templateUrl: './empresas.component.html',
  styleUrls: ['./empresas.component.scss']
})
export class EmpresasComponent implements OnInit, OnDestroy, AfterViewInit {

  private empresasService = inject(EmpresasMockService);
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  filterForm!: FormGroup;
  dataSource = new MatTableDataSource<Empresa>();
  metrics: EmpresaMetrics = {
    totalEmpresas: 0, ativas: 0, emOnboarding: 0, suspensas: 0,
    totalUsuarios: 0, totalExportacoes: 0
  };
  loading = true;

  displayedColumns: string[] = [
    'nomeFantasia', 'cnpj', 'tipo', 'status', 'pais', 'plano',
    'responsavel', 'usuarios', 'exportacoes', 'dataAdesao', 'ultimoAcesso', 'actions'
  ];

  tipos: EmpresaTipo[] = ['EXPORTADOR', 'TRADING', 'COOPERATIVA', 'INDÚSTRIA', 'OPERADOR_LOGÍSTICO'];
  statuses: EmpresaStatus[] = ['ATIVA', 'SUSPENSA', 'BLOQUEADA', 'EM_ONBOARDING'];
  planos: string[] = ['Starter', 'Professional', 'Enterprise'];

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      tipo: [''],
      status: [''],
      plano: [''],
      search: ['']
    });

    this.loadData();

    this.filterForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.applyFilters());
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadData(): void {
    this.loading = true;

    this.empresasService.getEmpresas()
      .pipe(takeUntil(this.destroy$))
      .subscribe(empresas => {
        this.dataSource.data = empresas;
        this.loading = false;
      });

    this.empresasService.getMetrics()
      .pipe(takeUntil(this.destroy$))
      .subscribe(metrics => {
        this.metrics = metrics;
      });
  }

  applyFilters(): void {
    const { tipo, status, plano, search } = this.filterForm.value;

    this.dataSource.filterPredicate = (data: Empresa, filter: string) => {
      const filterObj = JSON.parse(filter);
      let match = true;

      if (filterObj.tipo) {
        match = match && data.tipo === filterObj.tipo;
      }
      if (filterObj.status) {
        match = match && data.status === filterObj.status;
      }
      if (filterObj.plano) {
        match = match && data.plano === filterObj.plano;
      }
      if (filterObj.search) {
        const searchLower = filterObj.search.toLowerCase();
        match = match && (
          data.nomeFantasia.toLowerCase().includes(searchLower) ||
          data.razaoSocial.toLowerCase().includes(searchLower) ||
          data.cnpj.includes(searchLower) ||
          data.responsavel.toLowerCase().includes(searchLower)
        );
      }

      return match;
    };

    this.dataSource.filter = JSON.stringify({ tipo, status, plano, search });
  }

  clearFilters(): void {
    this.filterForm.reset({ tipo: '', status: '', plano: '', search: '' });
  }

  novaEmpresa(): void {
    const dialogRef = this.dialog.open(NovaEmpresaDialogComponent, {
      width: '780px',
      maxWidth: '92vw',
      maxHeight: '85vh',
      autoFocus: 'first-tabbable',
      panelClass: 'novo-usuario-panel'
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result) {
          const newEmpresa: Empresa = {
            id: 'EMP-' + Date.now(),
            razaoSocial: result.razaoSocial,
            nomeFantasia: result.nomeFantasia,
            cnpj: result.cnpj,
            tipo: result.tipo,
            status: 'EM_ONBOARDING',
            pais: result.pais || 'Brasil',
            estado: result.estado || '',
            cidade: result.cidade || '',
            responsavel: result.responsavel,
            email: result.email || '',
            telefone: result.telefone || '',
            plano: result.plano || 'Professional',
            dataAdesao: new Date(),
            ultimoAcesso: new Date(),
            usuarios: 0,
            exportacoes: 0,
            modulosAtivos: ['Exportações']
          };

          this.empresasService.addEmpresa(newEmpresa)
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
              this.loadData();
              this.snackBar.open(`Empresa "${result.nomeFantasia}" criada com sucesso!`, 'OK', { duration: 3000 });
            });
        }
      });
  }

  editarEmpresa(empresa: Empresa): void {
    const dialogRef = this.dialog.open(EditarEmpresaDialogComponent, {
      width: '780px',
      maxWidth: '92vw',
      maxHeight: '85vh',
      data: empresa,
      panelClass: 'novo-usuario-panel'
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result) {
          this.empresasService.updateEmpresa(result)
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
              this.loadData();
              this.snackBar.open(`Empresa "${result.nomeFantasia}" atualizada com sucesso!`, 'OK', { duration: 3000 });
            });
        }
      });
  }

  suspenderEmpresa(empresa: Empresa): void {
    const isSuspensa = empresa.status === 'SUSPENSA';
    const dialogData: ConfirmDialogData = {
      title: isSuspensa ? 'Reativar Empresa' : 'Suspender Empresa',
      message: isSuspensa
        ? `Deseja reativar a empresa "${empresa.nomeFantasia}" (${empresa.cnpj})?`
        : `Deseja suspender a empresa "${empresa.nomeFantasia}" (${empresa.cnpj})? Todos os usuários perderão acesso à plataforma.`,
      icon: isSuspensa ? 'play_circle' : 'pause_circle',
      iconColor: isSuspensa ? '#4caf50' : '#ff9800',
      confirmText: isSuspensa ? 'Reativar' : 'Suspender',
      confirmColor: isSuspensa ? 'primary' : 'warn'
    };

    const dialogRef = this.dialog.open(ConfirmarAcaoDialogComponent, {
      width: '420px',
      maxWidth: '92vw',
      data: dialogData
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          const updatedEmpresa = { ...empresa, status: (isSuspensa ? 'ATIVA' : 'SUSPENSA') as EmpresaStatus };
          this.empresasService.updateEmpresa(updatedEmpresa)
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
              this.loadData();
              this.snackBar.open(
                isSuspensa
                  ? `Empresa "${empresa.nomeFantasia}" reativada!`
                  : `Empresa "${empresa.nomeFantasia}" suspensa!`,
                'OK', { duration: 3000 }
              );
            });
        }
      });
  }

  visualizarEmpresa(empresa: Empresa): void {
    this.snackBar.open(
      `${empresa.nomeFantasia} | ${empresa.cnpj} | ${empresa.responsavel} | ${empresa.plano} | ${this.getStatusLabel(empresa.status)}`,
      'Fechar',
      { duration: 5000 }
    );
  }

  getStatusLabel(status: EmpresaStatus): string {
    const labels: Record<EmpresaStatus, string> = {
      'ATIVA': 'Ativa',
      'SUSPENSA': 'Suspensa',
      'BLOQUEADA': 'Bloqueada',
      'EM_ONBOARDING': 'Onboarding'
    };
    return labels[status];
  }

  getTipoLabel(tipo: EmpresaTipo): string {
    const labels: Record<EmpresaTipo, string> = {
      'EXPORTADOR': 'Exportador',
      'TRADING': 'Trading',
      'COOPERATIVA': 'Cooperativa',
      'INDÚSTRIA': 'Indústria',
      'OPERADOR_LOGÍSTICO': 'Op. Logístico'
    };
    return labels[tipo];
  }
}
