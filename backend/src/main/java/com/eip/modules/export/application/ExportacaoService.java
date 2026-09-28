package com.eip.modules.export.application;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
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

    @Override
    @Transactional(readOnly = true)
    public ExportacoesDashboard dashboard() {
        UUID org = currentOrg();
        PageResult result = repo.listar(org, null, 0, 10000);
        Map<String, Long> counts = new LinkedHashMap<>();
        BigDecimal valorTotal = BigDecimal.ZERO;
        for (Exportacao e : result.content()) {
            String status = e.status().name();
            counts.merge(status, 1L, Long::sum);
            if (e.totalAmount() != null) {
                valorTotal = valorTotal.add(e.totalAmount());
            }
        }
        List<ContagemPorStatus> porStatus = counts.entrySet().stream()
                .map(en -> new ContagemPorStatus(en.getKey(), en.getValue()))
                .toList();
        return new ExportacoesDashboard(
                result.total(),
                counts.getOrDefault("RASCUNHO", 0L),
                counts.getOrDefault("CONFIRMADA", 0L),
                counts.getOrDefault("CANCELADA", 0L),
                valorTotal,
                porStatus);
    }

    private static String payload(UUID exportId, UUID org) {
        return "{\"exportId\":\"" + exportId + "\",\"organizationId\":\"" + org
                + "\",\"occurredAt\":\"" + OffsetDateTime.now() + "\"}";
    }
}
