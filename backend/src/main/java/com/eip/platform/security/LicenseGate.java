package com.eip.platform.security;

import java.util.Set;

import org.springframework.stereotype.Component;

/**
 * Gates actions according to the current organization's license mode.
 *
 * <p>Precedence rules:
 * <ul>
 *   <li>{@link LicenseMode#NONE} — blocks everything.</li>
 *   <li>{@link LicenseMode#READ_ONLY} — blocks mutating actions
 *       (create/edit/update/delete); read actions allowed.</li>
 *   <li>{@link LicenseMode#BILLING_ONLY} — allows only billing actions.</li>
 *   <li>{@link LicenseMode#FULL} — allows everything.</li>
 * </ul>
 */
@Component
public class LicenseGate {

    /** Possible license states for an organization. */
    public enum LicenseMode {
        FULL, READ_ONLY, BILLING_ONLY, NONE
    }

    private static final Set<String> MUTATING_ACTIONS =
            Set.of("create", "edit", "update", "delete");

    /**
     * @param action the action verb being attempted
     * @return whether the current license permits {@code action}
     */
    public boolean allows(String action) {
        String normalized = action == null ? "" : action.toLowerCase();
        return switch (currentMode()) {
            case FULL -> true;
            case NONE -> false;
            case READ_ONLY -> !MUTATING_ACTIONS.contains(normalized);
            case BILLING_ONLY -> "billing".equals(normalized);
        };
    }

    /**
     * Resolves the active license mode.
     *
     * <p>TODO: wire to the Subscription module to read the organization's real
     * subscription state. Defaults to {@link LicenseMode#FULL} for now (mock).
     */
    protected LicenseMode currentMode() {
        return LicenseMode.FULL;
    }
}
