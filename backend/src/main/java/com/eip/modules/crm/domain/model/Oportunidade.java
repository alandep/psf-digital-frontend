package com.eip.modules.crm.domain.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import com.eip.platform.error.BusinessRuleException;

/**
 * Sales-opportunity aggregate root. Pure domain.
 *
 * <p>{@code valorEstimado} is money ({@link BigDecimal}). The
 * {@link EstagioOportunidade#GANHA} and {@link EstagioOportunidade#PERDIDA}
 * stages are terminal.
 */
public final class Oportunidade {

    private final OportunidadeId id;
    private final UUID organizationId;
    private final ClienteId clienteId;
    private final String titulo;
    private final BigDecimal valorEstimado;
    private final String moeda;
    private EstagioOportunidade estagio;
    private Integer probabilidade;
    private final LocalDate fechamentoPrevisto;
    private final long version;

    public Oportunidade(OportunidadeId id, UUID organizationId, ClienteId clienteId, String titulo,
                        BigDecimal valorEstimado, String moeda, EstagioOportunidade estagio,
                        Integer probabilidade, LocalDate fechamentoPrevisto, long version) {
        this.id = id;
        this.organizationId = organizationId;
        this.clienteId = clienteId;
        this.titulo = titulo;
        this.valorEstimado = valorEstimado;
        this.moeda = moeda;
        this.estagio = estagio;
        this.probabilidade = probabilidade;
        this.fechamentoPrevisto = fechamentoPrevisto;
        this.version = version;
    }

    /** Creates a new opportunity in the {@link EstagioOportunidade#PROSPECCAO} stage. */
    public static Oportunidade nova(UUID org, ClienteId clienteId, String titulo,
                                    BigDecimal valorEstimado, String moeda, Integer probabilidade,
                                    LocalDate fechamentoPrevisto) {
        if (titulo == null || titulo.isBlank()) {
            throw new BusinessRuleException("Titulo da oportunidade e obrigatorio");
        }
        if (clienteId == null) {
            throw new BusinessRuleException("Cliente da oportunidade e obrigatorio");
        }
        return new Oportunidade(
                OportunidadeId.novo(),
                org,
                clienteId,
                titulo,
                valorEstimado,
                moeda == null || moeda.isBlank() ? "USD" : moeda,
                EstagioOportunidade.PROSPECCAO,
                probabilidade,
                fechamentoPrevisto,
                0L);
    }

    private boolean terminal() {
        return estagio == EstagioOportunidade.GANHA || estagio == EstagioOportunidade.PERDIDA;
    }

    /**
     * Advances the opportunity to a new pipeline stage.
     *
     * @throws BusinessRuleException if the opportunity is already in a terminal stage
     */
    public void avancarEstagio(EstagioOportunidade novo) {
        if (novo == null) {
            throw new BusinessRuleException("Novo estagio da oportunidade e obrigatorio");
        }
        if (terminal()) {
            throw new BusinessRuleException(
                    "Oportunidade em estagio terminal nao pode avancar: " + estagio);
        }
        this.estagio = novo;
    }

    /**
     * Marks the opportunity as won.
     *
     * @throws BusinessRuleException if the opportunity is already in a terminal stage
     */
    public void ganhar() {
        if (terminal()) {
            throw new BusinessRuleException(
                    "Oportunidade em estagio terminal nao pode ser ganha: " + estagio);
        }
        this.estagio = EstagioOportunidade.GANHA;
        this.probabilidade = 100;
    }

    /**
     * Marks the opportunity as lost.
     *
     * @throws BusinessRuleException if the opportunity is already in a terminal stage
     */
    public void perder() {
        if (terminal()) {
            throw new BusinessRuleException(
                    "Oportunidade em estagio terminal nao pode ser perdida: " + estagio);
        }
        this.estagio = EstagioOportunidade.PERDIDA;
        this.probabilidade = 0;
    }

    public OportunidadeId id() {
        return id;
    }

    public UUID organizationId() {
        return organizationId;
    }

    public ClienteId clienteId() {
        return clienteId;
    }

    public String titulo() {
        return titulo;
    }

    public BigDecimal valorEstimado() {
        return valorEstimado;
    }

    public String moeda() {
        return moeda;
    }

    public EstagioOportunidade estagio() {
        return estagio;
    }

    public Integer probabilidade() {
        return probabilidade;
    }

    public LocalDate fechamentoPrevisto() {
        return fechamentoPrevisto;
    }

    public long version() {
        return version;
    }
}
