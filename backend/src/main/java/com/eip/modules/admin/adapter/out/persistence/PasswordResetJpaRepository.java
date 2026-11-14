package com.eip.modules.admin.adapter.out.persistence;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

/** Admin repository for {@link PasswordResetEntity} (activation / reset tokens). */
public interface PasswordResetJpaRepository extends JpaRepository<PasswordResetEntity, UUID> {

    Optional<PasswordResetEntity> findByTokenHash(String tokenHash);

    long countByUserIdAndCreatedAtAfter(UUID userId, OffsetDateTime after);

    List<PasswordResetEntity> findByUserIdAndUsedAtIsNull(UUID userId);
}
