import { Component, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';

import { AI_SERVICE } from '../../services/ai/ai-service.token';
import { IAiService } from '../../services/ai/ai-service.interface';
import { AiAnalysisResult, AiReconciliationResult } from '../../../types/ai-hub';
import { AiFriendlyError, toAiFriendlyError } from '../../../types/ai-error';

@Component({
  selector: 'app-ai-hub',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatTabsModule
  ],
  templateUrl: './ai-hub.component.html',
  styleUrl: './ai-hub.component.scss'
})
export class AiHubComponent implements OnDestroy {
  private readonly ai = inject<IAiService>(AI_SERVICE);

  // Timers de contagem regressiva do Retry-After, por aba. Mantidos para que
  // possam ser limpos ao reenviar ou ao destruir o componente (evita leaks e
  // multiplos intervals concorrentes).
  private ncmRetryTimer: ReturnType<typeof setInterval> | null = null;
  private docRetryTimer: ReturnType<typeof setInterval> | null = null;
  private recRetryTimer: ReturnType<typeof setInterval> | null = null;

  ngOnDestroy(): void {
    this.clearNcmRetryTimer();
    this.clearDocRetryTimer();
    this.clearRecRetryTimer();
  }

  // Mapeia o erro normalizado pelo errorInterceptor para uma mensagem amigavel pt-BR
  // com base no status HTTP real, evitando mensagens genericas enganosas.
  private mensagemErro(err: unknown): string {
    const e = err as { status?: number; message?: string };
    switch (e?.status) {
      case 400:
        return 'Requisicao invalida. Revise os dados informados.';
      case 401:
        return 'Sessao expirada. Faca login novamente.';
      case 403:
        return 'Sem permissao para usar a IA. Verifique seu acesso.';
      case 422:
        return 'Nao foi possivel extrair um documento valido do texto informado. Verifique se o conteudo corresponde ao tipo de documento esperado (ex.: uma Commercial Invoice com numero, moeda, Incoterm e itens).';
      case 429:
        return 'Limite de uso de IA atingido. Aguarde e tente novamente.';
      case 500:
        return 'Erro interno ao processar a IA. Tente novamente mais tarde.';
      case 502:
        return 'O provedor de IA retornou uma resposta invalida. Tente novamente mais tarde.';
      case 503:
        return 'O servico de IA esta temporariamente indisponivel. Tente novamente em instantes.';
      case 504:
        return 'O servico de IA demorou para responder (timeout). Tente novamente.';
      default:
        // Prefere a mensagem do backend quando presente; senao, uma nota generica.
        return e?.message || 'Falha ao chamar a IA. Tente novamente.';
    }
  }

  // --- Aba 1: Classificar NCM ---
  ncmInput = '';
  ncmLoading = signal(false);
  ncmResult = signal<AiAnalysisResult | null>(null);
  ncmErro = signal<AiFriendlyError | null>(null);
  // Segundos restantes ate liberar o retry (Retry-After); 0 => retry liberado.
  ncmRetryIn = signal(0);

  classificarNcm(): void {
    // Guarda contra double-submit: se ja ha um envio desta aba em andamento,
    // um novo clique e um no-op (o signal de loading e a unica fonte de verdade).
    if (this.ncmLoading()) {
      return;
    }
    const input = this.ncmInput.trim();
    if (!input) {
      return;
    }
    // Reset de estado da aba. NAO limpamos `ncmInput` (preservacao de input).
    this.clearNcmRetryTimer();
    this.ncmLoading.set(true);
    this.ncmResult.set(null);
    this.ncmErro.set(null);
    this.ai.analisar({ task: 'NCM_CLASSIFICATION', input }).subscribe({
      next: (res) => {
        this.ncmResult.set(res);
        this.ncmLoading.set(false);
      },
      error: (err) => {
        const info = toAiFriendlyError(err, this.mensagemErro(err));
        this.ncmErro.set(info);
        this.ncmLoading.set(false);
        this.startNcmCountdown(info);
      }
    });
  }

  // Reexecuta a classificacao reusando o input preservado nos campos.
  retryNcm(): void {
    if (this.ncmRetryIn() > 0) {
      return;
    }
    this.classificarNcm();
  }

  private startNcmCountdown(info: AiFriendlyError): void {
    const seconds = info.retryable ? info.retryAfterSeconds ?? 0 : 0;
    this.ncmRetryIn.set(seconds > 0 ? seconds : 0);
    if (seconds > 0) {
      this.ncmRetryTimer = setInterval(() => {
        const next = this.ncmRetryIn() - 1;
        this.ncmRetryIn.set(next > 0 ? next : 0);
        if (next <= 0) {
          this.clearNcmRetryTimer();
        }
      }, 1000);
    }
  }

  private clearNcmRetryTimer(): void {
    if (this.ncmRetryTimer != null) {
      clearInterval(this.ncmRetryTimer);
      this.ncmRetryTimer = null;
    }
    this.ncmRetryIn.set(0);
  }

  // --- Aba 2: Extrair Documento ---
  docInput = '';
  docLoading = signal(false);
  docResult = signal<string | null>(null);
  docErro = signal<AiFriendlyError | null>(null);
  // Segundos restantes ate liberar o retry (Retry-After); 0 => retry liberado.
  docRetryIn = signal(0);

  extrairDocumento(): void {
    // Guarda contra double-submit: se ja ha um envio desta aba em andamento,
    // um novo clique e um no-op (o signal de loading e a unica fonte de verdade).
    if (this.docLoading()) {
      return;
    }
    const input = this.docInput.trim();
    if (!input) {
      return;
    }
    // Reset de estado da aba. NAO limpamos `docInput` (preservacao de input).
    this.clearDocRetryTimer();
    this.docLoading.set(true);
    this.docResult.set(null);
    this.docErro.set(null);
    this.ai.analisar({ task: 'DOCUMENT_EXTRACTION', input }).subscribe({
      next: (res) => {
        this.docResult.set(this.prettyJson(res.output));
        this.docLoading.set(false);
      },
      error: (err) => {
        const info = toAiFriendlyError(err, this.mensagemErro(err));
        this.docErro.set(info);
        this.docLoading.set(false);
        this.startDocCountdown(info);
      }
    });
  }

  // Reexecuta a extracao reusando o input preservado no campo.
  retryDoc(): void {
    if (this.docRetryIn() > 0) {
      return;
    }
    this.extrairDocumento();
  }

  private startDocCountdown(info: AiFriendlyError): void {
    const seconds = info.retryable ? info.retryAfterSeconds ?? 0 : 0;
    this.docRetryIn.set(seconds > 0 ? seconds : 0);
    if (seconds > 0) {
      this.docRetryTimer = setInterval(() => {
        const next = this.docRetryIn() - 1;
        this.docRetryIn.set(next > 0 ? next : 0);
        if (next <= 0) {
          this.clearDocRetryTimer();
        }
      }, 1000);
    }
  }

  private clearDocRetryTimer(): void {
    if (this.docRetryTimer != null) {
      clearInterval(this.docRetryTimer);
      this.docRetryTimer = null;
    }
    this.docRetryIn.set(0);
  }

  // Tenta formatar o JSON retornado; se nao for JSON valido, mostra o texto cru.
  private prettyJson(raw: string): string {
    try {
      return JSON.stringify(JSON.parse(raw), null, 2);
    } catch {
      return raw;
    }
  }

  // --- Aba 3: Reconciliar ---
  recPedido = '';
  recPacking = '';
  recInvoice = '';
  recLoading = signal(false);
  recResult = signal<AiReconciliationResult | null>(null);
  recErro = signal<AiFriendlyError | null>(null);
  // Segundos restantes ate liberar o retry (Retry-After); 0 => retry liberado.
  recRetryIn = signal(0);

  // Rotulos pt-BR amigaveis para os codigos de ReviewReason vindos do backend.
  private readonly reviewReasonLabels: Record<string, string> = {
    FINISH_REASON_NOT_STOP: 'Resposta do modelo foi interrompida (finishReason != STOP)',
    REVALIDATION_FAILED: 'Falha na revalidacao de regra de negocio',
    RECONCILIATION_DIVERGENCE: 'Divergencia na reconciliacao entre documentos',
    PARTIAL_EXTRACTION: 'Extracao parcial: nem todos os documentos foram extraidos'
  };

  reviewReasonLabel(code: string): string {
    return this.reviewReasonLabels[code] ?? code;
  }

  reconciliar(): void {
    // Guarda contra double-submit: se ja ha um envio desta aba em andamento,
    // um novo clique e um no-op (o signal de loading e a unica fonte de verdade).
    if (this.recLoading()) {
      return;
    }
    const pedido = this.recPedido.trim();
    const packing = this.recPacking.trim();
    const invoice = this.recInvoice.trim();
    if (!pedido && !packing && !invoice) {
      return;
    }
    // Reset de estado da aba. NAO limpamos recPedido/recPacking/recInvoice
    // (preservacao de input).
    this.clearRecRetryTimer();
    this.recLoading.set(true);
    this.recResult.set(null);
    this.recErro.set(null);
    this.ai.reconciliar({ pedido, packing, invoice }).subscribe({
      next: (res) => {
        this.recResult.set(res);
        this.recLoading.set(false);
      },
      error: (err) => {
        const info = toAiFriendlyError(err, this.mensagemErro(err));
        this.recErro.set(info);
        this.recLoading.set(false);
        this.startRecCountdown(info);
      }
    });
  }

  // Reexecuta a reconciliacao reusando os inputs preservados nos campos.
  retryRec(): void {
    if (this.recRetryIn() > 0) {
      return;
    }
    this.reconciliar();
  }

  private startRecCountdown(info: AiFriendlyError): void {
    const seconds = info.retryable ? info.retryAfterSeconds ?? 0 : 0;
    this.recRetryIn.set(seconds > 0 ? seconds : 0);
    if (seconds > 0) {
      this.recRetryTimer = setInterval(() => {
        const next = this.recRetryIn() - 1;
        this.recRetryIn.set(next > 0 ? next : 0);
        if (next <= 0) {
          this.clearRecRetryTimer();
        }
      }, 1000);
    }
  }

  private clearRecRetryTimer(): void {
    if (this.recRetryTimer != null) {
      clearInterval(this.recRetryTimer);
      this.recRetryTimer = null;
    }
    this.recRetryIn.set(0);
  }
}
