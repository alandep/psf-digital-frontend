package com.eip.bootstrap;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Entry point for the EIP platform modular monolith backend.
 *
 * <p>Component scanning is rooted at {@code com.eip} so every module package
 * (aligned with a hexagonal architecture) is discovered. The Spring Modulith
 * structure is analyzed by {@code ModularityTests}, which uses an explicit base
 * package ({@code com.eip.modules}) so each domain is treated as a first-class
 * module and {@code com.eip.platform} is an allowed external (non-module)
 * dependency.
 */
@SpringBootApplication(scanBasePackages = "com.eip")
public class EipBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(EipBackendApplication.class, args);
    }
}
