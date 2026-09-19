package com.eip.platform.outbox;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Enables Spring's scheduling support so the {@link OutboxWorker} poller runs.
 */
@Configuration
@EnableScheduling
public class OutboxConfig {
}
