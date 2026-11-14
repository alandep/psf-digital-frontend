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

    /** Lists entries; {@code status} (effective, ATRASADO computed) and {@code tipo} are optional filters. */
    List<PagamentoView> listar(String status, String tipo);

    PagamentoView porId(UUID id);

    PagamentoView criar(PagamentoCommand cmd);

    PagamentoView atualizar(UUID id, PagamentoCommand cmd);

    /** Settles the entry; {@code paidAt} defaults to now when {@code null}. */
    PagamentoView marcarPago(UUID id, OffsetDateTime paidAt);

    PagamentoView cancelar(UUID id);

    /** Summary of open entries, optionally restricted to one {@code tipo}. */
    ResumoFinanceiro resumo(String tipo);

    /** Command to create or fully update an entry. */
    record PagamentoCommand(
            UUID exportId,
            String tipo,
            String descricao,
            String contraparte,
            String referencia,
            String contaBancaria,
            UUID contratoCambioId,
            String observacoes,
            BigDecimal amount,
            String currency,
            LocalDate dueDate) {
    }

    /** Read view of a single payment. {@code status} is the effective one (ATRASADO computed). */
    record PagamentoView(
            UUID id,
            String tipo,
            String descricao,
            String contraparte,
            String referencia,
            String contaBancaria,
            UUID contratoCambioId,
            String observacoes,
            BigDecimal amount,
            String currency,
            String status,
            LocalDate dueDate,
            OffsetDateTime paidAt,
            UUID exportId,
            OffsetDateTime createdAt) {

        public static PagamentoView from(Pagamento p, LocalDate hoje) {
            return new PagamentoView(
                    p.id().value(),
                    p.tipo() == null ? null : p.tipo().name(),
                    p.descricao(),
                    p.contraparte(),
                    p.referencia(),
                    p.contaBancaria(),
                    p.contratoCambioId(),
                    p.observacoes(),
                    p.amount(),
                    p.currency(),
                    p.statusEm(hoje).name(),
                    p.dueDate(),
                    p.paidAt(),
                    p.exportId(),
                    p.createdAt());
        }
    }

    /**
     * Financial summary of open (pending or overdue) entries.
     *
     * @param totalReceber sum of open receivables
     * @param totalPagar   sum of open payables
     * @param saldo        {@code totalReceber - totalPagar}
     */
    record ResumoFinanceiro(
            BigDecimal totalReceber,
            BigDecimal totalPagar,
            BigDecimal saldo) {
    }
}
