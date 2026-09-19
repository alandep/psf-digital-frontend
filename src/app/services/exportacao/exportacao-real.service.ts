import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IExportacaoService } from './exportacao-service.interface';
import { ExportacaoMockService } from '../../../services/exportacaoMockService';
import { environment } from '../../../environments/environment';
import {
  Exportacao,
  ExportacaoFilterOptions,
  ExportacaoDashboard,
  AIAssistantMessage,
  SiscomexIntegration,
  AISuggestion,
  ExportacaoDocumento
} from '../../../types/exportacao';

// --- Backend BFF DTOs (subset actually consumed) ---
interface ExportacaoItemView {
  productId?: string;
  description?: string;
  quantity?: number;
  unitPrice?: number;
}

interface ExportacaoView {
  id: string;
  reference?: string;
  status?: string;
  destinationCountry?: string;
  incoterm?: string;
  currency?: string;
  totalAmount?: number;
  itens?: ExportacaoItemView[];
}

interface ExportacoesPageResponse {
  content?: ExportacaoView[];
  items?: ExportacaoView[];
  totalElements?: number;
  page?: number;
}

// PARTIAL: backend covers CRUD list/create/confirm; other methods use mock
// until the backend exposes them. Only used when environment.realApis.export
// is true; otherwise the mock adapter is provided.
@Injectable({
  providedIn: 'root'
})
export class ExportacaoRealService implements IExportacaoService {
  private readonly http = inject(HttpClient);
  private readonly mock = inject(ExportacaoMockService);
  private readonly api = `${environment.bffBaseUrl}/bff/exportacoes`;

  // Maps a backend status enum to the front Exportacao.export_status union.
  private mapStatus(status?: string): Exportacao['export_status'] {
    switch ((status || '').toUpperCase()) {
      case 'CONFIRMADA':
        return 'Approved';
      case 'CANCELADA':
        return 'Cancelled';
      case 'RASCUNHO':
      default:
        return 'Draft';
    }
  }

  // Maps a backend ExportacaoView to the rich front Exportacao type, filling
  // fields the backend does not provide with safe defaults so the UI renders.
  private toExportacao(v: ExportacaoView): Exportacao {
    const now = new Date();
    return {
      export_id: v.id,
      export_number: v.reference ?? v.id,
      contract_id: '',
      exporter_id: '',
      exporter_name: '',
      importer_name: '',
      importer_country: v.destinationCountry ?? '',
      destination_country: v.destinationCountry ?? '',
      product_id: '',
      product_name: '',
      ncm_code: '',
      quantity: 0,
      unit: 'MT',
      packaging_type: 'Container',
      incoterm: (v.incoterm as Exportacao['incoterm']) ?? 'FOB',
      currency: (v.currency as Exportacao['currency']) ?? 'USD',
      unit_price: 0,
      total_value: v.totalAmount ?? 0,
      payment_method: 'T/T',
      payment_terms: '',
      port_origin: '',
      port_destination: '',
      transport_mode: 'Marítimo',
      export_status: this.mapStatus(v.status),
      compliance_status: 'Pending',
      export_license_required: false,
      mapa_approval: false,
      vigiagro_status: 'Not Required',
      ai_generated: false,
      ai_confidence_score: 0,
      ai_risk_score: 0,
      ai_auto_fill_enabled: false,
      ai_document_generation: false,
      ai_compliance_check: false,
      created_at: now,
      created_by: '',
      updated_at: now,
      updated_by: ''
    };
  }

  private extractContent(res: ExportacoesPageResponse): ExportacaoView[] {
    return res.content ?? res.items ?? [];
  }

  // --- CRUD backed by the backend BFF ---
  getExportacoes(filters?: ExportacaoFilterOptions): Observable<Exportacao[]> {
    let params = new HttpParams();
    if (filters?.export_status) {
      params = params.set('status', filters.export_status);
    }
    return this.http
      .get<ExportacoesPageResponse>(this.api, { params })
      .pipe(map((res) => this.extractContent(res).map((v) => this.toExportacao(v))));
  }

  getExportacaoById(id: string): Observable<Exportacao | null> {
    return this.http
      .get<ExportacaoView>(`${this.api}/${id}`)
      .pipe(map((v) => (v ? this.toExportacao(v) : null)));
  }

  createExportacao(exportacao: Partial<Exportacao>): Observable<Exportacao> {
    const body = {
      destinationCountry: exportacao.destination_country ?? '',
      incoterm: exportacao.incoterm ?? 'FOB',
      currency: exportacao.currency ?? 'USD',
      itens: (exportacao.items ?? []).map((it) => ({
        productId: it.product_id,
        description: it.product_name ?? it.product_description ?? '',
        quantity: it.quantity,
        unitPrice: it.unit_price
      }))
    };
    return this.http
      .post<ExportacaoView>(this.api, body)
      .pipe(map((v) => this.toExportacao(v)));
  }

  // No backend delete endpoint yet: delegate to the mock so screens keep working.
  deleteExportacao(id: string): Observable<boolean> {
    return this.mock.deleteExportacao(id);
  }

  // No backend generic update yet: delegate to the mock.
  updateExportacao(id: string, exportacao: Partial<Exportacao>): Observable<Exportacao> {
    return this.mock.updateExportacao(id, exportacao);
  }

  // --- Not yet exposed by the backend: delegate to the mock ---
  getDashboardData(): Observable<ExportacaoDashboard> {
    return this.mock.getDashboardData();
  }

  getExportacaoDetails(exportId: string): Observable<any> {
    return this.mock.getExportacaoDetails(exportId);
  }

  createExportacaoByNLP(text: string): Observable<Exportacao> {
    return this.mock.createExportacaoByNLP(text);
  }

  processOCRDocument(file: File): Observable<Exportacao> {
    return this.mock.processOCRDocument(file);
  }

  generateExportWithAI(basicData: any): Observable<Exportacao> {
    return this.mock.generateExportWithAI(basicData);
  }

  getMasterData(): Observable<any> {
    return this.mock.getMasterData();
  }

  getAISuggestions(formData: any): Observable<any[]> {
    return this.mock.getAISuggestions(formData);
  }

  getAIResponse(query: string): Observable<{ message: string; suggestions?: AISuggestion[] }> {
    return this.mock.getAIResponse(query);
  }

  runAIAnalysis(exportId: string): Observable<any> {
    return this.mock.runAIAnalysis(exportId);
  }

  processAIQuery(query: string, contextExportId?: string): Observable<AIAssistantMessage[]> {
    return this.mock.processAIQuery(query, contextExportId);
  }

  validateExportacao(exportId: string): Observable<{ valid: boolean; errors: string[] }> {
    return this.mock.validateExportacao(exportId);
  }

  validateCompliance(
    exportId: string
  ): Observable<{ valid: boolean; errors: string[]; warnings: string[] }> {
    return this.mock.validateCompliance(exportId);
  }

  generateDocuments(exportId: string): Observable<boolean> {
    return this.mock.generateDocuments(exportId);
  }

  regenerateDocument(exportId: string, documentId: string): Observable<ExportacaoDocumento> {
    return this.mock.regenerateDocument(exportId, documentId);
  }

  sendToSiscomex(exportId: string): Observable<SiscomexIntegration> {
    return this.mock.sendToSiscomex(exportId);
  }

  checkSiscomexStatus(dueNumber: string): Observable<SiscomexIntegration> {
    return this.mock.checkSiscomexStatus(dueNumber);
  }

  getCountries(): Observable<string[]> {
    return this.mock.getCountries();
  }

  getProducts(): Observable<{ id: string; name: string; ncm: string }[]> {
    return this.mock.getProducts();
  }

  getPorts(): Observable<{ origin: string[]; destination: string[] }> {
    return this.mock.getPorts();
  }
}
