package com.eip.modules.subscription.adapter.out.persistence;

import java.math.BigDecimal;
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
 * JPA entity for the tenant-scoped {@code addon_purchase} table (RLS).
 */
@Entity(name = "BillingAddonPurchase")
@Table(name = "addon_purchase")
@Getter
@Setter
@NoArgsConstructor
public class AddonPurchaseEntity {

    @Id
    private UUID id;

    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;

    @Column(name = "addon_code", nullable = false)
    private String addonCode;

    @Column(name = "ai_credits", nullable = false)
    private int aiCredits;

    @Column(name = "ocr_pages", nullable = false)
    private int ocrPages;

    @Column(name = "amount", precision = 18, scale = 2, nullable = false)
    private BigDecimal amount;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "billing_type")
    private String billingType;

    @Column(name = "invoice_id")
    private UUID invoiceId;

    @Column(name = "asaas_payment_id")
    private String asaasPaymentId;

    @Column(name = "period_start")
    private OffsetDateTime periodStart;

    @Column(name = "period_end")
    private OffsetDateTime periodEnd;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "paid_at")
    private OffsetDateTime paidAt;
}
