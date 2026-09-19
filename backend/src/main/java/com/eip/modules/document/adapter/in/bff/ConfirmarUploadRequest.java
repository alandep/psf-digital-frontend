package com.eip.modules.document.adapter.in.bff;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
 * Request body to confirm a completed upload.
 */
public record ConfirmarUploadRequest(
        @NotNull @Positive Long sizeBytes,
        String sha256) {
}
