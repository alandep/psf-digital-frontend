package com.eip.modules.document.adapter.out.storage;

import java.io.IOException;
import java.net.URL;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import com.eip.modules.document.domain.port.out.StoragePort;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.auth.oauth2.ImpersonatedCredentials;
import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.HttpMethod;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;

/**
 * Google Cloud Storage implementation of {@link StoragePort} for the
 * {@code cloud} profile. Mints short-lived <strong>V4 signed URLs</strong> so
 * clients upload (PUT) and download (GET) directly to/from a private bucket;
 * the backend never proxies file bytes.
 *
 * <p><strong>Signing without key.json.</strong> Credentials are resolved via ADC
 * (Application Default Credentials — Workload Identity on Cloud Run / local
 * {@code gcloud} ADC). ADC here is a user / Workload-Identity credential with no
 * private key, so {@link Storage#signUrl} cannot self-sign. Signing is therefore
 * delegated to the IAM Credentials {@code signBlob} API via an
 * {@link ImpersonatedCredentials} that impersonates
 * {@link GcsStorageProperties#signerServiceAccount()}; its
 * {@code sign(byte[])} performs the signature server-side. No service-account
 * key file is used or referenced.
 *
 * <p>The target bucket is private (public access prevention + uniform
 * bucket-level access); its region (us-central1) is fixed at bucket creation and
 * is not part of the client configuration. All settings are config-driven via
 * {@link GcsStorageProperties}.
 *
 * <p>Replaces {@link MockStorageAdapter} ({@code @Profile("!cloud")}) only when
 * the {@code cloud} profile is active.
 */
@Component
@Profile("cloud")
public class GcsStorageAdapter implements StoragePort {

    /** Scope required to call the IAM Credentials signBlob API. */
    private static final String CLOUD_PLATFORM_SCOPE = "https://www.googleapis.com/auth/cloud-platform";

    /** Lifetime (seconds) of the impersonated credential's access token. */
    private static final int IMPERSONATION_LIFETIME_SECONDS = 3600;

    private final GcsStorageProperties props;
    private final Storage storage;
    private final ImpersonatedCredentials signer;

    public GcsStorageAdapter(GcsStorageProperties props) {
        this.props = props;
        try {
            GoogleCredentials adc = GoogleCredentials.getApplicationDefault();
            this.storage = StorageOptions.newBuilder()
                    .setProjectId(props.project())
                    .setCredentials(adc)
                    .build()
                    .getService();
            // Impersonate the signer SA so V4 URL signing goes through IAM signBlob
            // (ADC has no private key). Built once and reused for all signatures.
            this.signer = ImpersonatedCredentials.create(
                    adc,
                    props.signerServiceAccount(),   // target principal
                    null,                           // no delegation chain
                    List.of(CLOUD_PLATFORM_SCOPE),
                    IMPERSONATION_LIFETIME_SECONDS);
        } catch (IOException | RuntimeException e) {
            throw new IllegalStateException(
                    "Failed to initialize Google Cloud Storage adapter. Ensure Application Default "
                            + "Credentials (ADC) are available (Workload Identity on Cloud Run or local "
                            + "gcloud ADC) and that the caller holds roles/iam.serviceAccountTokenCreator "
                            + "on the signer service account '" + props.signerServiceAccount()
                            + "' so V4 URLs can be signed via IAM signBlob.", e);
        }
    }

    @Override
    public SignedUrl signedUpload(String storageKey, String mediaType) {
        BlobInfo blob = BlobInfo.newBuilder(BlobId.of(props.bucket(), storageKey))
                .setContentType(mediaType)
                .build();
        URL url = storage.signUrl(blob, props.signedUrlTtlMinutes(), TimeUnit.MINUTES,
                Storage.SignUrlOption.httpMethod(HttpMethod.PUT),
                Storage.SignUrlOption.withV4Signature(),
                Storage.SignUrlOption.withContentType(),   // PUT must send matching Content-Type
                Storage.SignUrlOption.signWith(signer));
        return new SignedUrl(url.toString(), OffsetDateTime.now().plusMinutes(props.signedUrlTtlMinutes()));
    }

    @Override
    public SignedUrl signedDownload(String storageKey) {
        BlobInfo blob = BlobInfo.newBuilder(BlobId.of(props.bucket(), storageKey)).build();
        URL url = storage.signUrl(blob, props.signedUrlTtlMinutes(), TimeUnit.MINUTES,
                Storage.SignUrlOption.httpMethod(HttpMethod.GET),
                Storage.SignUrlOption.withV4Signature(),
                Storage.SignUrlOption.signWith(signer));
        return new SignedUrl(url.toString(), OffsetDateTime.now().plusMinutes(props.signedUrlTtlMinutes()));
    }

    @Override
    public String buildKey(UUID org, UUID documentId, String filename) {
        return "organizations/" + org + "/documents/" + documentId + "/" + sanitize(filename);
    }

    private static String sanitize(String filename) {
        if (filename == null || filename.isBlank()) {
            return "file";
        }
        String name = filename.replace('\\', '/');
        int slash = name.lastIndexOf('/');
        if (slash >= 0) {
            name = name.substring(slash + 1);
        }
        return name.replaceAll("[^A-Za-z0-9._-]", "_");
    }
}
