package com.eip.modules.logistics.domain.model;

/**
 * Lifecycle state of an {@link Embarque} aggregate.
 */
public enum EmbarqueStatus {
    PLANEJADO,
    EM_TRANSITO,
    ENTREGUE,
    CANCELADO
}
