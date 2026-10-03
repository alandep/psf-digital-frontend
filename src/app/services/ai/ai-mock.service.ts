import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { IAiService } from './ai-service.interface';
import {
  AiAnalyzeRequest,
  AiAnalysisResult,
  AiReconcileRequest,
  AiReconciliationResult
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
}
