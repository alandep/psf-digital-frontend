package com.eip.modules.identity.adapter.out.persistence;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Spring Data JPA repository for {@link AppUserEntity}.
 */
public interface AppUserJpaRepository extends JpaRepository<AppUserEntity, UUID> {

    Optional<AppUserEntity> findByEmail(String email);

    Optional<AppUserEntity> findByCpfLookupHash(String cpfLookupHash);
}
