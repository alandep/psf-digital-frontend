package com.eip.modules.cms.application;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eip.modules.cms.domain.model.OfficialLink;
import com.eip.modules.cms.domain.port.in.ConsultarLinksOficiaisUseCase;
import com.eip.modules.cms.domain.port.out.OfficialLinkRepositoryPort;
import com.eip.platform.error.BusinessRuleException;
import com.eip.platform.error.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;

/**
 * Application service for the official links catalog.
 *
 * <p>Links are GLOBAL: this service does NOT read the tenant organization
 * context, since the active-link listing is reachable without auth and
 * {@code official_link} is not RLS-scoped.
 */
@Service
@RequiredArgsConstructor
public class OfficialLinksService implements ConsultarLinksOficiaisUseCase {

    private final OfficialLinkRepositoryPort repo;

    @Override
    @Transactional(readOnly = true)
    public List<OfficialLinkView> listar() {
        return repo.listActive().stream().map(OfficialLinkView::from).toList();
    }

    @Override
    @Transactional
    public OfficialLinkView criar(CriarLinkCommand cmd) {
        if (cmd.name() == null || cmd.name().isBlank()) {
            throw new BusinessRuleException("Nome do link e obrigatorio");
        }
        if (cmd.url() == null || cmd.url().isBlank()) {
            throw new BusinessRuleException("URL do link e obrigatoria");
        }
        OfficialLink link = new OfficialLink(UUID.randomUUID(), cmd.category(), cmd.name(),
                cmd.description(), cmd.url(), cmd.country(), cmd.displayOrder(), true);
        return OfficialLinkView.from(repo.save(link));
    }

    @Override
    @Transactional
    public OfficialLinkView alternar(UUID id) {
        OfficialLink l = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Link oficial nao encontrado: " + id));
        OfficialLink toggled = new OfficialLink(l.id(), l.category(), l.name(), l.description(),
                l.url(), l.country(), l.displayOrder(), !l.active());
        return OfficialLinkView.from(repo.save(toggled));
    }
}
