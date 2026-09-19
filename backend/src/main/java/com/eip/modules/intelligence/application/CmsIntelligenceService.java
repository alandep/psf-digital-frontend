package com.eip.modules.intelligence.application;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eip.modules.intelligence.domain.model.ImpactLevel;
import com.eip.modules.intelligence.domain.model.IntelligenceItem;
import com.eip.modules.intelligence.domain.model.IntelligenceType;
import com.eip.modules.intelligence.domain.model.PublicationStatus;
import com.eip.modules.intelligence.domain.model.ReviewStatus;
import com.eip.modules.intelligence.domain.port.in.CurarConteudoUseCase;
import com.eip.modules.intelligence.domain.port.out.IntelligenceItemRepositoryPort;
import com.eip.platform.error.ResourceNotFoundException;
import com.eip.platform.outbox.OutboxPublisher;

import lombok.RequiredArgsConstructor;

/**
 * Application service implementing the CMS curation use cases over GLOBAL
 * content. Deliberately does NOT read the tenant organization context, since
 * {@code intelligence_item} is not RLS-scoped. Outbox events for global content
 * use the nil-UUID system organization sentinel.
 */
@Service
@RequiredArgsConstructor
public class CmsIntelligenceService implements CurarConteudoUseCase {

    /** System/global organization sentinel for outbox events on global content. */
    private static final UUID SYSTEM_ORG = new UUID(0L, 0L);

    private final IntelligenceItemRepositoryPort repo;
    private final OutboxPublisher outbox;

    @Override
    @Transactional(readOnly = true)
    public List<CmsItemView> listar(String reviewStatus) {
        return repo.listarCms(reviewStatus).stream().map(CmsItemView::from).toList();
    }

    @Override
    @Transactional
    public CmsItemView criar(CriarItemCommand cmd) {
        IntelligenceItem item = IntelligenceItem.novo(
                IntelligenceSupport.parse(IntelligenceType.class, cmd.type(), "type"),
                cmd.title(),
                cmd.slug(),
                cmd.summary(),
                cmd.content(),
                cmd.sourceName(),
                cmd.country(),
                cmd.sector(),
                cmd.commodity(),
                IntelligenceSupport.parseOptional(ImpactLevel.class, cmd.impactLevel(), "impactLevel"),
                cmd.aiGenerated(),
                cmd.aiAnalysis());
        return CmsItemView.from(repo.salvar(item));
    }

    @Override
    @Transactional
    public CmsItemView aprovar(UUID id) {
        IntelligenceItem item = carregar(id);
        item.aprovar();
        IntelligenceItem salvo = repo.salvar(item);
        outbox.record("IntelligenceItem", salvo.id().toString(), SYSTEM_ORG, "ConteudoAprovado",
                IntelligenceSupport.payload("intelligenceItemId", salvo.id(), SYSTEM_ORG));
        return CmsItemView.from(salvo);
    }

    @Override
    @Transactional
    public CmsItemView rejeitar(UUID id) {
        IntelligenceItem item = carregar(id);
        item.rejeitar();
        return CmsItemView.from(repo.salvar(item));
    }

    @Override
    @Transactional
    public CmsItemView publicar(UUID id) {
        IntelligenceItem item = carregar(id);
        item.publicar();
        IntelligenceItem salvo = repo.salvar(item);
        outbox.record("IntelligenceItem", salvo.id().toString(), SYSTEM_ORG, "ConteudoPublicado",
                IntelligenceSupport.payload("intelligenceItemId", salvo.id(), SYSTEM_ORG));
        return CmsItemView.from(salvo);
    }

    @Override
    @Transactional
    public CmsItemView arquivar(UUID id) {
        IntelligenceItem item = carregar(id);
        item.arquivar();
        return CmsItemView.from(repo.salvar(item));
    }

    @Override
    @Transactional(readOnly = true)
    public CmsStats stats() {
        long coletados = repo.countTotal();
        long analisados = repo.countAiGenerated();
        long publicados = repo.countByPublicationStatus(PublicationStatus.PUBLISHED.name());
        long aguardandoRevisao = repo.countByReviewStatus(ReviewStatus.REVIEW_REQUIRED.name());
        return new CmsStats(coletados, analisados, publicados, aguardandoRevisao);
    }

    private IntelligenceItem carregar(UUID id) {
        return repo.byId(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Item de inteligencia nao encontrado: " + id));
    }
}
