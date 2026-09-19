package com.eip.modules.crm.domain.port.out;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import com.eip.modules.crm.domain.model.Lead;

/**
 * Outbound port: persistence for the lead aggregate.
 */
public interface LeadRepositoryPort {

    Lead salvar(Lead l);

    Optional<Lead> porId(UUID id, UUID org);

    /** Lists leads, optionally filtered by status and/or source (both nullable). */
    List<Lead> listar(UUID org, String status, String source);

    /** Number of leads per {@code LeadStatus} name, for the conversion funnel. */
    Map<String, Long> countByStatus(UUID org);
}
