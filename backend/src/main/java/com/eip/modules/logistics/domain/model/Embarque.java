package com.eip.modules.logistics.domain.model;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import com.eip.platform.error.BusinessRuleException;

/**
 * Shipment aggregate root. Pure domain: no framework or persistence annotations.
 *
 * <p>Lifecycle invariants:
 * <ul>
 *   <li>A shipment starts as {@code PLANEJADO}.</li>
 *   <li>{@code iniciarTransito} is only valid from {@code PLANEJADO}.</li>
 *   <li>{@code concluir} is only valid from {@code EM_TRANSITO}.</li>
 *   <li>{@code cancelar} is valid from any state except {@code ENTREGUE}.</li>
 * </ul>
 */
public final class Embarque {

    private final EmbarqueId id;
    private final UUID organizationId;
    private final UUID exportId;
    private String reference;
    private EmbarqueStatus status;
    private final UUID portoOrigemId;
    private final UUID portoDestinoId;
    private final UUID navioId;
    private final UUID transportadoraId;
    private final LocalDate etd;
    private final LocalDate eta;
    private final String modal;
    private long version;
    private final List<Container> containers;

    public Embarque(EmbarqueId id, UUID organizationId, UUID exportId, String reference,
                    EmbarqueStatus status, UUID portoOrigemId, UUID portoDestinoId,
                    UUID navioId, UUID transportadoraId, LocalDate etd, LocalDate eta,
                    String modal, long version, List<Container> containers) {
        this.id = id;
        this.organizationId = organizationId;
        this.exportId = exportId;
        this.reference = reference;
        this.status = status;
        this.portoOrigemId = portoOrigemId;
        this.portoDestinoId = portoDestinoId;
        this.navioId = navioId;
        this.transportadoraId = transportadoraId;
        this.etd = etd;
        this.eta = eta;
        this.modal = modal;
        this.version = version;
        this.containers = containers == null ? new ArrayList<>() : new ArrayList<>(containers);
    }

    /**
     * Creates a new planned shipment.
     */
    public static Embarque novo(UUID org, UUID exportId, String reference, UUID origem,
                                UUID destino, UUID navio, UUID transp, LocalDate etd,
                                LocalDate eta, String modal) {
        return new Embarque(
                EmbarqueId.novo(),
                org,
                exportId,
                reference,
                EmbarqueStatus.PLANEJADO,
                origem,
                destino,
                navio,
                transp,
                etd,
                eta,
                modal,
                0L,
                new ArrayList<>());
    }

    /**
     * Puts the shipment in transit.
     *
     * @throws BusinessRuleException if the shipment is not {@code PLANEJADO}
     */
    public void iniciarTransito() {
        if (status != EmbarqueStatus.PLANEJADO) {
            throw new BusinessRuleException(
                    "Somente embarques PLANEJADO podem iniciar transito");
        }
        this.status = EmbarqueStatus.EM_TRANSITO;
    }

    /**
     * Marks the shipment as delivered.
     *
     * @throws BusinessRuleException if the shipment is not {@code EM_TRANSITO}
     */
    public void concluir() {
        if (status != EmbarqueStatus.EM_TRANSITO) {
            throw new BusinessRuleException(
                    "Somente embarques EM_TRANSITO podem ser concluidos");
        }
        this.status = EmbarqueStatus.ENTREGUE;
    }

    /**
     * Cancels the shipment.
     *
     * @throws BusinessRuleException if the shipment is already {@code ENTREGUE}
     */
    public void cancelar() {
        if (status == EmbarqueStatus.ENTREGUE) {
            throw new BusinessRuleException(
                    "Embarque ENTREGUE nao pode ser cancelado");
        }
        this.status = EmbarqueStatus.CANCELADO;
    }

    public EmbarqueId id() {
        return id;
    }

    public UUID organizationId() {
        return organizationId;
    }

    public UUID exportId() {
        return exportId;
    }

    public String reference() {
        return reference;
    }

    public EmbarqueStatus status() {
        return status;
    }

    public UUID portoOrigemId() {
        return portoOrigemId;
    }

    public UUID portoDestinoId() {
        return portoDestinoId;
    }

    public UUID navioId() {
        return navioId;
    }

    public UUID transportadoraId() {
        return transportadoraId;
    }

    public LocalDate etd() {
        return etd;
    }

    public LocalDate eta() {
        return eta;
    }

    public String modal() {
        return modal;
    }

    public long version() {
        return version;
    }

    public List<Container> containers() {
        return Collections.unmodifiableList(containers);
    }
}
