import { Observable } from 'rxjs';
import {
  AiAnalyzeRequest,
  AiAnalysisResult,
  AiReconcileRequest,
  AiReconciliationResult
} from '../../../types/ai-hub';

// Gateway interface for the AI Hub module. Method names and return types are
// identical across the mock and HTTP adapters so screens can swap the concrete
// service for the InjectionToken without any other change. Both methods are
// backed by the real BFF endpoints (POST /bff/ai/analisar and
// POST /bff/ai/reconciliar) in the HTTP adapter, and by deterministic
// in-memory responses in the mock adapter.
export interface IAiService {
  analisar(req: AiAnalyzeRequest): Observable<AiAnalysisResult>;
  reconciliar(req: AiReconcileRequest): Observable<AiReconciliationResult>;
}
