package com.eip.platform.reporting;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.jdbc.core.JdbcTemplate;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;

/**
 * Dedicated READ-ONLY reporting datasource for Super Admin cross-tenant
 * analytics.
 *
 * <p>This DataSource connects with the {@code eip_report} role (V17), which has
 * the {@code BYPASSRLS} attribute and only {@code SELECT} on the reporting
 * tables. It exists ONLY so the Super Admin metrics/tenants/unit-economics/
 * funnel aggregations can see every tenant's rows. It must NEVER be used for
 * tenant-scoped reads or writes — those must go through the RLS-enforced main
 * datasource.
 *
 * <p>Resilience: the beans are {@link Lazy}. They are injected only by the
 * Super Admin metrics adapter, so a missing/misconfigured reporting role does
 * not crash application startup; the reporting endpoints would fail at call
 * time instead.
 */
@Configuration
public class ReportingDataSourceConfig {

    /**
     * Builds the read-only, BYPASSRLS reporting datasource. Defaults point at the
     * same database as the main datasource but authenticate as {@code eip_report}.
     */
    @Bean(name = "reportingDataSource", defaultCandidate = false)
    @Lazy
    public DataSource reportingDataSource(
            @Value("${eip.reporting.datasource.url:${SPRING_DATASOURCE_URL:jdbc:postgresql://localhost:5432/eip}}") String url,
            @Value("${eip.reporting.datasource.username:eip_report}") String username,
            @Value("${eip.reporting.datasource.password:eip_report}") String password) {
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(url);
        config.setUsername(username);
        config.setPassword(password);
        config.setPoolName("eip-report-pool");
        config.setMaximumPoolSize(3);
        // Cross-tenant analytics is strictly read-only.
        config.setReadOnly(true);
        // Do NOT attempt a connection at pool init (negative = skip the init
        // probe). Connections are created lazily on first getConnection(), so a
        // transient/missing eip_report role never fail-fasts and crashes boot.
        config.setInitializationFailTimeout(-1);
        return new HikariDataSource(config);
    }

    /**
     * JdbcTemplate over the reporting datasource. Used by the Super Admin metrics
     * adapter for cross-tenant aggregation SQL.
     */
    @Bean(name = "reportingJdbcTemplate", defaultCandidate = false)
    @Lazy
    public JdbcTemplate reportingJdbcTemplate(
            @Qualifier("reportingDataSource") DataSource reportingDataSource) {
        return new JdbcTemplate(reportingDataSource);
    }
}
