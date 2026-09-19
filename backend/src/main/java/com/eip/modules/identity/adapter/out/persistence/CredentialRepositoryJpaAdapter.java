package com.eip.modules.identity.adapter.out.persistence;

import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Component;

import com.eip.modules.identity.domain.model.UserCredential;
import com.eip.modules.identity.domain.port.out.CredentialRepositoryPort;

import lombok.RequiredArgsConstructor;

/**
 * Persistence adapter implementing {@link CredentialRepositoryPort} over JPA.
 * Maps {@link UserCredentialEntity} rows to the {@link UserCredential} domain
 * record.
 */
@Component
@RequiredArgsConstructor
public class CredentialRepositoryJpaAdapter implements CredentialRepositoryPort {

    private final UserCredentialJpaRepository jpa;

    @Override
    public Optional<UserCredential> findByUserId(UUID userId) {
        return jpa.findById(userId).map(this::toDomain);
    }

    private UserCredential toDomain(UserCredentialEntity entity) {
        return new UserCredential(
                entity.getUserId(),
                entity.getPasswordHash(),
                entity.isMustChangePassword());
    }
}
