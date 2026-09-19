package com.eip.platform.error;

/**
 * Base type for all domain / application exceptions carrying a stable error
 * {@code code} that maps to an {@link ApiError#code()} and an HTTP status in the
 * {@link GlobalExceptionHandler}.
 */
public abstract class DomainException extends RuntimeException {

    private final String code;

    protected DomainException(String code, String message) {
        super(message);
        this.code = code;
    }

    protected DomainException(String code, String message, Throwable cause) {
        super(message, cause);
        this.code = code;
    }

    public String getCode() {
        return code;
    }
}
