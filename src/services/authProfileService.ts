// MOCK: profile is loaded from assets JSON. To use a real backend, replace
// loadProfile() body with an HTTP call to the real endpoint returning the same
// AccessProfile shape (id/name/description/color/system/usersCount/permissions/
// createdAt/updatedAt). No other file needs to change.

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import {
  AccessProfile,
  PermissionAction,
  ProfilePermission
} from '../types/perfil-acesso';
import { LicenseAccessMode } from '../types/saas-billing';
import { PerfilAcessoMockService } from './perfilAcessoMockService';

// Path served by Angular CLI (assets input = public/). File lives at
// public/mock/current-profile.json and is served from /mock/current-profile.json.
const PROFILE_ASSET_PATH = 'mock/current-profile.json';
const STORAGE_KEY = 'eip_current_profile';
const LICENSE_MODE_KEY = 'eip_license_mode';

// Raw shape as it comes from the JSON (dates are strings, extra mock flags).
interface RawProfile {
  id: string;
  name: string;
  description: string;
  color: string;
  system: boolean;
  fullAccess?: boolean;
  usersCount: number;
  permissions: ProfilePermission[];
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class AuthProfileService {
  private http = inject(HttpClient);
  private catalogService = inject(PerfilAcessoMockService);

  private profileSubject = new BehaviorSubject<AccessProfile | null>(null);
  readonly profile$ = this.profileSubject.asObservable();

  // Marks whether the current profile grants unrestricted access.
  private fullAccess = false;

  // SaaS subscription/license gate. Defaults to 'FULL' (mock ACTIVE).
  // This gate is applied ON TOP OF RBAC: see can() for the precedence rules.
  private licenseModeSubject = new BehaviorSubject<LicenseAccessMode>('FULL');
  readonly licenseMode$ = this.licenseModeSubject.asObservable();

  constructor() {
    this.restoreFromStorage();
    this.restoreLicenseMode();
  }

  get currentProfile(): AccessProfile | null {
    return this.profileSubject.value;
  }

  get currentLicenseMode(): LicenseAccessMode {
    return this.licenseModeSubject.value;
  }

  /**
   * Loads the current user's access profile.
   * MOCK IMPLEMENTATION: GETs the JSON asset and, when it represents a
   * full-access admin, fills permissions with the entire catalog.
   */
  loadProfile(): Observable<AccessProfile> {
    return this.http.get<RawProfile>(PROFILE_ASSET_PATH).pipe(
      map((raw) => this.materialize(raw)),
      tap((profile) => this.setProfile(profile)),
      catchError(() => {
        // Never leave the user without a profile in mock mode.
        const fallback = this.buildFullAccessAdmin();
        this.setProfile(fallback);
        return of(fallback);
      })
    );
  }

  // Converts the raw JSON into an AccessProfile, expanding full-access profiles.
  private materialize(raw: RawProfile): AccessProfile {
    const emptyPerms = !raw.permissions || raw.permissions.length === 0;
    const isFull = raw.fullAccess === true || (raw.system === true && emptyPerms);
    const permissions = isFull
      ? this.buildFullCatalogPermissions()
      : (raw.permissions || []).map((p) => ({ screenId: p.screenId, actions: [...p.actions] }));
    return {
      id: raw.id,
      name: raw.name,
      description: raw.description,
      color: raw.color,
      system: raw.system,
      usersCount: raw.usersCount,
      permissions,
      createdAt: new Date(raw.createdAt),
      updatedAt: new Date(raw.updatedAt)
    };
  }

  // Every screen in the catalog with all of its actions.
  private buildFullCatalogPermissions(): ProfilePermission[] {
    const perms: ProfilePermission[] = [];
    for (const mod of this.catalogService.getModuleCatalog()) {
      for (const sc of mod.screens) {
        perms.push({ screenId: sc.screenId, actions: [...sc.actions] });
      }
    }
    return perms;
  }

  private buildFullAccessAdmin(): AccessProfile {
    const now = new Date();
    return {
      id: 'PERFIL-ADMIN',
      name: 'Administrador',
      description: 'Acesso total a todas as telas e funcionalidades do sistema.',
      color: '#1976d2',
      system: true,
      usersCount: 4,
      permissions: this.buildFullCatalogPermissions(),
      createdAt: now,
      updatedAt: now
    };
  }

  // Detects the full-access condition from a materialized profile: the profile
  // covers every screen the catalog knows about.
  private detectFullAccess(profile: AccessProfile): boolean {
    const totalScreens = this.catalogService
      .getModuleCatalog()
      .reduce((sum, m) => sum + m.screens.length, 0);
    const covered = profile.permissions.filter((p) => p.actions.length > 0).length;
    return (profile.system && covered >= totalScreens) || covered >= totalScreens;
  }

  private setProfile(profile: AccessProfile): void {
    this.fullAccess = this.detectFullAccess(profile);
    this.profileSubject.next(profile);
    this.persist(profile);
  }

  // ================================
  // PERMISSION API (synchronous)
  // ================================
  isFullAccess(): boolean {
    return this.fullAccess;
  }

  hasScreen(screenId: string): boolean {
    if (this.fullAccess) { return true; }
    const profile = this.currentProfile;
    if (!profile) { return false; }
    const perm = profile.permissions.find((p) => p.screenId === screenId);
    return !!perm && perm.actions.length > 0;
  }

  // ================================
  // LICENSE (SaaS subscription) API
  // ================================
  // Precedence: the licenseMode gate is applied ON TOP OF RBAC. RBAC/full-access
  // still decides the base answer for the READ path (view/export). The license
  // gate can only ever REMOVE access, never grant it:
  //  - READ_ONLY  : write actions (create/edit/delete) are denied for everyone
  //                 (even full-access admin); view/export follow normal RBAC.
  //  - BILLING_ONLY: everything is denied except the billing/subscription
  //                 screens (routes starting with 'admin/assinatura').
  //  - NONE       : nothing is permitted.
  //  - FULL       : no restriction (today's mock default) -> RBAC decides.
  isReadOnly(): boolean {
    return this.currentLicenseMode === 'READ_ONLY';
  }

  // True only when the tenant can operate normally (create/edit/delete allowed).
  canOperate(): boolean {
    return this.currentLicenseMode === 'FULL';
  }

  setLicenseMode(mode: LicenseAccessMode): void {
    this.licenseModeSubject.next(mode);
    try {
      localStorage.setItem(LICENSE_MODE_KEY, mode);
    } catch {
      // localStorage may be unavailable (SSR / privacy mode) - ignore.
    }
  }

  private restoreLicenseMode(): void {
    try {
      const raw = localStorage.getItem(LICENSE_MODE_KEY) as LicenseAccessMode | null;
      if (raw === 'FULL' || raw === 'READ_ONLY' || raw === 'BILLING_ONLY' || raw === 'NONE') {
        this.licenseModeSubject.next(raw);
      }
    } catch {
      // Corrupt/unavailable storage - keep the default 'FULL'.
    }
  }

  // Is the given screenId one of the billing/subscription screens?
  private isBillingScreen(screenId: string): boolean {
    // screenIds use the '/' -> '_' convention; routes use '/'. Accept both.
    const normalized = (screenId || '').replace(/_/g, '/');
    return normalized.startsWith('admin/assinatura');
  }

  can(screenId: string, action: PermissionAction): boolean {
    // --- License gate (applied on top of RBAC; can only remove access) ---
    const mode = this.currentLicenseMode;
    const isWrite = action === 'create' || action === 'edit' || action === 'delete';
    if (mode === 'NONE') {
      return false;
    }
    if (mode === 'BILLING_ONLY') {
      // Only the billing/subscription screens are reachable, and no writes.
      if (!this.isBillingScreen(screenId) || isWrite) { return false; }
    }
    if (mode === 'READ_ONLY' && isWrite) {
      // Deny write actions for EVERYONE, including full-access admin.
      return false;
    }

    // --- Base RBAC / full-access decision (READ path unchanged) ---
    if (this.fullAccess) { return true; }
    const profile = this.currentProfile;
    if (!profile) { return false; }
    const perm = profile.permissions.find((p) => p.screenId === screenId);
    return !!perm && perm.actions.includes(action);
  }

  canView(screenId: string): boolean { return this.can(screenId, 'view'); }
  canCreate(screenId: string): boolean { return this.can(screenId, 'create'); }
  canEdit(screenId: string): boolean { return this.can(screenId, 'edit'); }
  canDelete(screenId: string): boolean { return this.can(screenId, 'delete'); }
  canExport(screenId: string): boolean { return this.can(screenId, 'export'); }

  /**
   * Normalizes a route to a screenId and checks access.
   * Full-access always passes. Routes that are NOT part of the catalog are
   * NOT governed by RBAC and are therefore allowed (return true), so menu
   * entries without a catalog screen keep working.
   */
  canAccessRoute(route: string): boolean {
    if (this.fullAccess) { return true; }
    const screenId = this.resolveScreenId(route);
    if (!screenId) {
      // Unknown route: not governed by the catalog -> allow.
      return true;
    }
    return this.hasScreen(screenId);
  }

  // Turns a raw route into a screenId using the '/' -> '_' convention.
  routeToScreenId(route: string): string {
    return this.normalizeRoute(route).replace(/\//g, '_');
  }

  // Strips leading slash, the home-logged prefix and query/fragment.
  private normalizeRoute(route: string): string {
    let r = (route || '').trim();
    r = r.split('?')[0].split('#')[0];
    r = r.replace(/^\/+/, '');
    r = r.replace(/^home-logged\/?/, '');
    r = r.replace(/\/+$/, '');
    return r;
  }

  // Resolves the route to a known catalog screenId by matching the longest
  // catalog route that is a prefix of the given route (handles child routes
  // like 'logistica/embarque/detalhe/1'). Returns null when unknown.
  private resolveScreenId(route: string): string | null {
    const normalized = this.normalizeRoute(route);
    if (!normalized) { return null; }
    const catalogRoutes: string[] = [];
    for (const mod of this.catalogService.getModuleCatalog()) {
      for (const sc of mod.screens) { catalogRoutes.push(sc.route); }
    }
    let best: string | null = null;
    for (const cr of catalogRoutes) {
      if (normalized === cr || normalized.startsWith(cr + '/')) {
        if (!best || cr.length > best.length) { best = cr; }
      }
    }
    return best ? best.replace(/\//g, '_') : null;
  }

  // ================================
  // PERSISTENCE / LIFECYCLE
  // ================================
  clear(): void {
    this.fullAccess = false;
    this.profileSubject.next(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // localStorage may be unavailable (SSR / privacy mode) - ignore.
    }
  }

  private persist(profile: AccessProfile): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // Ignore storage errors.
    }
  }

  private restoreFromStorage(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) { return; }
      const parsed = JSON.parse(raw) as AccessProfile;
      const profile: AccessProfile = {
        ...parsed,
        createdAt: new Date(parsed.createdAt),
        updatedAt: new Date(parsed.updatedAt),
        permissions: (parsed.permissions || []).map((p) => ({
          screenId: p.screenId,
          actions: [...p.actions]
        }))
      };
      this.fullAccess = this.detectFullAccess(profile);
      this.profileSubject.next(profile);
    } catch {
      // Corrupt storage - ignore and start clean.
    }
  }
}
