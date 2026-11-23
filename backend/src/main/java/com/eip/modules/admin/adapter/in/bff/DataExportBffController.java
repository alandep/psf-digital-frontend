package com.eip.modules.admin.adapter.in.bff;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.StandardOpenOption;

import org.springframework.core.io.InputStreamResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eip.modules.admin.application.DataExportService;
import com.eip.modules.admin.application.DataExportService.ExportResult;
import com.eip.platform.tenant.OrganizationContext;
import com.eip.platform.tenant.OrganizationContextHolder;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

/**
 * Exportação dos dados da organização em um arquivo ZIP (um JSON por tabela).
 */
@RestController
@RequestMapping("/bff/admin")
@RequiredArgsConstructor
public class DataExportBffController {

    private final DataExportService service;

    @GetMapping("/exportar-dados")
    @PreAuthorize("@rbac.can('admin/exportar-dados','view')")
    public ResponseEntity<InputStreamResource> exportar(HttpServletRequest request) {
        OrganizationContext context = OrganizationContextHolder.current();
        ExportResult result = service.exportar();
        service.registrarAuditoria(context.userId(), context.organizationId().value(), clientIp(request));

        InputStream in;
        try {
            // DELETE_ON_CLOSE remove o arquivo temporário quando a resposta termina de ser enviada.
            in = Files.newInputStream(result.file(), StandardOpenOption.DELETE_ON_CLOSE);
        } catch (IOException e) {
            throw new UncheckedIOException("Falha ao ler a exportação gerada", e);
        }
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("application/zip"))
                .contentLength(result.sizeBytes())
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment()
                        .filename(result.fileName()).build().toString())
                .header(HttpHeaders.CACHE_CONTROL, "no-store")
                .body(new InputStreamResource(in));
    }

    private static String clientIp(HttpServletRequest http) {
        String forwarded = http.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return http.getRemoteAddr();
    }
}
