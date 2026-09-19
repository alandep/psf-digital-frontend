# syntax=docker/dockerfile:1

# --- Build stage ---
FROM eclipse-temurin:21-jdk AS build
WORKDIR /workspace
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw -q -B dependency:go-offline
COPY src/ src/
RUN ./mvnw -q -B -DskipTests package

# --- Runtime stage ---
FROM eclipse-temurin:21-jre AS runtime
WORKDIR /app
COPY --from=build /workspace/target/eip-backend-*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-XX:+UseZGC", "-jar", "app.jar"]
