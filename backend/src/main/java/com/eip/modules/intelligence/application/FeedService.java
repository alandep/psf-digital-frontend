package com.eip.modules.intelligence.application;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eip.modules.intelligence.domain.model.IntelligenceItem;
import com.eip.modules.intelligence.domain.port.in.ConsultarFeedUseCase;
import com.eip.modules.intelligence.domain.port.out.IntelligenceItemRepositoryPort;
import com.eip.platform.error.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;

/**
 * Application service implementing the public curated feed use case.
 *
 * <p>Content is GLOBAL: this service intentionally does NOT read the tenant
 * organization context, since the feed is reachable without authentication and
 * {@code intelligence_item} is not RLS-scoped.
 */
@Service
@RequiredArgsConstructor
public class FeedService implements ConsultarFeedUseCase {

    private final IntelligenceItemRepositoryPort repo;

    @Override
    @Transactional(readOnly = true)
    public List<FeedItemView> feed(String type) {
        return repo.feed(type).stream().map(FeedItemView::from).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ItemDetailView porSlug(String slug) {
        IntelligenceItem item = repo.bySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Item de inteligencia nao encontrado: " + slug));
        return ItemDetailView.from(item);
    }
}
