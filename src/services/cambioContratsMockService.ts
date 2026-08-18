import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import {
  ContratoCambio,
  ContractStatus,
  QuotationData,
  SimulationRequest,
  SimulationResult,
  BankComparison,
  FinancialTimelineEvent,
  CambioAIInsights,
  CambioFilters,
  CambioMetrics,
  FinancialKPIs
} from '../types/cambio';

@Injectable({
  providedIn: 'root'
})
export class CambioContratsMockService {

  private contracts: ContratoCambio[] = [];
  private quotations: QuotationData[] = [];

  constructor() {
    this.initializeMockData();
  }

  // ================================
  // PUBLIC API
  // ================================

  getContracts(filters?: CambioFilters): Observable<ContratoCambio[]> {
    let result = [...this.contracts];

    if (filters) {
      if (filters.searchText) {
        const search = filters.searchText.toLowerCase();
        result = result.filter(c =>
          c.contractNumber.toLowerCase().includes(search) ||
          c.bank.toLowerCase().includes(search) ||
          c.exporterName.toLowerCase().includes(search) ||
          c.linkedExportNumber.toLowerCase().includes(search)
        );
      }
      if (filters.status) {
        result = result.filter(c => c.status === filters.status);
      }
      if (filters.bank) {
        result = result.filter(c => c.bank === filters.bank);
      }
      if (filters.currency) {
        result = result.filter(c => c.currency === filters.currency);
      }
      if (filters.minValue !== null && filters.minValue !== undefined) {
        result = result.filter(c => c.foreignValue >= filters.minValue!);
      }
    }

    return of(result).pipe(delay(this.randomDelay()));
  }

  getContractById(id: string): Observable<ContratoCambio | null> {
    const c = this.contracts.find(ct => ct.id === id) || null;
    return of(c).pipe(delay(this.randomDelay()));
  }

  createContract(data: Partial<ContratoCambio>): Observable<ContratoCambio> {
    const newContract: ContratoCambio = {
      id: `CAMBIO-${Date.now()}`,
      contractNumber: data.contractNumber || `CC-${Date.now().toString().slice(-6)}`,
      bank: data.bank || 'Banco do Brasil',
      exporterName: data.exporterName || 'Agro Export Brasil Ltda',
      currency: data.currency || 'USD',
      foreignValue: data.foreignValue || 100000,
      exchangeRate: data.exchangeRate || 5.18,
      brlValue: (data.foreignValue || 100000) * (data.exchangeRate || 5.18),
      status: 'ABERTO',
      closingDate: new Date(),
      liquidationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      linkedExportNumber: data.linkedExportNumber || '',
      linkedInvoiceNumber: data.linkedInvoiceNumber || '',
      linkedDueNumber: data.linkedDueNumber || '',
      aiFinancialScore: 75,
      gainLoss: 0,
      spread: 1.2,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.contracts.unshift(newContract);
    return of(newContract).pipe(delay(this.randomDelay()));
  }

  getQuotations(): Observable<QuotationData[]> {
    return of(this.quotations).pipe(delay(this.randomDelay()));
  }

  simulate(request: SimulationRequest): Observable<SimulationResult> {
    const baseRate = request.currency === 'USD' ? 5.18 :
                     request.currency === 'EUR' ? 5.62 : 6.55;
    const iof = request.value * baseRate * 0.0038;
    const bankFees = request.bank === 'BTG Pactual' ? 250 :
                     request.bank === 'Itaú BBA' ? 320 : 280;
    const spreadPct = request.bank === 'BTG Pactual' ? 0.8 :
                      request.bank === 'Itaú BBA' ? 1.0 :
                      request.bank === 'Banco do Brasil' ? 1.2 :
                      request.bank === 'Bradesco BBI' ? 1.1 :
                      request.bank === 'Santander' ? 1.3 : 0.9;
    const spreadValue = request.value * baseRate * (spreadPct / 100);
    const netValue = request.value * baseRate - iof - bankFees - spreadValue;
    const financialImpact = netValue - (request.value * baseRate);

    const result: SimulationResult = {
      netValue,
      iof,
      bankFees,
      spread: spreadPct,
      financialImpact,
      scenarios: [
        {
          type: 'OTIMISTA',
          rate: baseRate * 1.02,
          brlValue: request.value * (baseRate * 1.02),
          probability: 25
        },
        {
          type: 'PROVÁVEL',
          rate: baseRate,
          brlValue: request.value * baseRate,
          probability: 55
        },
        {
          type: 'CONSERVADOR',
          rate: baseRate * 0.97,
          brlValue: request.value * (baseRate * 0.97),
          probability: 20
        }
      ]
    };
    return of(result).pipe(delay(800));
  }

  compareBanks(currency: string, value: number): Observable<BankComparison[]> {
    const baseRate = currency === 'USD' ? 5.18 :
                     currency === 'EUR' ? 5.62 : 6.55;
    const comparisons: BankComparison[] = [
      { bank: 'Banco do Brasil', rate: baseRate - 0.02, spread: 1.2, fees: 280, totalCost: value * baseRate * 0.012 + 280, netValue: value * (baseRate - 0.02) - 280, recommendation: false },
      { bank: 'Itaú BBA', rate: baseRate + 0.01, spread: 1.0, fees: 320, totalCost: value * baseRate * 0.010 + 320, netValue: value * (baseRate + 0.01) - 320, recommendation: false },
      { bank: 'Bradesco BBI', rate: baseRate - 0.01, spread: 1.1, fees: 260, totalCost: value * baseRate * 0.011 + 260, netValue: value * (baseRate - 0.01) - 260, recommendation: false },
      { bank: 'Santander', rate: baseRate - 0.03, spread: 1.3, fees: 300, totalCost: value * baseRate * 0.013 + 300, netValue: value * (baseRate - 0.03) - 300, recommendation: false },
      { bank: 'BTG Pactual', rate: baseRate + 0.02, spread: 0.8, fees: 250, totalCost: value * baseRate * 0.008 + 250, netValue: value * (baseRate + 0.02) - 250, recommendation: true },
      { bank: 'Safra', rate: baseRate, spread: 0.9, fees: 270, totalCost: value * baseRate * 0.009 + 270, netValue: value * baseRate - 270, recommendation: false }
    ];
    return of(comparisons).pipe(delay(this.randomDelay()));
  }

  getTimeline(contractId: string): Observable<FinancialTimelineEvent[]> {
    const timeline: FinancialTimelineEvent[] = [
      { id: 'T1', contractId, event: 'Contrato Comercial Assinado', date: new Date('2024-06-15'), user: 'Carlos Silva', details: 'Contrato de venda firmado com importador', value: 500000 },
      { id: 'T2', contractId, event: 'Invoice Emitida', date: new Date('2024-07-01'), user: 'Ana Costa', details: 'Commercial Invoice emitida', value: 500000 },
      { id: 'T3', contractId, event: 'DU-E Registrada', date: new Date('2024-07-10'), user: 'Sistema', details: 'Declaração Única de Exportação registrada', value: 500000 },
      { id: 'T4', contractId, event: 'Embarque Realizado', date: new Date('2024-07-20'), user: 'João Santos', details: 'Carga embarcada no Porto de Santos', value: 500000 },
      { id: 'T5', contractId, event: 'Contrato de Câmbio Fechado', date: new Date('2024-07-25'), user: 'Maria Oliveira', details: 'Câmbio fechado a 5.22 BRL/USD', value: 2610000 },
      { id: 'T6', contractId, event: 'Liquidação do Câmbio', date: new Date('2024-08-15'), user: 'Sistema', details: 'Liquidação automática na data prevista', value: 2610000 },
      { id: 'T7', contractId, event: 'Recebimento Confirmado', date: new Date('2024-08-20'), user: 'Sistema', details: 'Valor creditado na conta corrente', value: 2610000 }
    ];
    return of(timeline).pipe(delay(this.randomDelay()));
  }

  getAIInsights(contractId: string): Observable<CambioAIInsights> {
    const insights: CambioAIInsights = {
      contractId,
      financialScore: 82,
      riskLevel: 'MÉDIO',
      alerts: [
        { severity: 'HIGH', message: 'Contrato CC-2024-008 vence em 5 dias — agendar liquidação', detectedAt: new Date() },
        { severity: 'MEDIUM', message: 'Volatilidade do USD/BRL acima da média (1.8% semanal)', detectedAt: new Date(Date.now() - 86400000) },
        { severity: 'LOW', message: 'Spread contratado 0.3% acima da média de mercado', detectedAt: new Date(Date.now() - 172800000) },
        { severity: 'CRITICAL', message: 'Divergência entre valor da invoice e contrato de câmbio detectada', detectedAt: new Date(Date.now() - 43200000) }
      ],
      suggestions: [
        {
          action: 'Antecipar liquidação do contrato CC-2024-005',
          reason: 'Tendência de desvalorização do USD nas próximas 48h com base em indicadores macroeconômicos',
          factors: ['Decisão COPOM', 'Fluxo cambial positivo', 'Payroll EUA abaixo do esperado'],
          confidence: 78,
          financialImpact: 'Economia estimada de R$ 12.500'
        },
        {
          action: 'Renegociar spread com Banco do Brasil',
          reason: 'Volume de operações nos últimos 90 dias justifica redução de 0.3% no spread',
          factors: ['Volume acumulado USD 2.5M', 'Histórico positivo', 'Concorrência entre bancos'],
          confidence: 85,
          financialImpact: 'Economia de R$ 7.800 por operação'
        },
        {
          action: 'Migrar operações para BTG Pactual',
          reason: 'Melhor taxa e menor spread comparado aos bancos atuais',
          factors: ['Spread 0.8% vs 1.2% atual', 'Taxas competitivas', 'Plataforma digital integrada'],
          confidence: 72,
          financialImpact: 'Economia anual estimada de R$ 45.000'
        }
      ],
      bankComparisons: [
        { bank: 'BTG Pactual', rate: 5.20, spread: 0.8, fees: 250, totalCost: 4150, netValue: 515750, recommendation: true },
        { bank: 'Itaú BBA', rate: 5.19, spread: 1.0, fees: 320, totalCost: 5500, netValue: 513500, recommendation: false },
        { bank: 'Banco do Brasil', rate: 5.16, spread: 1.2, fees: 280, totalCost: 6480, netValue: 509520, recommendation: false },
        { bank: 'Safra', rate: 5.18, spread: 0.9, fees: 270, totalCost: 4930, netValue: 513070, recommendation: false }
      ],
      executiveSummary: 'A carteira de câmbio apresenta desempenho financeiro satisfatório com score 82/100. Identificamos oportunidade de economia de R$ 45.000/ano com migração parcial para BTG Pactual. Atenção necessária ao contrato CC-2024-008 próximo do vencimento e divergência documental detectada no CC-2024-012. Recomendamos revisão dos spreads com Banco do Brasil dado o volume acumulado.'
    };
    return of(insights).pipe(delay(this.randomDelay()));
  }

  getMetrics(): Observable<CambioMetrics> {
    const metrics: CambioMetrics = {
      totalContracts: this.contracts.length,
      openContracts: this.contracts.filter(c => c.status === 'ABERTO' || c.status === 'FECHADO').length,
      liquidatedValue: this.contracts.filter(c => c.status === 'LIQUIDADO').reduce((sum, c) => sum + c.brlValue, 0),
      pendingReceipts: this.contracts.filter(c => c.status === 'ABERTO' || c.status === 'FECHADO').reduce((sum, c) => sum + c.brlValue, 0),
      totalGainLoss: this.contracts.reduce((sum, c) => sum + c.gainLoss, 0),
      avgSpread: this.contracts.reduce((sum, c) => sum + c.spread, 0) / this.contracts.length,
      avgLiquidationDays: 18
    };
    return of(metrics).pipe(delay(this.randomDelay()));
  }

  getFinancialKPIs(): Observable<FinancialKPIs> {
    const kpis: FinancialKPIs = {
      exportedValue: this.contracts.reduce((sum, c) => sum + c.foreignValue, 0),
      liquidatedValue: this.contracts.filter(c => c.status === 'LIQUIDADO').reduce((sum, c) => sum + c.brlValue, 0),
      pendingReceipts: this.contracts.filter(c => c.status !== 'LIQUIDADO' && c.status !== 'CANCELADO').reduce((sum, c) => sum + c.brlValue, 0),
      gainLoss: this.contracts.reduce((sum, c) => sum + c.gainLoss, 0),
      avgSpread: 1.15,
      avgLiquidationDays: 18
    };
    return of(kpis).pipe(delay(this.randomDelay()));
  }

  // Synchronous helpers
  getBanks(): string[] {
    return ['Banco do Brasil', 'Itaú BBA', 'Bradesco BBI', 'Santander', 'BTG Pactual', 'Safra'];
  }

  getCurrencies(): string[] {
    return ['USD', 'EUR', 'GBP'];
  }

  getStatuses(): ContractStatus[] {
    return ['ABERTO', 'FECHADO', 'LIQUIDADO', 'VENCIDO', 'CANCELADO', 'RENEGOCIADO'];
  }

  // ================================
  // PRIVATE HELPERS
  // ================================

  private randomDelay(): number {
    return Math.floor(Math.random() * 300) + 200;
  }

  private initializeMockData(): void {
    this.initializeContracts();
    this.initializeQuotations();
  }

  private initializeQuotations(): void {
    this.quotations = [
      {
        currency: 'USD',
        currentRate: 5.18,
        previousClose: 5.15,
        dailyChange: 0.58,
        weeklyChange: 1.17,
        trend: 'UP',
        bestAvailable: 5.20,
        lastUpdated: new Date(),
        source: 'BCB/PTAX'
      },
      {
        currency: 'EUR',
        currentRate: 5.62,
        previousClose: 5.59,
        dailyChange: 0.54,
        weeklyChange: 0.89,
        trend: 'UP',
        bestAvailable: 5.64,
        lastUpdated: new Date(),
        source: 'BCB/PTAX'
      },
      {
        currency: 'GBP',
        currentRate: 6.55,
        previousClose: 6.58,
        dailyChange: -0.46,
        weeklyChange: -0.31,
        trend: 'DOWN',
        bestAvailable: 6.57,
        lastUpdated: new Date(),
        source: 'BCB/PTAX'
      }
    ];
  }

  private initializeContracts(): void {
    this.contracts = [
      {
        id: 'CAMBIO-001', contractNumber: 'CC-2024-001', bank: 'Banco do Brasil',
        exporterName: 'Agro Export Brasil Ltda', currency: 'USD', foreignValue: 500000,
        exchangeRate: 5.22, brlValue: 2610000, status: 'LIQUIDADO',
        closingDate: new Date('2024-06-15'), liquidationDate: new Date('2024-07-15'),
        linkedExportNumber: 'EXP-2024-0042', linkedInvoiceNumber: 'INV-2024-0089',
        linkedDueNumber: 'DUE-2024-00156', aiFinancialScore: 92,
        gainLoss: 35000, spread: 1.2, createdAt: new Date('2024-06-10'), updatedAt: new Date('2024-07-15')
      },
      {
        id: 'CAMBIO-002', contractNumber: 'CC-2024-002', bank: 'Itaú BBA',
        exporterName: 'Brazilian Commodities SA', currency: 'USD', foreignValue: 750000,
        exchangeRate: 5.15, brlValue: 3862500, status: 'FECHADO',
        closingDate: new Date('2024-07-20'), liquidationDate: new Date('2024-08-20'),
        linkedExportNumber: 'EXP-2024-0058', linkedInvoiceNumber: 'INV-2024-0112',
        linkedDueNumber: 'DUE-2024-00189', aiFinancialScore: 78,
        gainLoss: -12500, spread: 1.0, createdAt: new Date('2024-07-18'), updatedAt: new Date('2024-07-20')
      },
      {
        id: 'CAMBIO-003', contractNumber: 'CC-2024-003', bank: 'BTG Pactual',
        exporterName: 'Export Excellence Corp', currency: 'EUR', foreignValue: 300000,
        exchangeRate: 5.58, brlValue: 1674000, status: 'ABERTO',
        closingDate: new Date('2024-08-01'), liquidationDate: new Date('2024-09-01'),
        linkedExportNumber: 'EXP-2024-0063', linkedInvoiceNumber: 'INV-2024-0128',
        linkedDueNumber: 'DUE-2024-00201', aiFinancialScore: 88,
        gainLoss: 8200, spread: 0.8, createdAt: new Date('2024-07-28'), updatedAt: new Date('2024-08-01')
      },
      {
        id: 'CAMBIO-004', contractNumber: 'CC-2024-004', bank: 'Bradesco BBI',
        exporterName: 'Agro Export Brasil Ltda', currency: 'USD', foreignValue: 1200000,
        exchangeRate: 5.28, brlValue: 6336000, status: 'LIQUIDADO',
        closingDate: new Date('2024-05-10'), liquidationDate: new Date('2024-06-10'),
        linkedExportNumber: 'EXP-2024-0031', linkedInvoiceNumber: 'INV-2024-0065',
        linkedDueNumber: 'DUE-2024-00112', aiFinancialScore: 95,
        gainLoss: 72000, spread: 1.1, createdAt: new Date('2024-05-05'), updatedAt: new Date('2024-06-10')
      },
      {
        id: 'CAMBIO-005', contractNumber: 'CC-2024-005', bank: 'Santander',
        exporterName: 'Brazilian Commodities SA', currency: 'USD', foreignValue: 450000,
        exchangeRate: 5.10, brlValue: 2295000, status: 'VENCIDO',
        closingDate: new Date('2024-04-01'), liquidationDate: new Date('2024-05-01'),
        linkedExportNumber: 'EXP-2024-0019', linkedInvoiceNumber: 'INV-2024-0038',
        linkedDueNumber: 'DUE-2024-00067', aiFinancialScore: 45,
        gainLoss: -28000, spread: 1.3, createdAt: new Date('2024-03-25'), updatedAt: new Date('2024-05-05')
      },
      {
        id: 'CAMBIO-006', contractNumber: 'CC-2024-006', bank: 'Safra',
        exporterName: 'Export Excellence Corp', currency: 'GBP', foreignValue: 200000,
        exchangeRate: 6.52, brlValue: 1304000, status: 'FECHADO',
        closingDate: new Date('2024-08-05'), liquidationDate: new Date('2024-09-05'),
        linkedExportNumber: 'EXP-2024-0071', linkedInvoiceNumber: 'INV-2024-0142',
        linkedDueNumber: 'DUE-2024-00218', aiFinancialScore: 81,
        gainLoss: 5600, spread: 0.9, createdAt: new Date('2024-08-01'), updatedAt: new Date('2024-08-05')
      },
      {
        id: 'CAMBIO-007', contractNumber: 'CC-2024-007', bank: 'Banco do Brasil',
        exporterName: 'Agro Export Brasil Ltda', currency: 'USD', foreignValue: 850000,
        exchangeRate: 5.19, brlValue: 4411500, status: 'ABERTO',
        closingDate: new Date('2024-08-10'), liquidationDate: new Date('2024-09-10'),
        linkedExportNumber: 'EXP-2024-0075', linkedInvoiceNumber: 'INV-2024-0150',
        linkedDueNumber: 'DUE-2024-00225', aiFinancialScore: 74,
        gainLoss: 0, spread: 1.2, createdAt: new Date('2024-08-08'), updatedAt: new Date('2024-08-10')
      },
      {
        id: 'CAMBIO-008', contractNumber: 'CC-2024-008', bank: 'Itaú BBA',
        exporterName: 'Brazilian Commodities SA', currency: 'USD', foreignValue: 620000,
        exchangeRate: 5.25, brlValue: 3255000, status: 'FECHADO',
        closingDate: new Date('2024-07-28'), liquidationDate: new Date('2024-08-28'),
        linkedExportNumber: 'EXP-2024-0068', linkedInvoiceNumber: 'INV-2024-0135',
        linkedDueNumber: 'DUE-2024-00210', aiFinancialScore: 83,
        gainLoss: 18500, spread: 1.0, createdAt: new Date('2024-07-25'), updatedAt: new Date('2024-07-28')
      },
      {
        id: 'CAMBIO-009', contractNumber: 'CC-2024-009', bank: 'BTG Pactual',
        exporterName: 'Agro Export Brasil Ltda', currency: 'USD', foreignValue: 980000,
        exchangeRate: 5.30, brlValue: 5194000, status: 'LIQUIDADO',
        closingDate: new Date('2024-06-20'), liquidationDate: new Date('2024-07-20'),
        linkedExportNumber: 'EXP-2024-0048', linkedInvoiceNumber: 'INV-2024-0098',
        linkedDueNumber: 'DUE-2024-00165', aiFinancialScore: 91,
        gainLoss: 45000, spread: 0.8, createdAt: new Date('2024-06-15'), updatedAt: new Date('2024-07-20')
      },
      {
        id: 'CAMBIO-010', contractNumber: 'CC-2024-010', bank: 'Bradesco BBI',
        exporterName: 'Export Excellence Corp', currency: 'EUR', foreignValue: 420000,
        exchangeRate: 5.55, brlValue: 2331000, status: 'CANCELADO',
        closingDate: new Date('2024-05-15'), liquidationDate: new Date('2024-06-15'),
        linkedExportNumber: 'EXP-2024-0035', linkedInvoiceNumber: 'INV-2024-0072',
        linkedDueNumber: 'DUE-2024-00125', aiFinancialScore: 30,
        gainLoss: 0, spread: 1.1, createdAt: new Date('2024-05-10'), updatedAt: new Date('2024-05-20')
      },
      {
        id: 'CAMBIO-011', contractNumber: 'CC-2024-011', bank: 'Santander',
        exporterName: 'Brazilian Commodities SA', currency: 'USD', foreignValue: 330000,
        exchangeRate: 5.12, brlValue: 1689600, status: 'RENEGOCIADO',
        closingDate: new Date('2024-04-20'), liquidationDate: new Date('2024-06-20'),
        linkedExportNumber: 'EXP-2024-0022', linkedInvoiceNumber: 'INV-2024-0045',
        linkedDueNumber: 'DUE-2024-00078', aiFinancialScore: 58,
        gainLoss: -8500, spread: 1.5, createdAt: new Date('2024-04-15'), updatedAt: new Date('2024-05-30')
      },
      {
        id: 'CAMBIO-012', contractNumber: 'CC-2024-012', bank: 'Safra',
        exporterName: 'Agro Export Brasil Ltda', currency: 'USD', foreignValue: 670000,
        exchangeRate: 5.21, brlValue: 3490700, status: 'ABERTO',
        closingDate: new Date('2024-08-12'), liquidationDate: new Date('2024-09-12'),
        linkedExportNumber: 'EXP-2024-0078', linkedInvoiceNumber: 'INV-2024-0155',
        linkedDueNumber: 'DUE-2024-00232', aiFinancialScore: 79,
        gainLoss: 3200, spread: 0.9, createdAt: new Date('2024-08-10'), updatedAt: new Date('2024-08-12')
      },
      {
        id: 'CAMBIO-013', contractNumber: 'CC-2024-013', bank: 'Itaú BBA',
        exporterName: 'Export Excellence Corp', currency: 'GBP', foreignValue: 150000,
        exchangeRate: 6.48, brlValue: 972000, status: 'LIQUIDADO',
        closingDate: new Date('2024-05-25'), liquidationDate: new Date('2024-06-25'),
        linkedExportNumber: 'EXP-2024-0037', linkedInvoiceNumber: 'INV-2024-0075',
        linkedDueNumber: 'DUE-2024-00130', aiFinancialScore: 87,
        gainLoss: 12800, spread: 1.0, createdAt: new Date('2024-05-20'), updatedAt: new Date('2024-06-25')
      },
      {
        id: 'CAMBIO-014', contractNumber: 'CC-2024-014', bank: 'BTG Pactual',
        exporterName: 'Brazilian Commodities SA', currency: 'USD', foreignValue: 1500000,
        exchangeRate: 5.35, brlValue: 8025000, status: 'FECHADO',
        closingDate: new Date('2024-08-15'), liquidationDate: new Date('2024-09-15'),
        linkedExportNumber: 'EXP-2024-0082', linkedInvoiceNumber: 'INV-2024-0162',
        linkedDueNumber: 'DUE-2024-00240', aiFinancialScore: 90,
        gainLoss: 52000, spread: 0.8, createdAt: new Date('2024-08-12'), updatedAt: new Date('2024-08-15')
      },
      {
        id: 'CAMBIO-015', contractNumber: 'CC-2024-015', bank: 'Banco do Brasil',
        exporterName: 'Agro Export Brasil Ltda', currency: 'EUR', foreignValue: 280000,
        exchangeRate: 5.60, brlValue: 1568000, status: 'ABERTO',
        closingDate: new Date('2024-08-18'), liquidationDate: new Date('2024-09-18'),
        linkedExportNumber: 'EXP-2024-0085', linkedInvoiceNumber: 'INV-2024-0168',
        linkedDueNumber: 'DUE-2024-00248', aiFinancialScore: 76,
        gainLoss: 0, spread: 1.2, createdAt: new Date('2024-08-15'), updatedAt: new Date('2024-08-18')
      },
      {
        id: 'CAMBIO-016', contractNumber: 'CC-2024-016', bank: 'Bradesco BBI',
        exporterName: 'Brazilian Commodities SA', currency: 'USD', foreignValue: 890000,
        exchangeRate: 5.18, brlValue: 4610200, status: 'LIQUIDADO',
        closingDate: new Date('2024-06-28'), liquidationDate: new Date('2024-07-28'),
        linkedExportNumber: 'EXP-2024-0052', linkedInvoiceNumber: 'INV-2024-0105',
        linkedDueNumber: 'DUE-2024-00175', aiFinancialScore: 89,
        gainLoss: 28500, spread: 1.1, createdAt: new Date('2024-06-25'), updatedAt: new Date('2024-07-28')
      }
    ];
  }
}
