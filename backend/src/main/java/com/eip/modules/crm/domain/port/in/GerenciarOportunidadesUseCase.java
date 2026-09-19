package com.eip.modules.crm.domain.port.in;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import com.eip.modules.crm.domain.model.Oportunidade;

/**
 * Inbound port: manage sales opportunities along the pipeline.
 */
public interface GerenciarOportunidadesUseCase {

    List<OportunidadeView> listar(String estagio);

    OportunidadeView porId(UUID id);

    OportunidadeView criar(CriarOportunidadeCommand cmd);

    OportunidadeView avancar(UUID id, EstagioCommand cmd);

    OportunidadeView ganhar(UUID id);

    OportunidadeView perder(UUID id);

    /** Command to create an opportunity. */
    record CriarOportunidadeCommand(
            UUID clienteId,
            String titulo,
            BigDecimal valorEstimado,
            String moeda,
            Integer probabilidade,
            LocalDate fechamentoPrevisto) {
    }

    /** Command to change an opportunity stage. */
    record EstagioCommand(String estagio) {
    }

    /** Read view of a single opportunity. */
    record OportunidadeView(
            UUID id,
            UUID clienteId,
            String titulo,
            BigDecimal valorEstimado,
            String moeda,
            String estagio,
            Integer probabilidade,
            LocalDate fechamentoPrevisto) {

        public static OportunidadeView from(Oportunidade o) {
            return new OportunidadeView(
                    o.id().value(),
                    o.clienteId() == null ? null : o.clienteId().value(),
                    o.titulo(),
                    o.valorEstimado(),
                    o.moeda(),
                    o.estagio().name(),
                    o.probabilidade(),
                    o.fechamentoPrevisto());
        }
    }
}
