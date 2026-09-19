package com.eip.modules.finance.application;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eip.modules.finance.domain.model.HedgeContrato;
import com.eip.modules.finance.domain.model.HedgeInstrumento;
import com.eip.modules.finance.domain.port.in.GerenciarHedgeUseCase;
import com.eip.modules.finance.domain.port.out.HedgeRepositoryPort;
import com.eip.platform.error.ResourceNotFoundException;
import com.eip.platform.outbox.OutboxPublisher;
import com.eip.platform.tenant.OrganizationContextHolder;

import lombok.RequiredArgsConstructor;

/**
 * Application service implementing the hedge contract use cases.
 */
@Service
@RequiredArgsConstructor
public class HedgeService implements GerenciarHedgeUseCase {

    private final HedgeRepositoryPort repo;
    private final OutboxPublisher outbox;

    private static UUID currentOrg() {
        return OrganizationContextHolder.current().organizationId().value();
    }

    @Override
    @Transactional(readOnly = true)
    public List<HedgeView> listar(String status) {
        UUID org = currentOrg();
        return repo.listar(org, status).stream().map(HedgeView::from).toList();
    }

    @Override
    @Transactional
    public HedgeView criar(CriarHedgeCommand cmd) {
        UUID org = currentOrg();
        HedgeContrato h = HedgeContrato.novo(
                org,
                FinanceEnums.parse(HedgeInstrumento.class, cmd.instrumento(), "instrumento"),
                cmd.moeda(),
                cmd.notional(),
                cmd.strike(),
                cmd.vencimento());
        HedgeContrato salvo = repo.salvar(h);
        outbox.record("HedgeContrato", salvo.id().asString(), org, "HedgeContratado",
                FinanceEnums.payload("hedgeId", salvo.id().value(), org));
        return HedgeView.from(salvo);
    }

    @Override
    @Transactional
    public HedgeView exercer(UUID id) {
        UUID org = currentOrg();
        HedgeContrato h = repo.porId(id, org)
                .orElseThrow(() -> new ResourceNotFoundException("Hedge nao encontrado: " + id));
        h.exercer();
        HedgeContrato salvo = repo.salvar(h);
        outbox.record("HedgeContrato", salvo.id().asString(), org, "HedgeExercido",
                FinanceEnums.payload("hedgeId", salvo.id().value(), org));
        return HedgeView.from(salvo);
    }

    @Override
    @Transactional
    public HedgeView expirar(UUID id) {
        UUID org = currentOrg();
        HedgeContrato h = repo.porId(id, org)
                .orElseThrow(() -> new ResourceNotFoundException("Hedge nao encontrado: " + id));
        h.expirar();
        HedgeContrato salvo = repo.salvar(h);
        outbox.record("HedgeContrato", salvo.id().asString(), org, "HedgeExpirado",
                FinanceEnums.payload("hedgeId", salvo.id().value(), org));
        return HedgeView.from(salvo);
    }

    @Override
    @Transactional
    public HedgeView cancelar(UUID id) {
        UUID org = currentOrg();
        HedgeContrato h = repo.porId(id, org)
                .orElseThrow(() -> new ResourceNotFoundException("Hedge nao encontrado: " + id));
        h.cancelar();
        HedgeContrato salvo = repo.salvar(h);
        outbox.record("HedgeContrato", salvo.id().asString(), org, "HedgeCancelado",
                FinanceEnums.payload("hedgeId", salvo.id().value(), org));
        return HedgeView.from(salvo);
    }
}
