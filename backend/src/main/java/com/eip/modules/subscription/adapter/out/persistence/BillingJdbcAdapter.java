package com.eip.modules.subscription.adapter.out.persistence;

import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import com.eip.modules.subscription.domain.port.out.BillingGatewayRefPort;
import com.eip.modules.subscription.domain.port.out.CheckoutAcceptancePort;
import com.eip.modules.subscription.domain.port.out.CustomerProfilePort;
import com.eip.modules.subscription.domain.port.out.DemoRequestPort;

import lombok.RequiredArgsConstructor;

/**
 * JDBC adapters for the simple billing tables: {@code billing_gateway_ref}
 * (global), {@code checkout_acceptance} (RLS; written under the org context of
 * the current transaction), {@code demo_request} (global) and the read-only
 * {@code legal_entity} customer profile. Runs on the same connection as the
 * surrounding JPA transaction.
 */
@Component
@RequiredArgsConstructor
public class BillingJdbcAdapter
        implements BillingGatewayRefPort, CheckoutAcceptancePort, DemoRequestPort, CustomerProfilePort {

    private final JdbcTemplate jdbc;

    @Override
    public void register(String gatewayId, String kind, UUID organizationId) {
        if (gatewayId == null || gatewayId.isBlank()) {
            return;
        }
        jdbc.update("insert into billing_gateway_ref (gateway_id, kind, organization_id) "
                + "values (?, ?, ?) on conflict (gateway_id) do update "
                + "set kind = excluded.kind, organization_id = excluded.organization_id",
                gatewayId, kind, organizationId);
    }

    @Override
    public Optional<UUID> organizationOf(String gatewayId) {
        if (gatewayId == null || gatewayId.isBlank()) {
            return Optional.empty();
        }
        List<UUID> rows = jdbc.queryForList(
                "select organization_id from billing_gateway_ref where gateway_id = ?",
                UUID.class, gatewayId);
        return rows.isEmpty() ? Optional.empty() : Optional.ofNullable(rows.get(0));
    }

    @Override
    public void record(Acceptance a) {
        jdbc.update("insert into checkout_acceptance (id, organization_id, user_id, terms_version, "
                + "privacy_version, billing_consent, ip, user_agent, accepted_at) "
                + "values (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                a.id(), a.organizationId(), a.userId(), a.termsVersion(), a.privacyVersion(),
                a.billingConsent(), a.ip(), truncate(a.userAgent(), 500),
                Timestamp.from(a.acceptedAt().toInstant()));
    }

    @Override
    public void save(DemoRequest r) {
        jdbc.update("insert into demo_request (id, name, email, phone, company, cnpj, message, "
                + "origin, ip, status, created_at) values (?, ?, ?, ?, ?, ?, ?, ?, ?, 'NEW', ?)",
                r.id(), r.name(), r.email(), r.phone(), r.company(), r.cnpj(), r.message(),
                r.origin(), r.ip(), Timestamp.from(r.createdAt().toInstant()));
    }

    @Override
    public Optional<CustomerProfile> forOrg(UUID organizationId) {
        List<CustomerProfile> rows = jdbc.query(
                "select razao_social, cnpj, email, telefone from legal_entity "
                        + "where organization_id = ? order by created_at nulls last limit 1",
                (rs, i) -> new CustomerProfile(rs.getString("razao_social"), rs.getString("cnpj"),
                        rs.getString("email"), rs.getString("telefone")),
                organizationId);
        return rows.isEmpty() ? Optional.empty() : Optional.of(rows.get(0));
    }

    private static String truncate(String v, int max) {
        return v == null || v.length() <= max ? v : v.substring(0, max);
    }
}
