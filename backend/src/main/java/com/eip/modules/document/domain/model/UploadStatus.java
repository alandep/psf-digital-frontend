package com.eip.modules.document.domain.model;

/**
 * Lifecycle of the physical file upload for a {@link Document}.
 *
 * <p>{@code PENDING} until the client PUTs the file to storage, then
 * {@code UPLOADED} on confirmation, or {@code FAILED} on error.
 */
public enum UploadStatus {
    PENDING,
    UPLOADED,
    FAILED
}
