package com.eip.modules.identity.domain.port.out;

import java.util.Optional;

import com.eip.modules.identity.domain.model.AppUser;

/**
 * Outbound port: read access to application users for the authentication flow.
 */
public interface UserRepositoryPort {

    Optional<AppUser> findByEmail(String email);

    Optional<AppUser> findByCpfLookupHash(String hash);
}
