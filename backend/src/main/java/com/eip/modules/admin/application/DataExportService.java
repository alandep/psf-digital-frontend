package com.eip.modules.admin.application;

import java.io.IOException;
import java.io.OutputStream;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.PreparedStatementCreator;
import org.springframework.jdbc.core.RowCallbackHandler;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eip.platform.tenant.OrganizationContext;
import com.eip.platform.tenant.OrganizationContextHolder;
import com.fasterxml.jackson.core.JsonFactory;
import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.util.DefaultPrettyPrinter;

import lombok.RequiredArgsConstructor;

/**
 * Exportação dos dados da organização (portabilidade/LGPD): gera um ZIP com um
 * {@code <tabela>.json} para cada tabela que possui {@code organization_id}, mais um
 * {@code LEIA-ME.txt}. Colunas sensíveis são omitidas. As leituras rodam em transação
 * somente leitura com o RLS da organização vinculado e sempre filtram por organização
 * (tabelas de identidade não usam RLS).
 */
@Service
@RequiredArgsConstructor
public class DataExportService {

    private static final Logger log = LoggerFactory.getLogger(DataExportService.class);

    /** Máximo de linhas exportadas por tabela. */
    static final int MAX_ROWS_PER_TABLE = 200_000;

    private static final int FETCH_SIZE = 1000;
    private static final ZoneId ZONE = ZoneId.of("America/Sao_Paulo");
    private static final DateTimeFormatter README_STAMP = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");

    private static final String LIST_TABLES_SQL = """
            SELECT DISTINCT c.table_name
              FROM information_schema.columns c
              JOIN information_schema.tables t
                ON t.table_schema = c.table_schema
               AND t.table_name = c.table_name
               AND t.table_type = 'BASE TABLE'
             WHERE c.table_schema = 'public'
               AND c.column_name = 'organization_id'
             ORDER BY c.table_name
            """;

    private final JdbcTemplate jdbc;

    /** Resultado da exportação: arquivo temporário (a ser removido pelo chamador) e nome sugerido. */
    public record ExportResult(Path file, long sizeBytes, String fileName) {
    }

    private record TableResult(String table, long rows, boolean truncated) {
    }

    /**
     * Gera o ZIP da organização do contexto atual em um arquivo temporário.
     *
     * @throws IllegalStateException sem organização no contexto
     */
    @Transactional(readOnly = true)
    public ExportResult exportar() {
        OrganizationContext context = OrganizationContextHolder.current();
        UUID org = context.organizationId().value();
        ZonedDateTime generatedAt = ZonedDateTime.now(ZONE);
        Path file = null;
        try {
            file = Files.createTempFile("eip-exportacao-", ".zip");
            List<TableResult> results = new ArrayList<>();
            JsonFactory factory = new JsonFactory();
            try (OutputStream out = Files.newOutputStream(file);
                 ZipOutputStream zip = new ZipOutputStream(out, StandardCharsets.UTF_8)) {
                for (String table : listTables()) {
                    zip.putNextEntry(new ZipEntry(table + ".json"));
                    results.add(writeTable(zip, factory, table, org));
                    zip.closeEntry();
                }
                zip.putNextEntry(new ZipEntry("LEIA-ME.txt"));
                zip.write(readme(org, generatedAt, results).getBytes(StandardCharsets.UTF_8));
                zip.closeEntry();
            }
            return new ExportResult(file, Files.size(file), DataExportRules.fileName(generatedAt));
        } catch (IOException | RuntimeException e) {
            deleteQuietly(file);
            if (e instanceof RuntimeException re) {
                throw re;
            }
            throw new UncheckedIOException("Falha ao gerar a exportação de dados", (IOException) e);
        }
    }

    /** Registra o evento de auditoria {@code DATA_EXPORTED} (best-effort, fora da transação de leitura). */
    @Transactional
    public void registrarAuditoria(UUID userId, UUID org, String ip) {
        try {
            jdbc.update("insert into security_event(id,user_id,organization_id,type,ip) values (?,?,?,?,?)",
                    UUID.randomUUID(), userId, org, "DATA_EXPORTED", ip);
        } catch (RuntimeException ex) {
            log.warn("Falha ao registrar security_event DATA_EXPORTED: {}", ex.getClass().getSimpleName());
        }
    }

    private List<String> listTables() {
        return jdbc.queryForList(LIST_TABLES_SQL, String.class).stream()
                .filter(t -> !DataExportRules.isExcludedTable(t))
                .filter(DataExportRules::isSafeIdentifier)
                .toList();
    }

    private TableResult writeTable(OutputStream target, JsonFactory factory, String table, UUID org) {
        // Identificador validado por isSafeIdentifier e entre aspas; a organização vai como parâmetro.
        String sql = "SELECT * FROM public.\"" + table + "\" WHERE organization_id = ? LIMIT "
                + (MAX_ROWS_PER_TABLE + 1);
        long[] count = {0L};
        boolean[] truncated = {false};
        try (JsonGenerator gen = factory.createGenerator(target)) {
            gen.disable(JsonGenerator.Feature.AUTO_CLOSE_TARGET);
            gen.setPrettyPrinter(new DefaultPrettyPrinter());
            gen.writeStartArray();
            PreparedStatementCreator creator = con -> {
                PreparedStatement ps = con.prepareStatement(sql);
                ps.setFetchSize(FETCH_SIZE);
                ps.setObject(1, org);
                return ps;
            };
            RowCallbackHandler handler = rs -> {
                if (count[0] >= MAX_ROWS_PER_TABLE) {
                    truncated[0] = true;
                    return;
                }
                try {
                    writeRow(gen, rs);
                } catch (IOException e) {
                    throw new UncheckedIOException("Falha ao exportar a tabela " + table, e);
                }
                count[0]++;
            };
            jdbc.query(creator, handler);
            gen.writeEndArray();
        } catch (IOException e) {
            throw new UncheckedIOException("Falha ao exportar a tabela " + table, e);
        }
        return new TableResult(table, count[0], truncated[0]);
    }

    private static void writeRow(JsonGenerator gen, ResultSet rs) throws IOException, SQLException {
        ResultSetMetaData meta = rs.getMetaData();
        gen.writeStartObject();
        for (int i = 1; i <= meta.getColumnCount(); i++) {
            String column = meta.getColumnName(i);
            if (DataExportRules.isSensitiveColumn(column)) {
                continue;
            }
            gen.writeFieldName(column);
            writeValue(gen, rs, i, meta.getColumnTypeName(i));
        }
        gen.writeEndObject();
    }

    private static void writeValue(JsonGenerator gen, ResultSet rs, int index, String typeName)
            throws IOException, SQLException {
        String type = typeName == null ? "" : typeName.toLowerCase();
        switch (type) {
            case "timestamptz" -> writeString(gen, rs.getObject(index, java.time.OffsetDateTime.class));
            case "timestamp" -> writeString(gen, rs.getObject(index, java.time.LocalDateTime.class));
            case "date" -> writeString(gen, rs.getObject(index, java.time.LocalDate.class));
            case "json", "jsonb" -> {
                String raw = rs.getString(index);
                if (raw == null) {
                    gen.writeNull();
                } else {
                    gen.writeRawValue(raw);
                }
            }
            case "bytea" -> {
                byte[] bytes = rs.getBytes(index);
                if (bytes == null) {
                    gen.writeNull();
                } else {
                    gen.writeBinary(bytes);
                }
            }
            default -> writeGeneric(gen, rs.getObject(index));
        }
    }

    private static void writeString(JsonGenerator gen, Object value) throws IOException {
        if (value == null) {
            gen.writeNull();
        } else {
            gen.writeString(value.toString());
        }
    }

    private static void writeGeneric(JsonGenerator gen, Object value) throws IOException {
        if (value == null) {
            gen.writeNull();
        } else if (value instanceof Boolean b) {
            gen.writeBoolean(b);
        } else if (value instanceof Integer || value instanceof Short || value instanceof Byte) {
            gen.writeNumber(((Number) value).intValue());
        } else if (value instanceof Long l) {
            gen.writeNumber(l);
        } else if (value instanceof java.math.BigDecimal bd) {
            gen.writeNumber(bd);
        } else if (value instanceof Double d) {
            gen.writeNumber(d);
        } else if (value instanceof Float f) {
            gen.writeNumber(f);
        } else {
            gen.writeString(value.toString());
        }
    }

    private static String readme(UUID org, ZonedDateTime generatedAt, List<TableResult> results) {
        StringBuilder sb = new StringBuilder();
        sb.append("EIP - Exportação de dados da organização\n");
        sb.append("========================================\n\n");
        sb.append("Gerado em: ").append(README_STAMP.format(generatedAt)).append(" (America/Sao_Paulo)\n");
        sb.append("Organização: ").append(org).append("\n\n");
        sb.append("Cada arquivo .json contém as linhas da tabela correspondente que pertencem à sua\n");
        sb.append("organização. Datas seguem o padrão ISO-8601. Por segurança, senhas, segredos,\n");
        sb.append("tokens, hashes e dados cifrados não são exportados.\n");
        sb.append("Limite de ").append(MAX_ROWS_PER_TABLE)
                .append(" linhas por tabela; tabelas acima do limite são truncadas.\n\n");
        sb.append("Tabelas (linhas exportadas):\n");
        Map<String, String> lines = new LinkedHashMap<>();
        for (TableResult r : results) {
            lines.put(r.table(), r.rows() + (r.truncated() ? " (TRUNCADO no limite de "
                    + MAX_ROWS_PER_TABLE + " linhas)" : ""));
        }
        lines.forEach((table, info) -> sb.append(" - ").append(table).append(".json: ").append(info).append('\n'));
        return sb.toString();
    }

    private static void deleteQuietly(Path file) {
        if (file == null) {
            return;
        }
        try {
            Files.deleteIfExists(file);
        } catch (IOException ignored) {
            // melhor esforço
        }
    }
}
