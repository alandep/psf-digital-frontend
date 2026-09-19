package com.eip.platform.error;

import java.util.List;
import java.util.UUID;

import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import lombok.extern.slf4j.Slf4j;

/**
 * Translates exceptions into a consistent {@link ApiError} payload with the
 * appropriate HTTP status. Server-side (5xx) failures are logged; client-side
 * (4xx) failures are not, to keep logs signal-rich. Stack traces are never
 * leaked to clients.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final String MDC_CORRELATION_ID = "correlationId";

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex) {
        List<ApiError.FieldError> fieldErrors = ex.getBindingResult().getFieldErrors().stream()
                .map(GlobalExceptionHandler::toFieldError)
                .toList();
        ApiError body = ApiError.of("VALIDATION_ERROR",
                "Falha de validacao dos dados enviados", correlationId(), fieldErrors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(ResourceNotFoundException ex) {
        return domain(HttpStatus.NOT_FOUND, ex);
    }

    @ExceptionHandler(ConcurrentModificationConflictException.class)
    public ResponseEntity<ApiError> handleConflict(ConcurrentModificationConflictException ex) {
        return domain(HttpStatus.CONFLICT, ex);
    }

    @ExceptionHandler(IdempotencyKeyReuseException.class)
    public ResponseEntity<ApiError> handleIdempotencyReuse(IdempotencyKeyReuseException ex) {
        return domain(HttpStatus.CONFLICT, ex);
    }

    @ExceptionHandler(BusinessRuleException.class)
    public ResponseEntity<ApiError> handleBusinessRule(BusinessRuleException ex) {
        return domain(HttpStatus.UNPROCESSABLE_ENTITY, ex);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiError> handleAccessDenied(AccessDeniedException ex) {
        ApiError body = ApiError.of("ACCESS_DENIED", "Acesso negado", correlationId());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGeneric(Exception ex) {
        String correlationId = correlationId();
        log.error("Erro interno nao tratado [correlationId={}]", correlationId, ex);
        ApiError body = ApiError.of("INTERNAL_ERROR",
                "Ocorreu um erro interno. Contate o suporte informando o correlationId.",
                correlationId);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }

    private ResponseEntity<ApiError> domain(HttpStatus status, DomainException ex) {
        ApiError body = ApiError.of(ex.getCode(), ex.getMessage(), correlationId());
        return ResponseEntity.status(status).body(body);
    }

    private static ApiError.FieldError toFieldError(FieldError fieldError) {
        String code = fieldError.getCode() != null ? fieldError.getCode() : "INVALID";
        return new ApiError.FieldError(fieldError.getField(), code);
    }

    private static String correlationId() {
        String correlationId = MDC.get(MDC_CORRELATION_ID);
        return correlationId != null ? correlationId : UUID.randomUUID().toString();
    }
}
