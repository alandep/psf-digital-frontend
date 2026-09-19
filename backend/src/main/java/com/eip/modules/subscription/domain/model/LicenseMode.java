package com.eip.modules.subscription.domain.model;

/**
 * Domain-level license mode derived from a subscription's status. Mirrors the
 * platform {@code LicenseGate.LicenseMode} but keeps the domain pure (no
 * dependency on the security package).
 */
public enum LicenseMode {
    FULL, READ_ONLY, BILLING_ONLY, NONE
}
