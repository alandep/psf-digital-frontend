package com.eip.modules.admin.adapter.out.persistence;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

/** Admin repository for {@link AdminUserCredentialEntity}, keyed by user id. */
public interface AdminUserCredentialJpaRepository extends JpaRepository<AdminUserCredentialEntity, UUID> {
}