package com.eip.export;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.eip.support.PostgresIT;

/**
 * The single most important security test: it proves that PostgreSQL Row Level
 * Security prevents one tenant from reading or writing another tenant's rows.
 *
 * <p>All assertions run over a connection opened as the NON-superuser
 * {@code eip_app} role (see {@link PostgresIT#appConnection()}) because RLS is
 * bypassed for superusers/BYPASSRLS roles. Tenant context is transaction-local
 * ({@code set_config(..., true)}), so every scenario sets the org context,
 * performs its statements and asserts within a SINGLE transaction with
 * autocommit disabled.
 */
class RlsCrossTenantLeakageIT extends PostgresIT {

    // Two tenant ids distinct from the dev seed org (...0001).
    private static final String ORG_A = "00000000-0000-0000-0000-0000000000aa";
    private static final String ORG_B = "00000000-0000-0000-0000-0000000000bb";

    @Test
    @DisplayName("RLS USING blocks reads of another tenant; WITH CHECK blocks foreign writes")
    void crossTenantIsolationIsEnforced() throws SQLException {
        // Guard: if the app role somehow ends up privileged, RLS would be silently
        // bypassed and this test would give false confidence. Fail loudly instead.
        assertNonPrivilegedRole();

        UUID customerId = UUID.randomUUID();

        // 1) As ORG_A, insert a customer within one transaction (context is tx-local).
        try (Connection conn = appConnection()) {
            conn.setAutoCommit(false);
            setOrgContext(conn, ORG_A);
            try (PreparedStatement ps = conn.prepareStatement(
                    "INSERT INTO customer (id, organization_id, name, country) "
                            + "VALUES (?, ?::uuid, ?, ?)")) {
                ps.setObject(1, customerId);
                ps.setString(2, ORG_A);
                ps.setString(3, "Tenant A Customer");
                ps.setString(4, "BR");
                int inserted = ps.executeUpdate();
                assertEquals(1, inserted, "ORG_A should be able to insert its own row");
            }
            conn.commit();
        }

        // 2) In a fresh transaction as ORG_B, the USING policy must hide ORG_A's row.
        try (Connection conn = appConnection()) {
            conn.setAutoCommit(false);
            setOrgContext(conn, ORG_B);
            try (PreparedStatement ps = conn.prepareStatement(
                    "SELECT count(*) FROM customer WHERE id = ?")) {
                ps.setObject(1, customerId);
                try (ResultSet rs = ps.executeQuery()) {
                    assertTrue(rs.next());
                    assertEquals(0, rs.getInt(1),
                            "ORG_B must NOT see ORG_A's row (RLS USING gates reads)");
                }
            }
            conn.commit();
        }

        // 3) As ORG_B, attempting to INSERT a row tagged with ORG_A must be rejected
        //    by the WITH CHECK clause of the isolation policy.
        try (Connection conn = appConnection()) {
            conn.setAutoCommit(false);
            setOrgContext(conn, ORG_B);
            SQLException ex = assertThrows(SQLException.class, () -> {
                try (PreparedStatement ps = conn.prepareStatement(
                        "INSERT INTO customer (id, organization_id, name, country) "
                                + "VALUES (?, ?::uuid, ?, ?)")) {
                    ps.setObject(1, UUID.randomUUID());
                    ps.setString(2, ORG_A); // foreign tenant id while context is ORG_B
                    ps.setString(3, "Spoofed Customer");
                    ps.setString(4, "US");
                    ps.executeUpdate();
                }
            }, "WITH CHECK must reject writing a foreign tenant's organization_id");
            // Row security violations surface as SQLState 42501 (insufficient privilege).
            assertTrue(ex.getMessage() != null && !ex.getMessage().isBlank());
            conn.rollback();
        }

        // 4) Sanity: as ORG_A the row is visible again (proves data really exists).
        try (Connection conn = appConnection()) {
            conn.setAutoCommit(false);
            setOrgContext(conn, ORG_A);
            try (PreparedStatement ps = conn.prepareStatement(
                    "SELECT count(*) FROM customer WHERE id = ?")) {
                ps.setObject(1, customerId);
                try (ResultSet rs = ps.executeQuery()) {
                    assertTrue(rs.next());
                    assertEquals(1, rs.getInt(1), "ORG_A must still see its own row");
                }
            }
            conn.commit();
        }
    }

    /** Sets the transaction-local tenant context read by the RLS policies. */
    private static void setOrgContext(Connection conn, String orgId) throws SQLException {
        try (PreparedStatement ps = conn.prepareStatement(
                "SELECT set_config('app.current_organization', ?, true)")) {
            ps.setString(1, orgId);
            ps.execute();
        }
    }

    /**
     * Fails the test if the connecting role can bypass RLS (superuser or
     * BYPASSRLS). Without this guard a misconfigured role would make the isolation
     * assertions pass vacuously.
     */
    private static void assertNonPrivilegedRole() throws SQLException {
        try (Connection conn = appConnection(); Statement st = conn.createStatement();
                ResultSet rs = st.executeQuery(
                        "SELECT rolsuper, rolbypassrls FROM pg_roles "
                                + "WHERE rolname = current_user")) {
            assertTrue(rs.next(), "current role must exist in pg_roles");
            assertFalse(rs.getBoolean("rolsuper"),
                    "app role must NOT be superuser or RLS is bypassed");
            assertFalse(rs.getBoolean("rolbypassrls"),
                    "app role must NOT have BYPASSRLS or RLS is bypassed");
        }
    }
}
