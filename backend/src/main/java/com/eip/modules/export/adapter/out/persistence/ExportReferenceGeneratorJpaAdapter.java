package com.eip.modules.export.adapter.out.persistence;

import java.time.Year;
import java.util.UUID;

import org.springframework.stereotype.Component;

import com.eip.modules.export.domain.port.out.ExportReferenceGenerator;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

/**
 * Native-SQL adapter that allocates the next per-tenant, per-year export
 * reference in the form {@code EXP-YYYY-NNNN}.
 *
 * <p>The counter lives in {@code export_reference_sequence}, keyed by
 * {@code (organization_id, year)}. Allocation is a single atomic
 * {@code INSERT ... ON CONFLICT (organization_id, year) DO UPDATE SET
 * last_value = last_value + 1 RETURNING last_value}: the first allocation of a
 * given year inserts a row with {@code last_value = 1}, and every subsequent
 * allocation takes the row lock implied by the conflicting upsert and bumps the
 * counter by one. Because the increment happens inside the single statement,
 * concurrent transactions are serialized by the row lock and can never observe
 * or produce a duplicate value.
 *
 * <p>The upsert runs within the caller's transaction (e.g.
 * {@code ExportacaoService.criar}, which is {@code @Transactional}), so the
 * {@code app.current_organization} RLS setting is already in effect and the
 * row is scoped to the tenant by the {@code export_reference_sequence_isolation}
 * policy.
 */
@Component
public class ExportReferenceGeneratorJpaAdapter implements ExportReferenceGenerator {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public String next(UUID organizationId) {
        int year = Year.now().getValue();
        String sql = "INSERT INTO export_reference_sequence (organization_id, year, last_value) "
                + "VALUES (?1, ?2, 1) "
                + "ON CONFLICT (organization_id, year) "
                + "DO UPDATE SET last_value = export_reference_sequence.last_value + 1 "
                + "RETURNING last_value";
        Object result = entityManager.createNativeQuery(sql)
                .setParameter(1, organizationId)
                .setParameter(2, year)
                .getSingleResult();
        long seq = ((Number) result).longValue();
        return String.format("EXP-%d-%04d", year, seq);
    }
}
