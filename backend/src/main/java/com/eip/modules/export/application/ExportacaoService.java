package com.eip.modules.export.application;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eip.modules.export.domain.model.Exportacao;
import com.eip.modules.export.domain.model.ItemExportacao;
import com.eip.modules.export.domain.port.in.ConfirmarExportacaoUseCase;
import com.eip.modules.export.domain.port.in.CriarExportacaoUseCase;
import com.eip.modules.export.domain.port.in.ListarExportacoesUseCase;
import com.eip.modules.export.domain.port.out.ExportacaoRepositoryPort;
import com.eip.modules.export.domain.port.out.PageResult;
import com.eip.platform.error.ResourceNotFoundException;
import com.eip.platform.outbox.OutboxPublisher;
import com.eip.platform.tenant.OrganizationContextHolder;

import lombok.RequiredArgsConstructor;

/**
 * Application service implementing the export use cases.
 */
@Service
@RequiredArgsConstructor
public class ExportacaoService
        implements CriarExportacaoUseCase, ConfirmarExportacaoUseCase, ListarExportacoesUseCase {

    private final ExportacaoRepositoryPort repo;
    private final OutboxPublisher outbox;

    private static UUID currentOrg() {
        return OrganizationContextHolder.current().organizationId().value();
    }

    @Override
    @Transactional
    public ExportacaoView criar(CriarExportacaoCommand cmd) {
        UUID org = currentOrg();
        List<ItemExportacao> itens = cmd.itens() == null ? List.of() : cmd.itens().stream()
                .map(i -> new ItemExportacao(
                        null, i.productId(), i.description(), i.quantity(), i.unitPrice()))
                .toList();
        Exportacao exportacao = Exportacao.novaRascunho(
                org, cmd.customerId(), cmd.destinationCountry(),
                cmd.incoterm(), cmd.currency(), itens);
        Exportacao salvo = repo.salvar(exportacao);
        outbox.record("Exportacao", salvo.id().asString(), org, "ExportacaoCriada",
                payload(salvo.id().value(), org));
        return ExportacaoView.from(salvo);
    }

    @Override
    @Transactional
    public ExportacaoView confirmar(UUID id) {
        UUID org = currentOrg();
        Exportacao exportacao = repo.porId(id, org)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Exportacao nao encontrada: " + id));
        exportacao.confirmar();
        Exportacao salvo = repo.salvar(exportacao);
        outbox.record("Exportacao", salvo.id().asString(), org, "ExportacaoConfirmada",
                payload(salvo.id().value(), org));
        return ExportacaoView.from(salvo);
    }

    @Override
    @Transactional(readOnly = true)
    public ExportacoesPage paraLista(int page, int size, String status) {
        UUID org = currentOrg();
        PageResult result = repo.listar(org, status, page, size);
        List<ExportacaoResumo> content = result.content().stream()
                .map(e -> new ExportacaoResumo(
                        e.id().value(),
                        e.reference(),
                        e.status().name(),
                        e.destinationCountry(),
                        e.totalAmount(),
                        e.currency()))
                .toList();
        return new ExportacoesPage(content, page, size, result.total());
    }

    @Override
    @Transactional(readOnly = true)
    public ExportacaoView porId(UUID id) {
        UUID org = currentOrg();
        Exportacao exportacao = repo.porId(id, org)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Exportacao nao encontrada: " + id));
        return ExportacaoView.from(exportacao);
    }

    private static String payload(UUID exportId, UUID org) {
        return "{\"exportId\":\"" + exportId + "\",\"organizationId\":\"" + org
                + "\",\"occurredAt\":\"" + OffsetDateTime.now() + "\"}";
    }
}
