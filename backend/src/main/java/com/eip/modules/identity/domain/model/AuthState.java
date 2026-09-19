package com.eip.modules.identity.domain.model;

/**
 * Steps of the stepped authentication flow, matching the Angular front's
 * {@code authFlowMockService} sequence: identify &rarr; password &rarr; MFA
 * &rarr; organization selection &rarr; authenticated.
 */
public enum AuthState {
    IDENTIFICATION_REQUIRED,
    PASSWORD_REQUIRED,
    MFA_REQUIRED,
    ORGANIZATION_SELECTION_REQUIRED,
    AUTHENTICATED,
    ACCOUNT_LOCKED
}
