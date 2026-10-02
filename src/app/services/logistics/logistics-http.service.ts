import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ILogisticsService } from './logistics-service.interface';
import { EmbarqueMockService } from '../../../services/embarqueMockService';
import { environment } from '../../../environments/environment';
import { Embarque, Rota, PortoInfo, EmbarqueFilters, LogisticsDashboard } from '../../../types/embarque';

// --- Backend BFF DTOs (/bff/logistica) ---
interface EmbarqueView {
  id: string;
  exportId?: string;
  reference: string;
  status: string;
  portoOrigemId?: string;
  portoDestinoId?: string;
  navioId?: string;
  transportadoraId?: string;
  etd?: string;
  eta?: string;
  modal?: string;
  containerCount?: number;
}

interface CriarEmbarqueRequest {
  reference: string;
  exportId?: string;
  portoOrigemId?: string;
  portoDestinoId?: string;
  navioId?: string;
  transportadoraId?: string;
  etd?: string;
  eta?: string;
  modal?: string;
  containerCount?: number;
}

// Backend dashboard counters for shipments.
interface EmbarquesDashboardResponse {
  total?: number;
  porStatus?: { status: string; quantidade: number }[];
}

// Backend port registry DTO (/bff/logistica/portos → PortoView).
interface PortoView {
  id: string;
  code: string;
  name: string;
  country: string;
}

// HTTP gateway for the logistica/embarque module. Only used when
// environment.realApis.logistics === true; otherwise the mock adapter is
// provided. The front mock is far richer than the backend, so methods with no
// backend endpoint DELEGATE to the injected mock (marked PARTIAL) and the
// screens keep working during incremental migration.
@Injectable({
  providedIn: 'root'
})
export class LogisticsHttpService implements ILogisticsService {
  private readonly http = inject(HttpClient);
  private readonly mock = inject(EmbarqueMockService);
  private readonly api = `${environment.bffBaseUrl}/bff/logistica`;

  // Maps a backend status (PLANEJADO/EM_TRANSITO/ENTREGUE/CANCELADO) to the
  // front shipment_status union, falling back to 'Planned' for unknown values.
  private mapStatus(status?: string): Embarque['shipment_status'] {
    switch ((status || '').toUpperCase()) {
      case 'EM_TRANSITO': return 'In Transit';
      case 'ENTREGUE': return 'Delivered';
      case 'CANCELADO': return 'Delayed';
      case 'PLANEJADO': return 'Planned';
      default: return 'Planned';
    }
  }

  // Maps EmbarqueView -> front Embarque, filling fields the backend does not
  // provide with safe defaults so the UI always renders a valid row.
  private toEmbarque(v: EmbarqueView): Embarque {
    const now = new Date();
    return {
      shipment_id: v.id,
      shipment_number: v.reference ?? '',
      contract_id: v.exportId ?? '',
      exporter_name: '',
      importer_name: '',
      commodity: '',
      quantity: 0,
      unit: 'MT',
      container_count: v.containerCount ?? 0,
      port_origin: v.portoOrigemId ?? '',
      port_destination: v.portoDestinoId ?? '',
      shipment_status: this.mapStatus(v.status),
      tracking_status: 'On Time',
      last_update: now,
      transport_mode: 'Marítimo',
      etd: v.etd ? new Date(v.etd) : undefined,
      eta: v.eta ? new Date(v.eta) : undefined,
      created_at: now,
      created_by: '',
      updated_at: now,
      updated_by: ''
    } as Embarque;
  }

  // Maps a front partial into the backend CriarEmbarqueRequest (best-effort:
  // only fields the backend understands are forwarded).
  private toCreateRequest(e: Partial<Embarque>): CriarEmbarqueRequest {
    return {
      reference: e.shipment_number ?? '',
      exportId: e.contract_id,
      portoOrigemId: e.port_origin,
      portoDestinoId: e.port_destination,
      modal: e.transport_mode,
      containerCount: e.container_count,
      etd: e.etd ? new Date(e.etd).toISOString() : undefined,
      eta: e.eta ? new Date(e.eta).toISOString() : undefined
    };
  }

  // --- Backed by the backend BFF ---
  getEmbarques(filters?: EmbarqueFilters): Observable<Embarque[]> {
    let params = new HttpParams();
    if (filters?.shipment_status) {
      params = params.set('status', filters.shipment_status);
    }
    return this.http
      .get<EmbarqueView[]>(`${this.api}/embarques`, { params })
      .pipe(map((rows) => (rows ?? []).map((r) => this.toEmbarque(r))));
  }

  // Consumes GET /bff/logistica/embarques/dashboard; falls back to the mock
  // aggregation when the backend is unavailable or returns nothing.
  getDashboard(): Observable<LogisticsDashboard> {
    const backend$ = this.http
      .get<EmbarquesDashboardResponse>(`${this.api}/embarques/dashboard`)
      .pipe(catchError(() => of<EmbarquesDashboardResponse>({})));
    return forkJoin({ mock: this.mock.getDashboard(), backend: backend$ }).pipe(
      map(({ mock, backend }) => {
        if (backend == null || backend.total == null) {
          return mock;
        }
        return {
          total: backend.total,
          porStatus: backend.porStatus && backend.porStatus.length > 0
            ? backend.porStatus
            : mock.porStatus
        } as LogisticsDashboard;
      })
    );
  }

  getEmbarqueById(id: string): Observable<Embarque | undefined> {
    return this.http
      .get<EmbarqueView>(`${this.api}/embarques/${id}`)
      .pipe(map((v) => (v ? this.toEmbarque(v) : undefined)));
  }

  createEmbarque(embarque: Partial<Embarque>): Observable<Embarque> {
    return this.http
      .post<EmbarqueView>(`${this.api}/embarques`, this.toCreateRequest(embarque))
      .pipe(map((v) => this.toEmbarque(v)));
  }

  // PARTIAL: the backend exposes only lifecycle transitions
  // (/transito, /concluir, /cancelar), not a generic update. Delegated to the
  // mock so edit flows keep working until a mapping is defined.
  updateEmbarque(id: string, updates: Partial<Embarque>): Observable<Embarque> {
    return this.mock.updateEmbarque(id, updates);
  }

  // PARTIAL: the backend has no delete endpoint (only cancel). Delegated.
  deleteEmbarque(id: string): Observable<boolean> {
    return this.mock.deleteEmbarque(id);
  }

  // PARTIAL: rota catalog is a front-only concept; no backend equivalent.
  getRotas(): Observable<Rota[]> {
    return this.mock.getRotas();
  }

  // Consumes GET /bff/logistica/portos (PortoView) and maps it to the front
  // PortoInfo, filling the rich fields (congestion, avg operation time) with
  // safe defaults since the backend does not provide them. Falls back to the
  // mock when the backend is unavailable.
  getPortos(): Observable<PortoInfo[]> {
    return this.http.get<PortoView[]>(`${this.api}/portos`).pipe(
      map((rows) => (rows ?? []).map((p) => ({
        codigo: p.code ?? '',
        nome: p.name ?? '',
        pais: p.country ?? '',
        congestionamento_atual: 0,
        tempo_medio_operacao: 0
      } as PortoInfo))),
      catchError(() => this.mock.getPortos())
    );
  }

  // PARTIAL: AI route suggestion has no backend endpoint.
  getAIRouteSuggestion(origem: string, destino: string, commodity: string): Observable<any> {
    return this.mock.getAIRouteSuggestion(origem, destino, commodity);
  }

  // PARTIAL: tracking timeline has no backend endpoint.
  getTimelineTracking(shipmentId: string): Observable<any[]> {
    return this.mock.getTimelineTracking(shipmentId);
  }

  // PARTIAL: document generation has no backend endpoint.
  generateDocuments(shipmentId: string): Observable<any[]> {
    return this.mock.generateDocuments(shipmentId);
  }
}
