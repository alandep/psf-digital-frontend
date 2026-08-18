import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import {
  Pagamento,
  PaymentReconciliation,
  PaymentNotification,
  PaymentTimelineEvent,
  PaymentAIInsights,
  PaymentMetrics,
  CashFlowProjection,
  PaymentFilters,
  PaymentStatus,
  PaymentCategory,
  PaymentType
} from '../types/pagamentos';

@Injectable({
  providedIn: 'root'
})
export class PagamentosMockService {

  private payments: Pagamento[] = this.generateMockPayments();

  private generateMockPayments(): Pagamento[] {
    return [
      {
        id: 'PAG-001', paymentNumber: 'PGT-2024-00001', company: 'PSF Exportadora Ltda',
        beneficiary: 'Terminal Santos SA', paymentType: 'NACIONAL' as PaymentType, category: 'TAXAS_PORTUÁRIAS' as PaymentCategory,
        bank: 'Banco do Brasil', bankAccount: '12345-6', currency: 'BRL', amount: 45000.00,
        issueDate: new Date('2024-11-01'), dueDate: new Date('2024-11-15'), paymentDate: new Date('2024-11-14'),
        status: 'PAGO' as PaymentStatus, linkedExportNumber: 'EXP-2024-0045', linkedContractNumber: 'CC-2024-012',
        linkedInvoiceNumber: 'INV-2024-0089', linkedDueNumber: 'DUE-2024-00234',
        costCenter: 'CC-LOGISTICA', observations: 'Taxa de utilização do terminal - Berço 7',
        aiFinancialScore: 92, swift: null, iban: null, beneficiaryBank: null, beneficiaryCountry: null,
        createdAt: new Date('2024-10-28'), updatedAt: new Date('2024-11-14')
      },
      {
        id: 'PAG-002', paymentNumber: 'PGT-2024-00002', company: 'PSF Exportadora Ltda',
        beneficiary: 'Despachante Oliveira & Cia', paymentType: 'NACIONAL' as PaymentType, category: 'DESPACHANTE' as PaymentCategory,
        bank: 'Itaú', bankAccount: '78901-2', currency: 'BRL', amount: 12500.00,
        issueDate: new Date('2024-11-05'), dueDate: new Date('2024-11-20'), paymentDate: null,
        status: 'PENDENTE' as PaymentStatus, linkedExportNumber: 'EXP-2024-0046', linkedContractNumber: 'CC-2024-013',
        linkedInvoiceNumber: 'INV-2024-0090', linkedDueNumber: 'DUE-2024-00235',
        costCenter: 'CC-DESPACHO', observations: 'Honorários desembaraço aduaneiro',
        aiFinancialScore: 78, swift: null, iban: null, beneficiaryBank: null, beneficiaryCountry: null,
        createdAt: new Date('2024-11-02'), updatedAt: new Date('2024-11-05')
      },
      {
        id: 'PAG-003', paymentNumber: 'PGT-2024-00003', company: 'PSF Exportadora Ltda',
        beneficiary: 'Transportes Alfa Logística', paymentType: 'NACIONAL' as PaymentType, category: 'TRANSPORTE' as PaymentCategory,
        bank: 'Bradesco', bankAccount: '34567-8', currency: 'BRL', amount: 78000.00,
        issueDate: new Date('2024-11-03'), dueDate: new Date('2024-11-10'), paymentDate: null,
        status: 'VENCIDO' as PaymentStatus, linkedExportNumber: 'EXP-2024-0044', linkedContractNumber: 'CC-2024-011',
        linkedInvoiceNumber: 'INV-2024-0088', linkedDueNumber: 'DUE-2024-00233',
        costCenter: 'CC-TRANSPORTE', observations: 'Frete rodoviário origem - Porto de Santos',
        aiFinancialScore: 45, swift: null, iban: null, beneficiaryBank: null, beneficiaryCountry: null,
        createdAt: new Date('2024-10-30'), updatedAt: new Date('2024-11-10')
      },
      {
        id: 'PAG-004', paymentNumber: 'PGT-2024-00004', company: 'PSF Exportadora Ltda',
        beneficiary: 'SGS Certificações', paymentType: 'INTERNACIONAL' as PaymentType, category: 'CERTIFICADOS' as PaymentCategory,
        bank: 'Santander', bankAccount: '56789-0', currency: 'USD', amount: 3500.00,
        issueDate: new Date('2024-11-08'), dueDate: new Date('2024-11-25'), paymentDate: null,
        status: 'APROVADO' as PaymentStatus, linkedExportNumber: 'EXP-2024-0047', linkedContractNumber: 'CC-2024-014',
        linkedInvoiceNumber: 'INV-2024-0091', linkedDueNumber: 'DUE-2024-00236',
        costCenter: 'CC-QUALIDADE', observations: 'Certificação fitossanitária internacional',
        aiFinancialScore: 85, swift: 'SABORSPOXXX', iban: null, beneficiaryBank: 'SGS Geneva',
        beneficiaryCountry: 'Suíça', createdAt: new Date('2024-11-06'), updatedAt: new Date('2024-11-08')
      },
      {
        id: 'PAG-005', paymentNumber: 'PGT-2024-00005', company: 'PSF Exportadora Ltda',
        beneficiary: 'Porto Paranaguá Admin', paymentType: 'NACIONAL' as PaymentType, category: 'TAXAS_PORTUÁRIAS' as PaymentCategory,
        bank: 'Banco do Brasil', bankAccount: '12345-6', currency: 'BRL', amount: 32000.00,
        issueDate: new Date('2024-11-10'), dueDate: new Date('2024-11-28'), paymentDate: null,
        status: 'PENDENTE' as PaymentStatus, linkedExportNumber: 'EXP-2024-0048', linkedContractNumber: 'CC-2024-015',
        linkedInvoiceNumber: 'INV-2024-0092', linkedDueNumber: 'DUE-2024-00237',
        costCenter: 'CC-LOGISTICA', observations: 'Capatazia e armazenagem temporária',
        aiFinancialScore: 72, swift: null, iban: null, beneficiaryBank: null, beneficiaryCountry: null,
        createdAt: new Date('2024-11-08'), updatedAt: new Date('2024-11-10')
      },
      {
        id: 'PAG-006', paymentNumber: 'PGT-2024-00006', company: 'PSF Exportadora Ltda',
        beneficiary: 'Seguradora ABC', paymentType: 'NACIONAL' as PaymentType, category: 'SEGURO' as PaymentCategory,
        bank: 'Itaú', bankAccount: '78901-2', currency: 'BRL', amount: 18500.00,
        issueDate: new Date('2024-10-25'), dueDate: new Date('2024-11-10'), paymentDate: new Date('2024-11-09'),
        status: 'PAGO' as PaymentStatus, linkedExportNumber: 'EXP-2024-0044', linkedContractNumber: 'CC-2024-011',
        linkedInvoiceNumber: 'INV-2024-0088', linkedDueNumber: 'DUE-2024-00233',
        costCenter: 'CC-SEGUROS', observations: 'Seguro de carga marítima - apólice 2024/567',
        aiFinancialScore: 88, swift: null, iban: null, beneficiaryBank: null, beneficiaryCountry: null,
        createdAt: new Date('2024-10-22'), updatedAt: new Date('2024-11-09')
      },
      {
        id: 'PAG-007', paymentNumber: 'PGT-2024-00007', company: 'PSF Exportadora Ltda',
        beneficiary: 'Banco do Brasil (Taxas)', paymentType: 'NACIONAL' as PaymentType, category: 'TAXAS_BANCÁRIAS' as PaymentCategory,
        bank: 'Banco do Brasil', bankAccount: '12345-6', currency: 'BRL', amount: 8750.00,
        issueDate: new Date('2024-11-01'), dueDate: new Date('2024-11-05'), paymentDate: new Date('2024-11-04'),
        status: 'CONCILIADO' as PaymentStatus, linkedExportNumber: 'EXP-2024-0045', linkedContractNumber: 'CC-2024-012',
        linkedInvoiceNumber: 'INV-2024-0089', linkedDueNumber: 'DUE-2024-00234',
        costCenter: 'CC-FINANCEIRO', observations: 'Tarifas bancárias contrato de câmbio',
        aiFinancialScore: 95, swift: null, iban: null, beneficiaryBank: null, beneficiaryCountry: null,
        createdAt: new Date('2024-10-29'), updatedAt: new Date('2024-11-04')
      },
      {
        id: 'PAG-008', paymentNumber: 'PGT-2024-00008', company: 'PSF Exportadora Ltda',
        beneficiary: 'Agência Marítima Sul', paymentType: 'NACIONAL' as PaymentType, category: 'FRETE' as PaymentCategory,
        bank: 'Bradesco', bankAccount: '34567-8', currency: 'BRL', amount: 185000.00,
        issueDate: new Date('2024-11-12'), dueDate: new Date('2024-12-01'), paymentDate: null,
        status: 'PENDENTE' as PaymentStatus, linkedExportNumber: 'EXP-2024-0049', linkedContractNumber: 'CC-2024-016',
        linkedInvoiceNumber: 'INV-2024-0093', linkedDueNumber: 'DUE-2024-00238',
        costCenter: 'CC-FRETE', observations: 'Frete marítimo Santos → Rotterdam',
        aiFinancialScore: 81, swift: null, iban: null, beneficiaryBank: null, beneficiaryCountry: null,
        createdAt: new Date('2024-11-10'), updatedAt: new Date('2024-11-12')
      },
      {
        id: 'PAG-009', paymentNumber: 'PGT-2024-00009', company: 'PSF Exportadora Ltda',
        beneficiary: 'Laboratório Central Ltda', paymentType: 'NACIONAL' as PaymentType, category: 'CERTIFICADOS' as PaymentCategory,
        bank: 'Santander', bankAccount: '56789-0', currency: 'BRL', amount: 6200.00,
        issueDate: new Date('2024-11-07'), dueDate: new Date('2024-11-18'), paymentDate: null,
        status: 'APROVADO' as PaymentStatus, linkedExportNumber: 'EXP-2024-0046', linkedContractNumber: 'CC-2024-013',
        linkedInvoiceNumber: 'INV-2024-0090', linkedDueNumber: 'DUE-2024-00235',
        costCenter: 'CC-QUALIDADE', observations: 'Análises laboratoriais - lote café especial',
        aiFinancialScore: 83, swift: null, iban: null, beneficiaryBank: null, beneficiaryCountry: null,
        createdAt: new Date('2024-11-05'), updatedAt: new Date('2024-11-07')
      },
      {
        id: 'PAG-010', paymentNumber: 'PGT-2024-00010', company: 'PSF Exportadora Ltda',
        beneficiary: 'Comissário João Silva', paymentType: 'NACIONAL' as PaymentType, category: 'COMISSÃO' as PaymentCategory,
        bank: 'Itaú', bankAccount: '78901-2', currency: 'BRL', amount: 25000.00,
        issueDate: new Date('2024-11-09'), dueDate: new Date('2024-11-22'), paymentDate: null,
        status: 'PENDENTE' as PaymentStatus, linkedExportNumber: 'EXP-2024-0047', linkedContractNumber: 'CC-2024-014',
        linkedInvoiceNumber: 'INV-2024-0091', linkedDueNumber: 'DUE-2024-00236',
        costCenter: 'CC-COMERCIAL', observations: 'Comissão agente comercial - mercado europeu',
        aiFinancialScore: 70, swift: null, iban: null, beneficiaryBank: null, beneficiaryCountry: null,
        createdAt: new Date('2024-11-07'), updatedAt: new Date('2024-11-09')
      },
      {
        id: 'PAG-011', paymentNumber: 'PGT-2024-00011', company: 'PSF Exportadora Ltda',
        beneficiary: 'Terminal Santos SA', paymentType: 'NACIONAL' as PaymentType, category: 'ARMAZENAGEM' as PaymentCategory,
        bank: 'Banco do Brasil', bankAccount: '12345-6', currency: 'BRL', amount: 22000.00,
        issueDate: new Date('2024-11-02'), dueDate: new Date('2024-11-08'), paymentDate: null,
        status: 'VENCIDO' as PaymentStatus, linkedExportNumber: 'EXP-2024-0044', linkedContractNumber: 'CC-2024-011',
        linkedInvoiceNumber: 'INV-2024-0088', linkedDueNumber: 'DUE-2024-00233',
        costCenter: 'CC-ARMAZEM', observations: 'Armazenagem contêiner reefer - período extra',
        aiFinancialScore: 38, swift: null, iban: null, beneficiaryBank: null, beneficiaryCountry: null,
        createdAt: new Date('2024-10-30'), updatedAt: new Date('2024-11-08')
      },
      {
        id: 'PAG-012', paymentNumber: 'PGT-2024-00012', company: 'PSF Exportadora Ltda',
        beneficiary: 'Transportes Alfa Logística', paymentType: 'NACIONAL' as PaymentType, category: 'FRETE' as PaymentCategory,
        bank: 'Bradesco', bankAccount: '34567-8', currency: 'BRL', amount: 56000.00,
        issueDate: new Date('2024-11-11'), dueDate: new Date('2024-11-26'), paymentDate: null,
        status: 'APROVADO' as PaymentStatus, linkedExportNumber: 'EXP-2024-0048', linkedContractNumber: 'CC-2024-015',
        linkedInvoiceNumber: 'INV-2024-0092', linkedDueNumber: 'DUE-2024-00237',
        costCenter: 'CC-FRETE', observations: 'Transporte rodoviário Uberaba → Santos',
        aiFinancialScore: 76, swift: null, iban: null, beneficiaryBank: null, beneficiaryCountry: null,
        createdAt: new Date('2024-11-09'), updatedAt: new Date('2024-11-11')
      },
      {
        id: 'PAG-013', paymentNumber: 'PGT-2024-00013', company: 'PSF Exportadora Ltda',
        beneficiary: 'Agência Marítima Sul', paymentType: 'INTERNACIONAL' as PaymentType, category: 'FRETE' as PaymentCategory,
        bank: 'Santander', bankAccount: '56789-0', currency: 'USD', amount: 42000.00,
        issueDate: new Date('2024-11-06'), dueDate: new Date('2024-11-30'), paymentDate: null,
        status: 'PENDENTE' as PaymentStatus, linkedExportNumber: 'EXP-2024-0045', linkedContractNumber: 'CC-2024-012',
        linkedInvoiceNumber: 'INV-2024-0089', linkedDueNumber: 'DUE-2024-00234',
        costCenter: 'CC-FRETE-INT', observations: 'Ocean freight - full container load 40HC',
        aiFinancialScore: 74, swift: 'BABORSPOXXX', iban: null, beneficiaryBank: 'Citibank NY',
        beneficiaryCountry: 'Estados Unidos', createdAt: new Date('2024-11-04'), updatedAt: new Date('2024-11-06')
      },
      {
        id: 'PAG-014', paymentNumber: 'PGT-2024-00014', company: 'PSF Exportadora Ltda',
        beneficiary: 'Despachante Oliveira & Cia', paymentType: 'NACIONAL' as PaymentType, category: 'DESPACHANTE' as PaymentCategory,
        bank: 'Itaú', bankAccount: '78901-2', currency: 'BRL', amount: 9800.00,
        issueDate: new Date('2024-10-28'), dueDate: new Date('2024-11-12'), paymentDate: new Date('2024-11-11'),
        status: 'CONCILIADO' as PaymentStatus, linkedExportNumber: 'EXP-2024-0044', linkedContractNumber: 'CC-2024-011',
        linkedInvoiceNumber: 'INV-2024-0088', linkedDueNumber: 'DUE-2024-00233',
        costCenter: 'CC-DESPACHO', observations: 'Serviços aduaneiros - registro DU-E',
        aiFinancialScore: 91, swift: null, iban: null, beneficiaryBank: null, beneficiaryCountry: null,
        createdAt: new Date('2024-10-26'), updatedAt: new Date('2024-11-11')
      },
      {
        id: 'PAG-015', paymentNumber: 'PGT-2024-00015', company: 'PSF Exportadora Ltda',
        beneficiary: 'Seguradora ABC', paymentType: 'INTERNACIONAL' as PaymentType, category: 'SEGURO' as PaymentCategory,
        bank: 'Banco do Brasil', bankAccount: '12345-6', currency: 'EUR', amount: 8200.00,
        issueDate: new Date('2024-11-13'), dueDate: new Date('2024-12-05'), paymentDate: null,
        status: 'PENDENTE' as PaymentStatus, linkedExportNumber: 'EXP-2024-0049', linkedContractNumber: 'CC-2024-016',
        linkedInvoiceNumber: 'INV-2024-0093', linkedDueNumber: 'DUE-2024-00238',
        costCenter: 'CC-SEGUROS', observations: 'Seguro carga internacional - all risks',
        aiFinancialScore: 80, swift: 'ABCDDEFFXXX', iban: 'DE89370400440532013000', beneficiaryBank: 'Deutsche Bank',
        beneficiaryCountry: 'Alemanha', createdAt: new Date('2024-11-11'), updatedAt: new Date('2024-11-13')
      },
      {
        id: 'PAG-016', paymentNumber: 'PGT-2024-00016', company: 'PSF Exportadora Ltda',
        beneficiary: 'Porto Paranaguá Admin', paymentType: 'NACIONAL' as PaymentType, category: 'TAXAS_PORTUÁRIAS' as PaymentCategory,
        bank: 'Bradesco', bankAccount: '34567-8', currency: 'BRL', amount: 15800.00,
        issueDate: new Date('2024-10-20'), dueDate: new Date('2024-11-05'), paymentDate: new Date('2024-11-04'),
        status: 'PAGO' as PaymentStatus, linkedExportNumber: 'EXP-2024-0043', linkedContractNumber: 'CC-2024-010',
        linkedInvoiceNumber: 'INV-2024-0087', linkedDueNumber: 'DUE-2024-00232',
        costCenter: 'CC-LOGISTICA', observations: 'Serviços portuários - movimentação de carga',
        aiFinancialScore: 90, swift: null, iban: null, beneficiaryBank: null, beneficiaryCountry: null,
        createdAt: new Date('2024-10-18'), updatedAt: new Date('2024-11-04')
      },
      {
        id: 'PAG-017', paymentNumber: 'PGT-2024-00017', company: 'PSF Exportadora Ltda',
        beneficiary: 'Comissário João Silva', paymentType: 'NACIONAL' as PaymentType, category: 'COMISSÃO' as PaymentCategory,
        bank: 'Itaú', bankAccount: '78901-2', currency: 'BRL', amount: 35000.00,
        issueDate: new Date('2024-10-15'), dueDate: new Date('2024-11-01'), paymentDate: new Date('2024-10-31'),
        status: 'PAGO' as PaymentStatus, linkedExportNumber: 'EXP-2024-0043', linkedContractNumber: 'CC-2024-010',
        linkedInvoiceNumber: 'INV-2024-0087', linkedDueNumber: 'DUE-2024-00232',
        costCenter: 'CC-COMERCIAL', observations: 'Comissão venda café premium - Japão',
        aiFinancialScore: 87, swift: null, iban: null, beneficiaryBank: null, beneficiaryCountry: null,
        createdAt: new Date('2024-10-12'), updatedAt: new Date('2024-10-31')
      },
      {
        id: 'PAG-018', paymentNumber: 'PGT-2024-00018', company: 'PSF Exportadora Ltda',
        beneficiary: 'Laboratório Central Ltda', paymentType: 'NACIONAL' as PaymentType, category: 'CERTIFICADOS' as PaymentCategory,
        bank: 'Santander', bankAccount: '56789-0', currency: 'BRL', amount: 4500.00,
        issueDate: new Date('2024-11-14'), dueDate: new Date('2024-11-29'), paymentDate: null,
        status: 'PENDENTE' as PaymentStatus, linkedExportNumber: 'EXP-2024-0049', linkedContractNumber: 'CC-2024-016',
        linkedInvoiceNumber: 'INV-2024-0093', linkedDueNumber: 'DUE-2024-00238',
        costCenter: 'CC-QUALIDADE', observations: 'Análise micotoxinas - exportação EU',
        aiFinancialScore: 77, swift: null, iban: null, beneficiaryBank: null, beneficiaryCountry: null,
        createdAt: new Date('2024-11-12'), updatedAt: new Date('2024-11-14')
      },
      {
        id: 'PAG-019', paymentNumber: 'PGT-2024-00019', company: 'PSF Exportadora Ltda',
        beneficiary: 'Transportes Alfa Logística', paymentType: 'NACIONAL' as PaymentType, category: 'TRANSPORTE' as PaymentCategory,
        bank: 'Banco do Brasil', bankAccount: '12345-6', currency: 'BRL', amount: 42000.00,
        issueDate: new Date('2024-11-04'), dueDate: new Date('2024-11-12'), paymentDate: null,
        status: 'VENCIDO' as PaymentStatus, linkedExportNumber: 'EXP-2024-0046', linkedContractNumber: 'CC-2024-013',
        linkedInvoiceNumber: 'INV-2024-0090', linkedDueNumber: 'DUE-2024-00235',
        costCenter: 'CC-TRANSPORTE', observations: 'Transporte intermodal - carga fracionada',
        aiFinancialScore: 42, swift: null, iban: null, beneficiaryBank: null, beneficiaryCountry: null,
        createdAt: new Date('2024-11-01'), updatedAt: new Date('2024-11-12')
      },
      {
        id: 'PAG-020', paymentNumber: 'PGT-2024-00020', company: 'PSF Exportadora Ltda',
        beneficiary: 'SGS Certificações', paymentType: 'INTERNACIONAL' as PaymentType, category: 'CERTIFICADOS' as PaymentCategory,
        bank: 'Itaú', bankAccount: '78901-2', currency: 'USD', amount: 5200.00,
        issueDate: new Date('2024-11-15'), dueDate: new Date('2024-12-10'), paymentDate: null,
        status: 'PENDENTE' as PaymentStatus, linkedExportNumber: 'EXP-2024-0050', linkedContractNumber: 'CC-2024-017',
        linkedInvoiceNumber: 'INV-2024-0094', linkedDueNumber: 'DUE-2024-00239',
        costCenter: 'CC-QUALIDADE', observations: 'Inspeção pré-embarque e certificado de origem',
        aiFinancialScore: 82, swift: 'SABORSPOXXX', iban: null, beneficiaryBank: 'SGS Geneva',
        beneficiaryCountry: 'Suíça', createdAt: new Date('2024-11-13'), updatedAt: new Date('2024-11-15')
      },
      {
        id: 'PAG-021', paymentNumber: 'PGT-2024-00021', company: 'PSF Exportadora Ltda',
        beneficiary: 'Terminal Santos SA', paymentType: 'NACIONAL' as PaymentType, category: 'ARMAZENAGEM' as PaymentCategory,
        bank: 'Banco do Brasil', bankAccount: '12345-6', currency: 'BRL', amount: 28500.00,
        issueDate: new Date('2024-11-10'), dueDate: new Date('2024-11-24'), paymentDate: null,
        status: 'APROVADO' as PaymentStatus, linkedExportNumber: 'EXP-2024-0048', linkedContractNumber: 'CC-2024-015',
        linkedInvoiceNumber: 'INV-2024-0092', linkedDueNumber: 'DUE-2024-00237',
        costCenter: 'CC-ARMAZEM', observations: 'Armazenagem alfandegada - zona primária',
        aiFinancialScore: 79, swift: null, iban: null, beneficiaryBank: null, beneficiaryCountry: null,
        createdAt: new Date('2024-11-08'), updatedAt: new Date('2024-11-10')
      },
      {
        id: 'PAG-022', paymentNumber: 'PGT-2024-00022', company: 'PSF Exportadora Ltda',
        beneficiary: 'Banco do Brasil (Taxas)', paymentType: 'NACIONAL' as PaymentType, category: 'TRIBUTOS' as PaymentCategory,
        bank: 'Banco do Brasil', bankAccount: '12345-6', currency: 'BRL', amount: 67000.00,
        issueDate: new Date('2024-11-01'), dueDate: new Date('2024-11-30'), paymentDate: null,
        status: 'PENDENTE' as PaymentStatus, linkedExportNumber: 'EXP-2024-0045', linkedContractNumber: 'CC-2024-012',
        linkedInvoiceNumber: 'INV-2024-0089', linkedDueNumber: 'DUE-2024-00234',
        costCenter: 'CC-FISCAL', observations: 'ICMS diferido - exportação indireta',
        aiFinancialScore: 68, swift: null, iban: null, beneficiaryBank: null, beneficiaryCountry: null,
        createdAt: new Date('2024-10-29'), updatedAt: new Date('2024-11-01')
      },
      {
        id: 'PAG-023', paymentNumber: 'PGT-2024-00023', company: 'PSF Exportadora Ltda',
        beneficiary: 'Agência Marítima Sul', paymentType: 'NACIONAL' as PaymentType, category: 'FRETE' as PaymentCategory,
        bank: 'Bradesco', bankAccount: '34567-8', currency: 'BRL', amount: 95000.00,
        issueDate: new Date('2024-10-22'), dueDate: new Date('2024-11-07'), paymentDate: null,
        status: 'CANCELADO' as PaymentStatus, linkedExportNumber: 'EXP-2024-0043', linkedContractNumber: 'CC-2024-010',
        linkedInvoiceNumber: 'INV-2024-0087', linkedDueNumber: 'DUE-2024-00232',
        costCenter: 'CC-FRETE', observations: 'Cancelado - mudança de armador',
        aiFinancialScore: 50, swift: null, iban: null, beneficiaryBank: null, beneficiaryCountry: null,
        createdAt: new Date('2024-10-20'), updatedAt: new Date('2024-11-02')
      }
    ];
  }

  // === PUBLIC METHODS ===

  getPayments(filters?: PaymentFilters): Observable<Pagamento[]> {
    let result = [...this.payments];
    if (filters) {
      if (filters.searchText) {
        const search = filters.searchText.toLowerCase();
        result = result.filter(p =>
          p.paymentNumber.toLowerCase().includes(search) ||
          p.beneficiary.toLowerCase().includes(search) ||
          p.company.toLowerCase().includes(search) ||
          p.observations.toLowerCase().includes(search)
        );
      }
      if (filters.status) result = result.filter(p => p.status === filters.status);
      if (filters.category) result = result.filter(p => p.category === filters.category);
      if (filters.paymentType) result = result.filter(p => p.paymentType === filters.paymentType);
      if (filters.beneficiary) result = result.filter(p => p.beneficiary === filters.beneficiary);
      if (filters.currency) result = result.filter(p => p.currency === filters.currency);
      if (filters.bank) result = result.filter(p => p.bank === filters.bank);
      if (filters.dateStart) result = result.filter(p => new Date(p.dueDate) >= filters.dateStart!);
      if (filters.dateEnd) result = result.filter(p => new Date(p.dueDate) <= filters.dateEnd!);
    }
    return of(result).pipe(delay(300));
  }

  getPaymentById(id: string): Observable<Pagamento | null> {
    const payment = this.payments.find(p => p.id === id) || null;
    return of(payment).pipe(delay(200));
  }

  createPayment(data: Partial<Pagamento>): Observable<Pagamento> {
    const newPayment: Pagamento = {
      id: `PAG-${String(this.payments.length + 1).padStart(3, '0')}`,
      paymentNumber: `PGT-2024-${String(this.payments.length + 1).padStart(5, '0')}`,
      company: data.company || 'PSF Exportadora Ltda',
      beneficiary: data.beneficiary || '',
      paymentType: data.paymentType || 'NACIONAL',
      category: data.category || 'OUTROS',
      bank: data.bank || 'Banco do Brasil',
      bankAccount: data.bankAccount || '',
      currency: data.currency || 'BRL',
      amount: data.amount || 0,
      issueDate: data.issueDate || new Date(),
      dueDate: data.dueDate || new Date(),
      paymentDate: null,
      status: 'PENDENTE',
      linkedExportNumber: data.linkedExportNumber || '',
      linkedContractNumber: data.linkedContractNumber || '',
      linkedInvoiceNumber: data.linkedInvoiceNumber || '',
      linkedDueNumber: data.linkedDueNumber || '',
      costCenter: data.costCenter || '',
      observations: data.observations || '',
      aiFinancialScore: Math.floor(Math.random() * 30) + 60,
      swift: data.swift || null,
      iban: data.iban || null,
      beneficiaryBank: data.beneficiaryBank || null,
      beneficiaryCountry: data.beneficiaryCountry || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.payments.push(newPayment);
    return of(newPayment).pipe(delay(500));
  }

  getReconciliations(paymentId: string): Observable<PaymentReconciliation[]> {
    const payment = this.payments.find(p => p.id === paymentId);
    if (!payment) return of([]);
    return of([
      {
        id: `REC-${paymentId}-001`,
        paymentId,
        expectedAmount: payment.amount,
        realizedAmount: payment.status === 'CONCILIADO' ? payment.amount : payment.amount * 0.98,
        difference: payment.status === 'CONCILIADO' ? 0 : payment.amount * 0.02,
        status: payment.status === 'CONCILIADO' ? 'CONCILIADO' as const : 'PENDENTE' as const,
        source: 'ERP Integração Bancária',
        reconciliatedAt: payment.status === 'CONCILIADO' ? new Date() : null
      }
    ]).pipe(delay(200));
  }

  getNotifications(paymentId: string): Observable<PaymentNotification[]> {
    return of([
      { id: `NOT-${paymentId}-01`, paymentId, type: 'Vencimento Próximo', message: 'Pagamento vence em 3 dias úteis', channel: 'EMAIL' as const, sentAt: new Date(Date.now() - 3 * 86400000), read: true },
      { id: `NOT-${paymentId}-02`, paymentId, type: 'Aprovação', message: 'Pagamento aguardando aprovação do gestor', channel: 'CENTRAL' as const, sentAt: new Date(Date.now() - 2 * 86400000), read: true },
      { id: `NOT-${paymentId}-03`, paymentId, type: 'Lembrete', message: 'Não esqueça de conferir os dados bancários', channel: 'WHATSAPP' as const, sentAt: new Date(Date.now() - 86400000), read: false },
      { id: `NOT-${paymentId}-04`, paymentId, type: 'Fluxo de Caixa', message: 'Impacto no fluxo de caixa projetado para esta semana', channel: 'PUSH' as const, sentAt: new Date(), read: false }
    ]).pipe(delay(200));
  }

  getTimeline(paymentId: string): Observable<PaymentTimelineEvent[]> {
    return of([
      { id: `TL-${paymentId}-01`, paymentId, event: 'Contrato Firmado', date: new Date(Date.now() - 30 * 86400000), user: 'Carlos Mendes', details: 'Contrato de exportação registrado no sistema' },
      { id: `TL-${paymentId}-02`, paymentId, event: 'Invoice Emitida', date: new Date(Date.now() - 25 * 86400000), user: 'Ana Souza', details: 'Fatura comercial emitida para o importador' },
      { id: `TL-${paymentId}-03`, paymentId, event: 'DU-E Registrada', date: new Date(Date.now() - 20 * 86400000), user: 'Pedro Oliveira', details: 'Declaração Única de Exportação averbada' },
      { id: `TL-${paymentId}-04`, paymentId, event: 'Embarque Realizado', date: new Date(Date.now() - 15 * 86400000), user: 'Marcos Lima', details: 'Carga embarcada no navio MV Santos Express' },
      { id: `TL-${paymentId}-05`, paymentId, event: 'Pagamento Registrado', date: new Date(Date.now() - 10 * 86400000), user: 'Juliana Costa', details: 'Obrigação financeira registrada no sistema' },
      { id: `TL-${paymentId}-06`, paymentId, event: 'Liquidação Prevista', date: new Date(Date.now() + 5 * 86400000), user: 'Sistema', details: 'Data prevista para liquidação da obrigação' },
      { id: `TL-${paymentId}-07`, paymentId, event: 'Conciliação', date: new Date(Date.now() + 7 * 86400000), user: 'Sistema', details: 'Conciliação automática programada' }
    ]).pipe(delay(300));
  }

  getAIInsights(paymentId: string): Observable<PaymentAIInsights> {
    const payment = this.payments.find(p => p.id === paymentId);
    const score = payment?.aiFinancialScore || 75;
    return of({
      paymentId,
      financialScore: score,
      riskLevel: score >= 80 ? 'BAIXO' as const : score >= 60 ? 'MÉDIO' as const : 'ALTO' as const,
      alerts: [
        { severity: 'HIGH' as const, message: 'Pagamento com vencimento nos próximos 3 dias úteis', detectedAt: new Date(Date.now() - 86400000) },
        { severity: 'MEDIUM' as const, message: 'Fluxo de caixa projetado abaixo do mínimo recomendado', detectedAt: new Date(Date.now() - 2 * 86400000) },
        { severity: 'LOW' as const, message: 'Oportunidade de consolidação com outros pagamentos do mesmo beneficiário', detectedAt: new Date() },
        { severity: 'CRITICAL' as const, message: '2 pagamentos vencidos necessitam atenção imediata', detectedAt: new Date() }
      ],
      suggestions: [
        {
          action: 'Consolidar pagamentos ao Terminal Santos SA',
          reason: 'Existem 3 pagamentos pendentes para o mesmo beneficiário que podem ser consolidados em uma única remessa, reduzindo taxas bancárias.',
          criteria: ['Mesmo beneficiário', 'Vencimento próximo', 'Mesmo banco pagador'],
          confidence: 87,
          financialImpact: 'Economia estimada de R$ 1.250 em taxas'
        },
        {
          action: 'Priorizar pagamentos vencidos',
          reason: 'Pagamentos vencidos geram multa de 2% + juros de 1% a.m. Regularização imediata evita custos adicionais de R$ 2.400.',
          criteria: ['Status VENCIDO', 'Multa aplicável', 'Impacto no score'],
          confidence: 95,
          financialImpact: 'Evitar R$ 2.400 em multas e juros'
        },
        {
          action: 'Antecipar pagamento do frete marítimo',
          reason: 'Desconto de 3% para pagamento antecipado em 15 dias. Valor do desconto: USD 1.260.',
          criteria: ['Desconto disponível', 'Caixa suficiente', 'Baixo risco cambial'],
          confidence: 72,
          financialImpact: 'Economia de USD 1.260 (aprox. R$ 6.300)'
        }
      ],
      cashFlowImpact: this.getCashFlowData(),
      executiveSummary: `Análise financeira indica score ${score}/100 para esta obrigação. O fluxo de caixa projetado comporta o pagamento sem comprometer compromissos futuros. Recomenda-se atenção aos ${this.payments.filter(p => p.status === 'VENCIDO').length} pagamentos vencidos que impactam negativamente o score geral da carteira. A consolidação de pagamentos ao mesmo beneficiário pode gerar economia de até R$ 3.500 em taxas este mês.`
    }).pipe(delay(400));
  }

  getMetrics(): Observable<PaymentMetrics> {
    const pending = this.payments.filter(p => p.status === 'PENDENTE');
    const paid = this.payments.filter(p => p.status === 'PAGO' || p.status === 'CONCILIADO');
    const overdue = this.payments.filter(p => p.status === 'VENCIDO');
    const scores = this.payments.map(p => p.aiFinancialScore);
    return of({
      totalPayments: this.payments.length,
      pendingCount: pending.length,
      paidCount: paid.length,
      overdueCount: overdue.length,
      totalPendingValue: pending.reduce((sum, p) => sum + p.amount, 0),
      totalPaidValue: paid.reduce((sum, p) => sum + p.amount, 0),
      totalOverdueValue: overdue.reduce((sum, p) => sum + p.amount, 0),
      avgFinancialScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    }).pipe(delay(200));
  }

  getCashFlowProjection(): Observable<CashFlowProjection> {
    return of(this.getCashFlowData()).pipe(delay(200));
  }

  private getCashFlowData(): CashFlowProjection {
    return {
      totalPayable: 2450000,
      paidThisMonth: 875000,
      upcomingWeek: 452000,
      upcomingMonth: 1180000,
      projectedBalance: 3200000,
      scenarioOptimistic: 3800000,
      scenarioProbable: 3200000,
      scenarioConservative: 2650000
    };
  }

  reconcilePayment(paymentId: string): Observable<PaymentReconciliation> {
    const payment = this.payments.find(p => p.id === paymentId);
    if (payment) {
      payment.status = 'CONCILIADO';
      payment.updatedAt = new Date();
    }
    return of({
      id: `REC-${paymentId}-AUTO`,
      paymentId,
      expectedAmount: payment?.amount || 0,
      realizedAmount: payment?.amount || 0,
      difference: 0,
      status: 'CONCILIADO' as const,
      source: 'Conciliação Manual',
      reconciliatedAt: new Date()
    }).pipe(delay(500));
  }

  approvePayment(paymentId: string): Observable<Pagamento> {
    const payment = this.payments.find(p => p.id === paymentId);
    if (payment) {
      payment.status = 'APROVADO';
      payment.updatedAt = new Date();
    }
    return of(payment!).pipe(delay(300));
  }

  // === SYNCHRONOUS DROPDOWN METHODS ===

  getBeneficiaries(): string[] {
    return [...new Set(this.payments.map(p => p.beneficiary))];
  }

  getCategories(): PaymentCategory[] {
    return ['FRETE', 'ARMAZENAGEM', 'DESPACHANTE', 'SEGURO', 'COMISSÃO', 'TAXAS_PORTUÁRIAS', 'TAXAS_BANCÁRIAS', 'CERTIFICADOS', 'TRANSPORTE', 'TRIBUTOS', 'FORNECEDORES', 'OUTROS'];
  }

  getBanks(): string[] {
    return ['Banco do Brasil', 'Itaú', 'Bradesco', 'Santander'];
  }

  getCurrencies(): string[] {
    return ['BRL', 'USD', 'EUR'];
  }

  getStatuses(): PaymentStatus[] {
    return ['PENDENTE', 'APROVADO', 'PAGO', 'VENCIDO', 'CANCELADO', 'CONCILIADO'];
  }
}
