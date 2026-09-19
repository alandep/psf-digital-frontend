package com.eip.modules.compliance.application;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eip.modules.compliance.domain.model.Licenca;
import com.eip.modules.compliance.domain.port.in.GerenciarLicencasUseCase;
import com.eip.modules.compliance.domain.port.out.LicencaRepositoryPort;
import com.eip.platform.error.ResourceNotFoundException;
import com.eip.platform.outbox.OutboxPublisher;
import com.eip.platform.tenant.OrganizationContextHolder;

import lombok.RequiredArgsConstructor;

/**
 * Application service implementing the license use cases. Writes are
 * transactional and emit outbox events; queries are read-only.
 */
@Service
@RequiredArgsConstructor
public class LicencaService implements GerenciarLicencasUseCase {

    private final LicencaRepositoryPort repo;
    private final OutboxPublisher outbox;

    private static UUID currentOrg() {
        return OrganizationContextHolder.current().organizationId().value();
    }

    @Override
    @Transactional(readOnly = true)
    public List<LicencaView> listar(String status) {
        UUID org = currentOrg();
        return repo.listar(org, status).stream().map(LicencaView::from).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public LicencaView porId(UUID id) {
        UUID org = currentOrg();
        Licenca l = repo.porId(id, org)
                .orElseThrow(() -> new ResourceNotFoundException("Licenca nao encontrada: " + id));
        return LicencaView.from(l);
    }

    @Override
    @Transactional
    public LicencaView criar(CriarLicencaCommand cmd) {
        UUID org = currentOrg();
        Licenca l = Licenca.nova(
                org,
                cmd.name(),
                cmd.tipo(),
                cmd.orgao(),
                cmd.numero(),
                cmd.emitidaEm(),
                cmd.validaAte());
        Licenca salvo = repo.salvar(l);
        outbox.record("Licenca", salvo.id().asString(), org, "LicencaCriada",
                ComplianceEnums.payload("licencaId", salvo.id().value(), org));
        return LicencaView.from(salvo);
    }

    @Override
    @Transactional
    public LicencaView renovar(UUID id, RenovarCommand cmd) {
        UUID org = currentOrg();
        Licenca l = repo.porId(id, org)
                .orElseThrow(() -> new ResourceNotFoundException("Licenca nao encontrada: " + id));
        l.renovar(cmd.validaAte());
        Licenca salvo = repo.salvar(l);
        outbox.record("Licenca", salvo.id().asString(), org, "LicencaRenovada",
                ComplianceEnums.payload("licencaId", salvo.id().value(), org));
        return LicencaView.from(salvo);
    }

    @Override
    @Transactional
    public LicencaView cancelar(UUID id) {
        UUID org = currentOrg();
        Licenca l = repo.porId(id, org)
                .orElseThrow(() -> new ResourceNotFoundException("Licenca nao encontrada: " + id));
        l.cancelar();
        Licenca salvo = repo.salvar(l);
        outbox.record("Licenca", salvo.id().asString(), org, "LicencaCancelada",
                ComplianceEnums.payload("licencaId", salvo.id().value(), org));
        return LicencaView.from(salvo);
    }
}
