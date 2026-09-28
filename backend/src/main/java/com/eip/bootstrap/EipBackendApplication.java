package com.eip.bootstrap;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

/**
 * Entry point for the EIP platform modular monolith backend.
 *
 * <p>Component scanning is rooted at {@code com.eip} so every module package
 * (aligned with a hexagonal architecture) is discovered. The Spring Modulith
 * structure is analyzed by {@code ModularityTests}, which uses an explicit base
 * package ({@code com.eip.modules}) so each domain is treated as a first-class
 * module and {@code com.eip.platform} is an allowed external (non-module)
 * dependency.
 *
 * <p>Because this application class lives in {@code com.eip.bootstrap}, Spring
 * Data JPA repository scanning and JPA entity scanning would otherwise default
 * to that sub-package. {@link EntityScan} and {@link EnableJpaRepositories} are
 * therefore explicitly rooted at {@code com.eip} so entities and repositories
 * in all module and platform packages are discovered. The Spring Modulith JPA
 * event publication registry ({@code org.springframework.modulith.events.jpa})
 * is included as well so its entity/repository remain scanned once the default
 * auto-registration is overridden.
 */
@SpringBootApplication(scanBasePackages = "com.eip")
@EntityScan(basePackages = {"com.eip", "org.springframework.modulith.events.jpa"})
@EnableJpaRepositories(basePackages = {"com.eip", "org.springframework.modulith.events.jpa"})
public class EipBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(EipBackendApplication.class, args);
    }
}
