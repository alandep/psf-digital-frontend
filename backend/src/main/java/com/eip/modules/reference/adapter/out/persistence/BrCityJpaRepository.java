package com.eip.modules.reference.adapter.out.persistence;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

/** Spring Data JPA repository for {@link BrCityEntity}. Global reference data (no tenant scope). */
public interface BrCityJpaRepository extends JpaRepository<BrCityEntity, String> {

    List<BrCityEntity> findByUfOrderByNameAsc(String uf);
}
