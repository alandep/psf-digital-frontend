package com.eip.modules.subscription.adapter.out.asaas;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;

import com.eip.modules.subscription.domain.port.out.PaymentGatewayPort.GatewayPayment;
import com.fasterxml.jackson.databind.JsonNode;

/**
 * Lenient mapping of Asaas JSON payloads (unknown fields are ignored). Shared
 * by the REST adapter and the webhook controller.
 */
public final class AsaasJson {

    private AsaasJson() {
    }

    /** Maps an Asaas payment object. */
    public static GatewayPayment payment(JsonNode n) {
        if (n == null || n.isMissingNode() || n.isNull()) {
            return null;
        }
        LocalDate paymentDate = date(n, "paymentDate");
        if (paymentDate == null) {
            paymentDate = date(n, "clientPaymentDate");
        }
        if (paymentDate == null) {
            paymentDate = date(n, "confirmedDate");
        }
        return new GatewayPayment(
                text(n, "id"),
                text(n, "subscription"),
                text(n, "customer"),
                text(n, "status"),
                decimal(n, "value"),
                decimal(n, "netValue"),
                date(n, "dueDate"),
                paymentDate,
                text(n, "billingType"),
                text(n, "invoiceUrl"),
                text(n, "bankSlipUrl"),
                text(n, "invoiceNumber"),
                text(n, "externalReference"),
                text(n, "description"));
    }

    public static String text(JsonNode n, String field) {
        if (n == null) {
            return null;
        }
        JsonNode v = n.get(field);
        if (v == null || v.isNull() || v.isMissingNode()) {
            return null;
        }
        String s = v.asText();
        return s == null || s.isBlank() ? null : s;
    }

    public static BigDecimal decimal(JsonNode n, String field) {
        JsonNode v = n == null ? null : n.get(field);
        if (v == null || v.isNull()) {
            return null;
        }
        if (v.isNumber()) {
            return v.decimalValue();
        }
        try {
            return new BigDecimal(v.asText());
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    public static LocalDate date(JsonNode n, String field) {
        String s = text(n, field);
        if (s == null) {
            return null;
        }
        try {
            return LocalDate.parse(s.length() > 10 ? s.substring(0, 10) : s);
        } catch (DateTimeParseException ex) {
            return null;
        }
    }
}
