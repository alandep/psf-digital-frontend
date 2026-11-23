package com.eip.modules.subscription.adapter.out.persistence;

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
 * JPA entity mapping for the tenant-scoped {@code invoice} table.
 */
@Entity
@Table(name = "invoice")
@Getter
@Setter
@NoArgsConstructor
public class InvoiceEntity {

    @Id
    private UUID id;

    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;

    @Column(name = "subscription_id")
    private UUID subscriptionId;

    @Column(name = "number")
    private String number;

    @Column(name = "period")
    private String period;

    @Column(name = "plan_name")
    private String planName;

    @Column(name = "amount", precision = 18, scale = 2, nullable = false)
    private BigDecimal amount;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "issued_at", nullable = false)
    private OffsetDateTime issuedAt;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "asaas_payment_id")
    private String asaasPaymentId;

    @Column(name = "kind", nullable = false)
    private String kind;

    @Column(name = "description")
    private String description;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "paid_at")
    private OffsetDateTime paidAt;

    @Column(name = "billing_type")
    private String billingType;

    @Column(name = "invoice_url")
    private String invoiceUrl;

    @Column(name = "bank_slip_url")
    private String bankSlipUrl;

    @Column(name = "net_value", precision = 18, scale = 2)
    private BigDecimal netValue;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
