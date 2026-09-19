package com.eip.modules.finance.domain.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import com.eip.platform.error.BusinessRuleException;

/**
 * FX (foreign-exchange) contract aggregate root. Pure domain.
 *
 * <p>{@code valor} is money ({@link BigDecimal}); {@code taxa} is an FX rate
 * ({@link BigDecimal}). Lifecycle transitions are guarded.
 */
public final class CambioContrato {

    private final CambioId id;
    private final UUID organizationId;
    private final String banco;
    private final String moeda;
    private final BigDecimal valor;
    private final BigDecimal taxa;
    private final CambioTipo tipo;
    private CambioStatus status;
    private final LocalDate dataContratacao;
    private LocalDate dataLiquidacao;
    private final long version;

    public CambioContrato(CambioId id, UUID organizationId, String banco, String moeda,
                          BigDecimal valor, BigDecimal taxa, CambioTipo tipo, CambioStatus status,
                          LocalDate dataContratacao, LocalDate dataLiquidacao, long version) {
        this.id = id;
        this.organizationId = organizationId;
        this.banco = banco;
        this.moeda = moeda;
        this.valor = valor;
        this.taxa = taxa;
        this.tipo = tipo;
        this.status = status;
        this.dataContratacao = dataContratacao;
        this.dataLiquidacao = dataLiquidacao;
        this.version = version;
    }

    /** Creates a new active FX contract. */
    public static CambioContrato novo(UUID org, String banco, String moeda, BigDecimal valor,
                                      BigDecimal taxa, CambioTipo tipo, LocalDate dataContratacao,
                                      LocalDate dataLiquidacao) {
        if (valor == null || taxa == null) {
            throw new BusinessRuleException("Valor e taxa do cambio sao obrigatorios");
        }
        if (moeda == null || moeda.isBlank()) {
            throw new BusinessRuleException("Moeda do cambio e obrigatoria");
        }
        return new CambioContrato(
                CambioId.novo(),
                org,
                banco,
                moeda,
                valor,
                taxa,
                tipo,
                CambioStatus.ATIVO,
                dataContratacao,
                dataLiquidacao,
                0L);
    }

    /**
     * Settles the contract.
     *
     * @throws BusinessRuleException if the contract is not active
     */
    public void liquidar() {
        if (status != CambioStatus.ATIVO) {
            throw new BusinessRuleException("Somente contratos ATIVO podem ser liquidados");
        }
        this.status = CambioStatus.LIQUIDADO;
        this.dataLiquidacao = LocalDate.now();
    }

    /**
     * Cancels the contract.
     *
     * @throws BusinessRuleException if the contract is already settled
     */
    public void cancelar() {
        if (status == CambioStatus.LIQUIDADO) {
            throw new BusinessRuleException("Contrato liquidado nao pode ser cancelado");
        }
        this.status = CambioStatus.CANCELADO;
    }

    public CambioId id() {
        return id;
    }

    public UUID organizationId() {
        return organizationId;
    }

    public String banco() {
        return banco;
    }

    public String moeda() {
        return moeda;
    }

    public BigDecimal valor() {
        return valor;
    }

    public BigDecimal taxa() {
        return taxa;
    }

    public CambioTipo tipo() {
        return tipo;
    }

    public CambioStatus status() {
        return status;
    }

    public LocalDate dataContratacao() {
        return dataContratacao;
    }

    public LocalDate dataLiquidacao() {
        return dataLiquidacao;
    }

    public long version() {
        return version;
    }
}
