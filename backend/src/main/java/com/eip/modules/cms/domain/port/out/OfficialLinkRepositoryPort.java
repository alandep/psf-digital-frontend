package com.eip.modules.cms.domain.port.out;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.eip.modules.cms.domain.model.OfficialLink;

/**
 * Outbound port: persistence for the GLOBAL official links catalog.
 */
public interface OfficialLinkRepositoryPort {

    List<OfficialLink> listActive();

    Optional<OfficialLink> findById(UUID id);

    OfficialLink save(OfficialLink link);
}
