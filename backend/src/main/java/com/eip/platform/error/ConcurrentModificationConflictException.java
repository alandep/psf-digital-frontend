package com.eip.platform.error;

/**
 * Raised on an optimistic-locking / version conflict when concurrent writers
 * modify the same aggregate. Maps to HTTP 409.
 */
public class ConcurrentModificationConflictException extends DomainException {

    public static final String DEFAULT_CODE = "CONCURRENT_MODIFICATION";

    public ConcurrentModificationConflictException(String message) {
        super(DEFAULT_CODE, message);
    }

    public ConcurrentModificationConflictException(String message, Throwable cause) {
        super(DEFAULT_CODE, message, cause);
    }
}
