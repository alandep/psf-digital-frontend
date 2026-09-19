package com.eip.modules.cms.adapter.out.persistence;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Component;

import com.eip.modules.cms.domain.model.PublicSetting;
import com.eip.modules.cms.domain.port.out.PublicSettingRepositoryPort;

import lombok.RequiredArgsConstructor;

/**
 * Persistence adapter implementing {@link PublicSettingRepositoryPort} over JPA.
 */
@Component
@RequiredArgsConstructor
public class PublicSettingJpaAdapter implements PublicSettingRepositoryPort {

    private final PublicSettingJpaRepository jpa;
    private final PublicSettingMapper mapper;

    @Override
    public List<PublicSetting> findPublic() {
        return jpa.findByTypeOrderByKey("PUBLIC").stream().map(mapper::toDomain).toList();
    }

    @Override
    public Optional<PublicSetting> find(String key) {
        return jpa.findById(key).map(mapper::toDomain);
    }

    @Override
    public PublicSetting save(PublicSetting setting) {
        PublicSettingEntity existing = jpa.findById(setting.key()).orElse(null);
        PublicSettingEntity entity = mapper.toEntity(setting, existing);
        return mapper.toDomain(jpa.saveAndFlush(entity));
    }
}
