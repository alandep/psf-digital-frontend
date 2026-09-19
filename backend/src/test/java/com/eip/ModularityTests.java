package com.eip;

import org.junit.jupiter.api.Test;
import org.springframework.modulith.core.ApplicationModules;
import org.springframework.modulith.docs.Documenter;

/**
 * Verifies the Spring Modulith structure of the application: module boundaries,
 * allowed dependencies and named-interface access rules.
 *
 * <p>The structure is analyzed with an explicit base package of
 * {@code com.eip.modules} so that each domain (export, identity, organization,
 * subscription, document, ai, finance, logistics) is a first-class module.
 * {@code com.eip.platform} lives outside this base package, so references to it
 * are treated as references to a non-module (external) package and are always
 * allowed — there is no Modulith module named {@code platform}.
 *
 * <p>The declared inter-module dependencies are:
 * <ul>
 *   <li>{@code identity} &rarr; {@code organization::query-api} — the login flow
 *       resolves memberships via the Organization read API.</li>
 *   <li>all other modules depend only on {@code com.eip.platform} (external).</li>
 * </ul>
 */
class ModularityTests {

    private final ApplicationModules modules = ApplicationModules.of("com.eip.modules");

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
