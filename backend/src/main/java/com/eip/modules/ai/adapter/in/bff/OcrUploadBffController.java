package com.eip.modules.ai.adapter.in.bff;

import java.io.IOException;
import java.util.Set;
import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.eip.modules.ai.domain.port.in.OcrExtractionUseCase;
import com.eip.modules.ai.domain.port.in.OcrExtractionUseCase.OcrCommand;
import com.eip.modules.ai.domain.port.in.OcrExtractionUseCase.OcrExtractionView;
import com.eip.modules.document.domain.port.out.StoragePort;
import com.eip.platform.error.BusinessRuleException;
import com.eip.platform.tenant.OrganizationContextHolder;

import lombok.RequiredArgsConstructor;

/**
 * Multipart OCR endpoint: receives the document binary directly, stores it
 * server-side via {@link StoragePort#upload} (GCS in cloud, mock otherwise) and
 * runs the real OCR extraction ({@link OcrExtractionUseCase}). This avoids any
 * cross-origin browser PUT to storage — the frontend simply posts the file here.
 */
@RestController
@RequestMapping("/bff/ai/ocr")
@RequiredArgsConstructor
public class OcrUploadBffController {

    private static final Set<String> SUPPORTED_MEDIA_TYPES = Set.of(
            "application/pdf", "image/png", "image/jpeg", "image/jpg", "image/webp", "image/tiff");

    private final OcrExtractionUseCase useCase;
    private final StoragePort storage;

    @PostMapping("/upload")
    @PreAuthorize("@rbac.can('ai-operations/painel','create')")
    public OcrExtractionView ocrUpload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "docKind", defaultValue = "COMMERCIAL_INVOICE") String docKind) {
        if (file == null || file.isEmpty()) {
            throw new BusinessRuleException("Arquivo de documento ausente ou vazio.");
        }
        String mediaType = file.getContentType();
        if (mediaType == null || !SUPPORTED_MEDIA_TYPES.contains(mediaType)) {
            throw new BusinessRuleException("Formato de documento nao suportado: " + mediaType);
        }
        UUID org = OrganizationContextHolder.current().organizationId().value();
        String key = storage.buildKey(org, UUID.randomUUID(),
                file.getOriginalFilename() == null ? "documento" : file.getOriginalFilename());
        byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (IOException e) {
            throw new BusinessRuleException("Falha ao ler o arquivo enviado.");
        }
        String storageUri = storage.upload(key, bytes, mediaType);
        return useCase.extract(new OcrCommand(storageUri, mediaType, docKind));
    }
}
