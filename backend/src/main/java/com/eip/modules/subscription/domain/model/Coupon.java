package com.eip.modules.subscription.domain.model;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.OffsetDateTime;
import java.util.Locale;

/**
 * Fixed-price coupon (global catalog). {@code planCode}/{@code billingInterval}
 * restrict where it applies when not null; {@code maxRedemptions} null means
 * unlimited.
 */
public record Coupon(String code, String description, String planCode, String billingInterval,
        BigDecimal fixedPrice, int cycles, Integer maxRedemptions, int redeemed,
        OffsetDateTime validUntil, boolean active) {

    /** Outcome of a coupon validation. */
    public record Check(boolean valid, String message) {
    }

    /**
     * Validates the coupon for a plan/interval at {@code now}. A {@code null}
     * plan or interval skips that restriction (preview without a selection).
     *
     * @param planCode plan being contracted (e.g. BUSINESS)
     * @param interval MONTHLY or ANNUAL
     */
    public Check check(String planCode, String interval, OffsetDateTime now) {
        if (!active) {
            return new Check(false, "Este cupom não está mais ativo.");
        }
        if (validUntil != null && !validUntil.isAfter(now)) {
            return new Check(false, "Este cupom expirou.");
        }
        if (this.planCode != null && planCode != null
                && !this.planCode.equalsIgnoreCase(planCode.trim())) {
            return new Check(false, "Este cupom é válido apenas para o plano "
                    + planLabel(this.planCode) + ".");
        }
        if (this.billingInterval != null && interval != null
                && !this.billingInterval.equalsIgnoreCase(interval.trim())) {
            return new Check(false, "Este cupom é válido apenas para a cobrança "
                    + ("ANNUAL".equalsIgnoreCase(this.billingInterval) ? "anual" : "mensal") + ".");
        }
        if (maxRedemptions != null && redeemed >= maxRedemptions) {
            return new Check(false, "Este cupom atingiu o limite de resgates.");
        }
        return new Check(true, "Cupom aplicado: " + brl(fixedPrice) + " por " + cycles
                + (cycles == 1 ? " cobrança." : " cobranças."));
    }

    private static String planLabel(String code) {
        return switch (code.toUpperCase(Locale.ROOT)) {
            case "START" -> "EIP Start";
            case "BUSINESS" -> "EIP Business";
            case "PRO" -> "EIP Pro";
            case "ENTERPRISE" -> "EIP Enterprise";
            default -> code;
        };
    }

    /** pt-BR currency format (e.g. {@code R$ 1.790,00}). */
    public static String brl(BigDecimal value) {
        NumberFormat nf = NumberFormat.getCurrencyInstance(Locale.of("pt", "BR"));
        return nf.format(value == null ? BigDecimal.ZERO : value).replace('\u00A0', ' ');
    }
}
