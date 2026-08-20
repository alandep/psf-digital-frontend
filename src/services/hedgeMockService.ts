import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import {
  HedgeContract,
  HedgeType,
  HedgeStatus,
  HedgeKPIs,
  ExposureSummary,
  HedgeFilters
} from '../types/hedge';

@Injectable({
  providedIn: 'root'
})
export class HedgeMockService {

  private contracts: HedgeContract[] = [];

  constructor() {
    this.initializeMockData();
  }

  getContracts(filters?: HedgeFilters): Observable<HedgeContract[]> {
    let result = [...this.contracts];

    if (filters) {
      if (filters.searchText) {
        const search = filters.searchText.toLowerCase();
        result = result.filter(c =>
          c.contractNumber.toLowerCase().includes(search) ||
          c.bank.toLowerCase().includes(search) ||
          c.counterparty.toLowerCase().includes(search)
        );
      }
      if (filters.type) {
        result = result.filter(c => c.type === filters.type);
      }
      if (filters.status) {
        result = result.filter(c => c.status === filters.status);
      }
      if (filters.bank) {
        result = result.filter(c => c.bank === filters.bank);
      }
      if (filters.currencyPair) {
        result = result.filter(c => c.currencyPair === filters.currencyPair);
      }
    }

    return of(result).pipe(delay(this.randomDelay()));
  }

  getKPIs(): Observable<HedgeKPIs> {
    const ativos = this.contracts.filter(c => c.status === 'ATIVO');
    const kpis: HedgeKPIs = {
      contratosAtivos: ativos.length,
      valorNocionalTotal: ativos.reduce((sum, c) => sum + c.notionalValue, 0),
      hedgeRatioMedio: 72.5,
      pnlNaoRealizado: ativos.reduce((sum, c) => sum + c.markToMarket, 0)
    };
    return of(kpis).pipe(delay(this.randomDelay()));
  }

  getExposureSummary(): Observable<ExposureSummary> {
    const summary: ExposureSummary = {
      totalExposed: 12500000,
      totalHedged: 9062500,
      hedgeRatio: 72.5,
      netOpenPosition: 3437500
    };
    return of(summary).pipe(delay(this.randomDelay()));
  }

  getBanks(): string[] {
    return ['BTG Pactual', 'Itaú BBA', 'Bradesco BBI', 'Santander', 'J.P. Morgan', 'Goldman Sachs', 'Banco do Brasil'];
  }

  getTypes(): HedgeType[] {
    return ['NDF', 'FORWARD', 'OPTION_CALL', 'OPTION_PUT', 'SWAP'];
  }

  getStatuses(): HedgeStatus[] {
    return ['ATIVO', 'LIQUIDADO', 'VENCIDO', 'CANCELADO', 'EM_NEGOCIACAO'];
  }

  getCurrencyPairs(): string[] {
    return ['USD/BRL', 'EUR/BRL', 'GBP/BRL', 'EUR/USD'];
  }

  private randomDelay(): number {
    return Math.floor(Math.random() * 300) + 200;
  }

  private initializeMockData(): void {
    this.contracts = [
      {
        id: 'HDG-001', contractNumber: 'NDF-2024-001', bank: 'BTG Pactual', type: 'NDF', status: 'ATIVO',
        notionalValue: 1500000, currencyPair: 'USD/BRL', strikeRate: 5.25, spotRateAtClose: 5.18,
        maturityDate: new Date('2024-12-15'), tradeDate: new Date('2024-06-15'), settlementDate: new Date('2024-12-17'),
        markToMarket: 45000, counterparty: 'Agro Export Brasil Ltda', linkedExposure: 'EXP-2024-042',
        premium: 0, direction: 'SELL', notes: 'Hedge de recebível de exportação de soja'
      },
      {
        id: 'HDG-002', contractNumber: 'FWD-2024-001', bank: 'Itaú BBA', type: 'FORWARD', status: 'ATIVO',
        notionalValue: 800000, currencyPair: 'USD/BRL', strikeRate: 5.30, spotRateAtClose: 5.20,
        maturityDate: new Date('2024-11-30'), tradeDate: new Date('2024-05-30'), settlementDate: new Date('2024-12-02'),
        markToMarket: 28000, counterparty: 'Brazilian Commodities SA', linkedExposure: 'EXP-2024-058',
        premium: 0, direction: 'SELL', notes: 'Forward para exportação de café'
      },
      {
        id: 'HDG-003', contractNumber: 'OPT-2024-001', bank: 'J.P. Morgan', type: 'OPTION_PUT', status: 'ATIVO',
        notionalValue: 2000000, currencyPair: 'USD/BRL', strikeRate: 5.10, spotRateAtClose: 5.18,
        maturityDate: new Date('2025-01-15'), tradeDate: new Date('2024-07-15'), settlementDate: new Date('2025-01-17'),
        markToMarket: -35000, counterparty: 'Agro Export Brasil Ltda', linkedExposure: 'EXP-2024-063',
        premium: 42000, direction: 'BUY', notes: 'Put option como seguro contra desvalorização'
      },
      {
        id: 'HDG-004', contractNumber: 'NDF-2024-002', bank: 'Bradesco BBI', type: 'NDF', status: 'LIQUIDADO',
        notionalValue: 1200000, currencyPair: 'USD/BRL', strikeRate: 5.15, spotRateAtClose: 5.05,
        maturityDate: new Date('2024-07-30'), tradeDate: new Date('2024-04-30'), settlementDate: new Date('2024-08-01'),
        markToMarket: 0, counterparty: 'Export Excellence Corp', linkedExposure: 'EXP-2024-031',
        premium: 0, direction: 'SELL', notes: 'Liquidado com ganho de R$ 120.000'
      },
      {
        id: 'HDG-005', contractNumber: 'NDF-2024-003', bank: 'Santander', type: 'NDF', status: 'ATIVO',
        notionalValue: 950000, currencyPair: 'EUR/BRL', strikeRate: 5.70, spotRateAtClose: 5.62,
        maturityDate: new Date('2024-10-15'), tradeDate: new Date('2024-07-15'), settlementDate: new Date('2024-10-17'),
        markToMarket: 18500, counterparty: 'Brazilian Commodities SA', linkedExposure: 'EXP-2024-048',
        premium: 0, direction: 'SELL', notes: 'Hedge de recebível em EUR'
      },
      {
        id: 'HDG-006', contractNumber: 'OPT-2024-002', bank: 'Goldman Sachs', type: 'OPTION_CALL', status: 'ATIVO',
        notionalValue: 3000000, currencyPair: 'USD/BRL', strikeRate: 5.40, spotRateAtClose: 5.18,
        maturityDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), tradeDate: new Date('2024-06-01'), settlementDate: new Date('2024-09-03'),
        markToMarket: -82000, counterparty: 'Agro Export Brasil Ltda', linkedExposure: 'EXP-2024-052',
        premium: 65000, direction: 'BUY', notes: 'Call option para capturar upside cambial'
      },
      {
        id: 'HDG-007', contractNumber: 'SWP-2024-001', bank: 'BTG Pactual', type: 'SWAP', status: 'ATIVO',
        notionalValue: 5000000, currencyPair: 'USD/BRL', strikeRate: 5.22, spotRateAtClose: 5.18,
        maturityDate: new Date('2025-06-15'), tradeDate: new Date('2024-06-15'), settlementDate: new Date('2025-06-17'),
        markToMarket: 120000, counterparty: 'Export Excellence Corp', linkedExposure: 'EXP-2024-075',
        premium: 0, direction: 'SELL', notes: 'Swap cambial com liquidação semestral'
      },
      {
        id: 'HDG-008', contractNumber: 'FWD-2024-002', bank: 'Banco do Brasil', type: 'FORWARD', status: 'VENCIDO',
        notionalValue: 600000, currencyPair: 'USD/BRL', strikeRate: 4.95, spotRateAtClose: 4.90,
        maturityDate: new Date('2024-06-30'), tradeDate: new Date('2024-03-30'), settlementDate: new Date('2024-07-02'),
        markToMarket: 0, counterparty: 'Agro Export Brasil Ltda', linkedExposure: 'EXP-2024-022',
        premium: 0, direction: 'SELL', notes: 'Vencido - perda de R$ 30.000 na liquidação'
      },
      {
        id: 'HDG-009', contractNumber: 'NDF-2024-004', bank: 'Itaú BBA', type: 'NDF', status: 'ATIVO',
        notionalValue: 1800000, currencyPair: 'USD/BRL', strikeRate: 5.35, spotRateAtClose: 5.18,
        maturityDate: new Date('2025-03-15'), tradeDate: new Date('2024-08-15'), settlementDate: new Date('2025-03-17'),
        markToMarket: 68000, counterparty: 'Brazilian Commodities SA', linkedExposure: 'EXP-2024-082',
        premium: 0, direction: 'SELL', notes: 'NDF longo prazo para safra 2025'
      },
      {
        id: 'HDG-010', contractNumber: 'OPT-2024-003', bank: 'J.P. Morgan', type: 'OPTION_PUT', status: 'CANCELADO',
        notionalValue: 750000, currencyPair: 'GBP/BRL', strikeRate: 6.40, spotRateAtClose: 6.55,
        maturityDate: new Date('2024-10-30'), tradeDate: new Date('2024-05-01'), settlementDate: new Date('2024-11-01'),
        markToMarket: 0, counterparty: 'Export Excellence Corp', linkedExposure: 'EXP-2024-037',
        premium: 28000, direction: 'BUY', notes: 'Cancelado por acordo mútuo'
      },
      {
        id: 'HDG-011', contractNumber: 'NDF-2024-005', bank: 'Santander', type: 'NDF', status: 'EM_NEGOCIACAO',
        notionalValue: 2200000, currencyPair: 'USD/BRL', strikeRate: 5.28, spotRateAtClose: 5.18,
        maturityDate: new Date('2025-04-15'), tradeDate: new Date('2024-08-20'), settlementDate: new Date('2025-04-17'),
        markToMarket: 0, counterparty: 'Agro Export Brasil Ltda', linkedExposure: 'EXP-2024-088',
        premium: 0, direction: 'SELL', notes: 'Em negociação - aguardando aprovação de crédito'
      },
      {
        id: 'HDG-012', contractNumber: 'FWD-2024-003', bank: 'Bradesco BBI', type: 'FORWARD', status: 'ATIVO',
        notionalValue: 1100000, currencyPair: 'EUR/BRL', strikeRate: 5.75, spotRateAtClose: 5.62,
        maturityDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), tradeDate: new Date('2024-06-20'), settlementDate: new Date('2024-09-22'),
        markToMarket: -25000, counterparty: 'Brazilian Commodities SA', linkedExposure: 'EXP-2024-055',
        premium: 0, direction: 'SELL', notes: 'Forward EUR próximo do vencimento'
      }
    ];
  }
}
