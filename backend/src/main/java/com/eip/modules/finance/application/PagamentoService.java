package com.eip.modules.finance.application;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eip.modules.finance.domain.model.Pagamento;
import com.eip.modules.finance.domain.model.PagamentoStatus;
import com.eip.modules.finance.domain.model.PagamentoTipo;
import com.eip.modules.finance.domain.port.in.GerenciarPagamentosUseCase;
import com.eip.modules.finance.domain.port.out.PagamentoRepositoryPort;
import com.eip.platform.error.BusinessRuleException;
import com.eip.platform.error.ResourceNotFoundException;
import com.eip.platform.outbox.OutboxPublisher;
import com.eip.platform.tenant.OrganizationContextHolder;

import lombok.RequiredArgsConstructor;

/**
 * Application service implementing the payment use cases. Writes are
 * transactional and emit outbox events; queries are read-only. The ATRASADO
 * status is derived on read (pending and past due) and never persisted.
 */
@Service
@RequiredArgsConstructor
public class PagamentoService implements GerenciarPagamentosUseCase {

    private static final ZoneId SP = ZoneId.of("America/Sao_Paulo");

    private final PagamentoRepositoryPort repo;
    private final OutboxPublisher outbox;

    private static UUID currentOrg() {
        return OrganizationContextHolder.current().organizationId().value();
    }

    private static LocalDate hoje() {
        return LocalDate.now(SP);
    }

    private static PagamentoTipo parseTipo(String tipo) {
        if (tipo == null || tipo.isBlank()) {
            throw new BusinessRuleException("Tipo inválido. Use RECEBIMENTO ou PAGAMENTO.");
        }
        try {
            return PagamentoTipo.valueOf(tipo.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BusinessRuleException("Tipo inválido. Use RECEBIMENTO ou PAGAMENTO.");
        }
    }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PagamentoView> listar(String status, String tipo) {
        UUID org = currentOrg();
        LocalDate hoje = hoje();
        return repo.listar(org, null).stream()
                .filter(p -> status == null || status.isBlank()
                        || p.statusEm(hoje).name().equalsIgnoreCase(status.trim()))
                .filter(p -> tipo == null || tipo.isBlank()
                        || (p.tipo() != null && p.tipo().name().equalsIgnoreCase(tipo.trim())))
                .map(p -> PagamentoView.from(p, hoje))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PagamentoView porId(UUID id) {
        return PagamentoView.from(carregar(id, currentOrg()), hoje());
    }

    @Override
    @Transactional
    public PagamentoView criar(PagamentoCommand cmd) {
        UUID org = currentOrg();
        Pagamento p = Pagamento.novo(
                org,
                cmd.exportId(),
                parseTipo(cmd.tipo()),
                blankToNull(cmd.descricao()),
                blankToNull(cmd.contraparte()),
                blankToNull(cmd.referencia()),
                blankToNull(cmd.contaBancaria()),
                cmd.contratoCambioId(),
                blankToNull(cmd.observacoes()),
                cmd.amount(),
                cmd.currency(),
                cmd.dueDate());
        Pagamento salvo = repo.salvar(p);
        outbox.record("Pagamento", salvo.id().asString(), org, "PagamentoCriado",
                FinanceEnums.payload("pagamentoId", salvo.id().value(), org));
        return PagamentoView.from(salvo, hoje());
    }

    @Override
    @Transactional
    public PagamentoView atualizar(UUID id, PagamentoCommand cmd) {
        UUID org = currentOrg();
        Pagamento p = carregar(id, org);
        p.editar(
                cmd.exportId(),
                parseTipo(cmd.tipo()),
                blankToNull(cmd.descricao()),
                blankToNull(cmd.contraparte()),
                blankToNull(cmd.referencia()),
                blankToNull(cmd.contaBancaria()),
                cmd.contratoCambioId(),
                blankToNull(cmd.observacoes()),
                cmd.amount(),
                cmd.currency(),
                cmd.dueDate());
        Pagamento salvo = repo.salvar(p);
        outbox.record("Pagamento", salvo.id().asString(), org, "PagamentoAtualizado",
                FinanceEnums.payload("pagamentoId", salvo.id().value(), org));
        return PagamentoView.from(salvo, hoje());
    }

    @Override
    @Transactional
    public PagamentoView marcarPago(UUID id, OffsetDateTime paidAt) {
        UUID org = currentOrg();
        Pagamento p = carregar(id, org);
        p.marcarPago(paidAt);
        Pagamento salvo = repo.salvar(p);
        outbox.record("Pagamento", salvo.id().asString(), org, "PagamentoLiquidado",
                FinanceEnums.payload("pagamentoId", salvo.id().value(), org));
        return PagamentoView.from(salvo, hoje());
    }

    @Override
    @Transactional
    public PagamentoView cancelar(UUID id) {
        UUID org = currentOrg();
        Pagamento p = carregar(id, org);
        p.cancelar();
        Pagamento salvo = repo.salvar(p);
        outbox.record("Pagamento", salvo.id().asString(), org, "PagamentoCancelado",
                FinanceEnums.payload("pagamentoId", salvo.id().value(), org));
        return PagamentoView.from(salvo, hoje());
    }

    @Override
    @Transactional(readOnly = true)
    public ResumoFinanceiro resumo(String tipo) {
        UUID org = currentOrg();
        LocalDate hoje = hoje();
        List<Pagamento> abertos = repo.listar(org, null).stream()
                .filter(p -> {
                    PagamentoStatus st = p.statusEm(hoje);
                    return st == PagamentoStatus.PENDENTE || st == PagamentoStatus.ATRASADO;
                })
                .toList();
        PagamentoTipo filtro = tipo == null || tipo.isBlank() ? null : parseTipo(tipo);
        BigDecimal totalReceber = filtro == PagamentoTipo.PAGAMENTO
                ? BigDecimal.ZERO.setScale(2)
                : somar(abertos, PagamentoTipo.RECEBIMENTO);
        BigDecimal totalPagar = filtro == PagamentoTipo.RECEBIMENTO
                ? BigDecimal.ZERO.setScale(2)
                : somar(abertos, PagamentoTipo.PAGAMENTO);
        BigDecimal saldo = totalReceber.subtract(totalPagar).setScale(2, RoundingMode.HALF_UP);
        return new ResumoFinanceiro(totalReceber, totalPagar, saldo);
    }

    private Pagamento carregar(UUID id, UUID org) {
        return repo.porId(id, org)
                .orElseThrow(() -> new ResourceNotFoundException("Lançamento não encontrado: " + id));
    }

    private static BigDecimal somar(List<Pagamento> pagamentos, PagamentoTipo tipo) {
        return pagamentos.stream()
                .filter(p -> p.tipo() == tipo)
                .map(Pagamento::amount)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);
    }
}
