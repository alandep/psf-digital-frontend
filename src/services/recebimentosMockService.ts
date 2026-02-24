import { Injectable } from '@angular/core';
import { Observable, of, delay, map } from 'rxjs';
import { 
  Recebimento, 
  ContractBasic, 
  BankAccount, 
  ExchangeRate, 
  RecebimentoFilters, 
  FiltroOptions,
  CURRENCY_LIST,
  PAYMENT_METHOD_LABELS,
  STATUS_LABELS
} from '../types/recebimentos';

@Injectable({
  providedIn: 'root'
})
export class RecebimentosMockService {

  private recebimentos: Recebimento[] = [
    {
      id: '1',
      amount: 250000.00,
      currency: 'USD',
      original_amount: 250000.00,
      original_currency: 'USD',
      payment_date: '2024-02-15',
      contract: 'CT-2024-001',
      exchange_rate: 5.15,
      bank_account: 'ACC-001',
      bank_code: '001',
      bank_name: 'Banco do Brasil',
      transaction_id: 'TXN-20240215001',
      status: 'completed',
      payment_method: 'wire_transfer',
      created_at: '2024-02-10T08:00:00Z',
      updated_at: '2024-02-15T14:30:00Z',
      created_by: 'admin@psf.com'
    },
    {
      id: '2',
      amount: 180000.00,
      currency: 'EUR',
      original_amount: 180000.00,
      original_currency: 'EUR',
      payment_date: '2024-02-20',
      contract: 'CT-2024-002',
      exchange_rate: 5.58,
      bank_account: 'ACC-002',
      bank_code: '033',
      bank_name: 'Santander',
      transaction_id: 'TXN-20240220001',
      status: 'processing',
      payment_method: 'letter_of_credit',
      created_at: '2024-02-18T09:15:00Z',
      updated_at: '2024-02-20T10:45:00Z',
      created_by: 'financeiro@psf.com'
    },
    {
      id: '3',
      amount: 95000.00,
      currency: 'USD',
      original_amount: 95000.00,
      original_currency: 'USD',
      payment_date: '2024-03-01',
      contract: 'CT-2024-003',
      exchange_rate: 5.12,
      bank_account: 'ACC-001',
      bank_code: '001',
      bank_name: 'Banco do Brasil',
      transaction_id: 'TXN-20240301001',
      status: 'pending',
      payment_method: 'collection',
      created_at: '2024-02-25T11:30:00Z',
      updated_at: '2024-02-25T11:30:00Z',
      created_by: 'export@psf.com'
    },
    {
      id: '4',
      amount: 320000.00,
      currency: 'USD',
      original_amount: 320000.00,
      original_currency: 'USD',
      payment_date: '2024-01-30',
      contract: 'CT-2024-004',
      exchange_rate: 5.25,
      bank_account: 'ACC-003',
      bank_code: '237',
      bank_name: 'Bradesco',
      transaction_id: 'TXN-20240130001',
      status: 'completed',
      payment_method: 'advance_payment',
      created_at: '2024-01-25T16:20:00Z',
      updated_at: '2024-01-30T13:15:00Z',
      created_by: 'admin@psf.com'
    },
    {
      id: '5',
      amount: 75000.00,
      currency: 'GBP',
      original_amount: 75000.00,
      original_currency: 'GBP',
      payment_date: '2024-03-05',
      contract: 'CT-2024-005',
      exchange_rate: 6.45,
      bank_account: 'ACC-002',
      bank_code: '033',
      bank_name: 'Santander',
      transaction_id: 'TXN-20240305001',
      status: 'pending',
      payment_method: 'wire_transfer',
      created_at: '2024-03-01T14:10:00Z',
      updated_at: '2024-03-01T14:10:00Z',
      created_by: 'financeiro@psf.com'
    }
  ];

  private contratos: ContractBasic[] = [
    { id: 'CT-2024-001', number: 'CT-2024-001', client_name: 'American Food Corp', total_amount: 250000, currency: 'USD', status: 'active' },
    { id: 'CT-2024-002', number: 'CT-2024-002', client_name: 'European Import Group', total_amount: 180000, currency: 'EUR', status: 'active' },
    { id: 'CT-2024-003', number: 'CT-2024-003', client_name: 'Global Commodities Ltd', total_amount: 95000, currency: 'USD', status: 'active' },
    { id: 'CT-2024-004', number: 'CT-2024-004', client_name: 'International Trading Co', total_amount: 320000, currency: 'USD', status: 'completed' },
    { id: 'CT-2024-005', number: 'CT-2024-005', client_name: 'UK Premium Foods', total_amount: 75000, currency: 'GBP', status: 'active' }
  ];

  private contasBancarias: BankAccount[] = [
    { id: 'ACC-001', bank_code: '001', bank_name: 'Banco do Brasil', account_number: '12345-6', account_type: 'checking', currency: 'BRL', active: true },
    { id: 'ACC-002', bank_code: '033', bank_name: 'Santander', account_number: '98765-4', account_type: 'checking', currency: 'BRL', active: true },
    { id: 'ACC-003', bank_code: '237', bank_name: 'Bradesco', account_number: '54321-0', account_type: 'checking', currency: 'BRL', active: true },
    { id: 'ACC-USD-001', bank_code: '001', bank_name: 'Banco do Brasil', account_number: '11111-1', account_type: 'checking', currency: 'USD', active: true },
    { id: 'ACC-EUR-001', bank_code: '033', bank_name: 'Santander', account_number: '22222-2', account_type: 'checking', currency: 'EUR', active: true }
  ];

  private taxasCambio: ExchangeRate[] = [
    { from_currency: 'USD', to_currency: 'BRL', rate: 5.15, date: '2024-02-23', source: 'Banco Central' },
    { from_currency: 'EUR', to_currency: 'BRL', rate: 5.58, date: '2024-02-23', source: 'Banco Central' },
    { from_currency: 'GBP', to_currency: 'BRL', rate: 6.45, date: '2024-02-23', source: 'Banco Central' },
    { from_currency: 'JPY', to_currency: 'BRL', rate: 0.034, date: '2024-02-23', source: 'Banco Central' },
    { from_currency: 'CAD', to_currency: 'BRL', rate: 3.78, date: '2024-02-23', source: 'Banco Central' }
  ];

  getRecebimentos(filtros?: RecebimentoFilters): Observable<Recebimento[]> {
    let result = [...this.recebimentos];

    if (filtros) {
      if (filtros.status && filtros.status.length > 0) {
        result = result.filter(r => filtros.status!.includes(r.status));
      }
      if (filtros.currency && filtros.currency.length > 0) {
        result = result.filter(r => filtros.currency!.includes(r.currency));
      }
      if (filtros.payment_method && filtros.payment_method.length > 0) {
        result = result.filter(r => filtros.payment_method!.includes(r.payment_method));
      }
      if (filtros.contract && filtros.contract.length > 0) {
        result = result.filter(r => filtros.contract!.includes(r.contract));
      }
      if (filtros.date_from) {
        const dateFrom = new Date(filtros.date_from);
        result = result.filter(r => new Date(r.payment_date) >= dateFrom);
      }
      if (filtros.date_to) {
        const dateTo = new Date(filtros.date_to);
        result = result.filter(r => new Date(r.payment_date) <= dateTo);
      }
      if (filtros.amount_min) {
        result = result.filter(r => r.amount >= filtros.amount_min!);
      }
      if (filtros.amount_max) {
        result = result.filter(r => r.amount <= filtros.amount_max!);
      }
    }

    return of(result).pipe(delay(500));
  }

  getRecebimentoById(id: string): Observable<Recebimento | null> {
    const recebimento = this.recebimentos.find(r => r.id === id);
    return of(recebimento || null).pipe(delay(300));
  }

  createRecebimento(recebimento: Omit<Recebimento, 'id' | 'created_at' | 'updated_at'>): Observable<Recebimento> {
    const novoRecebimento: Recebimento = {
      ...recebimento,
      id: `REC-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    this.recebimentos.push(novoRecebimento);
    return of(novoRecebimento).pipe(delay(800));
  }

  updateRecebimento(id: string, recebimento: Partial<Recebimento>): Observable<Recebimento | null> {
    const index = this.recebimentos.findIndex(r => r.id === id);
    if (index !== -1) {
      this.recebimentos[index] = {
        ...this.recebimentos[index],
        ...recebimento,
        updated_at: new Date().toISOString()
      };
      return of(this.recebimentos[index]).pipe(delay(600));
    }
    return of(null).pipe(delay(300));
  }

  deleteRecebimento(id: string): Observable<boolean> {
    const index = this.recebimentos.findIndex(r => r.id === id);
    if (index !== -1) {
      this.recebimentos.splice(index, 1);
      return of(true).pipe(delay(400));
    }
    return of(false).pipe(delay(200));
  }

  getContratos(): Observable<ContractBasic[]> {
    return of([...this.contratos]).pipe(delay(300));
  }

  getContasBancarias(): Observable<BankAccount[]> {
    return of([...this.contasBancarias]).pipe(delay(250));
  }

  getTaxasCambio(): Observable<ExchangeRate[]> {
    return of([...this.taxasCambio]).pipe(delay(200));
  }

  getTaxaCambio(fromCurrency: string, toCurrency: string = 'BRL'): Observable<ExchangeRate | null> {
    const taxa = this.taxasCambio.find(t => 
      t.from_currency === fromCurrency && t.to_currency === toCurrency
    );
    return of(taxa || null).pipe(delay(150));
  }

  getFiltroOptions(): Observable<FiltroOptions> {
    const options: FiltroOptions = {
      currencies: CURRENCY_LIST,
      paymentMethods: Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => ({ value, label })),
      statuses: Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label })),
      contracts: [...this.contratos],
      bankAccounts: [...this.contasBancarias]
    };
    
    return of(options).pipe(delay(200));
  }

  // Simulação de integração bancária
  processarPagamentoBancario(recebimentoId: string): Observable<{ success: boolean; message: string; transactionId?: string }> {
    return of({
      success: Math.random() > 0.1, // 90% de sucesso
      message: Math.random() > 0.1 ? 'Pagamento processado com sucesso' : 'Falha na comunicação bancária',
      transactionId: `TXN-${Date.now()}`
    }).pipe(delay(2000));
  }

  // Consulta de Status Bancário
  consultarStatusBancario(transactionId: string): Observable<{ status: string; details: any }> {
    const statuses = ['confirmed', 'pending', 'failed'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    return of({
      status: randomStatus,
      details: {
        bank_reference: `BR-${Date.now()}`,
        processing_date: new Date().toISOString(),
        estimated_completion: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }
    }).pipe(delay(1500));
  }
}