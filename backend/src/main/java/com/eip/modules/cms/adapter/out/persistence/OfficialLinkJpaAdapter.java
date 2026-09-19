package com.eip.modules.cms.adapter.out.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Component;

import com.eip.modules.cms.domain.model.OfficialLink;
import com.eip.modules.cms.domain.port.out.OfficialLinkRepositoryPort;

import lombok.RequiredArgsConstructor;

/**
 * Persistence adapter implementing {@link OfficialLinkRepositoryPort} over JPA.
 */
@Component
@RequiredArgsConstructor
public class OfficialLinkJpaAdapter implements OfficialLinkRepositoryPort {

    private final OfficialLinkJpaRepository jpa;
    private final OfficialLinkMapper mapper;

    @Override
    public List<OfficialLink> listActive() {
        return jpa.findByActiveTrueOrderByDisplayOrder().stream().map(mapper::toDomain).toList();
    }

    @Override
    public Optional<OfficialLink> findById(UUID id) {
        return jpa.findById(id).map(mapper::toDomain);
    }

    @Override
    public OfficialLink save(OfficialLink link) {
        OfficialLinkEntity existing = jpa.findById(link.id()).orElse(null);
        OfficialLinkEntity entity = mapper.toEntity(link, existing);
        return mapper.toDomain(jpa.saveAndFlush(entity));
    }
}
