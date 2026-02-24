export interface ProfitabilityData {
  exportId: string;
  produto: string;
  quantidade: number;
  precoVendaUSD: number;
  precoCompraBRL: number;
  freteInternacionalUSD: number;
  freteNacionalBRL: number;
  taxasPortuarias: number;
  taxasGovernamentais: number;
  custoArmazenagem: number;
  taxaCambioAtual: number;
  taxaCambioPrevista: number;
}

export interface CalculatedFields {
  receitaTotalBRL: number;
  custoTotalBRL: number;
  lucroBrutoBRL: number;
  margemLucro: number;
  scoreRentabilidade: number;
  scoreRisco: number;
}

export interface SimulationResult {
  scenario: string;
  impact: number;
  newProfitability: number;
  description: string;
}

export type SimulationScenario = 'dolar_subir' | 'dolar_cair' | 'frete_subir' | 'atraso_embarque';

export interface ProfitabilityAnalysis {
  pontosPositivos: string[];
  pontosNegativos: string[];
}
