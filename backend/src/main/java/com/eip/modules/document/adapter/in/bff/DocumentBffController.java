package com.eip.modules.document.adapter.in.bff;

import java.util.List;
import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.eip.modules.document.domain.port.in.DownloadDocumentUseCase;
import com.eip.modules.document.domain.port.in.DownloadDocumentUseCase.DownloadTicket;
import com.eip.modules.document.domain.port.in.ManageDocumentsUseCase;
import com.eip.modules.document.domain.port.in.ManageDocumentsUseCase.DocumentView;
import com.eip.modules.document.domain.port.in.UploadDocumentUseCase;
import com.eip.modules.document.domain.port.in.UploadDocumentUseCase.UploadTicket;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * BFF endpoints backing the document management screens (invoice, packing list,
 * bill of lading, certificates, contracts) plus async upload / download.
 */
@RestController
@RequestMapping("/bff/documentos")
@RequiredArgsConstructor
public class DocumentBffController {

    private final ManageDocumentsUseCase manageUseCase;
    private final UploadDocumentUseCase uploadUseCase;
    private final DownloadDocumentUseCase downloadUseCase;

    @GetMapping
    @PreAuthorize("@rbac.can('documentos/gerenciar','view')")
    public List<DocumentView> listar(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) UUID exportId) {
        return manageUseCase.listar(type, exportId);
    }

    @GetMapping("/{id}")
    @PreAuthorize("@rbac.can('documentos/gerenciar','view')")
    public DocumentView porId(@PathVariable UUID id) {
        return manageUseCase.porId(id);
    }

    @PostMapping("/upload/iniciar")
    @PreAuthorize("@rbac.can('documentos/gerenciar','create')")
    public UploadTicket iniciarUpload(@Valid @RequestBody IniciarUploadRequest request) {
        return uploadUseCase.iniciarUpload(request.toCommand());
    }

    @PostMapping("/{id}/upload/confirmar")
    @PreAuthorize("@rbac.can('documentos/gerenciar','create')")
    public DocumentView confirmarUpload(
            @PathVariable UUID id,
            @Valid @RequestBody ConfirmarUploadRequest request) {
        return uploadUseCase.confirmarUpload(id, request.sizeBytes(), request.sha256());
    }

    @GetMapping("/{id}/download")
    @PreAuthorize("@rbac.can('documentos/gerenciar','view')")
    public DownloadTicket download(@PathVariable UUID id) {
        return downloadUseCase.gerarDownload(id);
    }
}
