package com.eip.modules.intelligence.adapter.out.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Component;

import com.eip.modules.intelligence.domain.model.IntelligenceAlert;
import com.eip.modules.intelligence.domain.port.out.AlertRepositoryPort;

import lombok.RequiredArgsConstructor;

/**
 * Persistence adapter implementing {@link AlertRepositoryPort} over JPA.
 */
@Component
@RequiredArgsConstructor
public class IntelligenceAlertJpaAdapter implements AlertRepositoryPort {

    private final IntelligenceAlertJpaRepository jpa;
    private final IntelligenceAlertMapper mapper;

    @Override
    public List<IntelligenceAlert> listar(UUID org) {
        return jpa.findByOrganizationIdOrderByCreatedAtDesc(org).stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public Optional<IntelligenceAlert> porId(UUID id, UUID org) {
        return jpa.findByIdAndOrganizationId(id, org).map(mapper::toDomain);
    }

    @Override
    public IntelligenceAlert salvar(IntelligenceAlert a) {
        IntelligenceAlertEntity existing = jpa
                .findByIdAndOrganizationId(a.id(), a.organizationId())
                .orElse(null);
        IntelligenceAlertEntity entity = mapper.toEntity(a, existing);
        return mapper.toDomain(jpa.saveAndFlush(entity));
    }

    @Override
    public long countUnread(UUID org) {
        return jpa.countByOrganizationIdAndReadFalse(org);
    }
}
