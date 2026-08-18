import { Component, OnInit, OnDestroy, ViewChild, ElementRef, inject } from '@angular/core';
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
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

// Services and Types
import { AdminUsuariosMockService } from '../../../../services/adminUsuariosMockService';
import { AdminUser, UserMetrics, UserRole, UserStatus } from '../../../../types/admin-usuarios';
import { NovoUsuarioDialogComponent } from './novo-usuario-dialog/novo-usuario-dialog.component';
import { EditarUsuarioDialogComponent } from './editar-usuario-dialog/editar-usuario-dialog.component';
import { ConfirmarAcaoDialogComponent, ConfirmDialogData } from './confirmar-acao-dialog/confirmar-acao-dialog.component';

@Component({
  selector: 'app-admin-usuarios',
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
    MatMenuModule,
    MatDialogModule
  ],
  templateUrl: './admin-usuarios.component.html',
  styleUrls: ['./admin-usuarios.component.scss']
})
export class AdminUsuariosComponent implements OnInit, OnDestroy {

  private usuariosService = inject(AdminUsuariosMockService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private destroy$ = new Subject<void>();

  @ViewChild('usuariosPaginator') usuariosPaginator!: MatPaginator;
  @ViewChild('usuariosSort') usuariosSort!: MatSort;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  dataSource = new MatTableDataSource<AdminUser>([]);
  metrics: UserMetrics = {
    totalUsers: 0, ativos: 0, inativos: 0, bloqueados: 0, pendentes: 0, mfaHabilitado: 0
  };
  filterForm!: FormGroup;
  isLoading = false;

  displayedColumns: string[] = [
    'name', 'email', 'role', 'status', 'empresa', 'departamento',
    'ultimoAcesso', 'dataCriacao', 'mfaEnabled', 'loginCount', 'actions'
  ];

  roles: UserRole[] = ['ADMIN', 'GERENTE', 'ANALISTA', 'OPERADOR', 'VISUALIZADOR', 'COMPLIANCE', 'FINANCEIRO'];
  statuses: UserStatus[] = ['ATIVO', 'INATIVO', 'BLOQUEADO', 'PENDENTE'];

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
      role: [''],
      status: [''],
      empresa: ['']
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

    this.usuariosService.getMetrics()
      .pipe(takeUntil(this.destroy$))
      .subscribe(metrics => this.metrics = metrics);

    this.usuariosService.getUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe(users => {
        this.dataSource.data = users;
        setTimeout(() => {
          this.dataSource.paginator = this.usuariosPaginator;
          this.dataSource.sort = this.usuariosSort;
        });
        this.isLoading = false;
      });
  }

  applyFilters(): void {
    const { searchText, role, status, empresa } = this.filterForm.value;

    this.dataSource.filterPredicate = (data: AdminUser, filter: string) => {
      const filterObj = JSON.parse(filter);
      let match = true;

      if (filterObj.searchText) {
        const search = filterObj.searchText.toLowerCase();
        match = match && (
          data.name.toLowerCase().includes(search) ||
          data.email.toLowerCase().includes(search) ||
          data.departamento.toLowerCase().includes(search)
        );
      }
      if (filterObj.role) {
        match = match && data.role === filterObj.role;
      }
      if (filterObj.status) {
        match = match && data.status === filterObj.status;
      }
      if (filterObj.empresa) {
        match = match && data.empresa === filterObj.empresa;
      }

      return match;
    };

    this.dataSource.filter = JSON.stringify({ searchText, role, status, empresa });
  }

  clearFilters(): void {
    this.filterForm.reset({ searchText: '', role: '', status: '', empresa: '' });
  }

  novoUsuario(): void {
    const dialogRef = this.dialog.open(NovoUsuarioDialogComponent, {
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
          const newUser: AdminUser = {
            id: 'USR-' + Date.now(),
            name: result.name,
            email: result.email,
            role: result.role,
            status: 'PENDENTE',
            empresa: result.empresa,
            departamento: result.departamento || 'Não definido',
            ultimoAcesso: new Date(),
            dataCriacao: new Date(),
            mfaEnabled: result.mfaEnabled,
            loginCount: 0,
            phone: result.phone || ''
          };

          this.usuariosService.addUser(newUser)
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
              this.loadData();
              this.snackBar.open(`Usuário "${result.name}" criado com sucesso!`, 'OK', { duration: 3000 });
            });
        }
      });
  }

  importarUsuarios(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      const content = reader.result as string;
      const lines = content.split('\n').filter(line => line.trim());

      if (lines.length <= 1) {
        this.snackBar.open('Arquivo vazio ou apenas com cabeçalho.', 'OK', { duration: 3000 });
        return;
      }

      // Skip header line
      const dataLines = lines.slice(1);
      const importedUsers: AdminUser[] = dataLines.map((line, index) => {
        const cols = line.split(';').map(c => c.trim().replace(/"/g, ''));
        return {
          id: 'USR-IMP-' + Date.now() + '-' + index,
          name: cols[0] || 'Sem nome',
          email: cols[1] || `user${index}@empresa.com`,
          role: (cols[2] as UserRole) || 'OPERADOR',
          status: 'PENDENTE' as UserStatus,
          empresa: cols[3] || 'Não definida',
          departamento: cols[4] || 'Não definido',
          ultimoAcesso: new Date(),
          dataCriacao: new Date(),
          mfaEnabled: false,
          loginCount: 0,
          phone: ''
        };
      });

      this.usuariosService.addUsers(importedUsers)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.loadData();
          this.snackBar.open(`${importedUsers.length} usuário(s) importado(s) com sucesso!`, 'OK', { duration: 4000 });
        });
    };

    reader.readAsText(file, 'UTF-8');
    // Reset input so same file can be selected again
    input.value = '';
  }

  editUser(user: AdminUser): void {
    const dialogRef = this.dialog.open(EditarUsuarioDialogComponent, {
      width: '780px',
      maxWidth: '92vw',
      maxHeight: '85vh',
      data: user,
      panelClass: 'novo-usuario-panel'
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result) {
          this.usuariosService.updateUser(result)
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
              this.loadData();
              this.snackBar.open(`Usuário "${result.name}" atualizado com sucesso!`, 'OK', { duration: 3000 });
            });
        }
      });
  }

  blockUser(user: AdminUser): void {
    const isBlocked = user.status === 'BLOQUEADO';
    const dialogData: ConfirmDialogData = {
      title: isBlocked ? 'Desbloquear Usuário' : 'Bloquear Usuário',
      message: isBlocked
        ? `Deseja desbloquear o acesso de "${user.name}" (${user.email})?`
        : `Deseja bloquear o acesso de "${user.name}" (${user.email})? O usuário não conseguirá mais acessar a plataforma.`,
      icon: isBlocked ? 'lock_open' : 'block',
      iconColor: isBlocked ? '#4caf50' : '#f44336',
      confirmText: isBlocked ? 'Desbloquear' : 'Bloquear',
      confirmColor: isBlocked ? 'primary' : 'warn'
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
          const updatedUser = { ...user, status: (isBlocked ? 'ATIVO' : 'BLOQUEADO') as UserStatus };
          this.usuariosService.updateUser(updatedUser)
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
              this.loadData();
              this.snackBar.open(
                isBlocked ? `Usuário "${user.name}" desbloqueado!` : `Usuário "${user.name}" bloqueado!`,
                'OK', { duration: 3000 }
              );
            });
        }
      });
  }

  resetPassword(user: AdminUser): void {
    const dialogData: ConfirmDialogData = {
      title: 'Reset de Senha',
      message: `Deseja enviar um link de redefinição de senha para "${user.name}" (${user.email})?`,
      icon: 'lock_reset',
      iconColor: '#2196f3',
      confirmText: 'Enviar Reset',
      confirmColor: 'primary'
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
          this.snackBar.open(`Link de reset de senha enviado para ${user.email}`, 'OK', { duration: 4000 });
        }
      });
  }

  getStatusClass(status: UserStatus): string {
    switch (status) {
      case 'ATIVO': return 'status-ativo';
      case 'INATIVO': return 'status-inativo';
      case 'BLOQUEADO': return 'status-bloqueado';
      case 'PENDENTE': return 'status-pendente';
      default: return '';
    }
  }

  getRoleClass(role: UserRole): string {
    switch (role) {
      case 'ADMIN': return 'role-admin';
      case 'GERENTE': return 'role-gerente';
      case 'ANALISTA': return 'role-analista';
      case 'OPERADOR': return 'role-operador';
      case 'VISUALIZADOR': return 'role-visualizador';
      case 'COMPLIANCE': return 'role-compliance';
      case 'FINANCEIRO': return 'role-financeiro';
      default: return '';
    }
  }

  getUniqueEmpresas(): string[] {
    const empresas = this.dataSource.data.map(u => u.empresa);
    return [...new Set(empresas)];
  }
}
