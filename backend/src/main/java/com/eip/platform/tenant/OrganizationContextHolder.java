package com.eip.platform.tenant;

/**
 * Thread-local holder for the current {@link OrganizationContext}.
 *
 * <p>Populated early in the request lifecycle (e.g. a servlet filter) and read
 * by cross-cutting infrastructure such as RLS preparation, the outbox and the
 * idempotency service. Must be {@link #clear() cleared} at the end of the
 * request to avoid leaking context across pooled threads.
 */
public final class OrganizationContextHolder {

    private static final ThreadLocal<OrganizationContext> CONTEXT = new ThreadLocal<>();

    private OrganizationContextHolder() {
    }

    public static void set(OrganizationContext context) {
        CONTEXT.set(context);
    }

    /**
     * @return the current context
     * @throws IllegalStateException if no context is bound to the current thread
     */
    public static OrganizationContext current() {
        OrganizationContext context = CONTEXT.get();
        if (context == null) {
            throw new IllegalStateException("Nenhuma organizacao no contexto");
        }
        return context;
    }

    /** @return the current context, or {@code null} if none is bound. */
    public static OrganizationContext currentOrNull() {
        return CONTEXT.get();
    }

    public static void clear() {
        CONTEXT.remove();
    }
}
