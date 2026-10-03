package com.eip.modules.ai.application;

import org.slf4j.MDC;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.eip.modules.ai.domain.error.AiDefinitiveProviderException;
import com.eip.modules.ai.domain.error.AiProviderUnavailableException;
import com.eip.modules.ai.domain.error.AiRateLimitedException;
import com.eip.modules.ai.domain.error.AiResponseException;
import com.eip.modules.ai.domain.error.AiTimeoutException;
import com.eip.modules.ai.domain.error.AiTransientProviderException;
import com.eip.platform.error.ApiError;

/**
 * AI-module advice mapping {@link AiQuotaExceededException} to HTTP 402
 * (Payment Required), which the front interprets as "Comprar creditos de IA".
 *
 * <p>Also maps the AI error taxonomy ({@code com.eip.modules.ai.domain.error})
 * to specific HTTP statuses with pt-BR messages, reusing {@link ApiError} and
 * the MDC {@code correlationId}:
 * <ul>
 *   <li>{@link AiTimeoutException} &rarr; 504 {@code AI_TIMEOUT}</li>
 *   <li>{@link AiProviderUnavailableException} &rarr; 503 {@code AI_UNAVAILABLE}</li>
 *   <li>{@link AiRateLimitedException} &rarr; 429 {@code AI_RATE_LIMITED} (+ {@code Retry-After})</li>
 *   <li>{@link AiTransientProviderException} &rarr; 503 {@code AI_PROVIDER_ERROR}</li>
 *   <li>{@link AiDefinitiveProviderException} &rarr; 502 {@code AI_PROVIDER_ERROR}</li>
 *   <li>{@link AiResponseException} &rarr; 422 {@code AI_RESPONSE_INVALID}</li>
 * </ul>
 *
 * <p>Functional failures still fall through to the platform
 * GlobalExceptionHandler (400/422/403/404/500).
 */
@RestControllerAdvice(basePackages = "com.eip.modules.ai")
public class AiExceptionHandler {

    private static final String MDC_CORRELATION_ID = "correlationId";

    @ExceptionHandler(AiQuotaExceededException.class)
    public ResponseEntity<ApiError> handleQuotaExceeded(AiQuotaExceededException ex) {
        ApiError body = ApiError.of(ex.getCode(), ex.getMessage(), correlationId());
        return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED).body(body);
    }

    @ExceptionHandler(AiTimeoutException.class)
    public ResponseEntity<ApiError> handleTimeout(AiTimeoutException ex) {
        ApiError body = ApiError.of(
                "AI_TIMEOUT",
                "O servico de IA demorou mais que o esperado. Tente novamente.",
                correlationId());
        return ResponseEntity.status(HttpStatus.GATEWAY_TIMEOUT).body(body);
    }

    @ExceptionHandler(AiProviderUnavailableException.class)
    public ResponseEntity<ApiError> handleProviderUnavailable(AiProviderUnavailableException ex) {
        ApiError body = ApiError.of(
                "AI_UNAVAILABLE",
                "Servico de IA temporariamente indisponivel. Tente novamente em instantes.",
                correlationId());
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(body);
    }

    @ExceptionHandler(AiRateLimitedException.class)
    public ResponseEntity<ApiError> handleRateLimited(AiRateLimitedException ex) {
        ApiError body = ApiError.of(
                "AI_RATE_LIMITED",
                "Limite de uso de IA atingido. Aguarde e tente novamente.",
                correlationId());
        ResponseEntity.BodyBuilder builder = ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS);
        if (ex.retryAfter() != null) {
            builder = builder.header(HttpHeaders.RETRY_AFTER, String.valueOf(ex.retryAfter().toSeconds()));
        }
        return builder.body(body);
    }

    @ExceptionHandler(AiTransientProviderException.class)
    public ResponseEntity<ApiError> handleTransientProvider(AiTransientProviderException ex) {
        ApiError body = ApiError.of(
                "AI_PROVIDER_ERROR",
                "Falha no provedor de IA. Tente novamente.",
                correlationId());
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(body);
    }

    @ExceptionHandler(AiDefinitiveProviderException.class)
    public ResponseEntity<ApiError> handleDefinitiveProvider(AiDefinitiveProviderException ex) {
        ApiError body = ApiError.of(
                "AI_PROVIDER_ERROR",
                "Falha definitiva no provedor de IA.",
                correlationId());
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(body);
    }

    @ExceptionHandler(AiResponseException.class)
    public ResponseEntity<ApiError> handleResponse(AiResponseException ex) {
        ApiError body = ApiError.of(
                "AI_RESPONSE_INVALID",
                "A resposta da IA foi invalida ou incompleta e nao pode ser usada.",
                correlationId());
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(body);
    }

    private static String correlationId() {
        String correlationId = MDC.get(MDC_CORRELATION_ID);
        return correlationId != null ? correlationId : "";
    }
}
