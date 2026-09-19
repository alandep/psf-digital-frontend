package com.eip.modules.cms.adapter.out.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Component;

import com.eip.modules.cms.domain.model.AccessProfile;
import com.eip.modules.cms.domain.port.out.AccessProfileRepositoryPort;
import com.eip.platform.error.ConcurrentModificationConflictException;

import lombok.RequiredArgsConstructor;

/**
 * Persistence adapter implementing {@link AccessProfileRepositoryPort} over JPA.
 * Maps optimistic-lock failures to {@link ConcurrentModificationConflictException}.
 */
@Component
@RequiredArgsConstructor
public class AccessProfileJpaAdapter implements AccessProfileRepositoryPort {

    private final AccessProfileJpaRepository jpa;
    private final AccessProfileMapper mapper;

    @Override
    public AccessProfile salvar(AccessProfile profile) {
        try {
            AccessProfileEntity existing = jpa
                    .findByIdAndOrganizationId(profile.id(), profile.organizationId())
                    .orElse(null);
            AccessProfileEntity entity = mapper.toEntity(profile, existing);
            return mapper.toDomain(jpa.saveAndFlush(entity));
        } catch (ObjectOptimisticLockingFailureException ex) {
            throw new ConcurrentModificationConflictException(
                    "Perfil de acesso modificado concorrentemente: " + profile.id(), ex);
        }
    }

    @Override
    public Optional<AccessProfile> porId(UUID id, UUID org) {
        return jpa.findByIdAndOrganizationId(id, org).map(mapper::toDomain);
    }

    @Override
    public List<AccessProfile> listar(UUID org) {
        return jpa.findByOrganizationId(org).stream().map(mapper::toDomain).toList();
    }

    @Override
    public void remover(UUID id, UUID org) {
        jpa.deleteByIdAndOrganizationId(id, org);
    }
}
