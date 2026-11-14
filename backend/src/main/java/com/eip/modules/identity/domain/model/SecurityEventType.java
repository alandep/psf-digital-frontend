package com.eip.modules.identity.domain.model;

/**
 * Codes of the security events persisted in {@code security_event.type}.
 * Kept as plain strings so other modules (e.g. admin) can record their own.
 */
public final class SecurityEventType {

    public static final String LOGIN_SUCCEEDED = "LOGIN_SUCCEEDED";
    public static final String LOGIN_FAILED = "LOGIN_FAILED";
    public static final String ACCOUNT_LOCKED = "ACCOUNT_LOCKED";
    public static final String MFA_SUCCEEDED = "MFA_SUCCEEDED";
    public static final String MFA_FAILED = "MFA_FAILED";
    public static final String MFA_EMAIL_SENT = "MFA_EMAIL_SENT";
    public static final String RECOVERY_CODE_USED = "RECOVERY_CODE_USED";
    public static final String MFA_ENABLED = "MFA_ENABLED";
    public static final String MFA_DISABLED = "MFA_DISABLED";
    public static final String MFA_RESET_BY_ADMIN = "MFA_RESET_BY_ADMIN";
    public static final String RECOVERY_CODES_REGENERATED = "RECOVERY_CODES_REGENERATED";
    public static final String PASSWORD_CHANGED = "PASSWORD_CHANGED";
    public static final String PASSWORD_RESET_REQUESTED = "PASSWORD_RESET_REQUESTED";
    public static final String SESSION_REVOKED = "SESSION_REVOKED";
    public static final String LOGOUT = "LOGOUT";

    private SecurityEventType() {
    }
}
