import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { IAdminUsuarioService } from './admin-usuario-service.interface';
import { environment } from '../../../environments/environment';
import { AdminUser, UserMetrics, UserRole, UserStatus } from '../../../types/admin-usuarios';

/** Backend user view (GET/POST/PUT /bff/admin/usuarios). */
interface UsuarioViewDto {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  empresa: string;
  departamento: string;
  ultimoAcesso: string;
  dataCriacao: string;
  mfaEnabled: boolean;
  loginCount: number;
  phone: string;
}

interface UserMetricsDto {
  totalUsers: number; ativos: number; inativos: number;
  bloqueados: number; pendentes: number; mfaHabilitado: number;
}

/**
 * Real HTTP gateway for user management. Hits the tenant-scoped BFF under
 * /bff/admin/usuarios; the backend scopes everything to the current org.
 * Session cookie + CSRF are attached by the global interceptors.
 */
@Injectable({ providedIn: 'root' })
export class AdminUsuarioHttpService implements IAdminUsuarioService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.bffBaseUrl}/bff/admin/usuarios`;

  getUsers(): Observable<AdminUser[]> {
    return this.http.get<UsuarioViewDto[]>(this.api).pipe(map(list => (list ?? []).map(d => this.toUser(d))));
  }

  getMetrics(): Observable<UserMetrics> {
    return this.http.get<UserMetricsDto>(`${this.api}/metricas`).pipe(map(d => ({
      totalUsers: d.totalUsers, ativos: d.ativos, inativos: d.inativos,
      bloqueados: d.bloqueados, pendentes: d.pendentes, mfaHabilitado: d.mfaHabilitado
    })));
  }

  addUser(user: AdminUser): Observable<AdminUser> {
    return this.http.post<UsuarioViewDto>(this.api, this.toRequest(user)).pipe(map(d => this.toUser(d)));
  }

  addUsers(users: AdminUser[]): Observable<AdminUser[]> {
    const body = { usuarios: users.map(u => this.toRequest(u)) };
    return this.http.post<UsuarioViewDto[]>(`${this.api}/importar`, body).pipe(map(list => (list ?? []).map(d => this.toUser(d))));
  }

  updateUser(user: AdminUser): Observable<AdminUser> {
    return this.http.put<UsuarioViewDto>(`${this.api}/${user.id}`, this.toRequest(user)).pipe(map(d => this.toUser(d)));
  }

  changeStatus(userId: string, status: string): Observable<AdminUser> {
    return this.http.put<UsuarioViewDto>(`${this.api}/${userId}/status`, { status }).pipe(map(d => this.toUser(d)));
  }

  resetPassword(userId: string): Observable<{ ok: boolean }> {
    return this.http.post<{ ok: boolean }>(`${this.api}/${userId}/reset-senha`, {});
  }

  private toRequest(u: AdminUser): Record<string, unknown> {
    return {
      name: u.name, email: u.email, role: u.role, status: u.status,
      departamento: u.departamento, phone: u.phone, mfaEnabled: u.mfaEnabled
    };
  }

  private toUser(d: UsuarioViewDto): AdminUser {
    return {
      id: d.id,
      name: d.name ?? '',
      email: d.email ?? '',
      role: (d.role as UserRole) ?? 'ANALISTA',
      status: (d.status as UserStatus) ?? 'PENDENTE',
      empresa: d.empresa ?? '',
      departamento: d.departamento ?? '',
      ultimoAcesso: d.ultimoAcesso ? new Date(d.ultimoAcesso) : new Date(),
      dataCriacao: d.dataCriacao ? new Date(d.dataCriacao) : new Date(),
      mfaEnabled: !!d.mfaEnabled,
      loginCount: d.loginCount ?? 0,
      phone: d.phone ?? ''
    };
  }
}