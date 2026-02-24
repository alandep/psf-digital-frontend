import { ProfitabilityData, SimulationResult, SimulationScenario, ProfitabilityAnalysis } from '../types/profitability';

export const mockProfitabilityService = {
  getAnalysis(): ProfitabilityAnalysis {
    return {
      pontosPositivos: [
        'Preço internacional favorável: +12%',
        'Taxa cambial positiva: +4%',
        'Baixo custo logístico: +6%',
        'Alta demanda internacional: +8%'
      ],
      pontosNegativos: [
        'Alta volatilidade cambial: -5%',
        'Custo portuário elevado: -3%',
        'Risco atraso embarque: -2%'
      ]
    };
  },

  simulate(data: ProfitabilityData, scenario: SimulationScenario): SimulationResult {
    const scenarios = {
      dolar_subir: {
        scenario: 'Dólar Subir 10%',
        impact: 10,
        newProfitability: 22.5,
        description: 'Aumento da receita em USD convertida para BRL'
      },
      dolar_cair: {
        scenario: 'Dólar Cair 10%',
        impact: -8,
        newProfitability: 15.2,
        description: 'Redução da receita em USD convertida para BRL'
      },
      frete_subir: {
        scenario: 'Frete Subir 15%',
        impact: -5,
        newProfitability: 16.8,
        description: 'Aumento dos custos de transporte internacional'
      },
      atraso_embarque: {
        scenario: 'Atraso Embarque',
        impact: -3,
        newProfitability: 17.2,
        description: 'Custos adicionais por atraso na operação'
      }
    };

    return scenarios[scenario];
  },

  calculateProfitability(data: ProfitabilityData) {
    // Mock calculation logic
    const receita = data.precoVendaUSD * data.quantidade * data.taxaCambioAtual;
    const custoTotal = (data.precoCompraBRL * data.quantidade) + 
                      (data.freteInternacionalUSD * data.taxaCambioAtual) + 
                      data.freteNacionalBRL + data.taxasPortuarias + 
                      data.taxasGovernamentais + data.custoArmazenagem;
    
    return {
      receitaTotalBRL: receita,
      custoTotalBRL: custoTotal,
      lucroBrutoBRL: receita - custoTotal,
      margemLucro: receita > 0 ? ((receita - custoTotal) / receita) * 100 : 0,
      scoreRentabilidade: Math.max(0, Math.min(100, ((receita - custoTotal) / receita) * 400 + 60)),
      scoreRisco: Math.random() * 30 + 10
    };
  }
};
