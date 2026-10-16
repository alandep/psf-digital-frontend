package com.eip.modules.export.domain.port.out;

import java.util.UUID;

/** Outbound port: allocates the next human-readable export reference (EXP-YYYY-NNNN) for a tenant. */
public interface ExportReferenceGenerator {
    String next(UUID organizationId);
}
