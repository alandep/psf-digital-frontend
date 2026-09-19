package com.eip.modules.ai.application;

import com.eip.platform.error.DomainException;

/**
 * Raised when the tenant's AI/OCR franquia is exhausted. Mapped to HTTP 402 by
 * {@link AiExceptionHandler} so the front can prompt "Comprar creditos de IA".
 */
public class AiQuotaExceededException extends DomainException {

    public static final String CODE = "AI_QUOTA_EXCEEDED";

    public AiQuotaExceededException(String message) {
        super(CODE, message);
    }
}
