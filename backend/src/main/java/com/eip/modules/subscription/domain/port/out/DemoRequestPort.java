package com.eip.modules.subscription.domain.port.out;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Outbound port storing commercial demo requests (global, no RLS).
 */
public interface DemoRequestPort {

    void save(DemoRequest request);

    record DemoRequest(UUID id, String name, String email, String phone, String company,
            String cnpj, String message, String origin, String ip, OffsetDateTime createdAt) {
    }
}
