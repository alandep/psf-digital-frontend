package com.eip.modules.export.domain.model;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
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
    private String destinationCountry;
    private String incoterm;
    private BigDecimal totalAmount;
    private String currency;
    private long version;
    private final List<ItemExportacao> itens;
    /** Total cost of the export; {@code null} means not informed (treated as zero in analytics). */
    private BigDecimal totalCost;
    /** Whether the export has been shipped (orthogonal to {@link ExportacaoStatus}). */
    private boolean shipped;
    /** Instant the export was marked as shipped; {@code null} while pending. */
    private OffsetDateTime shippedAt;

    public Exportacao(ExportacaoId id, UUID organizationId, UUID legalEntityId, UUID customerId,
                      String reference, ExportacaoStatus status, String destinationCountry,
                      String incoterm, BigDecimal totalAmount, String currency, long version,
                      List<ItemExportacao> itens, BigDecimal totalCost, boolean shipped,
                      OffsetDateTime shippedAt) {
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
        this.totalCost = totalCost;
        this.shipped = shipped;
        this.shippedAt = shippedAt;
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
                lista,
                null,
                false,
                null);
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

    /**
     * Marks the export as shipped. Idempotent: a no-op when already shipped,
     * so repeated calls preserve the original {@code shippedAt}.
     *
     * @param quando the instant the shipment occurred
     */
    public void marcarEmbarcado(OffsetDateTime quando) {
        if (this.shipped) {
            return;
        }
        this.shipped = true;
        this.shippedAt = quando;
    }

    /**
     * Edits a draft export in place. Only allowed while in RASCUNHO.
     * Replaces items (recomputing totalAmount), destination, incoterm, currency and cost.
     *
     * @throws BusinessRuleException if status is not RASCUNHO
     */
    public void editarRascunho(String destino, String incoterm, String currency,
                               java.util.List<ItemExportacao> novosItens, BigDecimal custo) {
        if (status != ExportacaoStatus.RASCUNHO) {
            throw new BusinessRuleException("Somente exportacoes em RASCUNHO podem ser editadas");
        }
        this.destinationCountry = destino;
        this.incoterm = incoterm;
        if (currency != null && !currency.isBlank()) {
            this.currency = currency;
        }
        this.itens.clear();
        if (novosItens != null) {
            this.itens.addAll(novosItens);
        }
        this.totalAmount = this.itens.stream()
                .map(ItemExportacao::subtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        definirCusto(custo);
    }

    /** Assigns the system-generated human-readable reference (once). */
    public void atribuirReferencia(String ref) {
        this.reference = ref;
    }

    /**
     * Sets the total cost of the export.
     *
     * @param custo the cost ({@code null} means not informed)
     * @throws BusinessRuleException if {@code custo} is negative
     */
    public void definirCusto(BigDecimal custo) {
        if (custo != null && custo.signum() < 0) {
            throw new BusinessRuleException("Custo da exportacao nao pode ser negativo");
        }
        this.totalCost = custo;
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

    /** @return the total cost, or {@code null} when not informed. */
    public BigDecimal totalCost() {
        return totalCost;
    }

    /** @return {@code true} when the export has been shipped. */
    public boolean shipped() {
        return shipped;
    }

    /** @return the shipment instant, or {@code null} while pending. */
    public OffsetDateTime shippedAt() {
        return shippedAt;
    }
}
