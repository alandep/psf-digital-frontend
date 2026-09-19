package com.eip.modules.compliance.domain.model;

import java.time.LocalDate;
import java.util.UUID;

import com.eip.platform.error.BusinessRuleException;

/**
 * License aggregate root. Pure domain: no framework or persistence annotations.
 * Lifecycle transitions are guarded.
 */
public final class Licenca {

    private final LicencaId id;
    private final UUID organizationId;
    private final String name;
    private final String tipo;
    private final String orgao;
    private final String numero;
    private LicencaStatus status;
    private final LocalDate emitidaEm;
    private LocalDate validaAte;
    private final long version;

    public Licenca(LicencaId id, UUID organizationId, String name, String tipo, String orgao,
                   String numero, LicencaStatus status, LocalDate emitidaEm, LocalDate validaAte,
                   long version) {
        this.id = id;
        this.organizationId = organizationId;
        this.name = name;
        this.tipo = tipo;
        this.orgao = orgao;
        this.numero = numero;
        this.status = status;
        this.emitidaEm = emitidaEm;
        this.validaAte = validaAte;
        this.version = version;
    }

    /** Creates a new active license. */
    public static Licenca nova(UUID org, String name, String tipo, String orgao, String numero,
                               LocalDate emitidaEm, LocalDate validaAte) {
        if (name == null || name.isBlank()) {
            throw new BusinessRuleException("Nome da licenca e obrigatorio");
        }
        return new Licenca(
                LicencaId.novo(),
                org,
                name,
                tipo,
                orgao,
                numero,
                LicencaStatus.ATIVA,
                emitidaEm,
                validaAte,
                0L);
    }

    /**
     * Renews the license, extending its validity and re-activating it.
     *
     * @throws BusinessRuleException if the license is cancelled or the date is missing
     */
    public void renovar(LocalDate novaValidade) {
        if (status == LicencaStatus.CANCELADA) {
            throw new BusinessRuleException("Licenca cancelada nao pode ser renovada");
        }
        if (novaValidade == null) {
            throw new BusinessRuleException("Nova validade e obrigatoria na renovacao");
        }
        this.status = LicencaStatus.ATIVA;
        this.validaAte = novaValidade;
    }

    /**
     * Cancels the license.
     *
     * @throws BusinessRuleException if the license is already cancelled
     */
    public void cancelar() {
        if (status == LicencaStatus.CANCELADA) {
            throw new BusinessRuleException("Licenca ja esta cancelada");
        }
        this.status = LicencaStatus.CANCELADA;
    }

    public LicencaId id() {
        return id;
    }

    public UUID organizationId() {
        return organizationId;
    }

    public String name() {
        return name;
    }

    public String tipo() {
        return tipo;
    }

    public String orgao() {
        return orgao;
    }

    public String numero() {
        return numero;
    }

    public LicencaStatus status() {
        return status;
    }

    public LocalDate emitidaEm() {
        return emitidaEm;
    }

    public LocalDate validaAte() {
        return validaAte;
    }

    public long version() {
        return version;
    }
}
