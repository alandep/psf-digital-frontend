import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';

import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';

import {
  AccessProfile,
  ModuleCatalog,
  PermissionAction,
  PERMISSION_ACTION_LABELS,
  ProfilePermission,
  ScreenFeature
} from '../../../../../types/perfil-acesso';

export interface PerfilPermissoesDialogData {
  profile: AccessProfile | null;
  catalog: ModuleCatalog[];
}

interface ColorOption { name: string; value: string; }

@Component({
  selector: 'app-perfil-permissoes-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    MatChipsModule
  ],
  templateUrl: './perfil-permissoes-dialog.component.html',
  styleUrls: ['./perfil-permissoes-dialog.component.scss']
})
export class PerfilPermissoesDialogComponent implements OnInit {

  form!: FormGroup;
  catalog: ModuleCatalog[] = [];
  isEdit = false;
  searchTerm = '';

  readonly actionLabels = PERMISSION_ACTION_LABELS;
  readonly colorOptions: ColorOption[] = [
    { name: 'Azul', value: '#1976d2' },
    { name: 'Verde', value: '#2e7d32' },
    { name: 'Laranja', value: '#ef6c00' },
    { name: 'Roxo', value: '#6a1b9a' },
    { name: 'Vermelho', value: '#c62828' },
    { name: 'Ciano', value: '#00838f' },
    { name: 'Cinza', value: '#546e7a' }
  ];

  // Estado das permissões: screenId -> Set<PermissionAction>
  private selection = new Map<string, Set<PermissionAction>>();

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<PerfilPermissoesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PerfilPermissoesDialogData
  ) {}

  ngOnInit(): void {
    this.catalog = this.data.catalog || [];
    this.isEdit = !!this.data.profile;
    const p = this.data.profile;

    this.form = this.fb.group({
      name: [p?.name || '', [Validators.required, Validators.maxLength(60)]],
      description: [p?.description || '', [Validators.maxLength(200)]],
      color: [p?.color || this.colorOptions[0].value, Validators.required]
    });

    if (p) {
      for (const perm of p.permissions) {
        this.selection.set(perm.screenId, new Set(perm.actions));
      }
    }
  }

  get dialogTitle(): string {
    return this.isEdit ? `Editar Perfil: ${this.data.profile?.name}` : 'Novo Perfil';
  }

  // ================================
  // FILTRO DE BUSCA
  // ================================
  visibleScreens(mod: ModuleCatalog): ScreenFeature[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) { return mod.screens; }
    return mod.screens.filter(sc =>
      sc.screenName.toLowerCase().includes(term) ||
      sc.route.toLowerCase().includes(term) ||
      mod.moduleName.toLowerCase().includes(term)
    );
  }

  visibleModules(): ModuleCatalog[] {
    return this.catalog.filter(m => this.visibleScreens(m).length > 0);
  }

  private ensureSet(screenId: string): Set<PermissionAction> {
    let set = this.selection.get(screenId);
    if (!set) {
      set = new Set<PermissionAction>();
      this.selection.set(screenId, set);
    }
    return set;
  }

  // ================================
  // NÍVEL AÇÃO
  // ================================
  isActionChecked(screenId: string, action: PermissionAction): boolean {
    return this.selection.get(screenId)?.has(action) ?? false;
  }

  toggleAction(screen: ScreenFeature, action: PermissionAction): void {
    const set = this.ensureSet(screen.screenId);
    if (set.has(action)) {
      set.delete(action);
    } else {
      set.add(action);
      // Qualquer ação não-view implica visibilidade
      if (action !== 'view' && screen.actions.includes('view')) {
        set.add('view');
      }
    }
  }

  // ================================
  // NÍVEL TELA
  // ================================
  screenCheckedCount(screen: ScreenFeature): number {
    const set = this.selection.get(screen.screenId);
    if (!set) { return 0; }
    return screen.actions.filter(a => set.has(a)).length;
  }

  isScreenAllChecked(screen: ScreenFeature): boolean {
    return this.screenCheckedCount(screen) === screen.actions.length && screen.actions.length > 0;
  }

  isScreenIndeterminate(screen: ScreenFeature): boolean {
    const count = this.screenCheckedCount(screen);
    return count > 0 && count < screen.actions.length;
  }

  toggleScreenAll(screen: ScreenFeature, checked: boolean): void {
    const set = this.ensureSet(screen.screenId);
    set.clear();
    if (checked) {
      for (const a of screen.actions) { set.add(a); }
    }
  }

  // ================================
  // NÍVEL MÓDULO
  // ================================
  moduleTotalActions(mod: ModuleCatalog): number {
    return mod.screens.reduce((sum, sc) => sum + sc.actions.length, 0);
  }

  moduleCheckedActions(mod: ModuleCatalog): number {
    return mod.screens.reduce((sum, sc) => sum + this.screenCheckedCount(sc), 0);
  }

  isModuleAllChecked(mod: ModuleCatalog): boolean {
    const total = this.moduleTotalActions(mod);
    return total > 0 && this.moduleCheckedActions(mod) === total;
  }

  isModuleIndeterminate(mod: ModuleCatalog): boolean {
    const checked = this.moduleCheckedActions(mod);
    return checked > 0 && checked < this.moduleTotalActions(mod);
  }

  toggleModuleAll(mod: ModuleCatalog, checked: boolean): void {
    for (const sc of mod.screens) {
      this.toggleScreenAll(sc, checked);
    }
  }

  // ================================
  // NÍVEL GLOBAL
  // ================================
  totalCount(): number {
    return this.catalog.reduce((sum, m) => sum + this.moduleTotalActions(m), 0);
  }

  selectedCount(): number {
    return this.catalog.reduce((sum, m) => sum + this.moduleCheckedActions(m), 0);
  }

  isGlobalAllChecked(): boolean {
    const total = this.totalCount();
    return total > 0 && this.selectedCount() === total;
  }

  isGlobalIndeterminate(): boolean {
    const checked = this.selectedCount();
    return checked > 0 && checked < this.totalCount();
  }

  toggleGlobalAll(checked: boolean): void {
    for (const mod of this.catalog) {
      this.toggleModuleAll(mod, checked);
    }
  }

  // ================================
  // AÇÕES DO DIALOG
  // ================================
  cancel(): void {
    this.dialogRef.close();
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const permissions: ProfilePermission[] = [];
    for (const [screenId, set] of this.selection.entries()) {
      if (set.size > 0) {
        permissions.push({ screenId, actions: Array.from(set) });
      }
    }

    const base = this.data.profile;
    const now = new Date();
    const result: AccessProfile = {
      id: base?.id || '',
      name: this.form.value.name.trim(),
      description: (this.form.value.description || '').trim(),
      color: this.form.value.color,
      system: base?.system || false,
      usersCount: base?.usersCount || 0,
      permissions,
      createdAt: base?.createdAt || now,
      updatedAt: now
    };
    this.dialogRef.close(result);
  }
}
