package com.eip.modules.cms.adapter.out.persistence;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Spring Data JPA repository for {@link OfficialLinkEntity}.
 */
public interface OfficialLinkJpaRepository extends JpaRepository<OfficialLinkEntity, UUID> {

    List<OfficialLinkEntity> findByActiveTrueOrderByDisplayOrder();
}
