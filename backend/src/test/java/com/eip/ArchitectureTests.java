package com.eip;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchRule;

/**
 * ArchUnit guardrails enforcing the hexagonal boundaries every module follows:
 * a pure domain core, an application layer of use cases, and adapters at the
 * edges. Rules are intentionally few and strong.
 */
@AnalyzeClasses(packages = "com.eip")
class ArchitectureTests {

    /**
     * Domain purity: module domain code must not know about the Spring framework.
     * Keeps the core free of infrastructure concerns and trivially unit-testable.
     */
    @ArchTest
    static final ArchRule domainIsFreeOfSpring = noClasses()
            .that().resideInAPackage("..modules..domain..")
            .should().dependOnClassesThat().resideInAnyPackage("org.springframework..")
            .because("domain code must stay framework-agnostic");

    /**
     * Domain purity: module domain code must not depend on JPA/persistence APIs.
     * Persistence details belong to outbound adapters, not the model.
     */
    @ArchTest
    static final ArchRule domainIsFreeOfPersistence = noClasses()
            .that().resideInAPackage("..modules..domain..")
            .should().dependOnClassesThat().resideInAnyPackage("jakarta.persistence..")
            .because("persistence mapping belongs to adapters, not the domain");

    /**
     * Dependency direction: the application layer must not depend on adapters.
     * Application talks to the outside world through ports; adapters implement
     * or drive those ports, never the reverse.
     */
    @ArchTest
    static final ArchRule applicationDoesNotDependOnAdapters = noClasses()
            .that().resideInAPackage("..modules..application..")
            .should().dependOnClassesThat().resideInAPackage("..modules..adapter..")
            .because("adapters must not be referenced by the application layer");
}
