package com.eip.modules.document.adapter.out.storage;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

/**
 * Enables {@link GcsStorageProperties} binding only in the {@code cloud} profile.
 *
 * <p>Scoping activation to {@code @Profile("cloud")} keeps the default / demo
 * profile untouched (demo safety): outside {@code cloud} this configuration —
 * and therefore the {@code eip.gcs} binding — does not activate, and
 * {@link MockStorageAdapter} ({@code @Profile("!cloud")}) remains the storage
 * implementation. The real {@link GcsStorageAdapter} (also {@code @Profile("cloud")})
 * consumes these properties.
 */
@Configuration
@Profile("cloud")
@EnableConfigurationProperties(GcsStorageProperties.class)
public class GcsStorageConfig {
}
