import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { SimulacaoInput, SimulacaoResult, SimulacaoHistorico, CostBreakdownItem } from '../types/simulador-rentabilidade';

@Injectable({
  providedIn: 'root'
})
export class SimuladorMockService {

  private historico: SimulacaoHistorico[] = [];

  constructor() {
    this.initializeHistorico();
  }

  simular(input: SimulacaoInput): Observable<SimulacaoResult> {
    const receita = input.volume * input.pricePerUnit * input.exchangeRate;

    // Realistic cost percentages based on product type
    const custosProdutoPerc = this.getCustosProdutoPerc(input.product);
    const custosLogisticosPerc = this.getCustosLogisticosPerc(input.destinationCountry);
    const custosPortuariosPerc = 0.025;
    const seguroPerc = 0.012;
    const impostosPerc = 0.035;
    const custosFinanceirosPerc = 0.018;
    const comissoesPerc = 0.03;

    const custosProduto = receita * custosProdutoPerc;
    const custosLogisticos = receita * custosLogisticosPerc;
    const custosPortuarios = receita * custosPortuariosPerc;
    const seguro = receita * seguroPerc;
    const impostos = receita * impostosPerc;
    const custosFinanceiros = receita * custosFinanceirosPerc;
    const comissoes = receita * comissoesPerc;

    const custoTotal = custosProduto + custosLogisticos + custosPortuarios + seguro + impostos + custosFinanceiros + comissoes;
    const margemBruta = receita - custoTotal;
    const margemPercentual = (margemBruta / receita) * 100;

    const breakdownItems: CostBreakdownItem[] = [
      { category: 'Produto', description: 'Custo de aquisição/produção', value: custosProduto, percentage: (custosProduto / custoTotal) * 100 },
      { category: 'Logística', description: 'Frete internacional e interno', value: custosLogisticos, percentage: (custosLogisticos / custoTotal) * 100 },
      { category: 'Portuário', description: 'THC, capatazia e armazenagem', value: custosPortuarios, percentage: (custosPortuarios / custoTotal) * 100 },
      { category: 'Seguro', description: 'Seguro de transporte internacional', value: seguro, percentage: (seguro / custoTotal) * 100 },
      { category: 'Impostos', description: 'Tributos e taxas de exportação', value: impostos, percentage: (impostos / custoTotal) * 100 },
      { category: 'Financeiro', description: 'Hedge cambial e juros', value: custosFinanceiros, percentage: (custosFinanceiros / custoTotal) * 100 },
      { category: 'Comissões', description: 'Comissões comerciais e agentes', value: comissoes, percentage: (comissoes / custoTotal) * 100 }
    ];

    const result: SimulacaoResult = {
      receita,
      custosProduto,
      custosLogisticos,
      custosPortuarios,
      seguro,
      impostos,
      custosFinanceiros,
      comissoes,
      custoTotal,
      margemBruta,
      margemPercentual,
      breakdownItems
    };

    return of(result).pipe(delay(800));
  }

  getHistorico(): Observable<SimulacaoHistorico[]> {
    return of([...this.historico]).pipe(delay(this.randomDelay()));
  }

  private getCustosProdutoPerc(product: string): number {
    const custos: Record<string, number> = {
      'Soja em Grãos': 0.55,
      'Café Arábica': 0.48,
      'Carne Bovina': 0.60,
      'Frango Congelado': 0.58,
      'Açúcar Cristal': 0.50,
      'Celulose': 0.45,
      'Minério de Ferro': 0.40,
      'Etanol': 0.52,
      'Milho': 0.53,
      'Algodão': 0.50
    };
    return custos[product] || 0.55;
  }

  private getCustosLogisticosPerc(country: string): number {
    const custos: Record<string, number> = {
      'China': 0.08,
      'EUA': 0.06,
      'Japão': 0.09,
      'Alemanha': 0.07,
      'Arábia Saudita': 0.085,
      'Índia': 0.075,
      'Holanda': 0.065,
      'Coreia do Sul': 0.088,
      'Chile': 0.04,
      'Argentina': 0.035
    };
    return custos[country] || 0.07;
  }

  private randomDelay(): number {
    return 300 + Math.random() * 500;
  }

  private initializeHistorico(): void {
    this.historico = [
      {
        id: 'SIM-001', date: new Date('2024-12-10'), product: 'Soja em Grãos',
        country: 'China', volume: 50000, receita: 12500000, margem: 2875000, margemPercent: 23.0
      },
      {
        id: 'SIM-002', date: new Date('2024-12-08'), product: 'Café Arábica',
        country: 'Alemanha', volume: 5000, receita: 4250000, margem: 1275000, margemPercent: 30.0
      },
      {
        id: 'SIM-003', date: new Date('2024-12-05'), product: 'Carne Bovina',
        country: 'Arábia Saudita', volume: 3000, receita: 6000000, margem: 1140000, margemPercent: 19.0
      },
      {
        id: 'SIM-004', date: new Date('2024-12-03'), product: 'Frango Congelado',
        country: 'Japão', volume: 4000, receita: 3200000, margem: 576000, margemPercent: 18.0
      },
      {
        id: 'SIM-005', date: new Date('2024-11-28'), product: 'Açúcar Cristal',
        country: 'Índia', volume: 25000, receita: 7500000, margem: 1725000, margemPercent: 23.0
      },
      {
        id: 'SIM-006', date: new Date('2024-11-25'), product: 'Celulose',
        country: 'China', volume: 10000, receita: 16000000, margem: 4960000, margemPercent: 31.0
      },
      {
        id: 'SIM-007', date: new Date('2024-11-20'), product: 'Minério de Ferro',
        country: 'China', volume: 100000, receita: 42500000, margem: 14025000, margemPercent: 33.0
      },
      {
        id: 'SIM-008', date: new Date('2024-11-18'), product: 'Etanol',
        country: 'EUA', volume: 15000, receita: 7050000, margem: 1551000, margemPercent: 22.0
      },
      {
        id: 'SIM-009', date: new Date('2024-11-15'), product: 'Milho',
        country: 'Coreia do Sul', volume: 30000, receita: 4800000, margem: 912000, margemPercent: 19.0
      },
      {
        id: 'SIM-010', date: new Date('2024-11-10'), product: 'Algodão',
        country: 'Holanda', volume: 8000, receita: 5600000, margem: 1400000, margemPercent: 25.0
      }
    ];
  }
}
