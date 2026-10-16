package com.eip.modules.ai.domain.port.in;

import java.util.List;

/**
 * Porta de entrada para a extração estruturada de documentos via OCR multimodal.
 *
 * <p>Lê o binário diretamente do object storage (por {@code storageKey}/{@code gs://}),
 * executa o OCR via Gemini multimodal (Vertex no profile {@code cloud}; mock caso
 * contrário), valida a extração, calcula o score de completude e detecta
 * discrepâncias — tudo medido no ledger de uso de IA (Requisitos 17.3, 17.4,
 * 17.6, 17.7, 17.9).
 */
public interface OcrExtractionUseCase {

    /**
     * Extrai os campos estruturados do documento referenciado pelo comando.
     *
     * @param cmd o comando de OCR (referência de storage, tipo de mídia, tipo de documento)
     * @return a visão da extração com DTO estruturado, score de completude,
     *         discrepâncias, sinalização de revisão e telemetria do provedor
     */
    OcrExtractionView extract(OcrCommand cmd);

    /**
     * Comando de OCR: identifica o binário no object storage e o tipo de documento esperado.
     *
     * @param storageKey a referência do objeto no storage (ex.: {@code gs://bucket/key})
     * @param mediaType  o MIME type do binário (ex.: {@code application/pdf})
     * @param docKind    o tipo de documento esperado (ex.: {@code COMMERCIAL_INVOICE})
     */
    record OcrCommand(String storageKey, String mediaType, String docKind) {}

    /**
     * Visão do resultado da extração de OCR.
     *
     * @param docKind          o tipo de documento processado
     * @param extraction       o DTO estruturado validado (ex.: {@code CommercialInvoiceDto})
     * @param completenessScore o score de completude (0..100)
     * @param discrepancies    divergências detectadas na extração
     * @param needsReview      indica se o resultado exige revisão humana ({@code score < 70})
     * @param provider         o provedor que atendeu a chamada
     * @param model            o modelo que atendeu a chamada
     * @param ocrPages         o número de páginas processadas pelo OCR
     */
    record OcrExtractionView(
            String docKind,
            Object extraction,
            int completenessScore,
            List<String> discrepancies,
            boolean needsReview,
            String provider,
            String model,
            int ocrPages) {}
}
