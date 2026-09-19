package com.eip.platform.tenant;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

import org.springframework.stereotype.Component;

/**
 * Prepares a JDBC {@link Connection} for PostgreSQL Row-Level Security by
 * setting the {@code app.current_organization} runtime parameter.
 *
 * <p>The value is set as transaction-local ({@code is_local = true}) so it is
 * automatically reset at the end of the current transaction and never leaks to
 * the next transaction served by the same pooled connection. RLS policies on
 * tenant tables read this setting via {@code current_setting('app.current_organization')}.
 */
@Component
public class RlsConnectionPreparer {

    private static final String SET_ORG_SQL =
            "SELECT set_config('app.current_organization', ?, true)";

    /**
     * Binds the organization id to the connection for the current transaction.
     *
     * @param connection an open JDBC connection enrolled in the current transaction
     * @param organizationId the tenant identifier (UUID string)
     */
    public void prepare(Connection connection, String organizationId) {
        try (PreparedStatement statement = connection.prepareStatement(SET_ORG_SQL)) {
            statement.setString(1, organizationId);
            statement.execute();
        } catch (SQLException ex) {
            throw new IllegalStateException(
                    "Falha ao configurar app.current_organization para RLS", ex);
        }
    }
}
