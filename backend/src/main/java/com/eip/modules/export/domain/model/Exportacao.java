package com.eip.modules.export.domain.model;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import com.eip.platform.error.BusinessRuleException;

/**
 * Export aggregate root. Pure domain: no framework or persistence annotations.
 *
 * <p>Invariants:
 * <ul>
 *   <li>{@code totalAmount} is the sum of {@code quantity * unitPrice} over the items.</li>
 *   <li>Confirmation requires status {@code RASCUNHO} and at least one item.</li>
 * </ul>
 */
public final class Exportacao {

    private final ExportacaoId id;
    private final UUID organizationId;
    private final UUID legalEntityId;
    private final UUID customerId;
    private String reference;
    private ExportacaoStatus status;
    private final String destinationCountry;
    private final String incoterm;
    private BigDecimal totalAmount;
    private final String currency;
    private long version;
    private final List<ItemExportacao> itens;

    public Exportacao(ExportacaoId id, UUID organizationId, UUID legalEntityId, UUID customerId,
                      String reference, ExportacaoStatus status, String destinationCountry,
                      String incoterm, BigDecimal totalAmount, String currency, long version,
                      List<ItemExportacao> itens) {
        this.id = id;
        this.organizationId = organizationId;
        this.legalEntityId = legalEntityId;
        this.customerId = customerId;
        this.reference = reference;
        this.status = status;
        this.destinationCountry = destinationCountry;
        this.incoterm = incoterm;
        this.totalAmount = totalAmount;
        this.currency = currency;
        this.version = version;
        this.itens = itens == null ? new ArrayList<>() : new ArrayList<>(itens);
    }

    /**
     * Creates a new draft export, computing the total from its items.
     */
    public static Exportacao novaRascunho(UUID org, UUID customerId, String destino,
                                          String incoterm, String currency,
                                          List<ItemExportacao> itens) {
        List<ItemExportacao> lista = itens == null ? new ArrayList<>() : new ArrayList<>(itens);
        BigDecimal total = lista.stream()
                .map(ItemExportacao::subtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return new Exportacao(
                ExportacaoId.novo(),
                org,
                null,
                customerId,
                null,
                ExportacaoStatus.RASCUNHO,
                destino,
                incoterm,
                total,
                currency == null || currency.isBlank() ? "USD" : currency,
                0L,
                lista);
    }

    /**
     * Confirms the export.
     *
     * @throws BusinessRuleException if there are no items or status is not {@code RASCUNHO}
     */
    public void confirmar() {
        if (itens.isEmpty()) {
            throw new BusinessRuleException("Exportacao sem itens nao pode ser confirmada");
        }
        if (status != ExportacaoStatus.RASCUNHO) {
            throw new BusinessRuleException(
                    "Somente exportacoes em RASCUNHO podem ser confirmadas");
        }
        this.status = ExportacaoStatus.CONFIRMADA;
    }

    /** Cancels the export unless already cancelled. */
    public void cancelar() {
        if (status == ExportacaoStatus.CANCELADA) {
            return;
        }
        this.status = ExportacaoStatus.CANCELADA;
    }

    public ExportacaoId id() {
        return id;
    }

    public UUID organizationId() {
        return organizationId;
    }

    public UUID legalEntityId() {
        return legalEntityId;
    }

    public UUID customerId() {
        return customerId;
    }

    public String reference() {
        return reference;
    }

    public ExportacaoStatus status() {
        return status;
    }

    public String destinationCountry() {
        return destinationCountry;
    }

    public String incoterm() {
        return incoterm;
    }

    public BigDecimal totalAmount() {
        return totalAmount;
    }

    public String currency() {
        return currency;
    }

    public long version() {
        return version;
    }

    public List<ItemExportacao> itens() {
        return Collections.unmodifiableList(itens);
    }
}
