package com.eip.platform.error;

/**
 * Raised when a business rule / invariant is violated. Maps to HTTP 422.
 */
public class BusinessRuleException extends DomainException {

    public static final String DEFAULT_CODE = "BUSINESS_RULE_VIOLATION";

    public BusinessRuleException(String message) {
        super(DEFAULT_CODE, message);
    }

    public BusinessRuleException(String code, String message) {
        super(code, message);
    }
}
