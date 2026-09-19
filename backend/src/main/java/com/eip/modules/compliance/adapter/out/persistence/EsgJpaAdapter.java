package com.eip.modules.compliance.adapter.out.persistence;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Component;

import com.eip.modules.compliance.domain.model.EsgAvaliacao;
import com.eip.modules.compliance.domain.model.EsgStatus;
import com.eip.modules.compliance.domain.port.out.EsgRepositoryPort;

import lombok.RequiredArgsConstructor;

/**
 * Persistence adapter implementing {@link EsgRepositoryPort} over JPA.
 * Mapping is inlined as the type has no rich lifecycle.
 */
@Component
@RequiredArgsConstructor
public class EsgJpaAdapter implements EsgRepositoryPort {

    private final EsgJpaRepository jpa;

    @Override
    public EsgAvaliacao salvar(EsgAvaliacao e) {
        EsgAvaliacaoEntity entity = jpa.findById(e.id()).orElseGet(() -> {
            EsgAvaliacaoEntity fresh = new EsgAvaliacaoEntity();
            fresh.setId(e.id());
            fresh.setCreatedAt(OffsetDateTime.now());
            return fresh;
        });
        entity.setOrganizationId(e.organizationId());
        entity.setPeriodo(e.periodo());
        entity.setScoreAmbiental(e.scoreAmbiental());
        entity.setScoreSocial(e.scoreSocial());
        entity.setScoreGovernanca(e.scoreGovernanca());
        entity.setScoreTotal(e.scoreTotal());
        entity.setStatus(e.status().name());
        return toDomain(jpa.saveAndFlush(entity));
    }

    @Override
    public List<EsgAvaliacao> listar(UUID org) {
        return jpa.findByOrganizationId(org).stream().map(this::toDomain).toList();
    }

    private EsgAvaliacao toDomain(EsgAvaliacaoEntity entity) {
        return new EsgAvaliacao(
                entity.getId(),
                entity.getOrganizationId(),
                entity.getPeriodo(),
                entity.getScoreAmbiental(),
                entity.getScoreSocial(),
                entity.getScoreGovernanca(),
                entity.getScoreTotal(),
                EsgStatus.valueOf(entity.getStatus()));
    }
}
