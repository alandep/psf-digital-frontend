package com.eip.modules.crm.adapter.out.persistence;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Component;

import com.eip.modules.crm.domain.model.Lead;
import com.eip.modules.crm.domain.port.out.LeadRepositoryPort;
import com.eip.platform.error.ConcurrentModificationConflictException;

import lombok.RequiredArgsConstructor;

/**
 * Persistence adapter implementing {@link LeadRepositoryPort} over JPA.
 */
@Component
@RequiredArgsConstructor
public class LeadJpaAdapter implements LeadRepositoryPort {

    private final LeadJpaRepository jpa;
    private final LeadMapper mapper;

    @Override
    public Lead salvar(Lead l) {
        try {
            LeadEntity existing = jpa
                    .findByIdAndOrganizationId(l.id().value(), l.organizationId())
                    .orElse(null);
            LeadEntity entity = mapper.toEntity(l, existing);
            LeadEntity saved = jpa.saveAndFlush(entity);
            return mapper.toDomain(saved);
        } catch (ObjectOptimisticLockingFailureException ex) {
            throw new ConcurrentModificationConflictException(
                    "Lead modificado concorrentemente: " + l.id().asString(), ex);
        }
    }

    @Override
    public Optional<Lead> porId(UUID id, UUID org) {
        return jpa.findByIdAndOrganizationId(id, org).map(mapper::toDomain);
    }

    @Override
    public List<Lead> listar(UUID org, String status, String source) {
        boolean hasStatus = status != null && !status.isBlank();
        boolean hasSource = source != null && !source.isBlank();
        List<LeadEntity> rows;
        if (hasStatus && hasSource) {
            rows = jpa.findByOrganizationIdAndStatusAndSource(org, status, source);
        } else if (hasStatus) {
            rows = jpa.findByOrganizationIdAndStatus(org, status);
        } else if (hasSource) {
            rows = jpa.findByOrganizationIdAndSource(org, source);
        } else {
            rows = jpa.findByOrganizationId(org);
        }
        return rows.stream().map(mapper::toDomain).toList();
    }

    @Override
    public Map<String, Long> countByStatus(UUID org) {
        // Simplest correct approach: list all org leads and group in Java.
        // Acceptable given expected lead volumes; can be replaced with a
        // grouped count query if it ever becomes a hotspot.
        return jpa.findByOrganizationId(org).stream()
                .collect(Collectors.groupingBy(LeadEntity::getStatus, Collectors.counting()));
    }
}
