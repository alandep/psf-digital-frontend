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
 * lifecycle behaviors {@link #marcarPago()} and {@link #cancelar()}.
 */
public final class Pagamento {

    private final PagamentoId id;
    private final UUID organizationId;
    private final UUID exportId;
    private final PagamentoTipo tipo;
    private final String descricao;
    private final BigDecimal amount;
    private final String currency;
    private PagamentoStatus status;
    private final LocalDate dueDate;
    private OffsetDateTime paidAt;
    private final long version;

    public Pagamento(PagamentoId id, UUID organizationId, UUID exportId, PagamentoTipo tipo,
                     String descricao, BigDecimal amount, String currency, PagamentoStatus status,
                     LocalDate dueDate, OffsetDateTime paidAt, long version) {
        this.id = id;
        this.organizationId = organizationId;
        this.exportId = exportId;
        this.tipo = tipo;
        this.descricao = descricao;
        this.amount = amount;
        this.currency = currency;
        this.status = status;
        this.dueDate = dueDate;
        this.paidAt = paidAt;
        this.version = version;
    }

    /** Creates a new pending payment. */
    public static Pagamento novo(UUID org, UUID exportId, PagamentoTipo tipo, String descricao,
                                 BigDecimal amount, String currency, LocalDate dueDate) {
        if (amount == null) {
            throw new BusinessRuleException("Valor do pagamento e obrigatorio");
        }
        return new Pagamento(
                PagamentoId.novo(),
                org,
                exportId,
                tipo,
                descricao,
                amount,
                currency == null || currency.isBlank() ? "USD" : currency,
                PagamentoStatus.PENDENTE,
                dueDate,
                null,
                0L);
    }

    /**
     * Marks the payment as settled.
     *
     * @throws BusinessRuleException if the payment is cancelled
     */
    public void marcarPago() {
        if (status == PagamentoStatus.CANCELADO) {
            throw new BusinessRuleException("Pagamento cancelado nao pode ser marcado como pago");
        }
        this.status = PagamentoStatus.PAGO;
        this.paidAt = OffsetDateTime.now();
    }

    /**
     * Cancels the payment.
     *
     * @throws BusinessRuleException if the payment is already settled
     */
    public void cancelar() {
        if (status == PagamentoStatus.PAGO) {
            throw new BusinessRuleException("Pagamento pago nao pode ser cancelado");
        }
        this.status = PagamentoStatus.CANCELADO;
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
}
