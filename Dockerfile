# Stage 1: Build modern React frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# Stage 2: Build Spring Boot JAR with Gradle & JDK 21
FROM eclipse-temurin:21-jdk-jammy AS backend-builder
WORKDIR /app

COPY gradlew ./
COPY gradle ./gradle
COPY build.gradle.kts settings.gradle.kts ./
RUN chmod +x gradlew

# Download dependencies first for Docker layer caching
RUN ./gradlew dependencies --no-daemon || true

COPY src ./src
# Copy production frontend build into Spring Boot static resources
COPY --from=frontend-builder /app/frontend/dist/ ./src/main/resources/static/

RUN ./gradlew bootJar --no-daemon -x test

# Stage 3: Lightweight production JRE runtime
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Run container as non-root user
RUN groupadd -r appgroup && useradd -r -g appgroup appuser
USER appuser

COPY --from=backend-builder /app/build/libs/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
