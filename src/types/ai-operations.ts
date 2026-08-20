export interface AiAgent {
  id: string;
  name: string;
  module: string;
  requests24h: number;
  avgResponseTime: number;
  accuracy: number;
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
