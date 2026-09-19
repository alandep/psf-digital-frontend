package com.eip.modules.crm.application;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eip.modules.crm.domain.model.Lead;
import com.eip.modules.crm.domain.model.LeadSource;
import com.eip.modules.crm.domain.model.LeadStatus;
import com.eip.modules.crm.domain.port.in.GerenciarLeadsUseCase;
import com.eip.modules.crm.domain.port.out.LeadRepositoryPort;
import com.eip.platform.error.ResourceNotFoundException;
import com.eip.platform.outbox.OutboxPublisher;
import com.eip.platform.tenant.OrganizationContextHolder;

import lombok.RequiredArgsConstructor;

/**
 * Application service implementing the lead use cases. Writes are
 * transactional and emit outbox events; queries are read-only.
 */
@Service
@RequiredArgsConstructor
public class LeadService implements GerenciarLeadsUseCase {

    private final LeadRepositoryPort repo;
    private final OutboxPublisher outbox;

    private static UUID currentOrg() {
        return OrganizationContextHolder.current().organizationId().value();
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeadView> listar(String status, String source) {
        UUID org = currentOrg();
        // Validate optional filters against the enums before querying.
        CrmEnums.parseOptional(LeadStatus.class, status, "status");
        CrmEnums.parseOptional(LeadSource.class, source, "source");
        return repo.listar(org, normalize(status), normalize(source)).stream()
                .map(LeadView::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public LeadView porId(UUID id) {
        UUID org = currentOrg();
        Lead l = repo.porId(id, org)
                .orElseThrow(() -> new ResourceNotFoundException("Lead nao encontrado: " + id));
        return LeadView.from(l);
    }

    @Override
    @Transactional
    public LeadView criar(CriarLeadCommand cmd) {
        UUID org = currentOrg();
        Lead l = Lead.novo(
                org,
                cmd.name(),
                cmd.companyName(),
                cmd.email(),
                cmd.phone(),
                CrmEnums.parseOptional(LeadSource.class, cmd.source(), "source"),
                cmd.origin());
        Lead salvo = repo.salvar(l);
        outbox.record("Lead", salvo.id().asString(), org, "LeadCriado",
                CrmEnums.payload("leadId", salvo.id().value(), org));
        return LeadView.from(salvo);
    }

    @Override
    @Transactional
    public LeadView atualizarStatus(UUID id, StatusCommand cmd) {
        UUID org = currentOrg();
        Lead l = repo.porId(id, org)
                .orElseThrow(() -> new ResourceNotFoundException("Lead nao encontrado: " + id));
        l.avancarStatus(CrmEnums.parse(LeadStatus.class, cmd.status(), "status"));
        Lead salvo = repo.salvar(l);
        outbox.record("Lead", salvo.id().asString(), org, "LeadStatusAlterado",
                CrmEnums.payload("leadId", salvo.id().value(), org));
        return LeadView.from(salvo);
    }

    @Override
    @Transactional(readOnly = true)
    public FunilView funil() {
        UUID org = currentOrg();
        Map<String, Long> counts = repo.countByStatus(org);
        List<FunilEtapa> etapas = new ArrayList<>();
        long total = 0L;
        // Emit every funnel status in canonical order, defaulting to zero.
        for (LeadStatus s : LeadStatus.values()) {
            long c = counts.getOrDefault(s.name(), 0L);
            etapas.add(new FunilEtapa(s.name(), c));
            total += c;
        }
        return new FunilView(etapas, total);
    }

    private static String normalize(String value) {
        return value == null || value.isBlank() ? null : value.trim().toUpperCase();
    }
}
