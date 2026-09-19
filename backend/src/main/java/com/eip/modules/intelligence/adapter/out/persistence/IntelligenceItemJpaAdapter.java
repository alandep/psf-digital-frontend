package com.eip.modules.intelligence.adapter.out.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Component;

import com.eip.modules.intelligence.domain.model.IntelligenceItem;
import com.eip.modules.intelligence.domain.port.out.IntelligenceItemRepositoryPort;

import lombok.RequiredArgsConstructor;

/**
 * Persistence adapter implementing {@link IntelligenceItemRepositoryPort} over JPA.
 */
@Component
@RequiredArgsConstructor
public class IntelligenceItemJpaAdapter implements IntelligenceItemRepositoryPort {

    private final IntelligenceItemJpaRepository jpa;
    private final IntelligenceItemMapper mapper;

    @Override
    public List<IntelligenceItem> feed(String type) {
        String normalized = (type == null || type.isBlank()) ? null : type.trim().toUpperCase();
        return jpa.findFeed(normalized).stream().map(mapper::toDomain).toList();
    }

    @Override
    public Optional<IntelligenceItem> bySlug(String slug) {
        return jpa.findBySlug(slug).map(mapper::toDomain);
    }

    @Override
    public Optional<IntelligenceItem> byId(UUID id) {
        return jpa.findById(id).map(mapper::toDomain);
    }

    @Override
    public IntelligenceItem salvar(IntelligenceItem i) {
        IntelligenceItemEntity existing = jpa.findById(i.id()).orElse(null);
        IntelligenceItemEntity entity = mapper.toEntity(i, existing);
        return mapper.toDomain(jpa.saveAndFlush(entity));
    }

    @Override
    public List<IntelligenceItem> listarCms(String reviewStatus) {
        List<IntelligenceItemEntity> rows = (reviewStatus == null || reviewStatus.isBlank())
                ? jpa.findAll()
                : jpa.findByReviewStatus(reviewStatus.trim().toUpperCase());
        return rows.stream().map(mapper::toDomain).toList();
    }

    @Override
    public long countByReviewStatus(String reviewStatus) {
        return jpa.countByReviewStatus(reviewStatus);
    }

    @Override
    public long countByPublicationStatus(String publicationStatus) {
        return jpa.countByPublicationStatus(publicationStatus);
    }

    @Override
    public long countAiGenerated() {
        return jpa.countByAiGeneratedTrue();
    }

    @Override
    public long countTotal() {
        return jpa.count();
    }
}
