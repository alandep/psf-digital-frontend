package com.eip.modules.intelligence.adapter.out.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * Spring Data JPA repository for {@link IntelligenceItemEntity} (GLOBAL content).
 */
public interface IntelligenceItemJpaRepository extends JpaRepository<IntelligenceItemEntity, UUID> {

    Optional<IntelligenceItemEntity> findBySlug(String slug);

    @Query("""
            select i from IntelligenceItemEntity i
            where i.publicationStatus = 'PUBLISHED'
              and i.reviewStatus = 'APPROVED'
              and (:type is null or i.type = :type)
            order by i.publishedAt desc nulls last
            """)
    List<IntelligenceItemEntity> findFeed(@Param("type") String type);

    List<IntelligenceItemEntity> findByReviewStatus(String reviewStatus);

    long countByReviewStatus(String reviewStatus);

    long countByPublicationStatus(String publicationStatus);

    long countByAiGeneratedTrue();
}
