package com.eip.modules.identity.domain.port.out;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.eip.modules.identity.domain.model.SecurityEventView;

/**
 * Outbound port: security audit trail and login bookkeeping.
 */
public interface AuthAuditPort {

    /**
     * Appends a security event. Implementations must never throw: auditing
     * failures must not break the authentication flow.
     */
    void recordEvent(UUID userId, UUID organizationId, String type, String ip);

    /**
     * Stamps {@code last_login_at}, increments {@code login_count} and accepts
     * pending invitations (membership {@code PENDING -> ACTIVE}) of the user.
     */
    void recordSuccessfulLogin(UUID userId);

    /** Mirrors the user's MFA state onto all of their memberships. */
    void syncMembershipMfaFlag(UUID userId, boolean enabled);

    /** @return the {@code app_user.status} of the user, if the user exists. */
    Optional<String> accountStatus(UUID userId);

    /** @return the most recent events of the user, newest first. */
    List<SecurityEventView> recentEvents(UUID userId, int limit);
}
