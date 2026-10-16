package com.eip.modules.admin.adapter.out.persistence;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

/** Admin repository for {@link AdminOrganizationEntity}. Identity table (not RLS-scoped): sees all tenants. */
public interface AdminOrganizationJpaRepository extends JpaRepository<AdminOrganizationEntity, UUID> {
}