package com.eip.modules.admin.adapter.out.persistence;

import java.time.OffsetDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** JPA entity for the {@code legal_entity} table (CNPJ / razao social per org). */
@Entity
@Table(name = "legal_entity")
@Getter
@Setter
@NoArgsConstructor
public class LegalEntityEntity {

    @Id
    private UUID id;

    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;

    private String cnpj;

    @Column(name = "razao_social")
    private String razaoSocial;

    @Column(name = "nome_fantasia")
    private String nomeFantasia;

    private String tipo;

    private String pais;

    private String estado;

    private String cidade;

    private String responsavel;

    private String email;

    private String telefone;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;
}