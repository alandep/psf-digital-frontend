package com.eip.platform.error;

import java.util.List;

/**
 * Standard error payload returned by the API for every non-2xx response.
 *
 * @param code          a stable, machine-readable error code
 * @param message       a human-readable description
 * @param correlationId the request correlation id, for log/trace lookup
 * @param errors        field-level validation errors (may be {@code null}/empty)
 */
public record ApiError(String code, String message, String correlationId, List<FieldError> errors) {

    /** A single field-level validation error. */
    public record FieldError(String field, String code) {
    }

    public static ApiError of(String code, String message, String correlationId) {
        return new ApiError(code, message, correlationId, List.of());
    }

    public static ApiError of(String code, String message, String correlationId, List<FieldError> errors) {
        return new ApiError(code, message, correlationId, errors);
    }
}
