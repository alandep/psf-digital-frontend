import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PagamentoView, PagamentoRequest, PagamentoApiStatus, blankToNull } from './pagamento-view';
import { parseApiDate, toApiDate } from './finance-utils';
import { environment } from '../../../environments/environment';

/** Recebimento (Contas a Receber) como a tela o enxerga. Mapeado de PagamentoView (tipo RECEBIMENTO). */
export interface RecebimentoItem {
  id: string;
  /** contraparte */
  cliente: string;
  /** referencia (nº do documento) */
  referencia: string;
  descricao: string;
  contaBancaria: string;
  /** contratoCambioId */
  contratoCambioId: string | null;
  observacoes: string;
  amount: number;
  currency: string;
  status: PagamentoApiStatus;
  /** Vencimento (dueDate) */
  dueDate: Date;
  /** Data do recebimento (paidAt) */
  paidAt: Date | null;
  createdAt: Date;
}

export interface RecebimentoInput {
  cliente: string;
  referencia: string;
  descricao: string;
  contaBancaria: string;
  contratoCambioId: string | null;
  observacoes: string;
  amount: number;
  currency: string;
  dueDate: Date;
}

/**
 * Gateway HTTP de Contas a Receber: /bff/financeiro/pagamentos?tipo=RECEBIMENTO.
 * Criar, editar (PUT, só itens em aberto), marcar como recebido (/pagar) e cancelar.
 */
@Injectable({
  providedIn: 'root'
})
export class RecebimentosHttpService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.bffBaseUrl}/bff/financeiro/pagamentos`;

  private toItem(v: PagamentoView): RecebimentoItem {
    const created = parseApiDate(v.createdAt) ?? new Date();
    return {
      id: v.id,
      cliente: v.contraparte ?? '',
      referencia: v.referencia ?? '',
      descricao: v.descricao ?? '',
      contaBancaria: v.contaBancaria ?? '',
      contratoCambioId: v.contratoCambioId,
      observacoes: v.observacoes ?? '',
      amount: v.amount ?? 0,
      currency: v.currency ?? 'BRL',
      status: v.status,
      dueDate: parseApiDate(v.dueDate) ?? created,
      paidAt: parseApiDate(v.paidAt),
      createdAt: created
    };
  }

  private toRequest(i: RecebimentoInput): PagamentoRequest {
    return {
      tipo: 'RECEBIMENTO',
      descricao: blankToNull(i.descricao),
      contraparte: blankToNull(i.cliente),
      referencia: blankToNull(i.referencia),
      contaBancaria: blankToNull(i.contaBancaria),
      contratoCambioId: blankToNull(i.contratoCambioId),
      observacoes: blankToNull(i.observacoes),
      amount: Number(i.amount) || 0,
      currency: i.currency || 'BRL',
      dueDate: toApiDate(i.dueDate) ?? '',
      exportId: null
    };
  }

  list(status?: PagamentoApiStatus): Observable<RecebimentoItem[]> {
    let params = new HttpParams().set('tipo', 'RECEBIMENTO');
    if (status) {
      params = params.set('status', status);
    }
    return this.http
      .get<PagamentoView[]>(this.api, { params })
      .pipe(map((rows) => (rows ?? []).map((r) => this.toItem(r))));
  }

  create(input: RecebimentoInput): Observable<RecebimentoItem> {
    return this.http.post<PagamentoView>(this.api, this.toRequest(input)).pipe(map((v) => this.toItem(v)));
  }

  update(id: string, input: RecebimentoInput): Observable<RecebimentoItem> {
    return this.http
      .put<PagamentoView>(`${this.api}/${encodeURIComponent(id)}`, this.toRequest(input))
      .pipe(map((v) => this.toItem(v)));
  }

  /** Marca como recebido (POST /{id}/pagar). */
  marcarRecebido(id: string, paidAt?: Date): Observable<RecebimentoItem> {
    const body = paidAt ? { paidAt: paidAt.toISOString() } : {};
    return this.http
      .post<PagamentoView>(`${this.api}/${encodeURIComponent(id)}/pagar`, body)
      .pipe(map((v) => this.toItem(v)));
  }

  cancelar(id: string): Observable<RecebimentoItem> {
    return this.http
      .post<PagamentoView>(`${this.api}/${encodeURIComponent(id)}/cancelar`, {})
      .pipe(map((v) => this.toItem(v)));
  }
}
