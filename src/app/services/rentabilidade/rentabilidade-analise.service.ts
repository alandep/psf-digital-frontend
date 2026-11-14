import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AnaliseRentabilidade,
  RentabilidadeAnaliseDto,
  RentabilidadeAnaliseRequest
} from '../../../types/rentabilidade-analise';

/** Histórico de análises de rentabilidade (/bff/rentabilidade/analises). */
@Injectable({ providedIn: 'root' })
export class RentabilidadeAnaliseService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.bffBaseUrl}/bff/rentabilidade/analises`;

  listar(): Observable<AnaliseRentabilidade[]> {
    return this.http
      .get<RentabilidadeAnaliseDto[]>(this.api)
      .pipe(map((list) => (list ?? []).map((d) => this.fromDto(d))));
  }

  salvar(analise: AnaliseRentabilidade): Observable<AnaliseRentabilidade> {
    const body: RentabilidadeAnaliseRequest = {
      exportacaoRef: analise.exportacaoId,
      produto: analise.produto,
      score: analise.scoreRentabilidade,
      margem: analise.margemLucro,
      lucroBrl: analise.lucroBrutoBrl,
      payload: analise
    };
    return this.http.post<RentabilidadeAnaliseDto>(this.api, body).pipe(map((d) => this.fromDto(d)));
  }

  excluir(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${encodeURIComponent(id)}`);
  }

  private fromDto(d: RentabilidadeAnaliseDto): AnaliseRentabilidade {
    const p = (d.payload ?? {}) as Partial<AnaliseRentabilidade>;
    return {
      id: d.id,
      exportacaoId: p.exportacaoId ?? d.exportacaoRef,
      produto: p.produto ?? d.produto,
      quantidade: p.quantidade ?? 0,
      precoVendaUsd: p.precoVendaUsd ?? 0,
      precoCompraBrl: p.precoCompraBrl ?? 0,
      freteInternacionalUsd: p.freteInternacionalUsd ?? 0,
      freteNacionalBrl: p.freteNacionalBrl ?? 0,
      taxasPortuarias: p.taxasPortuarias ?? 0,
      taxasGovernamentais: p.taxasGovernamentais ?? 0,
      custoArmazenagem: p.custoArmazenagem ?? 0,
      taxaCambioAtual: p.taxaCambioAtual ?? 0,
      taxaCambioPrevista: p.taxaCambioPrevista ?? null,
      expectativaAno: p.expectativaAno ?? null,
      expectativaData: p.expectativaData ?? null,
      receitaTotalBrl: p.receitaTotalBrl ?? 0,
      custoTotalBrl: p.custoTotalBrl ?? 0,
      lucroBrutoBrl: p.lucroBrutoBrl ?? d.lucroBrl,
      margemLucro: p.margemLucro ?? d.margem,
      scoreRentabilidade: p.scoreRentabilidade ?? d.score,
      scoreRisco: p.scoreRisco ?? 0,
      confiabilidadePrevisao: p.confiabilidadePrevisao ?? null,
      pontosPositivos: p.pontosPositivos ?? [],
      pontosNegativos: p.pontosNegativos ?? [],
      recomendacao: p.recomendacao ?? '',
      dataAnalise: new Date(d.createdAt)
    };
  }
}
