package com.eip.modules.finance.domain.port.in;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import com.eip.modules.finance.domain.model.Pagamento;

/**
 * Inbound port: manage payments (receivables and payables).
 */
public interface GerenciarPagamentosUseCase {

    List<PagamentoView> listar(String status);

    PagamentoView porId(UUID id);

    PagamentoView criar(CriarPagamentoCommand cmd);

    PagamentoView marcarPago(UUID id);

    PagamentoView cancelar(UUID id);

    ResumoFinanceiro resumo();

    /** Command to create a payment. */
    record CriarPagamentoCommand(
            UUID exportId,
            String tipo,
            String descricao,
            BigDecimal amount,
            String currency,
            LocalDate dueDate) {
    }

    /** Read view of a single payment. */
    record PagamentoView(
            UUID id,
            UUID exportId,
            String tipo,
            String descricao,
            BigDecimal amount,
            String currency,
            String status,
            LocalDate dueDate,
            OffsetDateTime paidAt) {

        public static PagamentoView from(Pagamento p) {
            return new PagamentoView(
                    p.id().value(),
                    p.exportId(),
                    p.tipo() == null ? null : p.tipo().name(),
                    p.descricao(),
                    p.amount(),
                    p.currency(),
                    p.status().name(),
                    p.dueDate(),
                    p.paidAt());
        }
    }

    /**
     * Financial summary of pending payments.
     *
     * @param totalReceber sum of pending receivables
     * @param totalPagar   sum of pending payables
     * @param saldo        {@code totalReceber - totalPagar}
     */
    record ResumoFinanceiro(
            BigDecimal totalReceber,
            BigDecimal totalPagar,
            BigDecimal saldo) {
    }
}
