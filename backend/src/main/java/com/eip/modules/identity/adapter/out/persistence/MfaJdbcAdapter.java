package com.eip.modules.identity.adapter.out.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.core.namedparam.SqlParameterSource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.eip.modules.identity.domain.model.TotpFactor;
import com.eip.modules.identity.domain.port.out.MfaRepositoryPort;

/**
 * JDBC adapter for {@code mfa_method} (one TOTP row per user) and
 * {@code mfa_recovery_code}. Plain SQL avoids coupling these tables to the
 * Hibernate schema validation.
 */
@Component
public class MfaJdbcAdapter implements MfaRepositoryPort {

    private static final String TOTP = "TOTP";
    private static final String ACTIVE = "ACTIVE";
    private static final String PENDING = "PENDING";

    private final NamedParameterJdbcTemplate jdbc;

    public MfaJdbcAdapter(JdbcTemplate jdbcTemplate) {
        this.jdbc = new NamedParameterJdbcTemplate(jdbcTemplate);
    }

    @Override
    public Optional<TotpFactor> findTotp(UUID userId) {
        List<TotpFactor> rows = jdbc.query("""
                SELECT secret_ciphertext, last_used_step, status
                  FROM mfa_method
                 WHERE user_id = :userId AND type = :type
                """,
                params(userId).addValue("type", TOTP),
                (rs, i) -> new TotpFactor(
                        rs.getString("secret_ciphertext"),
                        rs.getLong("last_used_step"),
                        ACTIVE.equals(rs.getString("status"))));
        return rows.stream().findFirst();
    }

    @Override
    @Transactional
    public void savePending(UUID userId, String secretCiphertext, int keyVersion) {
        MapSqlParameterSource p = params(userId)
                .addValue("type", TOTP)
                .addValue("active", ACTIVE);
        jdbc.update("""
                DELETE FROM mfa_method
                 WHERE user_id = :userId AND type = :type AND status <> :active
                """, p);
        p.addValue("id", UUID.randomUUID())
                .addValue("secret", secretCiphertext)
                .addValue("keyVersion", keyVersion)
                .addValue("pending", PENDING);
        // ON CONFLICT keeps an existing ACTIVE row untouched (unique user_id+type).
        jdbc.update("""
                INSERT INTO mfa_method
                    (id, user_id, type, secret_ciphertext, key_version, status, last_used_step, created_at)
                VALUES (:id, :userId, :type, :secret, :keyVersion, :pending, 0, now())
                ON CONFLICT (user_id, type) DO NOTHING
                """, p);
    }

    @Override
    @Transactional
    public void activate(UUID userId, long step, List<String> recoveryHashes) {
        jdbc.update("""
                UPDATE mfa_method
                   SET status = :active, verified_at = now(), last_used_step = :step
                 WHERE user_id = :userId AND type = :type
                """,
                params(userId)
                        .addValue("active", ACTIVE)
                        .addValue("step", step)
                        .addValue("type", TOTP));
        replaceRecoveryCodes(userId, recoveryHashes);
    }

    @Override
    public void updateLastStep(UUID userId, long step) {
        // Monotonic: never move the replay window backwards.
        jdbc.update("""
                UPDATE mfa_method
                   SET last_used_step = :step
                 WHERE user_id = :userId AND type = :type AND last_used_step < :step
                """,
                params(userId).addValue("step", step).addValue("type", TOTP));
    }

    @Override
    public boolean consumeRecoveryCode(UUID userId, String hash) {
        int updated = jdbc.update("""
                UPDATE mfa_recovery_code
                   SET used_at = now()
                 WHERE user_id = :userId AND code_hash = :hash AND used_at IS NULL
                """,
                params(userId).addValue("hash", hash));
        return updated == 1;
    }

    @Override
    public int remainingRecoveryCodes(UUID userId) {
        Integer count = jdbc.queryForObject("""
                SELECT count(*) FROM mfa_recovery_code
                 WHERE user_id = :userId AND used_at IS NULL
                """,
                params(userId), Integer.class);
        return count == null ? 0 : count;
    }

    @Override
    @Transactional
    public void replaceRecoveryCodes(UUID userId, List<String> hashes) {
        jdbc.update("DELETE FROM mfa_recovery_code WHERE user_id = :userId", params(userId));
        if (hashes == null || hashes.isEmpty()) {
            return;
        }
        SqlParameterSource[] batch = hashes.stream()
                .map(h -> (SqlParameterSource) params(userId)
                        .addValue("id", UUID.randomUUID())
                        .addValue("hash", h))
                .toArray(SqlParameterSource[]::new);
        jdbc.batchUpdate("""
                INSERT INTO mfa_recovery_code (id, user_id, code_hash)
                VALUES (:id, :userId, :hash)
                """, batch);
    }

    @Override
    @Transactional
    public void disable(UUID userId) {
        MapSqlParameterSource p = params(userId).addValue("type", TOTP);
        jdbc.update("DELETE FROM mfa_method WHERE user_id = :userId AND type = :type", p);
        jdbc.update("DELETE FROM mfa_recovery_code WHERE user_id = :userId", p);
    }

    private static MapSqlParameterSource params(UUID userId) {
        return new MapSqlParameterSource("userId", userId);
    }
}
