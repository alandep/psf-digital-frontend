package com.eip.modules.logistics.application;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eip.modules.logistics.domain.model.Embarque;
import com.eip.modules.logistics.domain.port.in.GerenciarEmbarquesUseCase;
import com.eip.modules.logistics.domain.port.in.RegistrosLogisticosUseCase;
import com.eip.modules.logistics.domain.port.out.EmbarqueRepositoryPort;
import com.eip.modules.logistics.domain.port.out.RegistroLogisticoRepositoryPort;
import com.eip.platform.error.ResourceNotFoundException;
import com.eip.platform.outbox.OutboxPublisher;
import com.eip.platform.tenant.OrganizationContextHolder;

import lombok.RequiredArgsConstructor;

/**
 * Application service implementing the logistics use cases.
 */
@Service
@RequiredArgsConstructor
public class LogisticsService
        implements GerenciarEmbarquesUseCase, RegistrosLogisticosUseCase {

    private static final String AGGREGATE = "Embarque";

    private final EmbarqueRepositoryPort embarques;
    private final RegistroLogisticoRepositoryPort registros;
    private final OutboxPublisher outbox;

    private static UUID currentOrg() {
        return OrganizationContextHolder.current().organizationId().value();
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmbarqueResumo> listar(String status) {
        UUID org = currentOrg();
        return embarques.listar(org, status).stream()
                .map(e -> new EmbarqueResumo(
                        e.id().value(),
                        e.reference(),
                        e.status().name(),
                        e.eta()))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public EmbarqueView porId(UUID id) {
        UUID org = currentOrg();
        Embarque embarque = embarques.porId(id, org)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Embarque nao encontrado: " + id));
        return EmbarqueView.from(embarque);
    }

    @Override
    @Transactional
    public EmbarqueView criar(CriarEmbarqueCommand cmd) {
        UUID org = currentOrg();
        Embarque embarque = Embarque.novo(
                org, cmd.exportId(), cmd.reference(), cmd.portoOrigemId(),
                cmd.portoDestinoId(), cmd.navioId(), cmd.transportadoraId(),
                cmd.etd(), cmd.eta(), cmd.modal());
        Embarque salvo = embarques.salvar(embarque);
        outbox.record(AGGREGATE, salvo.id().asString(), org, "EmbarqueCriado",
                payload(salvo.id().value(), org));
        return EmbarqueView.from(salvo);
    }

    @Override
    @Transactional
    public EmbarqueView iniciarTransito(UUID id) {
        return transicionar(id, "EmbarqueEmTransito", Embarque::iniciarTransito);
    }

    @Override
    @Transactional
    public EmbarqueView concluir(UUID id) {
        return transicionar(id, "EmbarqueConcluido", Embarque::concluir);
    }

    @Override
    @Transactional
    public EmbarqueView cancelar(UUID id) {
        return transicionar(id, "EmbarqueCancelado", Embarque::cancelar);
    }

    private EmbarqueView transicionar(UUID id, String eventType,
                                      java.util.function.Consumer<Embarque> transition) {
        UUID org = currentOrg();
        Embarque embarque = embarques.porId(id, org)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Embarque nao encontrado: " + id));
        transition.accept(embarque);
        Embarque salvo = embarques.salvar(embarque);
        outbox.record(AGGREGATE, salvo.id().asString(), org, eventType,
                payload(salvo.id().value(), org));
        return EmbarqueView.from(salvo);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PortoView> portos() {
        return registros.portos(currentOrg()).stream()
                .map(p -> new PortoView(p.id(), p.code(), p.name(), p.country()))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransportadoraView> transportadoras() {
        return registros.transportadoras(currentOrg()).stream()
                .map(t -> new TransportadoraView(t.id(), t.name(), t.tipo()))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<NavioView> navios() {
        return registros.navios(currentOrg()).stream()
                .map(n -> new NavioView(n.id(), n.name(), n.imo()))
                .toList();
    }

    private static String payload(UUID embarqueId, UUID org) {
        return "{\"embarqueId\":\"" + embarqueId + "\",\"organizationId\":\"" + org + "\"}";
    }
}
