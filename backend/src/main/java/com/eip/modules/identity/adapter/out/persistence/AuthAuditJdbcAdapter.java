package com.eip.modules.identity.adapter.out.persistence;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.eip.modules.identity.domain.model.SecurityEventView;
import com.eip.modules.identity.domain.port.out.AuthAuditPort;

import lombok.extern.slf4j.Slf4j;

/**
 * JDBC adapter for the security audit trail ({@code security_event}) and the
 * login bookkeeping on {@code app_user} / {@code organization_membership}.
 */
@Slf4j
@Component
public class AuthAuditJdbcAdapter implements AuthAuditPort {

    private final NamedParameterJdbcTemplate jdbc;

    public AuthAuditJdbcAdapter(JdbcTemplate jdbcTemplate) {
        this.jdbc = new NamedParameterJdbcTemplate(jdbcTemplate);
    }

    @Override
    public void recordEvent(UUID userId, UUID organizationId, String type, String ip) {
        try {
            jdbc.update("""
                    INSERT INTO security_event (id, user_id, organization_id, type, ip, occurred_at)
                    VALUES (:id, :userId, :orgId, :type, :ip, now())
                    """,
                    new MapSqlParameterSource()
                            .addValue("id", UUID.randomUUID())
                            .addValue("userId", userId)
                            .addValue("orgId", organizationId)
                            .addValue("type", type)
                            .addValue("ip", truncate(ip, 64)));
        } catch (RuntimeException ex) {
            // Auditing must never break the authentication flow.
            log.warn("Falha ao registrar evento de seguranca {}: {}", type, ex.getMessage());
        }
    }

    @Override
    @Transactional
    public void recordSuccessfulLogin(UUID userId) {
        MapSqlParameterSource p = new MapSqlParameterSource("userId", userId);
        jdbc.update("""
                UPDATE app_user
                   SET last_login_at = now(), login_count = login_count + 1
                 WHERE id = :userId
                """, p);
        // First successful login accepts pending invitations.
        jdbc.update("""
                UPDATE organization_membership
                   SET status = 'ACTIVE'
                 WHERE user_id = :userId AND status = 'PENDING'
                """, p);
    }

    @Override
    public void syncMembershipMfaFlag(UUID userId, boolean enabled) {
        jdbc.update("UPDATE organization_membership SET mfa_enabled = :enabled WHERE user_id = :userId",
                new MapSqlParameterSource("userId", userId).addValue("enabled", enabled));
    }

    @Override
    public Optional<String> accountStatus(UUID userId) {
        List<String> rows = jdbc.queryForList("SELECT status FROM app_user WHERE id = :userId",
                new MapSqlParameterSource("userId", userId), String.class);
        return rows.stream().findFirst();
    }

    @Override
    public List<SecurityEventView> recentEvents(UUID userId, int limit) {
        return jdbc.query("""
                SELECT id, type, ip, occurred_at
                  FROM security_event
                 WHERE user_id = :userId
                 ORDER BY occurred_at DESC
                 LIMIT :limit
                """,
                new MapSqlParameterSource("userId", userId).addValue("limit", Math.max(1, limit)),
                (rs, i) -> new SecurityEventView(
                        rs.getObject("id", UUID.class),
                        rs.getString("type"),
                        rs.getString("ip"),
                        rs.getObject("occurred_at", OffsetDateTime.class)));
    }

    private static String truncate(String value, int max) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.length() <= max ? trimmed : trimmed.substring(0, max);
    }
}
