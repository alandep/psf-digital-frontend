package com.eip.modules.ai.application;

import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.eip.platform.error.ApiError;

/**
 * AI-module advice mapping {@link AiQuotaExceededException} to HTTP 402
 * (Payment Required), which the front interprets as "Comprar creditos de IA".
 * Other exceptions fall through to the platform GlobalExceptionHandler.
 */
@RestControllerAdvice(basePackages = "com.eip.modules.ai")
public class AiExceptionHandler {

    private static final String MDC_CORRELATION_ID = "correlationId";

    @ExceptionHandler(AiQuotaExceededException.class)
    public ResponseEntity<ApiError> handleQuotaExceeded(AiQuotaExceededException ex) {
        ApiError body = ApiError.of(ex.getCode(), ex.getMessage(), correlationId());
        return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED).body(body);
    }

    private static String correlationId() {
        String correlationId = MDC.get(MDC_CORRELATION_ID);
        return correlationId != null ? correlationId : "";
    }
}
