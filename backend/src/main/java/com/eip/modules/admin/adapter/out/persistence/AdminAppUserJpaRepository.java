package com.eip.modules.admin.adapter.out.persistence;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

/** Admin repository for {@link AdminAppUserEntity}. Identity table (not RLS-scoped). */
public interface AdminAppUserJpaRepository extends JpaRepository<AdminAppUserEntity, UUID> {
    Optional<AdminAppUserEntity> findByEmail(String email);
    Optional<AdminAppUserEntity> findByCpfLookupHash(String cpfLookupHash);
}