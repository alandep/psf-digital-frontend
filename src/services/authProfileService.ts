// Perfil de acesso. Com environment.realApis.auth = true o perfil vem de
// GET /bff/acesso/me e as regras de autorização do backend são espelhadas em
// can(). Caso contrário (mock) o perfil é carregado do JSON em assets.

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
import { environment } from '../environments/environment';

/** Resposta de GET /bff/acesso/me. */
export interface AcessoMeDto {
  userId: string;
  organizationId: string;
  name: string;
  email: string;
  role: string | null;
  superAdmin: boolean;
  licenseMode: LicenseAccessMode;
  subscription: {
    status: string;
    planCode: string;
    planName: string;
    trialEndsAt: string | null;
    currentPeriodEnd: string | null;
    gatewayLinked?: boolean;
    cancelAtPeriodEnd?: boolean;
  } | null;
  modules: Record<string, boolean>;
  limits: Record<string, number | null>;
  modulePrefixes: Record<string, string>;
  readOnlyRoles: string[];
}

const ACCESS_KEY = 'eip_access_me';
const ALL_ACTIONS: PermissionAction[] = ['view', 'create', 'edit', 'delete', 'export'];

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
  private static readonly ALWAYS_ALLOWED_ADMIN_SCREENS = ['admin/assinatura', 'admin/exportar-dados'];

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

  // Modo real: perfil vindo do backend (GET /bff/acesso/me).
  private readonly realMode = !!environment.realApis?.auth;
  private access: AcessoMeDto | null = null;
  private loadFailed = false;
  private refreshed = false;

  constructor() {
    this.restoreFromStorage();
    this.restoreLicenseMode();
  }

  /** True quando a última carga do perfil real falhou (sem sessão válida). */
  get sessionInvalid(): boolean {
    return this.realMode && this.loadFailed;
  }

  /** No modo real, o perfil restaurado do storage só é confiável após uma carga nesta sessão do app. */
  get isFresh(): boolean {
    return !this.realMode || this.refreshed;
  }

  /** Dados brutos do acesso real (null no modo mock ou antes da carga). */
  get currentAccess(): AcessoMeDto | null {
    return this.access;
  }

  /** Assinatura do último GET /bff/acesso/me (null no modo mock ou sem assinatura). */
  get currentSubscription(): AcessoMeDto['subscription'] {
    return this.access?.subscription ?? null;
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
    if (this.realMode) {
      return this.loadRealProfile();
    }
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

  // ================================
  // REAL MODE (GET /bff/acesso/me)
  // ================================
  private loadRealProfile(): Observable<AccessProfile> {
    return this.http.get<AcessoMeDto>(`${environment.bffBaseUrl}/bff/acesso/me`).pipe(
      map((me) => {
        this.access = me;
        this.loadFailed = false;
        this.refreshed = true;
        this.setLicenseMode(me.licenseMode ?? 'NONE');
        const profile = this.buildRealProfile(me);
        this.setProfile(profile);
        this.persistAccess(me);
        return profile;
      }),
      catchError(() => {
        // Nunca cair para admin com acesso total: perfil que nega tudo.
        this.access = null;
        this.loadFailed = true;
        this.refreshed = true;
        this.clearStoredAccess();
        const denied = this.buildDenyAllProfile();
        this.fullAccess = false;
        this.profileSubject.next(denied);
        return of(denied);
      })
    );
  }

  private buildRealProfile(me: AcessoMeDto): AccessProfile {
    const now = new Date();
    const permissions: ProfilePermission[] = [];
    for (const mod of this.catalogService.getModuleCatalog()) {
      for (const sc of mod.screens) {
        const actions = sc.actions.filter((a) => this.evaluate(me, this.currentLicenseMode, sc.screenId, a));
        if (actions.length > 0) { permissions.push({ screenId: sc.screenId, actions }); }
      }
    }
    return {
      id: me.userId,
      name: me.role ?? 'Sem perfil',
      description: me.name,
      color: '#1976d2',
      system: true,
      usersCount: 1,
      permissions,
      createdAt: now,
      updatedAt: now
    };
  }

  private buildDenyAllProfile(): AccessProfile {
    const now = new Date();
    return {
      id: 'DENY-ALL',
      name: 'Sem acesso',
      description: 'Não foi possível carregar o perfil de acesso.',
      color: '#9e9e9e',
      system: false,
      usersCount: 0,
      permissions: [],
      createdAt: now,
      updatedAt: now
    };
  }

  // Espelha as regras de autorização do backend.
  private evaluate(me: AcessoMeDto, mode: LicenseAccessMode, screenId: string, action: PermissionAction): boolean {
    const role = me.role;
    if (!role) { return false; }
    const screen = (screenId || '').replace(/_/g, '/').replace(/^\/+/, '');

    if (screen.startsWith('super-admin')) { return me.superAdmin === true; }

    const isAdmin = role === 'ADMINISTRADOR';
    // Contrato §5: telas sempre liberadas ao ADMINISTRADOR em qualquer modo (inclusive edição).
    if (AuthProfileService.ALWAYS_ALLOWED_ADMIN_SCREENS.some((s) => screen === s || screen.startsWith(s + '/'))) {
      if (isAdmin) { return true; }
    }

    if (mode === 'NONE' || mode === 'BILLING_ONLY') { return false; }
    if (mode === 'READ_ONLY' && action !== 'view') { return false; }

    const withSlash = screen.endsWith('/') ? screen : screen + '/';
    for (const [prefix, moduleKey] of Object.entries(me.modulePrefixes ?? {})) {
      if (withSlash.startsWith(prefix) && me.modules?.[moduleKey] === false) { return false; }
    }

    if (isAdmin) { return true; }
    if (screen.startsWith('admin/')) { return false; }
    if ((me.readOnlyRoles ?? []).includes(role)) { return action === 'view'; }
    return !screen.startsWith('admin/');
  }

  private persistAccess(me: AcessoMeDto): void {
    try { localStorage.setItem(ACCESS_KEY, JSON.stringify(me)); } catch { /* ignore */ }
  }

  private clearStoredAccess(): void {
    try {
      localStorage.removeItem(ACCESS_KEY);
      localStorage.removeItem(STORAGE_KEY);
    } catch { /* ignore */ }
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
    this.fullAccess = this.realMode ? false : this.detectFullAccess(profile);
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
    if (this.realMode) { return this.can(screenId, 'view'); }
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
    return AuthProfileService.ALWAYS_ALLOWED_ADMIN_SCREENS.some((s) => normalized.startsWith(s));
  }

  can(screenId: string, action: PermissionAction): boolean {
    if (this.realMode) {
      return this.access ? this.evaluate(this.access, this.currentLicenseMode, screenId, action) : false;
    }
    // Contrato §5: assinatura e exportação de dados sempre liberadas ao administrador (qualquer modo).
    if (this.fullAccess && this.isBillingScreen(screenId)) { return true; }
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
    if (this.realMode) {
      if (!this.access) { return false; }
      const normalized = this.normalizeRoute(route);
      if (!normalized) { return !!this.access.role; }
      if (normalized === 'acesso-negado') { return true; }
      const screenId = this.resolveScreenId(route) ?? this.routeToScreenId(route);
      return this.can(screenId, 'view');
    }
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
    this.access = null;
    this.loadFailed = false;
    this.profileSubject.next(null);
    try {
      localStorage.removeItem(ACCESS_KEY);
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
    if (this.realMode) {
      try {
        const rawAccess = localStorage.getItem(ACCESS_KEY);
        if (!rawAccess) { return; }
        const me = JSON.parse(rawAccess) as AcessoMeDto;
        this.access = me;
        const mode = localStorage.getItem(LICENSE_MODE_KEY) as LicenseAccessMode | null;
        this.licenseModeSubject.next(mode ?? me.licenseMode ?? 'NONE');
        this.profileSubject.next(this.buildRealProfile(me));
      } catch {
        this.access = null;
      }
      return;
    }
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
