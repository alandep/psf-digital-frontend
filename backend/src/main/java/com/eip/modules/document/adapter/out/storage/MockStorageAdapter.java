package com.eip.modules.document.adapter.out.storage;

import java.time.OffsetDateTime;
import java.util.UUID;

import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.stereotype.Component;

import com.eip.modules.document.domain.port.out.StoragePort;

/**
 * DEV / mock implementation of {@link StoragePort}. Returns fake signed URLs
 * with a short expiry instead of talking to a real object store.
 *
 * <p>Registered only when no other {@link StoragePort} bean exists, so a real
 * adapter can transparently override it.
 *
 * <p>TODO: replace with Google Cloud Storage V4 signed URLs (upload + download)
 * in the cloud profile, backed by a service-account signer.
 */
@Component
@ConditionalOnMissingBean(StoragePort.class)
public class MockStorageAdapter implements StoragePort {

    private static final String BASE = "https://storage.eip.mock/";
    private static final int EXPIRY_MINUTES = 15;

    @Override
    public SignedUrl signedUpload(String storageKey, String mediaType) {
        OffsetDateTime expiresAt = OffsetDateTime.now().plusMinutes(EXPIRY_MINUTES);
        String url = BASE + storageKey + "?sig=mock-put-" + UUID.randomUUID()
                + "&method=PUT&expires=" + expiresAt;
        return new SignedUrl(url, expiresAt);
    }

    @Override
    public SignedUrl signedDownload(String storageKey) {
        OffsetDateTime expiresAt = OffsetDateTime.now().plusMinutes(EXPIRY_MINUTES);
        String url = BASE + storageKey + "?sig=mock-get-" + UUID.randomUUID()
                + "&method=GET&expires=" + expiresAt;
        return new SignedUrl(url, expiresAt);
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
