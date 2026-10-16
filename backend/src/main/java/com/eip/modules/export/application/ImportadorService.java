package com.eip.modules.export.application;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eip.modules.export.adapter.out.persistence.CustomerEntity;
import com.eip.modules.export.adapter.out.persistence.CustomerJpaRepository;
import com.eip.modules.export.domain.port.in.ClienteUseCase;
import com.eip.platform.error.BusinessRuleException;
import com.eip.platform.tenant.OrganizationContextHolder;

import lombok.RequiredArgsConstructor;

/** Application service for importer (cliente) listing and registration. */
@Service
@RequiredArgsConstructor
public class ImportadorService implements ClienteUseCase {

    private final CustomerJpaRepository repo;

    private static UUID currentOrg() {
        return OrganizationContextHolder.current().organizationId().value();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClienteView> listar() {
        return repo.findByOrganizationIdOrderByNameAsc(currentOrg()).stream()
                .map(ImportadorService::toView)
                .toList();
    }

    @Override
    @Transactional
    public ClienteView criar(CriarClienteCommand cmd) {
        if (cmd.name() == null || cmd.name().isBlank()) {
            throw new BusinessRuleException("Nome do importador e obrigatorio");
        }
        CustomerEntity e = new CustomerEntity();
        e.setId(UUID.randomUUID());
        e.setOrganizationId(currentOrg());
        e.setName(cmd.name());
        e.setCountry(cmd.country());
        e.setDocument(cmd.document());
        e.setAddress(cmd.address());
        e.setContact(cmd.contact());
        e.setCreatedAt(OffsetDateTime.now());
        CustomerEntity saved = repo.save(e);
        return toView(saved);
    }

    private static ClienteView toView(CustomerEntity e) {
        return new ClienteView(e.getId(), e.getName(), e.getCountry(),
                e.getDocument(), e.getAddress(), e.getContact());
    }
}
