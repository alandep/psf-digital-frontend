import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { Subscription, timer } from 'rxjs';
import { switchMap, takeWhile } from 'rxjs/operators';

import { AI_SERVICE } from '../../../services/ai/ai-service.token';
import { IAiService } from '../../../services/ai/ai-service.interface';
import { AiAnalysisResult, AiJobView, AiUsageView, NcmClassificationResult } from '../../../../types/ai-hub';
import { AiFriendlyError, toAiFriendlyError } from '../../../../types/ai-error';

// Metadados de uso devolvidos pelo backend (provider/model/unidades). Exibidos
// no rodape de cada resposta de IA; ocrPages so e mostrado para extracao de
// documento quando > 0.
interface AiResponseMeta {
  provider: string;
  model: string;
  inputUnits: number;
  outputUnits: number;
  ocrPages: number;
  task: AiTaskId;
}

interface ChatMessage {
  id: string;
  content: string;
  type: 'user' | 'ai';
  timestamp: Date;
  loading?: boolean;
  error?: boolean;
  meta?: AiResponseMeta;
  // Detalhe do erro de IA (Req 6): computado via toAiFriendlyError a partir do
  // erro ja normalizado pelo errorInterceptor (status/code/correlationId/
  // retryAfterSeconds). Dirige as afordancias exibidas na mensagem de erro.
  errorInfo?: AiFriendlyError;
  // Segundos restantes do countdown de Retry-After para esta mensagem de erro;
  // 0 => retry liberado (Req 6.3). Mantido por mensagem para suportar varias
  // mensagens de erro na conversa.
  retryIn?: number;
}

// Solicitacao que originou uma resposta de IA. Guardada para permitir "Tentar
// novamente" reenviando exatamente a mesma solicitacao (Req 6.4).
interface PendingRequest {
  input: string;
  task: AiTaskId;
  async: boolean;
}

// Tasks suportadas pelo Assistente. CHAT e o modo livre; os demais acionam os
// agentes estruturados do backend via AI_SERVICE.analisar.
type AiTaskId =
  | 'CHAT'
  | 'NCM_CLASSIFICATION'
  | 'DOCUMENT_SUMMARY'
  | 'TRANSLATION'
  | 'RISK_ANALYSIS'
  | 'DOCUMENT_EXTRACTION';

interface AiTaskOption {
  id: AiTaskId;
  label: string;
  icon: string;
}

interface QuickAction {
  label: string;
  command: string;
  icon: string;
  task: AiTaskId;
}

// Agente de roadmap: um Agente_Nomeado que NAO corresponde a nenhuma
// Capacidade_Real (Req 12.6). Listado apenas para fins informativos, nunca
// acionavel e sem nenhuma invocacao de IA associada (Req 12.7/12.8).
interface RoadmapAgent {
  label: string;
  icon: string;
}

@Component({
  selector: 'app-ai-copilot-simple',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatSelectModule,
    MatCheckboxModule
  ],
  templateUrl: './ai-copilot-simple.component.html',
  styleUrls: ['./ai-copilot-simple.component.scss']
})
export class AiCopilotSimpleComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  @ViewChild('messageInput') messageInput?: ElementRef<HTMLInputElement>;

  // Fonte unica de respostas: nenhum texto e gerado localmente. Toda resposta
  // vem do backend real/mock via o token AI_SERVICE.
  private readonly ai = inject<IAiService>(AI_SERVICE);

  // Navegacao usada pela afordancia "Comprar creditos de IA" (Req 6.2), que
  // leva o usuario a tela de assinatura/planos quando a quota se esgota.
  private readonly router = inject(Router);

  // Ultima solicitacao enviada, preservada para o botao "Tentar novamente"
  // reenviar exatamente a mesma entrada/agente/modo (Req 6.4).
  private lastRequest?: PendingRequest;

  // Timers de countdown de Retry-After ativos, indexados pelo id da mensagem
  // de erro. Limpos no retry e no destroy para evitar intervals concorrentes
  // e vazamentos.
  private retryTimers = new Map<string, ReturnType<typeof setInterval>>();

  public messages: ChatMessage[] = [];
  public userInput = '';
  public isProcessing = false;
  public inputInvalid = false;

  // Execucao assincrona (Req 4.3/4.4/4.5): quando ligada, o envio usa
  // analisarAsync + polling de jobStatus em vez da analise sincrona.
  public async = false;

  // Painel de uso/quota (Req 5.1-5.4). Carregado na init e recarregado apos
  // cada operacao de IA bem-sucedida. Se a consulta falhar, usageUnavailable
  // sinaliza indisponibilidade sem bloquear o restante da tela.
  public usage: AiUsageView[] = [];
  public usageUnavailable = false;

  // Subscriptions ativas para cleanup no destroy (polling de job e consulta
  // de uso), evitando vazamentos quando o componente e destruido.
  private pollSub?: Subscription;
  private usageSub?: Subscription;

  // Estados terminais do job (tolerantes a variacoes de string, comparados em
  // maiusculas).
  private static readonly SUCCESS_STATES = ['SUCCEEDED', 'SUCCESS', 'COMPLETED'];
  private static readonly FAILURE_STATES = ['FAILED', 'ERROR'];

  // Agente selecionado. Chat livre por padrao; o seletor permite acionar um
  // agente estruturado para a proxima mensagem enviada.
  public selectedTask: AiTaskId = 'CHAT';

  public readonly taskOptions: AiTaskOption[] = [
    { id: 'CHAT', label: 'Chat livre', icon: 'chat' },
    { id: 'NCM_CLASSIFICATION', label: 'Classificação NCM', icon: 'category' },
    { id: 'DOCUMENT_SUMMARY', label: 'Resumo de documento', icon: 'summarize' },
    { id: 'TRANSLATION', label: 'Tradução', icon: 'translate' },
    { id: 'RISK_ANALYSIS', label: 'Análise de risco', icon: 'gpp_maybe' },
    { id: 'DOCUMENT_EXTRACTION', label: 'Extração de documento', icon: 'document_scanner' }
  ];

  // Quick actions (Req 9): cada acao mapeia obrigatoriamente para um Agente_IA
  // real via a task correspondente (Req 9.1). O acionamento define o agente e
  // prepara a entrada, resolvendo pelo mesmo caminho de AI_SERVICE das demais
  // operacoes (Req 9.2). Nenhuma acao produz resposta hardcoded (Req 9.4) nem
  // mapeia para capacidade inexistente (Req 9.3). As cinco tasks abaixo sao as
  // Capacidades_Reais do backend (Req 12.1-12.5).
  public quickActions: QuickAction[] = [
    { label: 'Classificar NCM', command: 'Classifique o NCM do produto: ', icon: 'category', task: 'NCM_CLASSIFICATION' },
    { label: 'Resumir documento', command: 'Resuma o seguinte documento: ', icon: 'summarize', task: 'DOCUMENT_SUMMARY' },
    { label: 'Traduzir texto', command: 'Traduza o seguinte texto: ', icon: 'translate', task: 'TRANSLATION' },
    { label: 'Analisar risco', command: 'Analise o risco da seguinte operação: ', icon: 'gpp_maybe', task: 'RISK_ANALYSIS' },
    { label: 'Extrair documento', command: 'Extraia os dados do seguinte documento: ', icon: 'document_scanner', task: 'DOCUMENT_EXTRACTION' }
  ];

  // Agentes_Roadmap (Req 12.6): nomes exibidos no AI Operations Center que NAO
  // possuem Capacidade_Real no backend. Listados aqui apenas de forma
  // informativa e marcados como "roadmap/indisponivel" (Req 12.7). Nao sao
  // acionaveis e nao disparam nenhuma chamada nem resposta mockada (Req 12.8).
  public readonly roadmapAgents: readonly RoadmapAgent[] = [
    { label: 'Export', icon: 'local_shipping' },
    { label: 'Compliance', icon: 'verified_user' },
    { label: 'Logistics', icon: 'route' },
    { label: 'Finance', icon: 'payments' },
    { label: 'Analytics', icon: 'analytics' },
    { label: 'Forecast', icon: 'trending_up' }
  ];

  ngOnInit(): void {
    // Carregar o painel de uso/quota na init (Req 5.1).
    this.loadUsage();

    // Adicionar mensagem de boas-vindas
    setTimeout(() => {
      this.addAiMessage('Olá! 👋 Sou seu assistente de IA para o Export Intelligence Platform. Como posso ajudá-lo hoje?');
    }, 500);
  }

  ngAfterViewInit(): void {
    // Scrollar para o final se houver mensagens
    setTimeout(() => this.scrollToBottom(), 100);
  }

  ngOnDestroy(): void {
    // Cleanup de qualquer polling/consulta ativa para evitar vazamentos.
    this.pollSub?.unsubscribe();
    this.usageSub?.unsubscribe();
    // Limpa todos os countdowns de Retry-After pendentes.
    this.retryTimers.forEach((timer) => clearInterval(timer));
    this.retryTimers.clear();
  }

  // Mapeia o erro ja normalizado pelo errorInterceptor para uma mensagem
  // amigavel pt-BR com base no status HTTP real (Req 6.1). Espelha o mapa do
  // AiHubComponent para manter consistencia entre as telas de IA. 403 produz
  // uma mensagem generica de acesso negado sem detalhes internos (Req 10.3).
  private mensagemErro(err: unknown): string {
    const e = err as { status?: number; code?: string; message?: string };
    // AI_QUOTA_EXCEEDED chega como HTTP 402; mensagem dedicada (Req 6.2).
    if (e?.status === 402 || e?.code === 'AI_QUOTA_EXCEEDED') {
      return 'Seus créditos de IA acabaram. Compre créditos para continuar usando a IA.';
    }
    switch (e?.status) {
      case 400:
        return 'Requisição inválida. Revise os dados informados.';
      case 401:
        return 'Sessão expirada. Faça login novamente.';
      case 403:
        return 'Acesso negado: você não tem permissão para usar a IA.';
      case 422:
        return 'A resposta da IA foi inválida para a solicitação enviada. Tente reformular a entrada.';
      case 429:
        return 'Limite de uso de IA atingido. Aguarde e tente novamente.';
      case 500:
        return 'Erro interno ao processar a IA. Tente novamente mais tarde.';
      case 502:
        return 'O provedor de IA retornou uma resposta inválida. Tente novamente mais tarde.';
      case 503:
        return 'O serviço de IA está temporariamente indisponível. Tente novamente em instantes.';
      case 504:
        return 'O serviço de IA demorou para responder (timeout). Tente novamente.';
      default:
        return e?.message || 'Não foi possível obter uma resposta da IA. Tente novamente.';
    }
  }

  // Centraliza a exibicao de um Erro_IA numa mensagem de IA ja existente
  // (Req 6). Computa o AiFriendlyError, marca a mensagem como erro, nunca
  // substitui por conteudo mockado (Req 6.6) e inicia o countdown de
  // Retry-After quando aplicavel (Req 6.3).
  private applyError(message: ChatMessage, err: unknown): void {
    const info = toAiFriendlyError(err, this.mensagemErro(err));
    message.loading = false;
    message.error = true;
    message.errorInfo = info;
    message.content = info.message;
    this.isProcessing = false;
    this.startRetryCountdown(message, info);
    setTimeout(() => this.scrollToBottom(), 100);
  }

  // Inicia (ou zera) o countdown de Retry-After para uma mensagem de erro.
  // So conta quando o erro e retentavel e traz segundos de espera (ex.: 429
  // AI_RATE_LIMITED). Caso contrario, o retry fica imediatamente liberado.
  private startRetryCountdown(message: ChatMessage, info: AiFriendlyError): void {
    this.clearRetryTimer(message.id);
    const seconds = info.retryable ? info.retryAfterSeconds ?? 0 : 0;
    message.retryIn = seconds > 0 ? seconds : 0;
    if (seconds > 0) {
      const timer = setInterval(() => {
        const next = (message.retryIn ?? 0) - 1;
        message.retryIn = next > 0 ? next : 0;
        if (next <= 0) {
          this.clearRetryTimer(message.id);
        }
      }, 1000);
      this.retryTimers.set(message.id, timer);
    }
  }

  private clearRetryTimer(messageId: string): void {
    const timer = this.retryTimers.get(messageId);
    if (timer != null) {
      clearInterval(timer);
      this.retryTimers.delete(messageId);
    }
  }

  // Afordancia de retry (Req 6.4): so habilitada quando ha solicitacao
  // preservada, nenhum processamento em curso e o countdown de Retry-After
  // (Req 6.3) ja zerou.
  public canRetry(message: ChatMessage): boolean {
    return !!message.error && !this.isProcessing && (message.retryIn ?? 0) <= 0 && !!this.lastRequest;
  }

  // Reenvia a ultima solicitacao preservada, pelo mesmo caminho de envio
  // (sincrono ou assincrono), sem recriar a mensagem do usuario (Req 6.4).
  public retry(message: ChatMessage): void {
    if (!this.canRetry(message) || !this.lastRequest) {
      return;
    }
    this.clearRetryTimer(message.id);
    const { input, task, async } = this.lastRequest;
    this.async = async;
    this.processAiResponse(input, task);
  }

  // Indica se a mensagem de erro deve exibir o CTA "Comprar créditos de IA"
  // (Req 6.2): quota esgotada (AI_QUOTA_EXCEEDED / HTTP 402).
  public showsBuyCredits(message: ChatMessage): boolean {
    const info = message.errorInfo;
    return !!info && (info.status === 402 || info.code === 'AI_QUOTA_EXCEEDED');
  }

  // Leva o usuario a tela de assinatura/planos para comprar creditos de IA
  // (Req 6.2). A rota existe em app.routes.ts como `admin/assinatura`.
  public buyCredits(): void {
    this.router.navigate(['/admin/assinatura']);
  }

  // Consulta o uso/quota via AI_SERVICE.uso(). Em sucesso, popula o painel e
  // limpa a flag de indisponibilidade; em falha, sinaliza indisponibilidade
  // sem bloquear o restante da tela (Req 5.4).
  private loadUsage(): void {
    this.usageSub?.unsubscribe();
    this.usageSub = this.ai.uso().subscribe({
      next: (usage: AiUsageView[]) => {
        this.usage = usage ?? [];
        this.usageUnavailable = false;
      },
      error: () => {
        this.usage = [];
        this.usageUnavailable = true;
      }
    });
  }

  private isSuccessState(status: string): boolean {
    return AiCopilotSimpleComponent.SUCCESS_STATES.includes((status ?? '').toUpperCase());
  }

  private isFailureState(status: string): boolean {
    return AiCopilotSimpleComponent.FAILURE_STATES.includes((status ?? '').toUpperCase());
  }

  private isTerminalState(status: string): boolean {
    return this.isSuccessState(status) || this.isFailureState(status);
  }

  public sendMessage(): void {
    if (this.isProcessing) return;

    const userMessage = this.userInput.trim();

    // Validacao de entrada obrigatoria (Req 2.6): sem texto, bloqueia o envio.
    if (!userMessage) {
      this.inputInvalid = true;
      return;
    }

    this.inputInvalid = false;
    this.userInput = '';

    // Adicionar mensagem do usuário
    this.addUserMessage(userMessage);

    // Enviar ao agente selecionado
    this.processAiResponse(userMessage, this.selectedTask);
    // Apos iniciar o envio, devolve o foco ao campo de entrada (Req 11.3).
    this.focusInput();
  }

  public executeQuickAction(action: QuickAction): void {
    if (this.isProcessing) return;

    // A quick action define o agente alvo e prepara a entrada; o usuario
    // completa com o conteudo e envia. Nenhuma resposta e gerada localmente.
    this.selectedTask = action.task;
    this.userInput = action.command;
    this.inputInvalid = false;
    this.focusInput();
  }

  private addUserMessage(content: string): void {
    const message: ChatMessage = {
      id: this.generateId(),
      content: content,
      type: 'user',
      timestamp: new Date()
    };

    this.messages.push(message);
    setTimeout(() => this.scrollToBottom(), 100);
  }

  private addAiMessage(content: string): void {
    const message: ChatMessage = {
      id: this.generateId(),
      content: content,
      type: 'ai',
      timestamp: new Date()
    };

    this.messages.push(message);
    setTimeout(() => this.scrollToBottom(), 100);
  }

  // Fluxo unico de resposta: cria uma mensagem de IA em loading e a resolve com
  // a resposta real do backend (ou uma mensagem de erro) via AI_SERVICE. Nenhum
  // texto fixo nem latencia simulada.
  private processAiResponse(userMessage: string, task: AiTaskId): void {
    this.isProcessing = true;

    // Preserva a solicitacao para permitir "Tentar novamente" (Req 6.4).
    this.lastRequest = { input: userMessage, task, async: this.async };

    const loadingMessage: ChatMessage = {
      id: this.generateId(),
      content: '',
      type: 'ai',
      timestamp: new Date(),
      loading: true
    };

    this.messages.push(loadingMessage);
    setTimeout(() => this.scrollToBottom(), 100);

    // Fluxo assincrono opcional (Req 4.3/4.4/4.5): dispara o job e faz polling
    // do status ate um estado terminal.
    if (this.async) {
      this.processAsync(userMessage, task, loadingMessage);
      return;
    }

    // NCM estruturado (Req 2.7-2.10): a classificacao por IA consome a
    // capacidade dedicada classificarNcm, que ja devolve um DTO tipado
    // (ncm/confidence/rationale/alternatives). O front NAO faz JSON.parse de
    // string; apenas formata o resultado tipado para exibicao legivel.
    if (task === 'NCM_CLASSIFICATION') {
      this.processNcmClassification(userMessage, loadingMessage);
      return;
    }

    this.ai.analisar({ task, input: userMessage }).subscribe({
      next: (result: AiAnalysisResult) => {
        loadingMessage.loading = false;
        loadingMessage.content = result.output ?? '';
        loadingMessage.meta = {
          provider: result.provider,
          model: result.model,
          inputUnits: result.inputUnits,
          outputUnits: result.outputUnits,
          ocrPages: result.ocrPages,
          task
        };
        this.isProcessing = false;
        // Recarregar o painel de uso apos operacao bem-sucedida (Req 5.3).
        this.loadUsage();
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: (err: unknown) => {
        // Exibe o Erro_IA especifico por tipo, sem fallback mockado (Req 6).
        this.applyError(loadingMessage, err);
      }
    });
  }

  // Classificacao NCM tipada (Req 2.7-2.10): chama AI_SERVICE.classificarNcm
  // com a descricao informada pelo usuario e exibe ncm/confidence/rationale/
  // alternativas numa formatacao legivel. Nenhum JSON.parse de string: o
  // retorno ja e tipado.
  private processNcmClassification(userMessage: string, loadingMessage: ChatMessage): void {
    this.ai.classificarNcm({ description: userMessage }).subscribe({
      next: (result: NcmClassificationResult) => {
        loadingMessage.loading = false;
        loadingMessage.content = this.formatNcmResult(result);
        this.isProcessing = false;
        // Recarregar o painel de uso apos operacao bem-sucedida (Req 5.3).
        this.loadUsage();
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: (err: unknown) => {
        // Exibe o Erro_IA especifico por tipo, sem fallback mockado (Req 6).
        this.applyError(loadingMessage, err);
      }
    });
  }

  // Monta uma mensagem legivel a partir do resultado tipado de NCM. confidence
  // vem como fracao 0..1 e e apresentada em percentual. O conteudo e injetado
  // via [innerHTML], entao os valores dinamicos sao escapados e as quebras de
  // linha viram <br> para renderizar legivel.
  private formatNcmResult(result: NcmClassificationResult): string {
    const confidencePercent = Math.round((result.confidence ?? 0) * 1000) / 10;
    const lines: string[] = [
      `NCM: ${this.escapeHtml(result.ncm)} (confiança ${confidencePercent.toFixed(1)}%)`
    ];
    if (result.rationale) {
      lines.push(`Justificativa: ${this.escapeHtml(result.rationale)}`);
    }
    const alternatives = result.alternatives ?? [];
    if (alternatives.length > 0) {
      const alts = alternatives
        .map(alt => {
          const altPercent = Math.round((alt.confidence ?? 0) * 1000) / 10;
          const reason = alt.reason ? ` — ${this.escapeHtml(alt.reason)}` : '';
          return `${this.escapeHtml(alt.ncm)} (${altPercent.toFixed(1)}%)${reason}`;
        })
        .join('; ');
      lines.push(`Alternativas: ${alts}`);
    }
    return lines.join('<br>');
  }

  // Escapa caracteres HTML para injecao segura via [innerHTML].
  private escapeHtml(value: string): string {
    return (value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Fluxo assincrono: cria o job via analisarAsync e, com o jobId retornado,
  // faz polling de jobStatus a cada 1.5s ate um estado terminal. A mensagem de
  // loading exibe o estado corrente do job enquanto nao conclui. O AiJobView
  // nao traz output: no sucesso apresentamos o desfecho do job honestamente,
  // sem inventar conteudo.
  private processAsync(userMessage: string, task: AiTaskId, loadingMessage: ChatMessage): void {
    const taskName = this.taskLabel(task);

    this.ai.analisarAsync({ task, input: userMessage }).subscribe({
      next: (job: AiJobView) => {
        loadingMessage.content = `Processando… (${job.status})`;
        this.startPolling(job.jobId, task, taskName, loadingMessage);
      },
      error: (err: unknown) => {
        this.applyError(loadingMessage, err);
      }
    });
  }

  private startPolling(jobId: string, task: AiTaskId, taskName: string, loadingMessage: ChatMessage): void {
    // Garante que nao haja mais de um polling ativo ao mesmo tempo.
    this.pollSub?.unsubscribe();

    this.pollSub = timer(0, 1500)
      .pipe(
        switchMap(() => this.ai.jobStatus(jobId)),
        // Mantem a emissao enquanto nao terminal; `true` inclui a emissao
        // terminal para que ela seja tratada em `next`.
        takeWhile((job: AiJobView) => !this.isTerminalState(job.status), true)
      )
      .subscribe({
        next: (job: AiJobView) => {
          if (this.isSuccessState(job.status)) {
            loadingMessage.loading = false;
            loadingMessage.content =
              `Processamento assíncrono concluído (${job.status}). Job ${job.jobId}.`;
            loadingMessage.meta = {
              provider: '-',
              model: '-',
              inputUnits: 0,
              outputUnits: 0,
              ocrPages: 0,
              task
            };
            this.isProcessing = false;
            // Recarregar o painel de uso apos operacao bem-sucedida (Req 5.3).
            this.loadUsage();
            setTimeout(() => this.scrollToBottom(), 100);
          } else if (this.isFailureState(job.status)) {
            loadingMessage.loading = false;
            loadingMessage.error = true;
            loadingMessage.content =
              `O processamento assíncrono falhou (${job.status}). Job ${job.jobId}.`;
            this.isProcessing = false;
            setTimeout(() => this.scrollToBottom(), 100);
          } else {
            // Estado intermediario: atualiza o rotulo de loading com o estado
            // corrente do job.
            loadingMessage.content = `Processando ${taskName}… (${job.status})`;
          }
        },
        error: (err: unknown) => {
          this.applyError(loadingMessage, err);
        }
      });
  }

  // Rotulo amigavel do agente usado numa resposta, para compor o rodape.
  public taskLabel(task: AiTaskId): string {
    return this.taskOptions.find(o => o.id === task)?.label ?? task;
  }

  // Mostra ocrPages apenas quando a task foi de extracao de documento e > 0.
  public showsOcrPages(meta: AiResponseMeta): boolean {
    return meta.task === 'DOCUMENT_EXTRACTION' && meta.ocrPages > 0;
  }

  private scrollToBottom(): void {
    try {
      const element = this.messagesContainer?.nativeElement;
      if (element) {
        element.scrollTop = element.scrollHeight;
      }
    } catch {
      /* ignore scroll errors */
    }
  }

  private focusInput(): void {
    // Devolve o foco ao campo de entrada (Req 11.3) apos enviar uma mensagem
    // ou acionar uma quick action. Prefere a referencia direta do ViewChild e
    // recorre a busca no DOM como fallback.
    setTimeout(() => {
      try {
        const direct = this.messageInput?.nativeElement;
        if (direct) {
          direct.focus();
          return;
        }
        const input = this.messagesContainer?.nativeElement
          ?.closest('.chat-card')
          ?.querySelector('.input-field input') as HTMLInputElement | null;
        input?.focus();
      } catch {
        /* ignore focus errors */
      }
    }, 0);
  }

  public trackByMessage(index: number, message: ChatMessage): string {
    return message.id;
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}
