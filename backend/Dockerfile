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
ENTRYPOINT ["java", "-XX:+UseZGC", "-jar", "app.jar"]
