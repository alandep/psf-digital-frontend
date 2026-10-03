package com.eip.modules.document.adapter.out.storage;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

/**
 * Environment-driven configuration for the Google Cloud Storage adapter.
 *
 * <p>All values here are <strong>environment configuration</strong>, never
 * hardcoded secrets. {@code bucket}, {@code project},
 * {@code signerServiceAccount} and {@code signedUrlTtlMinutes} are resolved
 * from environment variables / YAML ({@code application-cloud.yml}). Credentials
 * are resolved via ADC (Application Default Credentials — Workload Identity on
 * Cloud Run / {@code gcloud} ADC locally); V4 signed URLs are signed through the
 * IAM Credentials {@code signBlob} API by impersonating {@code signerServiceAccount},
 * so <strong>no key.json</strong> is ever referenced here or in YAML.
 *
 * <p>Bound under the prefix {@code eip.gcs}. Activation is scoped to the
 * {@code cloud} profile via {@link GcsStorageConfig}, so the default / mock demo
 * profile is unaffected.
 *
 * @param bucket               the private GCS bucket name (e.g. {@code eip-ai-dev-documents})
 * @param project              the Google Cloud project id (e.g. {@code eip-ai-dev})
 * @param signerServiceAccount the service account impersonated to sign V4 URLs via
 *                             IAM {@code signBlob} (e.g.
 *                             {@code eip-backend@eip-ai-dev.iam.gserviceaccount.com})
 * @param signedUrlTtlMinutes  signed-URL validity in minutes (default 15)
 */
@Validated
@ConfigurationProperties(prefix = "eip.gcs")
public record GcsStorageProperties(
        String bucket,
        String project,
        String signerServiceAccount,
        long signedUrlTtlMinutes) {

    public GcsStorageProperties {
        if (signedUrlTtlMinutes <= 0) {
            signedUrlTtlMinutes = 15;
        }
    }
}
