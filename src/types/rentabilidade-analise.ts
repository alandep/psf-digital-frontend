/** Análise de rentabilidade de uma exportação (calculada no front por regras). */
export interface AnaliseRentabilidade {
  id: string;
  exportacaoId: string;
  produto: string;
  quantidade: number;
  precoVendaUsd: number;
  precoCompraBrl: number;
  freteInternacionalUsd: number;
  freteNacionalBrl: number;
  taxasPortuarias: number;
  taxasGovernamentais: number;
  custoArmazenagem: number;
  taxaCambioAtual: number;
  /** Mediana Focus/BCB do ano corrente; ausente quando a expectativa está indisponível. */
  taxaCambioPrevista?: number | null;
  /** Ano de referência da expectativa Focus. */
  expectativaAno?: string | null;
  /** Data da pesquisa Focus (yyyy-MM-dd). */
  expectativaData?: string | null;

  // Campos calculados
  receitaTotalBrl: number;
  custoTotalBrl: number;
  lucroBrutoBrl: number;
  margemLucro: number;
  scoreRentabilidade: number;
  scoreRisco: number;
  /** Não é mais estimada; ausente nas análises novas. */
  confiabilidadePrevisao?: number | null;

  // Análise qualitativa
  pontosPositivos: string[];
  pontosNegativos: string[];
  recomendacao: string;

  dataAnalise: Date;
}

/** Visão devolvida por /bff/rentabilidade/analises. */
export interface RentabilidadeAnaliseDto {
  id: string;
  exportacaoRef: string;
  produto: string;
  score: number;
  margem: number;
  lucroBrl: number;
  payload: object;
  createdAt: string;
}

/** Corpo do POST /bff/rentabilidade/analises. */
export interface RentabilidadeAnaliseRequest {
  exportacaoRef: string;
  produto: string;
  score: number;
  margem: number;
  lucroBrl: number;
  payload: object;
}
