package com.eip.platform.tenant;

import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.hibernate.Session;
import org.springframework.stereotype.Component;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Cross-cutting aspect that binds the current tenant to the database session at
 * the start of every {@link org.springframework.transaction.annotation.Transactional}
 * unit of work, enabling PostgreSQL Row-Level Security.
 *
 * <p>When no organization is bound to the current thread
 * ({@link OrganizationContextHolder#currentOrNull()} is {@code null}) the aspect
 * silently skips — this covers public / no-tenant endpoints (health, login,
 * webhooks) that legitimately run without a tenant.
 */
@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class RlsAspect {

    private final EntityManager entityManager;
    private final RlsConnectionPreparer preparer;

    @Before("@annotation(org.springframework.transaction.annotation.Transactional) "
            + "|| @within(org.springframework.transaction.annotation.Transactional)")
    public void applyRls() {
        OrganizationContext context = OrganizationContextHolder.currentOrNull();
        if (context == null) {
            // Public / no-tenant scope: nothing to bind.
            return;
        }
        String organizationId = context.organizationId().asString();
        entityManager.unwrap(Session.class)
                .doWork(connection -> preparer.prepare(connection, organizationId));
        if (log.isTraceEnabled()) {
            log.trace("RLS aplicado para organizacao {}", organizationId);
        }
    }
}
