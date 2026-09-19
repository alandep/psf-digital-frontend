package com.eip.modules.crm.domain.port.in;

import java.util.List;
import java.util.UUID;

import com.eip.modules.crm.domain.model.Lead;

/**
 * Inbound port: manage marketing/sales leads along the conversion funnel.
 */
public interface GerenciarLeadsUseCase {

    List<LeadView> listar(String status, String source);

    LeadView porId(UUID id);

    LeadView criar(CriarLeadCommand cmd);

    LeadView atualizarStatus(UUID id, StatusCommand cmd);

    FunilView funil();

    /** Command to create a lead. */
    record CriarLeadCommand(
            String name,
            String companyName,
            String email,
            String phone,
            String source,
            String origin) {
    }

    /** Command to change a lead status. */
    record StatusCommand(String status) {
    }

    /** Read view of a single lead. */
    record LeadView(
            UUID id,
            String name,
            String companyName,
            String email,
            String phone,
            String source,
            String origin,
            String status) {

        public static LeadView from(Lead l) {
            return new LeadView(
                    l.id().value(),
                    l.name(),
                    l.companyName(),
                    l.email(),
                    l.phone(),
                    l.source() == null ? null : l.source().name(),
                    l.origin(),
                    l.status().name());
        }
    }

    /** Count of leads sitting at a given funnel status. */
    record FunilEtapa(String status, long total) {
    }

    /**
     * Conversion-funnel view: the number of leads at each status.
     *
     * @param etapas per-status counts
     * @param total  overall number of leads
     */
    record FunilView(List<FunilEtapa> etapas, long total) {
    }
}
