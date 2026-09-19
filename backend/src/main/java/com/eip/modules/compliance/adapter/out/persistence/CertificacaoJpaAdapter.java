package com.eip.modules.compliance.adapter.out.persistence;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Component;

import com.eip.modules.compliance.domain.model.Certificacao;
import com.eip.modules.compliance.domain.model.CertificacaoId;
import com.eip.modules.compliance.domain.model.CertificacaoStatus;
import com.eip.modules.compliance.domain.port.out.CertificacaoRepositoryPort;

import lombok.RequiredArgsConstructor;

/**
 * Persistence adapter implementing {@link CertificacaoRepositoryPort} over JPA.
 * Mapping is inlined as the type has no rich lifecycle.
 */
@Component
@RequiredArgsConstructor
public class CertificacaoJpaAdapter implements CertificacaoRepositoryPort {

    private final CertificacaoJpaRepository jpa;

    @Override
    public Certificacao salvar(Certificacao c) {
        CertificacaoEntity entity = jpa.findById(c.id().value()).orElseGet(() -> {
            CertificacaoEntity fresh = new CertificacaoEntity();
            fresh.setId(c.id().value());
            fresh.setCreatedAt(OffsetDateTime.now());
            return fresh;
        });
        entity.setOrganizationId(c.organizationId());
        entity.setName(c.name());
        entity.setTipo(c.tipo());
        entity.setOrgaoEmissor(c.orgaoEmissor());
        entity.setNumero(c.numero());
        entity.setStatus(c.status().name());
        entity.setEmitidaEm(c.emitidaEm());
        entity.setValidaAte(c.validaAte());
        return toDomain(jpa.saveAndFlush(entity));
    }

    @Override
    public List<Certificacao> listar(UUID org, String status) {
        List<CertificacaoEntity> rows = (status == null || status.isBlank())
                ? jpa.findByOrganizationId(org)
                : jpa.findByOrganizationIdAndStatus(org, status);
        return rows.stream().map(this::toDomain).toList();
    }

    private Certificacao toDomain(CertificacaoEntity entity) {
        return new Certificacao(
                CertificacaoId.of(entity.getId()),
                entity.getOrganizationId(),
                entity.getName(),
                entity.getTipo(),
                entity.getOrgaoEmissor(),
                entity.getNumero(),
                CertificacaoStatus.valueOf(entity.getStatus()),
                entity.getEmitidaEm(),
                entity.getValidaAte());
    }
}
