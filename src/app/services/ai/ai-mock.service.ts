import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { IAiService } from './ai-service.interface';
import {
  AiAnalyzeRequest,
  AiAnalysisResult,
  AiReconcileRequest,
  AiReconciliationResult,
  AiJobView,
  AiUsageView,
  AiModelRouteView,
  NcmClassifyRequest,
  NcmClassificationResult,
  TransportSimRequest,
  TransportSimResult,
  NlCreateRequest,
  ExportDraft,
  OcrRequest,
  OcrExtractionResult
} from '../../../types/ai-hub';

// Mock adapter: provides deterministic, latency-simulated responses so the AI
// Hub screen works fully offline/demo while environment.realApis.ai === false.
// Mirrors the shape of the real BFF responses exactly.
@Injectable({
  providedIn: 'root'
})
export class AiMockAdapter implements IAiService {
  analisar(req: AiAnalyzeRequest): Observable<AiAnalysisResult> {
    const input = req.input ?? '';
    let output: string;

    if (req.task === 'NCM_CLASSIFICATION') {
      output = '0901.11.10';
    } else if (req.task === 'DOCUMENT_EXTRACTION') {
      output = JSON.stringify(
        {
          invoiceNumber: 'INV-2024-0001',
          issueDate: '2024-05-10',
          seller: 'Cooperativa Exportadora Ltda',
          buyer: 'Global Coffee Importers Inc',
          currency: 'USD',
          items: [
            {
              description: 'Café verde arábica',
              ncm: '0901.11.10',
              quantity: 1000,
              unit: 'KG',
              unitPrice: 4.5,
              total: 4500
            }
          ],
          totalAmount: 4500
        },
        null,
        2
      );
    } else {
      output = 'Resposta (mock)';
    }

    const result: AiAnalysisResult = {
      task: req.task,
      output,
      provider: 'mock',
      model: 'mock-model',
      inputUnits: input.length,
      outputUnits: output.length,
      ocrPages: 0
    };

    return of(result).pipe(delay(600));
  }

  reconciliar(req: AiReconcileRequest): Observable<AiReconciliationResult> {
    const result: AiReconciliationResult = {
      pedido: {
        kind: 'PEDIDO',
        status: 'OK',
        dto: req.pedido,
        failureKind: null,
        failureDetail: null
      },
      packing: {
        kind: 'PACKING',
        status: 'OK',
        dto: req.packing,
        failureKind: null,
        failureDetail: null
      },
      invoice: {
        kind: 'INVOICE',
        status: 'OK',
        dto: req.invoice,
        failureKind: null,
        failureDetail: null
      },
      allExtracted: true,
      reconciliation: {
        pedido: req.pedido,
        packing: req.packing,
        invoice: req.invoice,
        ok: false,
        divergences: [
          'Quantidade do item 1 difere entre pedido (1000 KG) e packing list (980 KG).',
          'Valor total da invoice (USD 4.500,00) nao confere com o pedido (USD 4.410,00).'
        ],
        explanation:
          'Reconciliacao simulada (mock): foram encontradas divergencias de quantidade e de valor total entre os documentos.'
      },
      review: {
        needsReview: true,
        reasons: ['RECONCILIATION_DIVERGENCE'],
        signalSource: 'deterministic'
      }
    };

    return of(result).pipe(delay(800));
  }

  // --- Operações base (Req 8, 4, 5, 10) ---
  // Versão demo-safe das operações expostas pelo HTTP adapter. Todas as
  // respostas são determinísticas e com latência simulada, para que a tela
  // funcione por completo com environment.realApis.ai === false.

  // Análise assíncrona: devolve um job já concluído (sucesso) para que o
  // polling da tela encerre no primeiro ciclo.
  analisarAsync(_req: AiAnalyzeRequest): Observable<AiJobView> {
    const job: AiJobView = { jobId: 'mock-job-1', status: 'SUCCEEDED' };
    return of(job).pipe(delay(400));
  }

  // Status do job: o mock sempre reporta sucesso para o id consultado.
  jobStatus(id: string): Observable<AiJobView> {
    const job: AiJobView = { jobId: id, status: 'SUCCEEDED' };
    return of(job).pipe(delay(300));
  }

  // Uso/quota corrente: linha plausível derivada do ledger (mock).
  uso(): Observable<AiUsageView[]> {
    const usage: AiUsageView[] = [
      { feature: 'AI', label: 'Operações de IA', used: 120, included: 1000, unit: 'req', percent: 12 },
      { feature: 'OCR', label: 'Páginas de OCR', used: 45, included: 500, unit: 'páginas', percent: 9 }
    ];
    return of(usage).pipe(delay(400));
  }

  // Roteamento de modelos por task (mock): tudo apontando para o provedor mock.
  router(): Observable<AiModelRouteView[]> {
    const routes: AiModelRouteView[] = [
      { task: 'CHAT', priority: 'STANDARD', provider: 'mock', model: 'mock-model', enabled: true },
      { task: 'NCM_CLASSIFICATION', priority: 'STANDARD', provider: 'mock', model: 'mock-model', enabled: true },
      { task: 'TRANSPORT_SIMULATION', priority: 'STANDARD', provider: 'mock', model: 'mock-model', enabled: true },
      { task: 'EXPORT_NL_CREATION', priority: 'STANDARD', provider: 'mock', model: 'mock-model', enabled: true },
      { task: 'OCR_DOCUMENT', priority: 'STANDARD', provider: 'mock', model: 'mock-model', enabled: true }
    ];
    return of(routes).pipe(delay(400));
  }

  // --- Capacidades estruturadas (Req 14-17) ---
  // Resultados determinísticos tipados, espelhando o shape dos DTOs do BFF.
  // O front nunca faz JSON.parse: o mock já devolve o objeto final.

  // NCM estruturado (Req 14): classificação determinística (ex.: café verde).
  classificarNcm(_req: NcmClassifyRequest): Observable<NcmClassificationResult> {
    const result: NcmClassificationResult = {
      ncm: '0901.11.10',
      confidence: 0.93,
      rationale: 'Café não torrado, não descafeinado.',
      alternatives: [
        { ncm: '0901.21.00', confidence: 0.4, reason: 'Se torrado' }
      ]
    };
    return of(result).pipe(delay(600));
  }

  // Simulação de transporte (Req 15): recomendação determinística para a rota.
  simularTransporte(_req: TransportSimRequest): Observable<TransportSimResult> {
    const result: TransportSimResult = {
      carrier: 'Transportadora Mock',
      modal: 'Rodoviário',
      route: 'Rondonópolis → Santos',
      rationale: 'Melhor custo/prazo para a rota.',
      estimatedTransitDays: 4,
      estimatedCost: 12500
    };
    return of(result).pipe(delay(700));
  }

  // Criação por linguagem natural (Req 16): rascunho determinístico derivado
  // de forma plausível a partir do comando informado.
  criarPorLinguagemNatural(req: NlCreateRequest): Observable<ExportDraft> {
    const command = req?.command ?? '';
    const result: ExportDraft = {
      incoterm: 'FOB',
      origin: 'Rondonópolis - MT',
      destination: 'Hamburgo - Alemanha',
      product: 'Café verde arábica',
      ncm: '0901.11.10',
      quantity: 1000,
      unit: 'KG',
      notes: command
        ? `Rascunho gerado (mock) a partir do comando: "${command}".`
        : 'Rascunho gerado (mock).'
    };
    return of(result).pipe(delay(700));
  }

  // OCR Upload multimodal (Req 17): extração determinística. Por padrão o
  // documento vem completo (completenessScore 85, needsReview false); se o
  // score cair abaixo do limiar (70), a UI deve sinalizar revisão humana.
  ocr(req: OcrRequest): Observable<OcrExtractionResult> {
    const completenessScore = 85;
    const threshold = 70;
    const needsReview = completenessScore < threshold;
    const result: OcrExtractionResult = {
      docKind: req?.docKind ?? 'INVOICE',
      extraction: {
        invoiceNumber: 'INV-2024-0001',
        issueDate: '2024-05-10',
        seller: 'Cooperativa Exportadora Ltda',
        buyer: 'Global Coffee Importers Inc',
        currency: 'USD',
        netWeightKg: 1000,
        grossWeightKg: 1020,
        items: [
          {
            description: 'Café verde arábica',
            ncm: '0901.11.10',
            quantity: 1000,
            unit: 'KG',
            unitPrice: 4.5,
            total: 4500
          }
        ],
        totalAmount: 4500
      },
      completenessScore,
      discrepancies: [
        'Peso líquido do packing list (980 KG) difere do peso informado na invoice (1000 KG).'
      ],
      needsReview,
      provider: 'mock',
      model: 'mock-model',
      ocrPages: 2
    };
    return of(result).pipe(delay(900));
  }

  // OCR Upload multimodal (Req 17): no modo demo delega para o ocr() existente,
  // derivando a OcrRequest a partir do File informado, de modo que o caminho de
  // upload direto também funcione offline/demo.
  ocrUpload(file: File, docKind: string): Observable<OcrExtractionResult> {
    return this.ocr({
      storageKey: 'mock://' + (file?.name ?? 'documento'),
      mediaType: file?.type ?? 'application/pdf',
      docKind
    });
  }
}
