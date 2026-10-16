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

// --- Escopo B — operações e capacidades (Data Models — Frontend) ---

// Operações base (Req 8)
export interface AiJobView { jobId: string; status: string; }
export interface AiUsageView {
  feature: string; label: string; used: number; included: number; unit: string; percent: number;
}
export interface AiModelRouteView {
  task: string; priority: string; provider: string; model: string; enabled: boolean;
}

// NCM estruturado (Req 14)
export interface NcmClassifyRequest {
  description: string; productName?: string; scientificName?: string; commodityType?: string;
}
export interface NcmClassificationResult {
  ncm: string;
  confidence: number;
  rationale: string;
  alternatives: { ncm: string; confidence: number; reason: string }[];
}

// Simulação de transporte (Req 15)
export interface TransportSimRequest {
  origin: string; destination: string; product: string; quantityTons: number;
  preferredModal: string; incoterm: string; desiredDate: string;
}
export interface TransportSimResult {
  carrier: string; modal: string; route: string; rationale: string;
  estimatedTransitDays?: number; estimatedCost?: number;
}

// Criação por linguagem natural (Req 16)
export interface NlCreateRequest { command: string; }
export interface ExportDraft {
  incoterm: string; origin: string; destination: string; product: string;
  ncm?: string; quantity: number; unit: string; notes?: string;
}

// OCR Upload multimodal (Req 17)
export interface OcrRequest { storageKey: string; mediaType: string; docKind: string; }
export interface OcrExtractionResult {
  docKind: string;
  extraction: unknown;
  completenessScore: number;
  discrepancies: string[];
  needsReview: boolean;
  provider: string;
  model: string;
  ocrPages: number;
}
