import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IAiService } from './ai-service.interface';
import { environment } from '../../../environments/environment';
import {
  AiAnalyzeRequest,
  AiAnalysisResult,
  AiReconcileRequest,
  AiReconciliationResult,
  AiJobView,
  AiUsageView,
  AiModelRouteView,
  NcmClassifyRequest,
  NcmClassificationResult,
  TransportSimRequest,
  TransportSimResult,
  NlCreateRequest,
  ExportDraft,
  OcrRequest,
  OcrExtractionResult
} from '../../../types/ai-hub';

// HTTP gateway for the AI Hub module. Only used when environment.realApis.ai
// === true; otherwise the mock adapter is provided. This adapter hits the REAL
// BFF (POST /bff/ai/analisar and POST /bff/ai/reconciliar). Session cookies and
// the X-XSRF-TOKEN CSRF header are attached automatically by the
// credentialsInterceptor and csrfInterceptor, so no extra wiring is needed.
// There is intentionally NO fallback to the mock here: real backend errors are
// surfaced to the screen so the operator sees genuine failures.
@Injectable({
  providedIn: 'root'
})
export class AiHttpService implements IAiService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.bffBaseUrl}/bff/ai`;

  analisar(req: AiAnalyzeRequest): Observable<AiAnalysisResult> {
    return this.http.post<AiAnalysisResult>(`${this.api}/analisar`, req);
  }

  reconciliar(req: AiReconcileRequest): Observable<AiReconciliationResult> {
    return this.http.post<AiReconciliationResult>(`${this.api}/reconciliar`, req);
  }

  // --- Operações base (Req 8, 4, 5, 10) ---
  // Análise assíncrona: o BFF enfileira o job e devolve o AiJobView inicial.
  analisarAsync(req: AiAnalyzeRequest): Observable<AiJobView> {
    return this.http.post<AiJobView>(`${this.api}/analisar/async`, req);
  }

  // Consulta de status do job assíncrono (polling feito pela tela).
  jobStatus(id: string): Observable<AiJobView> {
    return this.http.get<AiJobView>(`${this.api}/jobs/${id}`);
  }

  // Uso/quota corrente derivado do ledger.
  uso(): Observable<AiUsageView[]> {
    return this.http.get<AiUsageView[]>(`${this.api}/uso`);
  }

  // Roteamento de modelos configurado por task.
  router(): Observable<AiModelRouteView[]> {
    return this.http.get<AiModelRouteView[]>(`${this.api}/router`);
  }

  // --- Capacidades estruturadas (Req 14-17) ---
  // Cada endpoint dedicado já devolve DTO tipado: o HttpClient desserializa o
  // corpo direto, sem JSON.parse manual no front.
  classificarNcm(req: NcmClassifyRequest): Observable<NcmClassificationResult> {
    return this.http.post<NcmClassificationResult>(`${this.api}/ncm/classificar`, req);
  }

  simularTransporte(req: TransportSimRequest): Observable<TransportSimResult> {
    return this.http.post<TransportSimResult>(`${this.api}/transporte/simular`, req);
  }

  criarPorLinguagemNatural(req: NlCreateRequest): Observable<ExportDraft> {
    return this.http.post<ExportDraft>(`${this.api}/exportacao/criar-nl`, req);
  }

  ocr(req: OcrRequest): Observable<OcrExtractionResult> {
    return this.http.post<OcrExtractionResult>(`${this.api}/ocr`, req);
  }

  // OCR multimodal via upload direto (multipart). O binário vai no corpo como
  // multipart/form-data (parts: file + docKind); o Content-Type/boundary é
  // definido pelo navegador. Sessão e CSRF são anexados pelos interceptors.
  // Evita o PUT cross-origin que causava "Failed to fetch".
  ocrUpload(file: File, docKind: string): Observable<OcrExtractionResult> {
    const form = new FormData();
    form.append('file', file);
    form.append('docKind', docKind);
    return this.http.post<OcrExtractionResult>(`${this.api}/ocr/upload`, form);
  }
}
