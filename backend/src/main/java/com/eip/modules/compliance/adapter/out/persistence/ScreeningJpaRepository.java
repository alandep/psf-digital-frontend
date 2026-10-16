package com.eip.modules.compliance.adapter.out.persistence;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * Spring Data JPA repository for {@link ScreeningEntity}.
 */
public interface ScreeningJpaRepository extends JpaRepository<ScreeningEntity, UUID> {

    Optional<ScreeningEntity> findByIdAndOrganizationId(UUID id, UUID organizationId);

    List<ScreeningEntity> findByOrganizationId(UUID organizationId);

    List<ScreeningEntity> findByOrganizationIdAndStatus(UUID organizationId, String status);

    /**
     * Counts compliance alerts for a tenant via aggregation pushdown ({@code COUNT}
     * runs in the database, no rows are materialized).
     *
     * <p>A row is an alert when its status is pending / under analysis
     * ({@code PENDENTE} or {@code EM_ANALISE}) OR its risk level is high
     * ({@code ALTO} or {@code CRITICO}). The optional window {@code [from, to)}
     * filters by {@code created_at} ({@code from}/{@code to} may be {@code null}
     * for no bound). Scoped to {@code organizationId}; RLS further restricts rows
     * to the current tenant.
     */
    @Query("""
            select count(s) from ScreeningEntity s
            where s.organizationId = :organizationId
              and (s.status in ('PENDENTE', 'EM_ANALISE')
                   or s.riskLevel in ('ALTO', 'CRITICO'))
              and (cast(:from as timestamp) is null or s.createdAt >= :from)
              and (cast(:to as timestamp) is null or s.createdAt < :to)
            """)
    long countAlertas(@Param("organizationId") UUID organizationId,
                      @Param("from") OffsetDateTime from,
                      @Param("to") OffsetDateTime to);
}
