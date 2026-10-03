package com.eip.modules.ai.application.reconciliation;

/**
 * Status de extração de um único documento no fluxo de reconciliação parcial.
 *
 * <ul>
 *   <li>{@link #OK} — o documento foi extraído e validado com sucesso (DTO presente).</li>
 *   <li>{@link #FAILED} — a extração falhou por conteúdo/validação (causa registrada).</li>
 * </ul>
 */
public enum DocExtractionStatus {
    OK,
    FAILED
}
