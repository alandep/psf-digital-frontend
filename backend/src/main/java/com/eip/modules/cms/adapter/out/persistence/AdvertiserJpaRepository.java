package com.eip.modules.cms.adapter.out.persistence;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Spring Data JPA repository for {@link AdvertiserEntity}.
 */
public interface AdvertiserJpaRepository extends JpaRepository<AdvertiserEntity, UUID> {
}
