package com.eip.modules.cms.adapter.out.persistence;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Spring Data JPA repository for {@link AdCampaignEntity}.
 */
public interface AdCampaignJpaRepository extends JpaRepository<AdCampaignEntity, UUID> {

    List<AdCampaignEntity> findByStatus(String status);
}
