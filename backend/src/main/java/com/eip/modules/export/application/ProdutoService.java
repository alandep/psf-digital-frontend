package com.eip.modules.export.application;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eip.modules.export.adapter.out.persistence.ProductEntity;
import com.eip.modules.export.adapter.out.persistence.ProductJpaRepository;
import com.eip.modules.export.domain.port.in.ProdutoUseCase;
import com.eip.platform.error.BusinessRuleException;
import com.eip.platform.tenant.OrganizationContextHolder;

import lombok.RequiredArgsConstructor;

/** Application service for product listing and registration. */
@Service
@RequiredArgsConstructor
public class ProdutoService implements ProdutoUseCase {

    private final ProductJpaRepository repo;

    private static UUID currentOrg() {
        return OrganizationContextHolder.current().organizationId().value();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProdutoView> listar() {
        return repo.findByOrganizationIdOrderByNameAsc(currentOrg()).stream()
                .map(ProdutoService::toView)
                .toList();
    }

    @Override
    @Transactional
    public ProdutoView criar(CriarProdutoCommand cmd) {
        if (cmd.name() == null || cmd.name().isBlank()) {
            throw new BusinessRuleException("Nome do produto e obrigatorio");
        }
        ProductEntity e = new ProductEntity();
        e.setId(UUID.randomUUID());
        e.setOrganizationId(currentOrg());
        e.setName(cmd.name());
        e.setNcm(cmd.ncm());
        e.setDescription(cmd.description());
        e.setUnit(cmd.unit());
        e.setStandardPrice(cmd.standardPrice());
        e.setCurrency(cmd.currency());
        e.setOriginCountry(cmd.originCountry());
        e.setCreatedAt(OffsetDateTime.now());
        ProductEntity saved = repo.save(e);
        return toView(saved);
    }

    private static ProdutoView toView(ProductEntity e) {
        return new ProdutoView(e.getId(), e.getName(), e.getNcm(), e.getDescription(),
                e.getUnit(), e.getStandardPrice(), e.getCurrency(), e.getOriginCountry());
    }
}
