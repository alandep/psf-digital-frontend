package com.eip.modules.ai.application.reconciliation;

/**
 * Resultado da extração de um único documento, modelando a reconciliação parcial.
 *
 * <p>Cada documento ({@code pedido|packing|invoice}) tem um resultado independente, de modo
 * que a falha de um não aborta os demais. Invariantes de conteúdo:</p>
 *
 * <ul>
 *   <li>{@code status == OK} ⟹ {@code dto != null} (payload presente).</li>
 *   <li>{@code status == FAILED} ⟹ {@code failureKind != null} (causa classificada).</li>
 * </ul>
 *
 * <p>O campo {@code failureDetail} é uma mensagem legível e <strong>redigida</strong> —
 * nunca contém o texto integral do documento nem dados sensíveis.</p>
 *
 * @param <T>           tipo do DTO extraído
 * @param kind          tipo do documento
 * @param status        status de extração (OK/FAILED)
 * @param dto           DTO extraído — presente apenas quando {@code status == OK}
 * @param failureKind   classificação da falha — presente apenas quando {@code status == FAILED}
 * @param failureDetail mensagem legível e redigida (sem conteúdo integral do documento)
 */
public record DocumentExtractionResult<T>(
        DocKind kind,
        DocExtractionStatus status,
        T dto,
        com.eip.modules.ai.domain.error.AiResponseException.Kind failureKind,
        String failureDetail) {

    /**
     * Resultado bem-sucedido.
     *
     * @param kind tipo do documento
     * @param dto  DTO extraído (não-nulo)
     * @return resultado com {@code status == OK}
     */
    public static <T> DocumentExtractionResult<T> ok(DocKind kind, T dto) {
        return new DocumentExtractionResult<>(kind, DocExtractionStatus.OK, dto, null, null);
    }

    /**
     * Resultado de falha.
     *
     * @param kind          tipo do documento
     * @param failureKind   classificação da falha (não-nulo)
     * @param failureDetail mensagem legível e redigida
     * @return resultado com {@code status == FAILED}
     */
    public static <T> DocumentExtractionResult<T> failed(DocKind kind,
            com.eip.modules.ai.domain.error.AiResponseException.Kind failureKind, String failureDetail) {
        return new DocumentExtractionResult<>(kind, DocExtractionStatus.FAILED, null, failureKind, failureDetail);
    }

    /** @return {@code true} quando o status é {@link DocExtractionStatus#OK}. */
    public boolean isOk() {
        return status == DocExtractionStatus.OK;
    }
}
