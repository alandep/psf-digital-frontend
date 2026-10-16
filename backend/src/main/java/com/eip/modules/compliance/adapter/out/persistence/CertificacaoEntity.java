package com.eip.modules.compliance.adapter.out.persistence;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * JPA entity mapping for the {@code certificacao} table (V11).
 */
@Entity
@Table(name = "certificacao")
@Getter
@Setter
@NoArgsConstructor
public class CertificacaoEntity {

    @Id
    private UUID id;

    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;

    @Column(name = "name", nullable = false)
    private String name;

    private String tipo;

    @Column(name = "orgao_emissor")
    private String orgaoEmissor;

    private String numero;

    @Column(nullable = false)
    private String status;

    @Column(name = "emitida_em")
    private LocalDate emitidaEm;

    @Column(name = "valida_ate")
    private LocalDate validaAte;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "product_id")
    private String productId;

    @Column(name = "product_name")
    private String productName;

    @Column(name = "categoria")
    private String categoria;

    @Column(name = "descricao")
    private String descricao;

    @Column(name = "pais_emissor")
    private String paisEmissor;

    @Column(name = "pais_destino")
    private String paisDestino;

    @Column(name = "assinatura_digital")
    private boolean assinaturaDigital;

    @Column(name = "compliance_status")
    private String complianceStatus;

    @Column(name = "export_id")
    private String exportId;

    @Column(name = "due_number")
    private String dueNumber;

    @Column(name = "ai_generated")
    private boolean aiGenerated;

    @Column(name = "ai_confidence_score", precision = 6, scale = 4)
    private BigDecimal aiConfidenceScore;

    @Column(name = "ai_risk_score", precision = 6, scale = 4)
    private BigDecimal aiRiskScore;

    @Column(name = "ai_risk_level")
    private String aiRiskLevel;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
