package com.eip.modules.subscription.adapter.in.web;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eip.modules.subscription.application.StripeWebhookService;

import lombok.RequiredArgsConstructor;

/**
 * Inbound webhook adapter for Stripe billing events. Permitted without auth
 * (see {@code SecurityConfig}); idempotency is enforced by the inbox.
 *
 * <p>TODO: a real implementation verifies the {@code Stripe-Signature} header
 * (HMAC-SHA256 over the raw request body using the endpoint secret) before
 * trusting the payload, and parses the raw JSON body into the Stripe event.
 */
@RestController
@RequestMapping("/webhooks/stripe")
@RequiredArgsConstructor
public class StripeWebhookController {

    private final StripeWebhookService webhookService;

    @PostMapping
    public ResponseEntity<Void> receive(
            @RequestBody StripeEventDto event,
            @RequestHeader(name = "Stripe-Signature", required = false) String signature) {
        // TODO: verify signature against the raw body before processing.
        UUID organizationId = event.organizationId() != null && !event.organizationId().isBlank()
                ? UUID.fromString(event.organizationId()) : null;
        String payloadHash = sha256(event.toString());
        webhookService.handle(event.id(), event.type(), payloadHash,
                organizationId, event.subscriptionId());
        return ResponseEntity.ok().build();
    }

    private static String sha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 indisponivel", ex);
        }
    }

    /** Minimal Stripe event shape for this slice. */
    public record StripeEventDto(String id, String type, String organizationId,
            String subscriptionId) {
    }
}
