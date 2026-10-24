package com.eip.modules.identity.adapter.out.persistence;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Spring Data JPA repository for {@link AppUserEntity}.
 */
public interface AppUserJpaRepository extends JpaRepository<AppUserEntity, UUID> {

    Optional<AppUserEntity> findByEmail(String email);

    // May match more than one user (a CPF can belong to more than one account/org);
    // return the most recent to avoid NonUniqueResult and land on the just-created account.
    Optional<AppUserEntity> findFirstByCpfLookupHashOrderByCreatedAtDesc(String cpfLookupHash);
}
