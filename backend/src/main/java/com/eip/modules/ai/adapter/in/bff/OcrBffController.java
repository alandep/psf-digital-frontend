package com.eip.modules.ai.adapter.in.bff;

import java.util.Set;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eip.modules.ai.domain.port.in.OcrExtractionUseCase;
import com.eip.modules.ai.domain.port.in.OcrExtractionUseCase.OcrCommand;
import com.eip.modules.ai.domain.port.in.OcrExtractionUseCase.OcrExtractionView;
import com.eip.platform.error.BusinessRuleException;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;

/**
 * BFF endpoint for the multimodal OCR document extraction capability. Runs the
 * {@link com.eip.modules.ai.domain.model.AiTask#OCR_DOCUMENT} extraction through
 * the shared AI pipeline and returns a typed {@link OcrExtractionView} with the
 * structured fields, completeness score, detected discrepancies and provider
 * telemetry.
 *
 * <p><strong>The document binary never travels through the request body.</strong>
 * The front uploads the file to object storage via a signed URL and sends only
 * the resulting {@code storageKey}; the backend reads the binary from storage
 * (by {@code gs://}) when invoking the provider. The extraction result is meant
 * for human review (human-in-the-loop) and is never auto-applied to a business
 * action.
 *
 * <p>Before touching the provider, the {@code mediaType} is validated against an
 * allowlist of supported MIME types (Req 17.8). An unsupported format fails fast
 * with HTTP 422 ({@link BusinessRuleException}) and <em>no</em> AI call is made.
 * Quota exhaustion surfaces as HTTP 402 and malformed AI output as HTTP 422
 * {@code AI_RESPONSE_INVALID} via the module's {@code AiExceptionHandler}.
 */
@RestController
@RequestMapping("/bff/ai/ocr")
@RequiredArgsConstructor
public class OcrBffController {

    /** Supported document MIME types; anything outside this set is rejected pre-provider (Req 17.8). */
    private static final Set<String> SUPPORTED_MEDIA_TYPES = Set.of(
            "application/pdf",
            "image/png",
            "image/jpeg",
            "image/jpg",
            "image/webp",
            "image/tiff");

    private final OcrExtractionUseCase useCase;

    @PostMapping
    @PreAuthorize("@rbac.can('ai-operations/painel','create')")
    public OcrExtractionView ocr(@Valid @RequestBody OcrRequest request) {
        if (!SUPPORTED_MEDIA_TYPES.contains(request.mediaType())) {
            throw new BusinessRuleException(
                    "Formato de documento nao suportado: " + request.mediaType());
        }
        return useCase.extract(
                new OcrCommand(request.storageKey(), request.mediaType(), request.docKind()));
    }

    /**
     * Request to run OCR extraction over a document already uploaded to object
     * storage. All fields are required: the binary is referenced by
     * {@code storageKey} (never inlined in the body).
     *
     * @param storageKey the object storage reference of the uploaded binary (ex.: {@code gs://bucket/key})
     * @param mediaType  the MIME type of the binary (must be in the supported allowlist)
     * @param docKind    the expected document type (ex.: {@code COMMERCIAL_INVOICE})
     */
    public record OcrRequest(
            @NotBlank String storageKey,
            @NotBlank String mediaType,
            @NotBlank String docKind) {
    }
}
