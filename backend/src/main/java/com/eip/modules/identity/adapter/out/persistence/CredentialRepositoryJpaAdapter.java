package com.eip.modules.identity.adapter.out.persistence;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.eip.modules.identity.domain.model.UserCredential;
import com.eip.modules.identity.domain.port.out.CredentialRepositoryPort;

import lombok.RequiredArgsConstructor;

/**
 * Persistence adapter implementing {@link CredentialRepositoryPort} over JPA.
 * Maps {@link UserCredentialEntity} rows to the {@link UserCredential} domain
 * record and maintains the brute-force counters / lockout.
 */
@Component
@RequiredArgsConstructor
public class CredentialRepositoryJpaAdapter implements CredentialRepositoryPort {

    private final UserCredentialJpaRepository jpa;

    @Override
    @Transactional(readOnly = true)
    public Optional<UserCredential> findByUserId(UUID userId) {
        return jpa.findById(userId).map(this::toDomain);
    }

    @Override
    @Transactional
    public int registerFailedAttempt(UUID userId, int maxAttempts, int lockMinutes) {
        UserCredentialEntity entity = jpa.lockByUserId(userId).orElse(null);
        if (entity == null) {
            return maxAttempts;
        }
        OffsetDateTime now = now();
        int attempts = entity.getFailedAttempts() + 1;
        entity.setUpdatedAt(now);
        if (attempts >= maxAttempts) {
            entity.setFailedAttempts(0);
            entity.setLockedUntil(now.plusMinutes(lockMinutes));
            return 0;
        }
        entity.setFailedAttempts(attempts);
        return maxAttempts - attempts;
    }

    @Override
    @Transactional
    public void clearFailedAttempts(UUID userId) {
        jpa.findById(userId).ifPresent(entity -> {
            entity.setFailedAttempts(0);
            entity.setLockedUntil(null);
            entity.setUpdatedAt(now());
        });
    }

    @Override
    @Transactional
    public void changePassword(UUID userId, String newHash) {
        UserCredentialEntity entity = jpa.findById(userId).orElseGet(() -> {
            UserCredentialEntity created = new UserCredentialEntity();
            created.setUserId(userId);
            return created;
        });
        OffsetDateTime now = now();
        entity.setPasswordHash(newHash);
        entity.setPasswordChangedAt(now);
        entity.setMustChangePassword(false);
        entity.setFailedAttempts(0);
        entity.setLockedUntil(null);
        entity.setUpdatedAt(now);
        jpa.save(entity);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<OffsetDateTime> passwordChangedAt(UUID userId) {
        return jpa.findById(userId).map(UserCredentialEntity::getPasswordChangedAt);
    }

    private UserCredential toDomain(UserCredentialEntity entity) {
        return new UserCredential(
                entity.getUserId(),
                entity.getPasswordHash(),
                entity.isMustChangePassword(),
                entity.getLockedUntil(),
                entity.getFailedAttempts());
    }

    private static OffsetDateTime now() {
        return OffsetDateTime.now(ZoneOffset.UTC);
    }
}
