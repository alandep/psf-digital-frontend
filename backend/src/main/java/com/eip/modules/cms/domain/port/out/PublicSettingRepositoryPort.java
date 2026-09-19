package com.eip.modules.cms.domain.port.out;

import java.util.List;
import java.util.Optional;

import com.eip.modules.cms.domain.model.PublicSetting;

/**
 * Outbound port: persistence for GLOBAL institutional settings.
 */
public interface PublicSettingRepositoryPort {

    List<PublicSetting> findPublic();

    Optional<PublicSetting> find(String key);

    PublicSetting save(PublicSetting setting);
}
