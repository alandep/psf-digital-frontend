# syntax=docker/dockerfile:1

# --- Build stage ---
# Uses the official Maven image (Maven + JDK 21 preinstalled), so no Maven
# wrapper (mvnw) is required in the repository. Dependencies are cached via a
# BuildKit mount so repeated builds are fast without a fragile go-offline step.
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /workspace
COPY pom.xml ./
COPY src/ src/
RUN --mount=type=cache,target=/root/.m2 mvn -q -B -DskipTests package

# --- Runtime stage ---
FROM eclipse-temurin:21-jre AS runtime
WORKDIR /app
COPY --from=build /workspace/target/eip-backend-*.jar app.jar
EXPOSE 8080
# JVM tuning parametrizável via env (override em runtime sem rebuild).
# Default seguro para o pod pequeno do GKE (requests ~512Mi):
#  - MaxRAMPercentage=70 => a JVM respeita o limite de memória do container (sem -Xmx fixo)
#  - UseG1GC             => footprint menor que ZGC em heaps pequenos
# Para pods maiores, basta sobrescrever JAVA_OPTS (ex.: "-XX:MaxRAMPercentage=75 -XX:+UseZGC").
ENV JAVA_OPTS="-XX:MaxRAMPercentage=70 -XX:+UseG1GC"
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]
