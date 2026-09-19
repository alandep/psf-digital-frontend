package com.eip.modules.identity.adapter.out.persistence;

import java.util.Optional;

import org.springframework.stereotype.Component;

import com.eip.modules.identity.domain.model.AppUser;
import com.eip.modules.identity.domain.port.out.UserRepositoryPort;

import lombok.RequiredArgsConstructor;

/**
 * Persistence adapter implementing {@link UserRepositoryPort} over JPA. Maps
 * {@link AppUserEntity} rows to the {@link AppUser} domain record.
 */
@Component
@RequiredArgsConstructor
public class UserRepositoryJpaAdapter implements UserRepositoryPort {

    private final AppUserJpaRepository jpa;

    @Override
    public Optional<AppUser> findByEmail(String email) {
        return jpa.findByEmail(email).map(this::toDomain);
    }

    @Override
    public Optional<AppUser> findByCpfLookupHash(String hash) {
        return jpa.findByCpfLookupHash(hash).map(this::toDomain);
    }

    private AppUser toDomain(AppUserEntity entity) {
        return new AppUser(
                entity.getId(),
                entity.getName(),
                entity.getEmail(),
                entity.getCpfLookupHash());
    }
}
