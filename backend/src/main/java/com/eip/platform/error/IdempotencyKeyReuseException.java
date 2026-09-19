package com.eip.platform.error;

/**
 * Raised when an idempotency key is reused with a different request payload,
 * indicating a client error. Maps to HTTP 409.
 */
public class IdempotencyKeyReuseException extends DomainException {

    public static final String DEFAULT_CODE = "IDEMPOTENCY_KEY_REUSED";

    public IdempotencyKeyReuseException(String message) {
        super(DEFAULT_CODE, message);
    }
}
