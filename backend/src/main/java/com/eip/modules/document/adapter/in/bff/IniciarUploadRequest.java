package com.eip.modules.document.adapter.in.bff;

import java.util.UUID;

import com.eip.modules.document.domain.port.in.UploadDocumentUseCase.IniciarUploadCommand;

import jakarta.validation.constraints.NotBlank;

/**
 * Request body to start a document upload.
 */
public record IniciarUploadRequest(
        @NotBlank String type,
        String title,
        @NotBlank String originalFilename,
        String mediaType,
        UUID exportId,
        UUID legalEntityId) {

    public IniciarUploadCommand toCommand() {
        return new IniciarUploadCommand(
                type, title, originalFilename, mediaType, exportId, legalEntityId);
    }
}
