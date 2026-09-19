package com.eip.modules.cms.domain.port.out;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.eip.modules.cms.domain.model.AccessProfile;

/**
 * Outbound port: persistence for the tenant access-profile aggregate.
 */
public interface AccessProfileRepositoryPort {

    AccessProfile salvar(AccessProfile profile);

    Optional<AccessProfile> porId(UUID id, UUID org);

    List<AccessProfile> listar(UUID org);

    void remover(UUID id, UUID org);
}
