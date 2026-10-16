export interface AiAgent {
  id: string;
  name: string;
  module: string;
  requests24h: number;
  avgResponseTime: number;
  // Pode ser null quando a capacidade não expõe sinal real de acurácia
  // (apenas NCM_CLASSIFICATION/OCR_DOCUMENT derivam acurácia no backend).
  // A UI renderiza "n/a" nesse caso.
  accuracy: number | null;
  cost: number;
  status: 'ACTIVE' | 'DEGRADED' | 'OFFLINE' | 'MAINTENANCE';
  lastError: string | null;
  lastErrorAt: Date | null;
}

export interface AiOperationsMetrics {
  totalRequests24h: number;
  avgResponseTime: number;
  accuracyRate: number;
  estimatedCost: number;
  activeAgents: number;
  totalAgents: number;
}

export interface AiErrorEntry {
  id: string;
  agentId: string;
  timestamp: Date;
  type: string;
  message: string;
  module: string;
}

export interface AiOperationsFilters {
  searchText: string;
  status: string;
  module: string;
}
