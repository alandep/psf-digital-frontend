package com.eip.modules.subscription.domain.port.out;

import java.util.Optional;
import java.util.UUID;

/**
 * Read-only access to the organization's legal entity (razão social, CNPJ,
 * contact), used as billing customer data.
 */
public interface CustomerProfilePort {

    Optional<CustomerProfile> forOrg(UUID organizationId);

    record CustomerProfile(String razaoSocial, String cnpj, String email, String phone) {
    }
}
