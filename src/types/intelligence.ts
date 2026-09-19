// Types for EIP Intelligence (MOCK). Backend-agnostic shapes so the mock
// service can later be swapped for a real API without changing consumers.

export type IntelligenceType = 'FX' | 'ALERT' | 'NEWS' | 'OPPORTUNITY' | 'REGULATION';

export type ImpactLevel = 'INFORMATIONAL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface IntelligenceItem {
  id: string;
  slug: string;
  type: IntelligenceType;
  title: string;
  summary: string;
  sourceName: string;
  country?: string;
  sector?: string;
  impactLevel: ImpactLevel;
  aiGenerated: boolean;
  publishedAt: Date;
  aiAnalysis?: string; // EIP AI analysis, clearly separated from the source fact
}

export interface FxQuote {
  pair: string;
  value: number;
  changePercent: number;
  reference: string;
  source: string;
  updatedAt: Date;
}

export interface HomePublicData {
  fx: FxQuote[];
  items: IntelligenceItem[]; // alerts+news+opportunities mixed, for the Home teaser
  sponsored: { advertiser: string; headline: string; description: string; ctaLabel: string } | null;
  systemStatus: { ok: boolean; label: string };
}

// Shared presentation helpers (labels/colors) for impact levels and types.
export interface ImpactStyle {
  label: string;
  icon: string;
  color: string;
  bg: string;
}

export const IMPACT_STYLES: Record<ImpactLevel, ImpactStyle> = {
  INFORMATIONAL: { label: 'Informativo', icon: '🟢', color: '#2e7d32', bg: '#e8f5e9' },
  LOW: { label: 'Baixo impacto', icon: '🟢', color: '#2e7d32', bg: '#e8f5e9' },
  MEDIUM: { label: 'Atenção', icon: '🟡', color: '#ef6c00', bg: '#fff3e0' },
  HIGH: { label: 'Impacto relevante', icon: '🟠', color: '#e65100', bg: '#ffe0b2' },
  CRITICAL: { label: 'Alto impacto', icon: '🔴', color: '#c62828', bg: '#ffebee' },
};

export const TYPE_LABELS: Record<IntelligenceType, string> = {
  FX: 'Câmbio',
  ALERT: 'Alerta',
  NEWS: 'Notícia',
  OPPORTUNITY: 'Oportunidade',
  REGULATION: 'Regulação',
};
