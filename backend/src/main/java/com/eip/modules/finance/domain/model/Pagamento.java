package com.eip.modules.finance.domain.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

import com.eip.platform.error.BusinessRuleException;

/**
 * Payment aggregate root. Pure domain: no framework or persistence annotations.
 *
 * <p>Money is always {@link BigDecimal}. Invariants are enforced by the
 * lifecycle behaviors {@link #marcarPago(OffsetDateTime)}, {@link #cancelar()}
 * and {@link #editar}. The {@code ATRASADO} status is derived on read by
 * {@link #statusEm(LocalDate)} (a pending item past its due date).
 */
public final class Pagamento {

    private final PagamentoId id;
    private final UUID organizationId;
    private UUID exportId;
    private PagamentoTipo tipo;
    private String descricao;
    private String contraparte;
    private String referencia;
    private String contaBancaria;
    private UUID contratoCambioId;
    private String observacoes;
    private BigDecimal amount;
    private String currency;
    private PagamentoStatus status;
    private LocalDate dueDate;
    private OffsetDateTime paidAt;
    private final long version;
    private final OffsetDateTime createdAt;

    public Pagamento(PagamentoId id, UUID organizationId, UUID exportId, PagamentoTipo tipo,
                     String descricao, String contraparte, String referencia, String contaBancaria,
                     UUID contratoCambioId, String observacoes, BigDecimal amount, String currency,
                     PagamentoStatus status, LocalDate dueDate, OffsetDateTime paidAt, long version,
                     OffsetDateTime createdAt) {
        this.id = id;
        this.organizationId = organizationId;
        this.exportId = exportId;
        this.tipo = tipo;
        this.descricao = descricao;
        this.contraparte = contraparte;
        this.referencia = referencia;
        this.contaBancaria = contaBancaria;
        this.contratoCambioId = contratoCambioId;
        this.observacoes = observacoes;
        this.amount = amount;
        this.currency = currency;
        this.status = status;
        this.dueDate = dueDate;
        this.paidAt = paidAt;
        this.version = version;
        this.createdAt = createdAt;
    }

    /** Creates a new pending payment after validating the business rules. */
    public static Pagamento novo(UUID org, UUID exportId, PagamentoTipo tipo, String descricao,
                                 String contraparte, String referencia, String contaBancaria,
                                 UUID contratoCambioId, String observacoes, BigDecimal amount,
                                 String currency, LocalDate dueDate) {
        validar(tipo, amount, currency, dueDate);
        return new Pagamento(
                PagamentoId.novo(),
                org,
                exportId,
                tipo,
                descricao,
                contraparte,
                referencia,
                contaBancaria,
                contratoCambioId,
                observacoes,
                amount,
                currency.trim().toUpperCase(),
                PagamentoStatus.PENDENTE,
                dueDate,
                null,
                0L,
                null);
    }

    /**
     * Updates the editable data of an open entry.
     *
     * @throws BusinessRuleException if the entry is settled/cancelled or the data is invalid
     */
    public void editar(UUID exportId, PagamentoTipo tipo, String descricao, String contraparte,
                       String referencia, String contaBancaria, UUID contratoCambioId,
                       String observacoes, BigDecimal amount, String currency, LocalDate dueDate) {
        if (status != PagamentoStatus.PENDENTE && status != PagamentoStatus.ATRASADO) {
            throw new BusinessRuleException("Somente lançamentos em aberto podem ser editados.");
        }
        validar(tipo, amount, currency, dueDate);
        this.exportId = exportId;
        this.tipo = tipo;
        this.descricao = descricao;
        this.contraparte = contraparte;
        this.referencia = referencia;
        this.contaBancaria = contaBancaria;
        this.contratoCambioId = contratoCambioId;
        this.observacoes = observacoes;
        this.amount = amount;
        this.currency = currency.trim().toUpperCase();
        this.dueDate = dueDate;
    }

    private static void validar(PagamentoTipo tipo, BigDecimal amount, String currency,
                                LocalDate dueDate) {
        if (tipo == null) {
            throw new BusinessRuleException("Tipo inválido. Use RECEBIMENTO ou PAGAMENTO.");
        }
        if (amount == null || amount.signum() <= 0) {
            throw new BusinessRuleException("O valor deve ser maior que zero.");
        }
        if (currency == null || !currency.trim().matches("[A-Za-z]{3}")) {
            throw new BusinessRuleException("A moeda deve ter 3 letras (ex.: USD).");
        }
        if (dueDate == null) {
            throw new BusinessRuleException("O vencimento é obrigatório.");
        }
    }

    /**
     * Marks the payment as settled at the given instant.
     *
     * @throws BusinessRuleException if the payment is cancelled
     */
    public void marcarPago(OffsetDateTime quando) {
        if (status == PagamentoStatus.CANCELADO) {
            throw new BusinessRuleException("Lançamento cancelado não pode ser marcado como pago.");
        }
        this.status = PagamentoStatus.PAGO;
        this.paidAt = quando == null ? OffsetDateTime.now() : quando;
    }

    /**
     * Cancels the payment.
     *
     * @throws BusinessRuleException if the payment is already settled
     */
    public void cancelar() {
        if (status == PagamentoStatus.PAGO) {
            throw new BusinessRuleException("Lançamento pago não pode ser cancelado.");
        }
        this.status = PagamentoStatus.CANCELADO;
    }

    /**
     * Effective status at the given day: a pending entry whose due date is in
     * the past is reported as {@link PagamentoStatus#ATRASADO}.
     */
    public PagamentoStatus statusEm(LocalDate hoje) {
        if (status == PagamentoStatus.PENDENTE && dueDate != null && dueDate.isBefore(hoje)) {
            return PagamentoStatus.ATRASADO;
        }
        return status;
    }

    public PagamentoId id() {
        return id;
    }

    public UUID organizationId() {
        return organizationId;
    }

    public UUID exportId() {
        return exportId;
    }

    public PagamentoTipo tipo() {
        return tipo;
    }

    public String descricao() {
        return descricao;
    }

    public String contraparte() {
        return contraparte;
    }

    public String referencia() {
        return referencia;
    }

    public String contaBancaria() {
        return contaBancaria;
    }

    public UUID contratoCambioId() {
        return contratoCambioId;
    }

    public String observacoes() {
        return observacoes;
    }

    public BigDecimal amount() {
        return amount;
    }

    public String currency() {
        return currency;
    }

    public PagamentoStatus status() {
        return status;
    }

    public LocalDate dueDate() {
        return dueDate;
    }

    public OffsetDateTime paidAt() {
        return paidAt;
    }

    public long version() {
        return version;
    }

    public OffsetDateTime createdAt() {
        return createdAt;
    }
}
