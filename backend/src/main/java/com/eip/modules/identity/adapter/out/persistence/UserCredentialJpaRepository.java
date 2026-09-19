package com.eip.modules.identity.adapter.out.persistence;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Spring Data JPA repository for {@link UserCredentialEntity}, keyed by user id.
 */
public interface UserCredentialJpaRepository extends JpaRepository<UserCredentialEntity, UUID> {
}
