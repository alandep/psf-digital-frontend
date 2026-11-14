package com.eip.modules.identity.adapter.out.persistence;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;

/**
 * Spring Data JPA repository for {@link UserCredentialEntity}, keyed by user id.
 */
public interface UserCredentialJpaRepository extends JpaRepository<UserCredentialEntity, UUID> {

    /** Loads the credential with a row lock (serializes failed-attempt counting). */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from UserCredentialEntity c where c.userId = :userId")
    Optional<UserCredentialEntity> lockByUserId(@Param("userId") UUID userId);
}
