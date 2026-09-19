import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { PerfilAcessoMockService } from '../../../../services/perfilAcessoMockService';
import { AccessProfile, ModuleCatalog, ProfileMetrics } from '../../../../types/perfil-acesso';
import { PerfilPermissoesDialogComponent } from './perfil-permissoes-dialog/perfil-permissoes-dialog.component';
import { ConfirmarAcaoDialogComponent, ConfirmDialogData } from '../usuarios/confirmar-acao-dialog/confirmar-acao-dialog.component';
import { HasPermissionDirective } from '../../../directives/has-permission.directive';

@Component({
  selector: 'app-perfis-acesso',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDialogModule,
    MatProgressBarModule,
    HasPermissionDirective
  ],
  templateUrl: './perfis-acesso.component.html',
  styleUrls: ['./perfis-acesso.component.scss']
})
export class PerfisAcessoComponent implements OnInit, OnDestroy {

  private service = inject(PerfilAcessoMockService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private destroy$ = new Subject<void>();

  profiles: AccessProfile[] = [];
  metrics: ProfileMetrics | null = null;
  catalog: ModuleCatalog[] = [];
  totalTelas = 0;
  isLoading = false;

  ngOnInit(): void {
    this.catalog = this.service.getModuleCatalog();
    this.totalTelas = this.catalog.reduce((sum, m) => sum + m.screens.length, 0);
    this.loadProfiles();
    this.loadMetrics();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProfiles(): void {
    this.isLoading = true;
    this.service.getProfiles()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profiles) => {
          this.profiles = profiles;
          this.isLoading = false;
        },
        error: () => {
          this.snackBar.open('Erro ao carregar perfis', 'Fechar', { duration: 3000 });
          this.isLoading = false;
        }
      });
  }

  loadMetrics(): void {
    this.service.getMetrics()
      .pipe(takeUntil(this.destroy$))
      .subscribe(metrics => this.metrics = metrics);
  }

  // Nº de telas liberadas (com ao menos 1 ação) para o perfil
  telasLiberadas(profile: AccessProfile): number {
    return profile.permissions.filter(p => p.actions.length > 0).length;
  }

  novoPerfil(): void {
    const ref = this.dialog.open(PerfilPermissoesDialogComponent, {
      width: '1100px',
      maxWidth: '96vw',
      maxHeight: '92vh',
      autoFocus: false,
      panelClass: 'perfil-permissoes-dialog-panel',
      data: { profile: null, catalog: this.catalog }
    });
    ref.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((result: AccessProfile | undefined) => {
      if (!result) { return; }
      this.service.createProfile(result).pipe(takeUntil(this.destroy$)).subscribe(() => {
        this.snackBar.open('Perfil criado com sucesso!', 'OK', { duration: 3000 });
        this.loadProfiles();
        this.loadMetrics();
      });
    });
  }

  editarPerfil(profile: AccessProfile): void {
    const ref = this.dialog.open(PerfilPermissoesDialogComponent, {
      width: '1100px',
      maxWidth: '96vw',
      maxHeight: '92vh',
      autoFocus: false,
      panelClass: 'perfil-permissoes-dialog-panel',
      data: { profile, catalog: this.catalog }
    });
    ref.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((result: AccessProfile | undefined) => {
      if (!result) { return; }
      this.service.updateProfile(result).pipe(takeUntil(this.destroy$)).subscribe(() => {
        this.snackBar.open('Perfil atualizado com sucesso!', 'OK', { duration: 3000 });
        this.loadProfiles();
        this.loadMetrics();
      });
    });
  }

  duplicarPerfil(profile: AccessProfile): void {
    const copy: AccessProfile = {
      ...profile,
      id: '',
      name: `${profile.name} (cópia)`,
      system: false,
      usersCount: 0,
      permissions: profile.permissions.map(p => ({ screenId: p.screenId, actions: [...p.actions] })),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.service.createProfile(copy).pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackBar.open('Perfil duplicado com sucesso!', 'OK', { duration: 3000 });
      this.loadProfiles();
      this.loadMetrics();
    });
  }

  excluirPerfil(profile: AccessProfile): void {
    if (profile.system) {
      this.snackBar.open('Perfis do sistema não podem ser excluídos', 'Fechar', { duration: 3000 });
      return;
    }
    const data: ConfirmDialogData = {
      title: 'Excluir perfil',
      message: `Tem certeza que deseja excluir o perfil "${profile.name}"? Esta ação não pode ser desfeita.`,
      icon: 'delete',
      iconColor: '#f44336',
      confirmText: 'Excluir',
      confirmColor: 'warn'
    };
    const ref = this.dialog.open(ConfirmarAcaoDialogComponent, {
      width: '420px',
      autoFocus: false,
      data
    });
    ref.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((confirmed: boolean) => {
      if (!confirmed) { return; }
      this.service.deleteProfile(profile.id).pipe(takeUntil(this.destroy$)).subscribe(() => {
        this.snackBar.open('Perfil excluído com sucesso!', 'OK', { duration: 3000 });
        this.loadProfiles();
        this.loadMetrics();
      });
    });
  }
}
