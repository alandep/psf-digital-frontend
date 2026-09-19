package com.eip.platform.error;

/**
 * Raised when a requested resource does not exist (or is not visible to the
 * current tenant). Maps to HTTP 404.
 */
public class ResourceNotFoundException extends DomainException {

    public static final String DEFAULT_CODE = "RESOURCE_NOT_FOUND";

    public ResourceNotFoundException(String message) {
        super(DEFAULT_CODE, message);
    }

    public ResourceNotFoundException(String code, String message) {
        super(code, message);
    }
}
