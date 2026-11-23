package com.eip.modules.subscription.domain.model;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.Set;

import com.eip.platform.error.BusinessRuleException;

/**
 * Pure billing rules: provider status mapping, webhook event transitions,
 * billing periods and invoice numbering. No I/O, trivially unit-testable.
 */
public final class BillingRules {

    /** Business time zone for due dates and periods. */
    public static final ZoneId ZONE = ZoneId.of("America/Sao_Paulo");

    public static final String INVOICE_OPEN = "OPEN";
    public static final String INVOICE_PAID = "PAID";
    public static final String INVOICE_OVERDUE = "OVERDUE";
    public static final String INVOICE_REFUNDED = "REFUNDED";
    public static final String INVOICE_CANCELED = "CANCELED";

    public static final String KIND_SUBSCRIPTION = "SUBSCRIPTION";
    public static final String KIND_ADDON = "ADDON";

    /** Prefix of the external reference of add-on (pack) payments. */
    public static final String ADDON_REF_PREFIX = "addon:";

    public static final Set<String> BILLING_TYPES = Set.of("CREDIT_CARD", "PIX", "BOLETO");

    private static final DateTimeFormatter YEAR_MONTH = DateTimeFormatter.ofPattern("yyyy-MM");
    private static final DateTimeFormatter YEAR_MONTH_COMPACT = DateTimeFormatter.ofPattern("yyyyMM");

    private BillingRules() {
    }

    /** What a webhook event does to the invoice. */
    public enum WebhookAction {
        UPSERT, PAID, OVERDUE, REFUNDED, DELETED, IGNORE
    }

    /** Effect of a webhook event on the subscription. */
    public enum SubscriptionEffect {
        NONE, START_PAID_PERIOD, PAST_DUE
    }

    /** Effect of a webhook event on an add-on purchase. */
    public enum AddonEffect {
        NONE, PAID, CANCELED
    }

    /** Resolved transition of a webhook event. */
    public record Transition(WebhookAction action, String invoiceStatus,
            SubscriptionEffect subscription, AddonEffect addon) {
    }

    /** Maps an Asaas webhook event name to the action. Unknown events are ignored. */
    public static WebhookAction actionFor(String event) {
        if (event == null) {
            return WebhookAction.IGNORE;
        }
        return switch (event.toUpperCase(Locale.ROOT)) {
            case "PAYMENT_CREATED", "PAYMENT_UPDATED" -> WebhookAction.UPSERT;
            case "PAYMENT_CONFIRMED", "PAYMENT_RECEIVED" -> WebhookAction.PAID;
            case "PAYMENT_OVERDUE" -> WebhookAction.OVERDUE;
            case "PAYMENT_REFUNDED", "PAYMENT_CHARGEBACK_REQUESTED" -> WebhookAction.REFUNDED;
            case "PAYMENT_DELETED" -> WebhookAction.DELETED;
            default -> WebhookAction.IGNORE;
        };
    }

    /** Maps an Asaas payment status to the local invoice status. */
    public static String invoiceStatusFromGateway(String asaasStatus) {
        if (asaasStatus == null) {
            return INVOICE_OPEN;
        }
        return switch (asaasStatus.toUpperCase(Locale.ROOT)) {
            case "RECEIVED", "CONFIRMED", "RECEIVED_IN_CASH", "DUNNING_RECEIVED",
                    "REFUND_REQUESTED", "REFUND_IN_PROGRESS" -> INVOICE_PAID;
            case "OVERDUE", "DUNNING_REQUESTED" -> INVOICE_OVERDUE;
            case "REFUNDED", "CHARGEBACK_REQUESTED", "CHARGEBACK_DISPUTE",
                    "AWAITING_CHARGEBACK_REVERSAL" -> INVOICE_REFUNDED;
            case "DELETED" -> INVOICE_CANCELED;
            default -> INVOICE_OPEN;
        };
    }

    /** Whether the gateway status means the payment is already settled/confirmed. */
    public static boolean isPaidStatus(String asaasStatus) {
        return INVOICE_PAID.equals(invoiceStatusFromGateway(asaasStatus));
    }

    /**
     * Resolves the transition of a webhook event.
     *
     * @param event          Asaas event name
     * @param paymentStatus  Asaas payment status carried by the event
     * @param currentStatus  current local invoice status, or {@code null} when new
     * @param addon          whether the payment belongs to an add-on purchase
     */
    public static Transition transitionFor(String event, String paymentStatus,
            String currentStatus, boolean addon) {
        WebhookAction action = actionFor(event);
        return switch (action) {
            case IGNORE -> new Transition(action, currentStatus, SubscriptionEffect.NONE,
                    AddonEffect.NONE);
            case UPSERT -> {
                boolean settled = INVOICE_PAID.equals(currentStatus)
                        || INVOICE_REFUNDED.equals(currentStatus)
                        || INVOICE_CANCELED.equals(currentStatus);
                String status = settled ? currentStatus : invoiceStatusFromGateway(paymentStatus);
                if (INVOICE_PAID.equals(status) && !settled) {
                    // A "created/updated" event already settled: never mark PAID without effects.
                    status = INVOICE_OPEN;
                }
                yield new Transition(action, status, SubscriptionEffect.NONE, AddonEffect.NONE);
            }
            case PAID -> new Transition(action, INVOICE_PAID,
                    addon ? SubscriptionEffect.NONE : SubscriptionEffect.START_PAID_PERIOD,
                    addon ? AddonEffect.PAID : AddonEffect.NONE);
            case OVERDUE -> new Transition(action, INVOICE_OVERDUE,
                    addon ? SubscriptionEffect.NONE : SubscriptionEffect.PAST_DUE,
                    AddonEffect.NONE);
            case REFUNDED -> new Transition(action, INVOICE_REFUNDED, SubscriptionEffect.NONE,
                    addon ? AddonEffect.CANCELED : AddonEffect.NONE);
            case DELETED -> new Transition(action, INVOICE_CANCELED, SubscriptionEffect.NONE,
                    AddonEffect.NONE);
        };
    }

    /** Start of the business day of {@code date} (São Paulo). */
    public static OffsetDateTime startOfDay(LocalDate date) {
        return date.atStartOfDay(ZONE).toOffsetDateTime();
    }

    /** End of a billing period started at {@code start}. */
    public static OffsetDateTime periodEnd(OffsetDateTime start, BillingInterval interval) {
        return interval == BillingInterval.ANNUAL ? start.plusYears(1) : start.plusMonths(1);
    }

    /** Today in the business time zone. */
    public static LocalDate today() {
        return LocalDate.now(ZONE);
    }

    /** Invoice period label {@code yyyy-MM} of a due date. */
    public static String period(LocalDate dueDate) {
        return dueDate == null ? null : dueDate.format(YEAR_MONTH);
    }

    /**
     * Invoice number: the provider number when present, otherwise
     * {@code EIP-<yyyyMM>-<last 6 chars of the id>} (upper-case).
     */
    public static String invoiceNumber(String gatewayNumber, String id, LocalDate dueDate) {
        if (gatewayNumber != null && !gatewayNumber.isBlank()) {
            return gatewayNumber;
        }
        String raw = id == null ? "" : id.replaceAll("[^A-Za-z0-9]", "");
        String suffix = raw.length() > 6 ? raw.substring(raw.length() - 6) : raw;
        LocalDate ref = dueDate != null ? dueDate : today();
        return "EIP-" + ref.format(YEAR_MONTH_COMPACT) + "-" + suffix.toUpperCase(Locale.ROOT);
    }

    /** Parses the UI interval ({@code MONTHLY|ANNUAL}, case-insensitive; {@code YEARLY} accepted). */
    public static BillingInterval parseInterval(String interval) {
        if (interval == null || interval.isBlank()) {
            return BillingInterval.MONTHLY;
        }
        String v = interval.trim().toUpperCase(Locale.ROOT);
        return switch (v) {
            case "ANNUAL", "YEARLY", "ANUAL" -> BillingInterval.ANNUAL;
            case "MONTHLY", "MENSAL" -> BillingInterval.MONTHLY;
            default -> throw new BusinessRuleException(
                    "Periodicidade inválida. Use MONTHLY ou ANNUAL.");
        };
    }
}
