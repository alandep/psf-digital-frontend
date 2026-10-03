import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IAiService } from './ai-service.interface';
import { environment } from '../../../environments/environment';
import {
  AiAnalyzeRequest,
  AiAnalysisResult,
  AiReconcileRequest,
  AiReconciliationResult
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
}
