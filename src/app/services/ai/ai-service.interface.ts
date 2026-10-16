import { Observable } from 'rxjs';
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

// Gateway interface for the AI Hub module. Method names and return types are
// identical across the mock and HTTP adapters so screens can swap the concrete
// service for the InjectionToken without any other change. The sync methods are
// backed by the real BFF endpoints in the HTTP adapter and by deterministic
// in-memory responses in the mock adapter. Beyond the base analisar/reconciliar
// operations, the interface exposes async job handling and usage/router queries
// (Req 8) and the Escopo B structured capabilities (Req 14-17), each served by a
// dedicated BFF endpoint that already returns a typed DTO (no JSON.parse on the
// front).
export interface IAiService {
  analisar(req: AiAnalyzeRequest): Observable<AiAnalysisResult>;
  reconciliar(req: AiReconcileRequest): Observable<AiReconciliationResult>;
  analisarAsync(req: AiAnalyzeRequest): Observable<AiJobView>;
  jobStatus(id: string): Observable<AiJobView>;
  uso(): Observable<AiUsageView[]>;
  router(): Observable<AiModelRouteView[]>;
  classificarNcm(req: NcmClassifyRequest): Observable<NcmClassificationResult>;
  simularTransporte(req: TransportSimRequest): Observable<TransportSimResult>;
  criarPorLinguagemNatural(req: NlCreateRequest): Observable<ExportDraft>;
  ocr(req: OcrRequest): Observable<OcrExtractionResult>;
  // OCR multimodal via upload direto (multipart). O backend armazena o binário
  // e executa o agente OCR da GCP; evita PUT cross-origin do navegador.
  ocrUpload(file: File, docKind: string): Observable<OcrExtractionResult>;
}
