package com.eip.modules.cms.adapter.out.persistence;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Spring Data JPA repository for {@link PublicSettingEntity}.
 */
public interface PublicSettingJpaRepository extends JpaRepository<PublicSettingEntity, String> {

    List<PublicSettingEntity> findByTypeOrderByKey(String type);
}
