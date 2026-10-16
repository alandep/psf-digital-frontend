import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { IEmpresaService } from './empresa-service.interface';
import { environment } from '../../../environments/environment';
import { Empresa, EmpresaMetrics, EmpresaStatus, EmpresaTipo } from '../../../types/admin-empresas';

/** Backend DTO returned by GET/POST/PUT /bff/admin/empresas. */
interface EmpresaViewDto {
  id: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  tipo: string;
  status: string;
  pais: string;
  estado: string;
  cidade: string;
  responsavel: string;
  email: string;
  telefone: string;
  plano: string;
  gcpTenantId: string;
  dataAdesao: string;
  modulosAtivos: string[];
}

/**
 * HTTP gateway for empresa (tenant) administration. Hits the real BFF under
 * /bff/admin/empresas. Session cookie + CSRF header are attached by the global
 * interceptors. Maps the backend EmpresaView to the frontend Empresa shape.
 */
@Injectable({ providedIn: 'root' })
export class EmpresaHttpService implements IEmpresaService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.bffBaseUrl}/bff/admin/empresas`;

  getEmpresas(): Observable<Empresa[]> {
    return this.http.get<EmpresaViewDto[]>(this.api).pipe(map(list => (list ?? []).map(d => this.toEmpresa(d))));
  }

  getMetrics(): Observable<EmpresaMetrics> {
    // Derive metrics from the list (no dedicated backend endpoint yet).
    return this.getEmpresas().pipe(map(empresas => ({
      totalEmpresas: empresas.length,
      ativas: empresas.filter(e => e.status === 'ATIVA').length,
      emOnboarding: empresas.filter(e => e.status === 'EM_ONBOARDING').length,
      suspensas: empresas.filter(e => e.status === 'SUSPENSA').length,
      totalUsuarios: empresas.reduce((s, e) => s + (e.usuarios || 0), 0),
      totalExportacoes: empresas.reduce((s, e) => s + (e.exportacoes || 0), 0)
    })));
  }

  addEmpresa(empresa: Empresa): Observable<Empresa> {
    return this.http.post<EmpresaViewDto>(this.api, this.toRequest(empresa)).pipe(map(d => this.toEmpresa(d)));
  }

  updateEmpresa(empresa: Empresa): Observable<Empresa> {
    return this.http.put<EmpresaViewDto>(`${this.api}/${empresa.id}`, this.toRequest(empresa)).pipe(map(d => this.toEmpresa(d)));
  }

  private toRequest(e: Empresa): Record<string, string> {
    return {
      razaoSocial: e.razaoSocial, nomeFantasia: e.nomeFantasia, cnpj: e.cnpj,
      tipo: e.tipo, pais: e.pais, estado: e.estado, cidade: e.cidade,
      responsavel: e.responsavel, email: e.email, telefone: e.telefone, plano: e.plano
    };
  }

  private toEmpresa(d: EmpresaViewDto): Empresa {
    return {
      id: d.id,
      razaoSocial: d.razaoSocial ?? '',
      nomeFantasia: d.nomeFantasia ?? '',
      cnpj: d.cnpj ?? '',
      tipo: (d.tipo as EmpresaTipo) ?? 'EXPORTADOR',
      status: (d.status as EmpresaStatus) ?? 'EM_ONBOARDING',
      pais: d.pais ?? 'Brasil',
      estado: d.estado ?? '',
      cidade: d.cidade ?? '',
      responsavel: d.responsavel ?? '',
      email: d.email ?? '',
      telefone: d.telefone ?? '',
      plano: d.plano ?? '',
      gcpTenantId: d.gcpTenantId,
      dataAdesao: d.dataAdesao ? new Date(d.dataAdesao) : new Date(),
      ultimoAcesso: d.dataAdesao ? new Date(d.dataAdesao) : new Date(),
      usuarios: 0,
      exportacoes: 0,
      modulosAtivos: d.modulosAtivos ?? []
    };
  }
}