package com.eip.modules.finance.adapter.out.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Component;

import com.eip.modules.finance.domain.model.Pagamento;
import com.eip.modules.finance.domain.port.out.PagamentoRepositoryPort;
import com.eip.platform.error.ConcurrentModificationConflictException;

import lombok.RequiredArgsConstructor;

/**
 * Persistence adapter implementing {@link PagamentoRepositoryPort} over JPA.
 */
@Component
@RequiredArgsConstructor
public class PagamentoJpaAdapter implements PagamentoRepositoryPort {

    private final PagamentoJpaRepository jpa;
    private final PagamentoMapper mapper;

    @Override
    public Pagamento salvar(Pagamento p) {
        try {
            PagamentoEntity existing = jpa
                    .findByIdAndOrganizationId(p.id().value(), p.organizationId())
                    .orElse(null);
            PagamentoEntity entity = mapper.toEntity(p, existing);
            PagamentoEntity saved = jpa.saveAndFlush(entity);
            return mapper.toDomain(saved);
        } catch (ObjectOptimisticLockingFailureException ex) {
            throw new ConcurrentModificationConflictException(
                    "Pagamento modificado concorrentemente: " + p.id().asString(), ex);
        }
    }

    @Override
    public Optional<Pagamento> porId(UUID id, UUID org) {
        return jpa.findByIdAndOrganizationId(id, org).map(mapper::toDomain);
    }

    @Override
    public List<Pagamento> listar(UUID org, String status) {
        List<PagamentoEntity> rows = (status == null || status.isBlank())
                ? jpa.findByOrganizationId(org)
                : jpa.findByOrganizationIdAndStatus(org, status);
        return rows.stream().map(mapper::toDomain).toList();
    }

    @Override
    public List<Pagamento> listarPorTipoEStatus(UUID org, String tipo, String status) {
        return jpa.findByOrganizationIdAndTipoAndStatus(org, tipo, status).stream()
                .map(mapper::toDomain)
                .toList();
    }
}
