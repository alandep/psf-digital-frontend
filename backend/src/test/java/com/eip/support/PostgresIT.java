package com.eip.support;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;

import org.junit.jupiter.api.BeforeAll;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/**
 * Abstract Testcontainers base for integration tests that need a real
 * PostgreSQL 16 database with the Flyway migrations (V1..V5) applied and Row
 * Level Security actually enforced.
 *
 * <p><b>RLS enforcement caveat.</b> PostgreSQL bypasses RLS for superusers and
 * for roles with the {@code BYPASSRLS} attribute. The default container user
 * ({@code test}) is a superuser, so it would silently bypass every policy. To
 * prove isolation we therefore run migrations as the superuser (so tables and
 * {@code FORCE ROW LEVEL SECURITY} are created) and then provision a dedicated
 * NON-superuser login role {@code eip_app} used by the leakage test.
 *
 * <p>The Spring {@code @SpringBootTest} datasource stays on the superuser so the
 * context boots and Flyway runs cleanly; the security-sensitive leakage test
 * opens its OWN JDBC connection as {@code eip_app} (see
 * {@link #appConnection()}) to demonstrate that USING/WITH CHECK policies apply.
 */
@SpringBootTest
@Testcontainers
public abstract class PostgresIT {

    /** Non-superuser application role provisioned after migrations run. */
    protected static final String APP_ROLE = "eip_app";
    protected static final String APP_PASSWORD = "eip_app";

    /**
     * Reused Postgres container. The default {@code test/test} credentials are a
     * superuser; Flyway uses them so migrations and FORCE RLS are applied.
     */
    @Container
    protected static final PostgreSQLContainer<?> POSTGRES =
            new PostgreSQLContainer<>("postgres:16")
                    .withDatabaseName("eip")
                    .withUsername("test")
                    .withPassword("test");

    /**
     * Point the Spring datasource and Flyway at the container's superuser. Flyway
     * needs elevated privileges to create tables and toggle row security, so the
     * application context deliberately connects as the superuser here. The
     * cross-tenant leakage test uses {@link #appConnection()} instead.
     */
    @DynamicPropertySource
    static void datasourceProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
        registry.add("spring.flyway.enabled", () -> "true");
    }

    /**
     * After the container is up and the Spring context has applied the Flyway
     * migrations, provision a dedicated NON-superuser role and grant it just
     * enough privilege to read/write the tenant tables. Because this role has
     * neither SUPERUSER nor BYPASSRLS, the RLS policies (including FORCE RLS) are
     * fully enforced for it — which is exactly what the leakage test needs.
     *
     * <p>Idempotent: safe if invoked more than once across the test lifecycle.
     */
    @BeforeAll
    static void provisionNonSuperuserRole() throws SQLException {
        try (Connection admin = superuserConnection(); Statement st = admin.createStatement()) {
            // Create the login role only if it does not already exist.
            st.execute("""
                    DO $$
                    BEGIN
                        IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'eip_app') THEN
                            CREATE ROLE eip_app LOGIN PASSWORD 'eip_app' NOSUPERUSER NOBYPASSRLS;
                        END IF;
                    END $$;
                    """);
            // Minimal, sufficient grants for the tenant + app-read tables.
            st.execute("GRANT USAGE ON SCHEMA public TO eip_app");
            st.execute("GRANT SELECT, INSERT, UPDATE, DELETE "
                    + "ON ALL TABLES IN SCHEMA public TO eip_app");
            st.execute("GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO eip_app");
            // Cover any tables/sequences created by later migrations too.
            st.execute("ALTER DEFAULT PRIVILEGES IN SCHEMA public "
                    + "GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO eip_app");
            st.execute("ALTER DEFAULT PRIVILEGES IN SCHEMA public "
                    + "GRANT USAGE, SELECT ON SEQUENCES TO eip_app");

            // Cross-tenant reporting role (see V17). Read-only + BYPASSRLS so
            // Super Admin analytics can aggregate across tenants. Provisioned
            // here so the schema/role exists for any future reporting test; the
            // Spring reporting datasource keeps its defaults and is not wired
            // into tests unless a Super Admin bean is triggered.
            st.execute("""
                    DO $$
                    BEGIN
                        IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'eip_report') THEN
                            CREATE ROLE eip_report LOGIN PASSWORD 'eip_report' NOSUPERUSER BYPASSRLS;
                        END IF;
                    END $$;
                    """);
            st.execute("GRANT USAGE ON SCHEMA public TO eip_report");
            st.execute("GRANT SELECT ON subscription, organization, ai_usage_event, "
                    + "product_event, lead TO eip_report");
        }
    }

    /**
     * Opens a raw JDBC connection as the container superuser (the Flyway/migration
     * role). Used only for provisioning and setup — not for RLS assertions.
     */
    protected static Connection superuserConnection() throws SQLException {
        return DriverManager.getConnection(
                POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword());
    }

    /**
     * Opens a raw JDBC connection as the NON-superuser {@code eip_app} role. RLS
     * policies are enforced on this connection, so tenant isolation can be proven
     * end to end. Callers own the returned connection and must close it.
     */
    protected static Connection appConnection() throws SQLException {
        return DriverManager.getConnection(POSTGRES.getJdbcUrl(), APP_ROLE, APP_PASSWORD);
    }
}
