# EIP Backend

Backend da plataforma EIP: um monólito modular (Spring Modulith) em Spring Boot 3.5,
organizado por módulos com arquitetura hexagonal (portas e adaptadores). O pacote
`com.eip.platform` reúne componentes compartilhados entre os módulos.

## Requisitos

- Java 21 (LTS)
- Maven via wrapper (`./mvnw`) — não é necessário instalar o Maven
- PostgreSQL 16 (via Docker ou local)

## Como rodar

### Opção 1 — Docker Compose (recomendado)

```bash
docker compose up --build
```

Sobe a aplicação em `http://localhost:8080` junto com um Postgres já configurado.

### Opção 2 — Local com Postgres próprio

Com um Postgres disponível (banco `eip`, usuário/senha `eip`):

```bash
./mvnw spring-boot:run
```

Variáveis úteis: `SPRING_DATASOURCE_URL`, `DB_USER`, `DB_PASSWORD`, `DB_POOL_SIZE`, `PORT`.

## Perfis

- `local` (padrão): logging `DEBUG` para `com.eip`, ideal para desenvolvimento.
- `cloud`: ajustes para Cloud Run (pool menor, logging `INFO`).

Ative com `SPRING_PROFILES_ACTIVE=cloud`.

## Endpoints úteis

- Health/observabilidade: `/actuator/health`, `/actuator/prometheus`
- API docs (OpenAPI): `/v3/api-docs`
- Swagger UI: `/swagger-ui.html`

## Estrutura

- `com.eip.bootstrap` — classe principal (`EipBackendApplication`).
- `com.eip.<módulo>` — módulos de negócio (hexagonal).
- `com.eip.platform` — módulo compartilhado.
