package com.eip.modules.finance.domain.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import com.eip.platform.error.BusinessRuleException;

/**
 * Hedge contract aggregate root. Pure domain.
 *
 * <p>{@code notional} is money ({@link BigDecimal}); {@code strike} is an FX
 * rate ({@link BigDecimal}). Lifecycle transitions are guarded.
 */
public final class HedgeContrato {

    private final HedgeId id;
    private final UUID organizationId;
    private final HedgeInstrumento instrumento;
    private final String moeda;
    private final BigDecimal notional;
    private final BigDecimal strike;
    private final LocalDate vencimento;
    private HedgeStatus status;
    private final long version;

    public HedgeContrato(HedgeId id, UUID organizationId, HedgeInstrumento instrumento,
                         String moeda, BigDecimal notional, BigDecimal strike, LocalDate vencimento,
                         HedgeStatus status, long version) {
        this.id = id;
        this.organizationId = organizationId;
        this.instrumento = instrumento;
        this.moeda = moeda;
        this.notional = notional;
        this.strike = strike;
        this.vencimento = vencimento;
        this.status = status;
        this.version = version;
    }

    /** Creates a new active hedge contract. */
    public static HedgeContrato novo(UUID org, HedgeInstrumento instrumento, String moeda,
                                     BigDecimal notional, BigDecimal strike, LocalDate vencimento) {
        if (notional == null) {
            throw new BusinessRuleException("Notional do hedge e obrigatorio");
        }
        if (moeda == null || moeda.isBlank()) {
            throw new BusinessRuleException("Moeda do hedge e obrigatoria");
        }
        return new HedgeContrato(
                HedgeId.novo(),
                org,
                instrumento,
                moeda,
                notional,
                strike,
                vencimento,
                HedgeStatus.ATIVO,
                0L);
    }

    /**
     * Exercises the hedge.
     *
     * @throws BusinessRuleException if the contract is not active
     */
    public void exercer() {
        if (status != HedgeStatus.ATIVO) {
            throw new BusinessRuleException("Somente contratos ATIVO podem ser exercidos");
        }
        this.status = HedgeStatus.EXERCIDO;
    }

    /**
     * Expires the hedge.
     *
     * @throws BusinessRuleException if the contract is not active
     */
    public void expirar() {
        if (status != HedgeStatus.ATIVO) {
            throw new BusinessRuleException("Somente contratos ATIVO podem expirar");
        }
        this.status = HedgeStatus.EXPIRADO;
    }

    /**
     * Cancels the hedge.
     *
     * @throws BusinessRuleException if the contract is no longer active
     */
    public void cancelar() {
        if (status != HedgeStatus.ATIVO) {
            throw new BusinessRuleException("Somente contratos ATIVO podem ser cancelados");
        }
        this.status = HedgeStatus.CANCELADO;
    }

    public HedgeId id() {
        return id;
    }

    public UUID organizationId() {
        return organizationId;
    }

    public HedgeInstrumento instrumento() {
        return instrumento;
    }

    public String moeda() {
        return moeda;
    }

    public BigDecimal notional() {
        return notional;
    }

    public BigDecimal strike() {
        return strike;
    }

    public LocalDate vencimento() {
        return vencimento;
    }

    public HedgeStatus status() {
        return status;
    }

    public long version() {
        return version;
    }
}
