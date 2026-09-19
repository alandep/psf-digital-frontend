package com.eip.modules.finance.application;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eip.modules.finance.domain.model.Pagamento;
import com.eip.modules.finance.domain.model.PagamentoStatus;
import com.eip.modules.finance.domain.model.PagamentoTipo;
import com.eip.modules.finance.domain.port.in.GerenciarPagamentosUseCase;
import com.eip.modules.finance.domain.port.out.PagamentoRepositoryPort;
import com.eip.platform.error.ResourceNotFoundException;
import com.eip.platform.outbox.OutboxPublisher;
import com.eip.platform.tenant.OrganizationContextHolder;

import lombok.RequiredArgsConstructor;

/**
 * Application service implementing the payment use cases. Writes are
 * transactional and emit outbox events; queries are read-only.
 */
@Service
@RequiredArgsConstructor
public class PagamentoService implements GerenciarPagamentosUseCase {

    private final PagamentoRepositoryPort repo;
    private final OutboxPublisher outbox;

    private static UUID currentOrg() {
        return OrganizationContextHolder.current().organizationId().value();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PagamentoView> listar(String status) {
        UUID org = currentOrg();
        return repo.listar(org, status).stream().map(PagamentoView::from).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PagamentoView porId(UUID id) {
        UUID org = currentOrg();
        Pagamento p = repo.porId(id, org)
                .orElseThrow(() -> new ResourceNotFoundException("Pagamento nao encontrado: " + id));
        return PagamentoView.from(p);
    }

    @Override
    @Transactional
    public PagamentoView criar(CriarPagamentoCommand cmd) {
        UUID org = currentOrg();
        Pagamento p = Pagamento.novo(
                org,
                cmd.exportId(),
                FinanceEnums.parse(PagamentoTipo.class, cmd.tipo(), "tipo"),
                cmd.descricao(),
                cmd.amount(),
                cmd.currency(),
                cmd.dueDate());
        Pagamento salvo = repo.salvar(p);
        outbox.record("Pagamento", salvo.id().asString(), org, "PagamentoCriado",
                FinanceEnums.payload("pagamentoId", salvo.id().value(), org));
        return PagamentoView.from(salvo);
    }

    @Override
    @Transactional
    public PagamentoView marcarPago(UUID id) {
        UUID org = currentOrg();
        Pagamento p = repo.porId(id, org)
                .orElseThrow(() -> new ResourceNotFoundException("Pagamento nao encontrado: " + id));
        p.marcarPago();
        Pagamento salvo = repo.salvar(p);
        outbox.record("Pagamento", salvo.id().asString(), org, "PagamentoLiquidado",
                FinanceEnums.payload("pagamentoId", salvo.id().value(), org));
        return PagamentoView.from(salvo);
    }

    @Override
    @Transactional
    public PagamentoView cancelar(UUID id) {
        UUID org = currentOrg();
        Pagamento p = repo.porId(id, org)
                .orElseThrow(() -> new ResourceNotFoundException("Pagamento nao encontrado: " + id));
        p.cancelar();
        Pagamento salvo = repo.salvar(p);
        outbox.record("Pagamento", salvo.id().asString(), org, "PagamentoCancelado",
                FinanceEnums.payload("pagamentoId", salvo.id().value(), org));
        return PagamentoView.from(salvo);
    }

    @Override
    @Transactional(readOnly = true)
    public ResumoFinanceiro resumo() {
        UUID org = currentOrg();
        BigDecimal totalReceber = somar(repo.listarPorTipoEStatus(
                org, PagamentoTipo.RECEBIMENTO.name(), PagamentoStatus.PENDENTE.name()));
        BigDecimal totalPagar = somar(repo.listarPorTipoEStatus(
                org, PagamentoTipo.PAGAMENTO.name(), PagamentoStatus.PENDENTE.name()));
        BigDecimal saldo = totalReceber.subtract(totalPagar).setScale(2, RoundingMode.HALF_UP);
        return new ResumoFinanceiro(totalReceber, totalPagar, saldo);
    }

    private static BigDecimal somar(List<Pagamento> pagamentos) {
        return pagamentos.stream()
                .map(Pagamento::amount)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);
    }
}
