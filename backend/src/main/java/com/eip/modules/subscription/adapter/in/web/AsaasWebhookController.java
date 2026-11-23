package com.eip.modules.subscription.adapter.in.web;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eip.modules.subscription.adapter.out.asaas.AsaasJson;
import com.eip.modules.subscription.adapter.out.asaas.AsaasProperties;
import com.eip.modules.subscription.application.AsaasWebhookService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Inbound Asaas webhook ({@code POST /webhooks/asaas}). Permitted without a
 * session and CSRF-exempt in {@code SecurityConfig}; authenticity is the
 * {@code asaas-access-token} header compared in constant time against
 * {@code eip.asaas.webhook-token}. Idempotency is enforced by the inbox. The raw
 * body is read as a String and parsed leniently (unknown fields ignored).
 */
@Slf4j
@RestController
@RequestMapping("/webhooks/asaas")
@RequiredArgsConstructor
public class AsaasWebhookController {

    private final AsaasWebhookService webhookService;
    private final AsaasProperties props;
    private final ObjectMapper objectMapper;

    @PostMapping
    public ResponseEntity<Void> receive(@RequestBody(required = false) String body,
            @RequestHeader(name = "asaas-access-token", required = false) String token) {
        if (!validToken(token)) {
            log.warn("Webhook Asaas rejeitado: token invalido");
            return ResponseEntity.status(401).build();
        }
        if (body == null || body.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        JsonNode root;
        try {
            root = objectMapper.readTree(body);
        } catch (JsonProcessingException ex) {
            log.warn("Webhook Asaas com JSON invalido");
            return ResponseEntity.badRequest().build();
        }
        String hash = sha256(body);
        String eventId = AsaasJson.text(root, "id");
        if (eventId == null) {
            eventId = "sha256:" + hash;
        }
        String event = AsaasJson.text(root, "event");
        webhookService.handle(eventId, event, hash, AsaasJson.payment(root.get("payment")));
        return ResponseEntity.ok().build();
    }

    private boolean validToken(String token) {
        String expected = props.webhookToken();
        if (expected == null || expected.isBlank() || token == null) {
            return false;
        }
        return MessageDigest.isEqual(expected.getBytes(StandardCharsets.UTF_8),
                token.getBytes(StandardCharsets.UTF_8));
    }

    private static String sha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 indisponivel", ex);
        }
    }
}
