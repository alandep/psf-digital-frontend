package com.eip.modules.admin.adapter.out.gcp;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.text.Normalizer;
import java.time.Duration;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import com.eip.modules.admin.domain.port.out.TenantProvisioningPort;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.auth.oauth2.GoogleCredentials;

import lombok.extern.slf4j.Slf4j;

/**
 * Real GCP Identity Platform tenant provisioning. Active only under the
 * {@code cloud} profile, so it never runs locally.
 *
 * <p>Calls the Identity Toolkit REST API
 * ({@code POST https://identitytoolkit.googleapis.com/v2/projects/{project}/tenants})
 * with an OAuth2 token from Application Default Credentials, so no extra
 * dependency is required. The call fails fast when the project is not configured.
 *
 * <p>Setting {@code eip.gcp.tenant-provisioning.enabled=false} skips the remote
 * call and returns a {@code disabled-<orgId8>} placeholder, allowing a deployment
 * before Identity Platform multi-tenancy is enabled.
 */
@Component
@Profile("cloud")
@Slf4j
public class GcpTenantProvisioningAdapter implements TenantProvisioningPort {

    private static final String SCOPE = "https://www.googleapis.com/auth/cloud-platform";
    private static final String API = "https://identitytoolkit.googleapis.com/v2/projects/";
    private static final Duration TIMEOUT = Duration.ofSeconds(10);
    private static final int MAX_NAME = 20;
    private static final int MIN_NAME = 4;
    private static final int EXCERPT = 300;

    private final ObjectMapper objectMapper;
    private final String project;
    private final boolean enabled;
    private final HttpClient http = HttpClient.newBuilder().connectTimeout(TIMEOUT).build();
    private volatile GoogleCredentials credentials;

    public GcpTenantProvisioningAdapter(ObjectMapper objectMapper,
            @Value("${eip.gcp.identity-project:${GOOGLE_CLOUD_PROJECT:}}") String project,
            @Value("${eip.gcp.tenant-provisioning.enabled:true}") boolean enabled) {
        this.objectMapper = objectMapper;
        this.project = project;
        this.enabled = enabled;
    }

    @Override
    public String provisionTenant(UUID organizationId, String displayName) {
        if (!enabled) {
            String placeholder = "disabled-" + organizationId.toString().substring(0, 8);
            log.warn("Provisionamento de tenant GCP desabilitado; usando {} para org {}",
                    placeholder, organizationId);
            return placeholder;
        }
        if (project == null || project.isBlank()) {
            throw new IllegalStateException(
                    "Projeto do Identity Platform nao configurado (eip.gcp.identity-project).");
        }
        String tenantDisplayName = sanitizeDisplayName(displayName, organizationId);
        log.info("Provisionando tenant GCP Identity Platform para org {} (displayName={})",
                organizationId, tenantDisplayName);
        try {
            String body = objectMapper.writeValueAsString(Map.of(
                    "displayName", tenantDisplayName,
                    "allowPasswordSignup", true,
                    "enableEmailLinkSignin", false));
            HttpRequest request = HttpRequest.newBuilder(URI.create(API + project + "/tenants"))
                    .timeout(TIMEOUT)
                    .header("Authorization", "Bearer " + accessToken())
                    .header("x-goog-user-project", project)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body, StandardCharsets.UTF_8))
                    .build();
            HttpResponse<String> response =
                    http.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            if (response.statusCode() / 100 != 2) {
                throw new IllegalStateException("Falha ao criar tenant no Identity Platform: HTTP "
                        + response.statusCode() + " - " + excerpt(response.body()));
            }
            JsonNode name = objectMapper.readTree(response.body()).path("name");
            if (!name.isTextual() || name.asText().isBlank()) {
                throw new IllegalStateException(
                        "Resposta do Identity Platform sem o campo 'name' do tenant.");
            }
            String full = name.asText();
            String tenantId = full.substring(full.lastIndexOf('/') + 1);
            log.info("Tenant GCP criado para org {}: {}", organizationId, tenantId);
            return tenantId;
        } catch (IOException ex) {
            throw new IllegalStateException(
                    "Falha de comunicacao com o Identity Platform: " + ex.getClass().getSimpleName(), ex);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Provisionamento de tenant interrompido.", ex);
        }
    }

    private String accessToken() throws IOException {
        GoogleCredentials creds = credentials;
        if (creds == null) {
            creds = GoogleCredentials.getApplicationDefault().createScoped(SCOPE);
            credentials = creds;
        }
        creds.refreshIfExpired();
        return creds.getAccessToken().getTokenValue();
    }

    private static String excerpt(String body) {
        if (body == null) {
            return "";
        }
        String s = body.replaceAll("\\s+", " ").trim();
        return s.length() > EXCERPT ? s.substring(0, EXCERPT) + "..." : s;
    }

    /**
     * Builds a valid Identity Platform tenant display name: 4-20 chars, starts with
     * a letter, only letters, digits and hyphens.
     *
     * @param name  organization name (may be {@code null})
     * @param orgId organization id, used to pad short/empty names
     * @return the sanitized display name
     */
    static String sanitizeDisplayName(String name, UUID orgId) {
        String s = name == null ? "" : Normalizer.normalize(name, Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "");
        s = collapse(s.replaceAll("[^A-Za-z0-9]", "-"));
        if (s.isEmpty() || !Character.isLetter(s.charAt(0))) {
            s = "t-" + s;
        }
        if (s.length() < MIN_NAME) {
            s = s + "-" + orgId.toString().replace("-", "");
        }
        s = collapse(s);
        if (s.length() > MAX_NAME) {
            s = s.substring(0, MAX_NAME);
        }
        return s.replaceAll("-+$", "");
    }

    /** Collapses repeated hyphens and trims leading/trailing ones. */
    private static String collapse(String s) {
        return s.replaceAll("-{2,}", "-").replaceAll("^-+|-+$", "");
    }
}
