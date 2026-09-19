package com.eip;

import org.junit.jupiter.api.Test;
import org.springframework.modulith.core.ApplicationModules;
import org.springframework.modulith.docs.Documenter;

import com.eip.bootstrap.EipBackendApplication;

/**
 * Verifies the Spring Modulith structure of the application: module boundaries,
 * allowed dependencies and named-interface access rules.
 *
 * <p>The declared dependencies are:
 * <ul>
 *   <li>{@code platform} — shared module, usable by everyone.</li>
 *   <li>{@code identity} &rarr; {@code organization::query-api} — the login flow
 *       resolves memberships via the Organization read API.</li>
 *   <li>{@code organization}, {@code export} — depend only on {@code platform}.</li>
 * </ul>
 */
class ModularityTests {

    private final ApplicationModules modules = ApplicationModules.of(EipBackendApplication.class);

    @Test
    void verifiesModuleStructure() {
        // Fails if any module reaches into another module's internals or violates
        // its declared allowedDependencies / named interfaces.
        modules.verify();
    }

    @Test
    void writesDocumentation() {
        // Best-effort C4/PlantUML + module canvas under target/spring-modulith-docs.
        // Never fail the build on documentation generation issues.
        try {
            new Documenter(modules).writeDocumentation();
        } catch (RuntimeException ignored) {
            // Documentation output is non-essential for the test's purpose.
        }
    }
}
