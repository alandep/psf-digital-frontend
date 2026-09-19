package com.eip.modules.document.adapter.out.persistence;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Spring Data JPA repository for {@link DocumentJobEntity}.
 */
public interface DocumentJobJpaRepository extends JpaRepository<DocumentJobEntity, UUID> {
}
