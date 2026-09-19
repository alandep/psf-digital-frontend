package com.eip.modules.identity.domain.port.out;

import java.util.Optional;
import java.util.UUID;

import com.eip.modules.identity.domain.model.UserCredential;

/**
 * Outbound port: read access to user credentials for the authentication flow.
 */
public interface CredentialRepositoryPort {

    Optional<UserCredential> findByUserId(UUID userId);
}
