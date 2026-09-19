package com.eip.bootstrap;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.modulith.Modulithic;

/**
 * Entry point for the EIP platform modular monolith backend.
 *
 * <p>Component scanning is rooted at {@code com.eip} so every module package
 * (aligned with a hexagonal architecture) is discovered. Spring Modulith is
 * enabled via {@link Modulithic} with {@code platform} declared as a shared
 * module usable by all other modules.
 */
@Modulithic(sharedModules = "platform")
@SpringBootApplication(scanBasePackages = "com.eip")
public class EipBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(EipBackendApplication.class, args);
    }
}
