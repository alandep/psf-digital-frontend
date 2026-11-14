/**
 * Contrato do BFF /bff/financeiro/pagamentos, compartilhado por Pagamentos
 * (tipo PAGAMENTO) e Contas a Receber (tipo RECEBIMENTO).
 */
export type PagamentoTipo = 'RECEBIMENTO' | 'PAGAMENTO';
export type PagamentoApiStatus = 'PENDENTE' | 'PAGO' | 'ATRASADO' | 'CANCELADO';

export interface PagamentoView {
  id: string;
  tipo: PagamentoTipo;
  descricao: string | null;
  contraparte: string | null;
  referencia: string | null;
  contaBancaria: string | null;
  contratoCambioId: string | null;
  observacoes: string | null;
  amount: number;
  currency: string;
  status: PagamentoApiStatus;
  /** yyyy-MM-dd */
  dueDate: string;
  paidAt: string | null;
  exportId: string | null;
  createdAt: string;
}

export interface PagamentoRequest {
  tipo: PagamentoTipo;
  descricao: string | null;
  contraparte: string | null;
  referencia: string | null;
  contaBancaria: string | null;
  contratoCambioId: string | null;
  observacoes: string | null;
  amount: number;
  currency: string;
  /** yyyy-MM-dd */
  dueDate: string;
  exportId: string | null;
}

/** String vazia/espaços -> null (o backend aceita null para campos opcionais). */
export function blankToNull(value: string | null | undefined): string | null {
  const v = (value ?? '').trim();
  return v === '' ? null : v;
}
