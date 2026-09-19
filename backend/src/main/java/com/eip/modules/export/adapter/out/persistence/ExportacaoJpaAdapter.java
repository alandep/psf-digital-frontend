package com.eip.modules.export.adapter.out.persistence;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Component;

import com.eip.modules.export.domain.model.Exportacao;
import com.eip.modules.export.domain.port.out.ExportacaoRepositoryPort;
import com.eip.modules.export.domain.port.out.PageResult;
import com.eip.platform.error.ConcurrentModificationConflictException;

import lombok.RequiredArgsConstructor;

/**
 * Persistence adapter implementing {@link ExportacaoRepositoryPort} over JPA.
 */
@Component
@RequiredArgsConstructor
public class ExportacaoJpaAdapter implements ExportacaoRepositoryPort {

    private final ExportacaoJpaRepository jpa;
    private final ExportacaoMapper mapper;

    @Override
    public Exportacao salvar(Exportacao e) {
        try {
            ExportacaoEntity existing = jpa
                    .findByIdAndOrganizationId(e.id().value(), e.organizationId())
                    .orElse(null);
            ExportacaoEntity entity = mapper.toEntity(e, existing);
            ExportacaoEntity saved = jpa.saveAndFlush(entity);
            return mapper.toDomain(saved);
        } catch (ObjectOptimisticLockingFailureException ex) {
            throw new ConcurrentModificationConflictException(
                    "Exportacao modificada concorrentemente: " + e.id().asString(), ex);
        }
    }

    @Override
    public Optional<Exportacao> porId(UUID id, UUID org) {
        return jpa.findByIdAndOrganizationId(id, org).map(mapper::toDomain);
    }

    @Override
    public PageResult listar(UUID org, String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size,
                Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ExportacaoEntity> result = (status == null || status.isBlank())
                ? jpa.findByOrganizationId(org, pageable)
                : jpa.findByOrganizationIdAndStatus(org, status, pageable);
        return new PageResult(
                result.getContent().stream().map(mapper::toDomain).toList(),
                result.getTotalElements());
    }
}
