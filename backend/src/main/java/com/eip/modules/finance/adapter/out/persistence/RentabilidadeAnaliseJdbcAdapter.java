package com.eip.modules.finance.adapter.out.persistence;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Component;

import com.eip.modules.finance.domain.model.RentabilidadeAnalise;
import com.eip.modules.finance.domain.port.out.RentabilidadeAnaliseRepositoryPort;

/**
 * JDBC adapter for {@code rentabilidade_analise} (V38). The JSON payload is
 * written with {@code CAST(:payload AS jsonb)} and read back as text. Runs
 * inside the caller's transaction, so the RLS tenant binding applies.
 */
@Component
public class RentabilidadeAnaliseJdbcAdapter implements RentabilidadeAnaliseRepositoryPort {

    private static final String COLUNAS =
            "id, organization_id, user_id, exportacao_ref, produto, score, margem, lucro_brl, "
                    + "payload::text AS payload, created_at";

    private static final RowMapper<RentabilidadeAnalise> MAPPER = (rs, i) -> new RentabilidadeAnalise(
            rs.getObject("id", UUID.class),
            rs.getObject("organization_id", UUID.class),
            rs.getObject("user_id", UUID.class),
            rs.getString("exportacao_ref"),
            rs.getString("produto"),
            rs.getObject("score", Integer.class),
            rs.getBigDecimal("margem"),
            rs.getBigDecimal("lucro_brl"),
            rs.getString("payload"),
            rs.getObject("created_at", OffsetDateTime.class));

    private final NamedParameterJdbcTemplate jdbc;

    public RentabilidadeAnaliseJdbcAdapter(JdbcTemplate jdbcTemplate) {
        this.jdbc = new NamedParameterJdbcTemplate(jdbcTemplate);
    }

    @Override
    public RentabilidadeAnalise salvar(RentabilidadeAnalise a) {
        MapSqlParameterSource p = new MapSqlParameterSource()
                .addValue("id", a.id())
                .addValue("org", a.organizationId())
                .addValue("userId", a.userId())
                .addValue("ref", a.exportacaoRef())
                .addValue("produto", a.produto())
                .addValue("score", a.score())
                .addValue("margem", a.margem(), java.sql.Types.NUMERIC)
                .addValue("lucro", a.lucroBrl(), java.sql.Types.NUMERIC)
                .addValue("payload", a.payloadJson());
        List<RentabilidadeAnalise> rows = jdbc.query(
                "INSERT INTO rentabilidade_analise "
                        + "(id, organization_id, user_id, exportacao_ref, produto, score, margem, "
                        + "lucro_brl, payload) "
                        + "VALUES (:id, :org, :userId, :ref, :produto, :score, :margem, :lucro, "
                        + "CAST(:payload AS jsonb)) RETURNING " + COLUNAS,
                p, MAPPER);
        return rows.get(0);
    }

    @Override
    public List<RentabilidadeAnalise> listarRecentes(UUID org, int limite) {
        return jdbc.query(
                "SELECT " + COLUNAS + " FROM rentabilidade_analise "
                        + "WHERE organization_id = :org ORDER BY created_at DESC LIMIT :limite",
                new MapSqlParameterSource().addValue("org", org).addValue("limite", limite),
                MAPPER);
    }

    @Override
    public boolean excluir(UUID id, UUID org) {
        int n = jdbc.update(
                "DELETE FROM rentabilidade_analise WHERE id = :id AND organization_id = :org",
                new MapSqlParameterSource().addValue("id", id).addValue("org", org));
        return n > 0;
    }
}
