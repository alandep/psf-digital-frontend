package com.eip.modules.finance.application;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eip.modules.finance.domain.model.CambioContrato;
import com.eip.modules.finance.domain.model.CambioTipo;
import com.eip.modules.finance.domain.port.in.GerenciarCambioUseCase;
import com.eip.modules.finance.domain.port.out.CambioRepositoryPort;
import com.eip.platform.error.ResourceNotFoundException;
import com.eip.platform.outbox.OutboxPublisher;
import com.eip.platform.tenant.OrganizationContextHolder;

import lombok.RequiredArgsConstructor;

/**
 * Application service implementing the FX contract use cases.
 */
@Service
@RequiredArgsConstructor
public class CambioService implements GerenciarCambioUseCase {

    private final CambioRepositoryPort repo;
    private final OutboxPublisher outbox;

    private static UUID currentOrg() {
        return OrganizationContextHolder.current().organizationId().value();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CambioView> listar(String status) {
        UUID org = currentOrg();
        return repo.listar(org, status).stream().map(CambioView::from).toList();
    }

    @Override
    @Transactional
    public CambioView criar(CriarCambioCommand cmd) {
        UUID org = currentOrg();
        CambioContrato c = CambioContrato.novo(
                org,
                cmd.banco(),
                cmd.moeda(),
                cmd.valor(),
                cmd.taxa(),
                FinanceEnums.parse(CambioTipo.class, cmd.tipo(), "tipo"),
                cmd.dataContratacao(),
                cmd.dataLiquidacao());
        CambioContrato salvo = repo.salvar(c);
        outbox.record("CambioContrato", salvo.id().asString(), org, "CambioContratado",
                FinanceEnums.payload("cambioId", salvo.id().value(), org));
        return CambioView.from(salvo);
    }

    @Override
    @Transactional
    public CambioView liquidar(UUID id) {
        UUID org = currentOrg();
        CambioContrato c = repo.porId(id, org)
                .orElseThrow(() -> new ResourceNotFoundException("Cambio nao encontrado: " + id));
        c.liquidar();
        CambioContrato salvo = repo.salvar(c);
        outbox.record("CambioContrato", salvo.id().asString(), org, "CambioLiquidado",
                FinanceEnums.payload("cambioId", salvo.id().value(), org));
        return CambioView.from(salvo);
    }

    @Override
    @Transactional
    public CambioView cancelar(UUID id) {
        UUID org = currentOrg();
        CambioContrato c = repo.porId(id, org)
                .orElseThrow(() -> new ResourceNotFoundException("Cambio nao encontrado: " + id));
        c.cancelar();
        CambioContrato salvo = repo.salvar(c);
        outbox.record("CambioContrato", salvo.id().asString(), org, "CambioCancelado",
                FinanceEnums.payload("cambioId", salvo.id().value(), org));
        return CambioView.from(salvo);
    }
}
