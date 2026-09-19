package com.eip.modules.superadmin.adapter.out.persistence;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Spring Data JPA repository for {@link ProductEventEntity}.
 */
public interface ProductEventJpaRepository extends JpaRepository<ProductEventEntity, UUID> {

    List<ProductEventEntity> findByOrganizationIdOrderByOccurredAtDesc(UUID organizationId);

    List<ProductEventEntity> findByOrganizationIdAndEventOrderByOccurredAtDesc(
            UUID organizationId, String event);

    /** Counts events grouped by event name for a tenant. */
    @Query("""
            select e.event as event, count(e) as total
            from ProductEventEntity e
            where e.organizationId = :org
            group by e.event
            order by count(e) desc
            """)
    List<EventCountRow> countByType(@Param("org") UUID org);

    /** Projection for the grouped count query. */
    interface EventCountRow {
        String getEvent();

        long getTotal();
    }
}
