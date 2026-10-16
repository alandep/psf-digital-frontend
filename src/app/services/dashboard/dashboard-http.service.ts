import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { IDashboardService } from './dashboard-service.interface';
import { environment } from '../../../environments/environment';
import {
  DashboardCompleto,
  FiltrosDashboard,
  OptionsFilters
} from '../../../types/dashboard';

// HTTP gateway for the Dashboard Principal. Only used when
// environment.realApis.dashboard === true; otherwise the DashboardMockAdapter
// is provided. This adapter hits the REAL BFF
// (GET /bff/dashboards/principal and GET /bff/dashboards/principal/filtros).
// Session cookies and the X-XSRF-TOKEN CSRF header are attached automatically
// by the credentialsInterceptor and csrfInterceptor, so no extra wiring is
// needed. There is intentionally NO fallback to the mock here: real backend
// errors are surfaced to the screen so the operator sees genuine failures
// (Req 8.4).

// --- Backend contract shapes (BFF) ---
// Shape devolvido por GET /bff/dashboards/principal. Os KPIs usam camelCase e
// são mapeados para o snake_case que a tela/tipo DashboardData espera.
interface DashboardAnalyticsView {
  kpis: {
    totalExportacoes: number;
    totalEmbarcado: number;
    totalPendente: number;
    lucroEstimado: number;
    margemMedia: number;
    contratosAtivos: number;
    alertasCompliance: number;
  };
  exportacoesPorMes: { mes: string; valor: number }[];
  exportacoesPorPais: { pais: string; valor: number; percentual: number }[];
  exportacoesPorProduto: { produto: string; valor: number }[];
}

// Shape devolvido por GET /bff/dashboards/principal/filtros. Produtos e
// clientes vêm como pares {id,label}; a tela atual consome string[], então
// mapeamos para o label.
interface OptionsFiltersView {
  paises: string[];
  produtos: { id: string; label: string }[];
  clientes: { id: string; label: string }[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardHttpService implements IDashboardService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.bffBaseUrl}/bff/dashboards/principal`;

  getDashboardData(filtros?: FiltrosDashboard): Observable<DashboardCompleto> {
    let params = new HttpParams();

    if (filtros?.periodo?.dataInicio) {
      params = params.set('dataInicio', filtros.periodo.dataInicio.toISOString());
    }
    if (filtros?.periodo?.dataFim) {
      params = params.set('dataFim', filtros.periodo.dataFim.toISOString());
    }
    // Listas repetidas: append gera dataInicio=...&paises=A&paises=B...
    for (const pais of filtros?.paises ?? []) {
      params = params.append('paises', pais);
    }
    for (const produto of filtros?.produtos ?? []) {
      params = params.append('produtos', produto);
    }
    for (const cliente of filtros?.clientes ?? []) {
      params = params.append('clientes', cliente);
    }

    return this.http
      .get<DashboardAnalyticsView>(this.api, { params })
      .pipe(map(view => this.toDashboardCompleto(view)));
  }

  getOptionsFilters(): Observable<OptionsFilters> {
    return this.http
      .get<OptionsFiltersView>(`${this.api}/filtros`)
      .pipe(map(view => this.toOptionsFilters(view)));
  }

  // Mapeia o DashboardAnalyticsView (camelCase do backend) para o
  // DashboardCompleto (snake_case esperado pela tela). Os valores já chegam
  // como number no JSON, então é apenas renomeação de campos.
  private toDashboardCompleto(view: DashboardAnalyticsView): DashboardCompleto {
    return {
      kpis: {
        total_exportacoes: view.kpis.totalExportacoes,
        total_embarcado: view.kpis.totalEmbarcado,
        total_pendente: view.kpis.totalPendente,
        lucro_estimado: view.kpis.lucroEstimado,
        margem_media: view.kpis.margemMedia,
        contratos_ativos: view.kpis.contratosAtivos,
        alertas_compliance: view.kpis.alertasCompliance
      },
      exportacoesPorMes: view.exportacoesPorMes.map(m => ({
        mes: m.mes,
        valor: m.valor
      })),
      exportacoesPorPais: view.exportacoesPorPais.map(p => ({
        pais: p.pais,
        valor: p.valor,
        percentual: p.percentual
      })),
      exportacoesPorProduto: view.exportacoesPorProduto.map(p => ({
        produto: p.produto,
        valor: p.valor
      }))
    };
  }

  // Mapeia o OptionsFiltersView para OptionsFilters. O backend manda
  // {id,label} para produtos/clientes, mas o tipo do front usa string[]:
  // usamos o label (fallback para id). Idealmente o filtro por produto/cliente
  // usaria o id (UUID) para a query; mantemos string[] por compatibilidade com
  // o contrato atual da tela/mock.
  private toOptionsFilters(view: OptionsFiltersView): OptionsFilters {
    return {
      paises: view.paises,
      produtos: view.produtos.map(p => p.label ?? p.id),
      clientes: view.clientes.map(c => c.label ?? c.id)
    };
  }
}
