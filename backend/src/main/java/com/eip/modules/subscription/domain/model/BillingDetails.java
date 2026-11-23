package com.eip.modules.subscription.domain.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

/**
 * Gateway / billing attributes of a {@link Subscription}, used to restore the
 * aggregate from persistence. {@code cardToken} is the provider token (never a PAN).
 */
public record BillingDetails(String asaasCustomerId, String asaasSubscriptionId,
        String billingType, String cardToken, LocalDate nextDueDate,
        OffsetDateTime canceledAt, String cancelReason, String couponCode,
        BigDecimal couponPrice, Integer couponCyclesRemaining,
        OffsetDateTime invoicesSyncedAt) {

    /** Details of a subscription never linked to the gateway. */
    public static BillingDetails empty() {
        return new BillingDetails(null, null, null, null, null, null, null, null, null, null, null);
    }

    @Override
    public String toString() {
        return "BillingDetails[customer=" + asaasCustomerId + ", subscription="
                + asaasSubscriptionId + ", billingType=" + billingType + "]";
    }
}
