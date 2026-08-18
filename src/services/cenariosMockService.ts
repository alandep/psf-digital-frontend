import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Cenario, CenarioComparison, CenariosMetrics } from '../types/rentabilidade-cenarios';

@Injectable({
  providedIn: 'root'
})
export class CenariosMockService {

  private cenarios: Cenario[] = [];
  private comparisons: CenarioComparison[] = [];

  constructor() {
    this.initializeMockData();
  }

  getCenarios(): Observable<Cenario[]> {
    return of([...this.cenarios]).pipe(delay(400));
  }

  getMetrics(): Observable<CenariosMetrics> {
    const margins = this.cenarios.map(c => c.marginPercent);
    const exchangeRates = this.cenarios.map(c => c.exchangeRate);
    const metrics: CenariosMetrics = {
      totalCenarios: this.cenarios.length,
      cenariosAtivos: this.cenarios.filter(c => c.tipo === 'BASE' || c.tipo === 'OTIMISTA').length,
      melhorMargem: Math.max(...margins),
      piorMargem: Math.min(...margins),
      margemMedia: Math.round((margins.reduce((s, m) => s + m, 0) / margins.length) * 10) / 10,
      variacaoCambial: Math.round((Math.max(...exchangeRates) - Math.min(...exchangeRates)) * 100) / 100
    };
    return of(metrics).pipe(delay(300));
  }

  getComparisons(): Observable<CenarioComparison[]> {
    return of([...this.comparisons]).pipe(delay(350));
  }

  private initializeMockData(): void {
    this.cenarios = [
      { id: 'CEN-001', name: 'Soja China - Otimista', tipo: 'OTIMISTA', description: 'Cenário com câmbio favorável e frete reduzido', product: 'Soja em Grãos', country: 'China', volume: 10000, exchangeRate: 5.80, freightCost: 45000, productPrice: 520, margin: 1820000, marginPercent: 35.0, revenue: 5200000, totalCost: 3380000, riskLevel: 'Baixo', createdAt: new Date('2025-01-10'), createdBy: 'Ana Silva' },
      { id: 'CEN-002', name: 'Soja China - Base', tipo: 'BASE', description: 'Cenário com condições atuais de mercado', product: 'Soja em Grãos', country: 'China', volume: 10000, exchangeRate: 5.45, freightCost: 55000, productPrice: 490, margin: 1225000, marginPercent: 25.0, revenue: 4900000, totalCost: 3675000, riskLevel: 'Médio', createdAt: new Date('2025-01-10'), createdBy: 'Ana Silva' },
      { id: 'CEN-003', name: 'Soja China - Conservador', tipo: 'CONSERVADOR', description: 'Cenário com pressão de preços e câmbio desfavorável', product: 'Soja em Grãos', country: 'China', volume: 10000, exchangeRate: 5.20, freightCost: 62000, productPrice: 460, margin: 690000, marginPercent: 15.0, revenue: 4600000, totalCost: 3910000, riskLevel: 'Alto', createdAt: new Date('2025-01-10'), createdBy: 'Ana Silva' },
      { id: 'CEN-004', name: 'Soja China - Adverso', tipo: 'ADVERSO', description: 'Cenário com guerra comercial e custos elevados', product: 'Soja em Grãos', country: 'China', volume: 8000, exchangeRate: 4.90, freightCost: 75000, productPrice: 430, margin: 172000, marginPercent: 5.0, revenue: 3440000, totalCost: 3268000, riskLevel: 'Crítico', createdAt: new Date('2025-01-10'), createdBy: 'Ana Silva' },
      { id: 'CEN-005', name: 'Café Europa - Otimista', tipo: 'OTIMISTA', description: 'Alta demanda europeia com prêmio de qualidade', product: 'Café Arábica', country: 'Alemanha', volume: 800, exchangeRate: 5.80, freightCost: 18000, productPrice: 4200, margin: 1176000, marginPercent: 35.0, revenue: 3360000, totalCost: 2184000, riskLevel: 'Baixo', createdAt: new Date('2025-01-15'), createdBy: 'Carlos Mendes' },
      { id: 'CEN-006', name: 'Café Europa - Base', tipo: 'BASE', description: 'Condições normais de mercado para café', product: 'Café Arábica', country: 'Alemanha', volume: 800, exchangeRate: 5.45, freightCost: 22000, productPrice: 3800, margin: 684000, marginPercent: 22.5, revenue: 3040000, totalCost: 2356000, riskLevel: 'Médio', createdAt: new Date('2025-01-15'), createdBy: 'Carlos Mendes' },
      { id: 'CEN-007', name: 'Café Europa - Conservador', tipo: 'CONSERVADOR', description: 'Queda na demanda e aumento de competição', product: 'Café Arábica', country: 'Alemanha', volume: 600, exchangeRate: 5.20, freightCost: 25000, productPrice: 3500, margin: 315000, marginPercent: 15.0, revenue: 2100000, totalCost: 1785000, riskLevel: 'Alto', createdAt: new Date('2025-01-15'), createdBy: 'Carlos Mendes' },
      { id: 'CEN-008', name: 'Açúcar Índia - Otimista', tipo: 'OTIMISTA', description: 'Safra reduzida global elevando preços', product: 'Açúcar VHP', country: 'Índia', volume: 15000, exchangeRate: 5.80, freightCost: 85000, productPrice: 380, margin: 1710000, marginPercent: 30.0, revenue: 5700000, totalCost: 3990000, riskLevel: 'Baixo', createdAt: new Date('2025-01-20'), createdBy: 'Maria Oliveira' },
      { id: 'CEN-009', name: 'Açúcar Índia - Base', tipo: 'BASE', description: 'Mercado estável com demanda indiana consistente', product: 'Açúcar VHP', country: 'Índia', volume: 15000, exchangeRate: 5.45, freightCost: 95000, productPrice: 350, margin: 1050000, marginPercent: 20.0, revenue: 5250000, totalCost: 4200000, riskLevel: 'Médio', createdAt: new Date('2025-01-20'), createdBy: 'Maria Oliveira' },
      { id: 'CEN-010', name: 'Açúcar Índia - Adverso', tipo: 'ADVERSO', description: 'Subsídios indianos e queda de preço internacional', product: 'Açúcar VHP', country: 'Índia', volume: 12000, exchangeRate: 4.90, freightCost: 110000, productPrice: 310, margin: 186000, marginPercent: 5.0, revenue: 3720000, totalCost: 3534000, riskLevel: 'Crítico', createdAt: new Date('2025-01-20'), createdBy: 'Maria Oliveira' },
      { id: 'CEN-011', name: 'Milho Japão - Base', tipo: 'BASE', description: 'Demanda estável japonesa para ração animal', product: 'Milho', country: 'Japão', volume: 12000, exchangeRate: 5.45, freightCost: 72000, productPrice: 280, margin: 672000, marginPercent: 20.0, revenue: 3360000, totalCost: 2688000, riskLevel: 'Médio', createdAt: new Date('2025-01-22'), createdBy: 'Pedro Santos' },
      { id: 'CEN-012', name: 'Milho Japão - Conservador', tipo: 'CONSERVADOR', description: 'Competição com milho americano', product: 'Milho', country: 'Japão', volume: 10000, exchangeRate: 5.20, freightCost: 80000, productPrice: 260, margin: 390000, marginPercent: 15.0, revenue: 2600000, totalCost: 2210000, riskLevel: 'Alto', createdAt: new Date('2025-01-22'), createdBy: 'Pedro Santos' },
      { id: 'CEN-013', name: 'Celulose EUA - Otimista', tipo: 'OTIMISTA', description: 'Mercado aquecido com câmbio forte', product: 'Celulose', country: 'EUA', volume: 8000, exchangeRate: 5.80, freightCost: 52000, productPrice: 680, margin: 1904000, marginPercent: 35.0, revenue: 5440000, totalCost: 3536000, riskLevel: 'Baixo', createdAt: new Date('2025-01-25'), createdBy: 'Ana Silva' }
    ];

    this.comparisons = [
      { metric: 'Receita (USD)', otimista: 5200000, base: 4900000, conservador: 4600000, adverso: 3440000, unit: 'USD' },
      { metric: 'Custo Total (USD)', otimista: 3380000, base: 3675000, conservador: 3910000, adverso: 3268000, unit: 'USD' },
      { metric: 'Margem (%)', otimista: 35.0, base: 25.0, conservador: 15.0, adverso: 5.0, unit: '%' },
      { metric: 'Câmbio (BRL/USD)', otimista: 5.80, base: 5.45, conservador: 5.20, adverso: 4.90, unit: 'BRL' },
      { metric: 'Frete (USD)', otimista: 45000, base: 55000, conservador: 62000, adverso: 75000, unit: 'USD' },
      { metric: 'Nível de Risco', otimista: 1, base: 2, conservador: 3, adverso: 4, unit: 'nível' }
    ];
  }
}
