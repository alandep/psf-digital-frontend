package com.eip.modules.subscription.adapter.out.asaas;

import java.math.BigDecimal;
import java.net.http.HttpClient;
import java.time.Duration;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Supplier;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

import com.eip.modules.subscription.domain.port.out.PaymentGatewayPort;
import com.eip.platform.error.BusinessRuleException;
import com.eip.platform.error.GatewayUnavailableException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;

/**
 * Real Asaas REST adapter (API v3). Active only with {@code eip.asaas.enabled=true}.
 *
 * <p>Error mapping: HTTP 400-class validation errors become
 * {@link BusinessRuleException} with Asaas' {@code errors[].description}; 401/403,
 * 429, 5xx and I/O failures become {@link GatewayUnavailableException} (HTTP 503).
 *
 * <p>Logging policy: only operation names, gateway ids and HTTP status codes are
 * logged. Card data, card tokens, the API key and response bodies are never logged.
 */
@Slf4j
@Component
@ConditionalOnProperty(name = "eip.asaas.enabled", havingValue = "true")
public class AsaasPaymentGateway implements PaymentGatewayPort {

    static final String USER_AGENT = "EIP-Export-Intelligence-Platform/1.0";
    private static final String GENERIC_REJECTION =
            "Não foi possível processar o pagamento. Verifique os dados informados.";

    private final RestClient client;
    private final ObjectMapper objectMapper;

    public AsaasPaymentGateway(AsaasProperties props, RestClient.Builder builder,
            ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        HttpClient http = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
        JdkClientHttpRequestFactory factory = new JdkClientHttpRequestFactory(http);
        factory.setReadTimeout(Duration.ofSeconds(60));
        String apiKey = props.apiKey() == null ? "" : props.apiKey();
        this.client = builder
                .baseUrl(props.baseUrl())
                .requestFactory(factory)
                .defaultHeader("access_token", apiKey)
                .defaultHeader(HttpHeaders.USER_AGENT, USER_AGENT)
                .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    // ------------------------------------------------------------------ customers

    @Override
    public String upsertCustomer(CustomerData c) {
        String cpfCnpj = digits(c.cpfCnpj());
        JsonNode found = call("customers.search", () -> client.get()
                .uri(u -> u.path("/customers").queryParam("cpfCnpj", cpfCnpj).build())
                .retrieve().body(JsonNode.class));
        JsonNode data = found == null ? null : found.get("data");
        if (data != null && data.isArray() && !data.isEmpty()) {
            String id = AsaasJson.text(data.get(0), "id");
            if (id != null) {
                log.info("Asaas customer reutilizado id={}", id);
                return id;
            }
        }
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("name", c.name());
        body.put("cpfCnpj", cpfCnpj);
        put(body, "email", c.email());
        putPhone(body, c.phone());
        put(body, "postalCode", digits(c.postalCode()));
        put(body, "addressNumber", c.addressNumber());
        put(body, "externalReference", c.externalReference());
        JsonNode created = call("customers.create", () -> client.post().uri("/customers")
                .body(body).retrieve().body(JsonNode.class));
        String id = AsaasJson.text(created, "id");
        if (id == null) {
            throw new GatewayUnavailableException();
        }
        log.info("Asaas customer criado id={}", id);
        return id;
    }

    // ------------------------------------------------------------------ subscriptions

    @Override
    public GatewaySubscription createSubscription(String customerId, BigDecimal value,
            Cycle cycle, LocalDate nextDueDate, String billingType, String description,
            String externalReference, CardData card, HolderData holder, String cardToken,
            String remoteIp) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("customer", customerId);
        body.put("billingType", billingType);
        body.put("value", value);
        body.put("nextDueDate", nextDueDate.toString());
        body.put("cycle", cycle.name());
        put(body, "description", description);
        put(body, "externalReference", externalReference);
        putCard(body, card, holder, cardToken, remoteIp);
        JsonNode res = call("subscriptions.create", () -> client.post().uri("/subscriptions")
                .body(body).retrieve().body(JsonNode.class));
        GatewaySubscription sub = toSubscription(res);
        log.info("Asaas subscription criada id={} billingType={}", sub.id(), billingType);
        return sub;
    }

    @Override
    public void updateSubscription(String subscriptionId, BigDecimal value, Cycle cycle,
            String billingType, boolean updatePendingPayments) {
        Map<String, Object> body = new LinkedHashMap<>();
        put(body, "value", value);
        put(body, "cycle", cycle != null ? cycle.name() : null);
        put(body, "billingType", billingType);
        body.put("updatePendingPayments", updatePendingPayments);
        call("subscriptions.update", () -> client.put().uri("/subscriptions/{id}", subscriptionId)
                .body(body).retrieve().body(JsonNode.class));
        log.info("Asaas subscription atualizada id={}", subscriptionId);
    }

    @Override
    public GatewaySubscription updateSubscriptionCard(String subscriptionId, CardData card,
            HolderData holder, String remoteIp) {
        Map<String, Object> body = new LinkedHashMap<>();
        putCard(body, card, holder, null, remoteIp);
        JsonNode res = call("subscriptions.creditCard", () -> client.put()
                .uri("/subscriptions/{id}/creditCard", subscriptionId)
                .body(body).retrieve().body(JsonNode.class));
        GatewaySubscription sub = toSubscription(res);
        log.info("Asaas cartao da subscription atualizado id={}", subscriptionId);
        return new GatewaySubscription(sub.id() != null ? sub.id() : subscriptionId,
                sub.cardBrand(), sub.cardLast4(), sub.cardToken());
    }

    @Override
    public void cancelSubscription(String subscriptionId) {
        call("subscriptions.delete", () -> client.delete()
                .uri("/subscriptions/{id}", subscriptionId)
                .retrieve().body(JsonNode.class));
        log.info("Asaas subscription removida id={}", subscriptionId);
    }

    @Override
    public List<GatewayPayment> listSubscriptionPayments(String subscriptionId) {
        JsonNode res = call("subscriptions.payments", () -> client.get()
                .uri(u -> u.path("/subscriptions/{id}/payments").queryParam("limit", 100)
                        .build(subscriptionId))
                .retrieve().body(JsonNode.class));
        List<GatewayPayment> out = new ArrayList<>();
        JsonNode data = res == null ? null : res.get("data");
        if (data != null && data.isArray()) {
            for (JsonNode p : data) {
                GatewayPayment mapped = AsaasJson.payment(p);
                if (mapped != null && mapped.id() != null) {
                    out.add(mapped);
                }
            }
        }
        return out;
    }

    // ------------------------------------------------------------------ payments

    @Override
    public GatewayPayment createPayment(String customerId, String billingType, BigDecimal value,
            LocalDate dueDate, String description, String externalReference, CardData card,
            HolderData holder, String cardToken, String remoteIp) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("customer", customerId);
        body.put("billingType", billingType);
        body.put("value", value);
        body.put("dueDate", dueDate.toString());
        put(body, "description", description);
        put(body, "externalReference", externalReference);
        putCard(body, card, holder, cardToken, remoteIp);
        JsonNode res = call("payments.create", () -> client.post().uri("/payments")
                .body(body).retrieve().body(JsonNode.class));
        GatewayPayment payment = AsaasJson.payment(res);
        if (payment == null || payment.id() == null) {
            throw new GatewayUnavailableException();
        }
        log.info("Asaas payment criado id={} status={}", payment.id(), payment.status());
        return payment;
    }

    @Override
    public GatewayPayment getPayment(String paymentId) {
        JsonNode res = call("payments.get", () -> client.get().uri("/payments/{id}", paymentId)
                .retrieve().body(JsonNode.class));
        return AsaasJson.payment(res);
    }

    @Override
    public PixQrCode getPixQrCode(String paymentId) {
        JsonNode res = call("payments.pixQrCode", () -> client.get()
                .uri("/payments/{id}/pixQrCode", paymentId)
                .retrieve().body(JsonNode.class));
        return new PixQrCode(AsaasJson.text(res, "encodedImage"), AsaasJson.text(res, "payload"),
                AsaasJson.text(res, "expirationDate"));
    }

    // ------------------------------------------------------------------ helpers

    private JsonNode call(String operation, Supplier<JsonNode> request) {
        try {
            return request.get();
        } catch (RestClientResponseException ex) {
            throw translate(operation, ex);
        } catch (RestClientException ex) {
            log.warn("Asaas indisponivel op={} erro={}", operation, ex.getClass().getSimpleName());
            throw new GatewayUnavailableException(ex);
        }
    }

    private RuntimeException translate(String operation, RestClientResponseException ex) {
        HttpStatusCode status = ex.getStatusCode();
        int code = status.value();
        if (code == 401 || code == 403 || code == 429 || status.is5xxServerError()) {
            log.error("Asaas falhou op={} status={}", operation, code);
            return new GatewayUnavailableException(ex);
        }
        log.info("Asaas rejeitou op={} status={}", operation, code);
        return new BusinessRuleException("PAYMENT_REJECTED", firstErrorDescription(ex));
    }

    private String firstErrorDescription(RestClientResponseException ex) {
        try {
            JsonNode body = objectMapper.readTree(ex.getResponseBodyAsString());
            JsonNode errors = body == null ? null : body.get("errors");
            if (errors != null && errors.isArray() && !errors.isEmpty()) {
                String description = AsaasJson.text(errors.get(0), "description");
                if (description != null) {
                    return description;
                }
            }
        } catch (Exception ignored) {
            // Non-JSON error body: fall back to the generic message.
        }
        return GENERIC_REJECTION;
    }

    private static GatewaySubscription toSubscription(JsonNode res) {
        String id = AsaasJson.text(res, "id");
        JsonNode card = res == null ? null : res.get("creditCard");
        String brand = AsaasJson.text(card, "creditCardBrand");
        String last4 = AsaasJson.text(card, "creditCardNumber");
        String token = AsaasJson.text(card, "creditCardToken");
        if (last4 != null && last4.length() > 4) {
            last4 = last4.substring(last4.length() - 4);
        }
        return new GatewaySubscription(id, brand, last4, token);
    }

    private static void putCard(Map<String, Object> body, CardData card, HolderData holder,
            String cardToken, String remoteIp) {
        if (card != null) {
            Map<String, Object> cc = new LinkedHashMap<>();
            cc.put("holderName", card.holderName());
            cc.put("number", digits(card.number()));
            cc.put("expiryMonth", card.expiryMonth());
            cc.put("expiryYear", card.expiryYear());
            cc.put("ccv", card.ccv());
            body.put("creditCard", cc);
        } else if (cardToken != null && !cardToken.isBlank()) {
            body.put("creditCardToken", cardToken);
        }
        if (holder != null && (card != null || cardToken != null)) {
            Map<String, Object> h = new LinkedHashMap<>();
            h.put("name", holder.name());
            put(h, "email", holder.email());
            put(h, "cpfCnpj", digits(holder.cpfCnpj()));
            put(h, "postalCode", digits(holder.postalCode()));
            put(h, "addressNumber", holder.addressNumber());
            put(h, "addressComplement", holder.addressComplement());
            String phone = digits(holder.phone());
            put(h, "phone", phone);
            put(h, "mobilePhone", phone);
            body.put("creditCardHolderInfo", h);
        }
        if (card != null || cardToken != null) {
            put(body, "remoteIp", remoteIp);
        }
    }

    private static void putPhone(Map<String, Object> body, String phone) {
        String d = digits(phone);
        if (d == null) {
            return;
        }
        body.put(d.length() == 11 ? "mobilePhone" : "phone", d);
    }

    private static void put(Map<String, Object> body, String key, Object value) {
        if (value instanceof String s && s.isBlank()) {
            return;
        }
        if (value != null) {
            body.put(key, value);
        }
    }

    private static String digits(String v) {
        if (v == null) {
            return null;
        }
        String d = v.replaceAll("\\D", "");
        return d.isEmpty() ? null : d;
    }
}
