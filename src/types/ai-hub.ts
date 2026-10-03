export interface AiAnalyzeRequest { task: string; input: string; }
export interface AiAnalysisResult {
  task: string; output: string; provider: string; model: string;
  inputUnits: number; outputUnits: number; ocrPages: number;
}
export interface AiReconcileRequest { pedido: string; packing: string; invoice: string; }

// --- Nova forma do contrato de reconciliacao (ReconciliationResponse do BFF) ---
export type DocExtractionStatus = 'OK' | 'FAILED';

export interface DocumentExtractionResult {
  kind: string;
  status: DocExtractionStatus;
  dto: unknown | null;
  failureKind: string | null;
  failureDetail: string | null;
}

export interface ReconciliationView {
  pedido: unknown;
  packing: unknown;
  invoice: unknown;
  ok: boolean;
  divergences: string[];
  explanation: string;
}

export interface ReviewOutcome {
  needsReview: boolean;
  reasons: string[];
  signalSource: string;
}

export interface AiReconciliationResult {
  pedido: DocumentExtractionResult;
  packing: DocumentExtractionResult;
  invoice: DocumentExtractionResult;
  allExtracted: boolean;
  reconciliation: ReconciliationView | null;
  review: ReviewOutcome;
}
