# Task Manager API

A backend service for managing tasks, built with Spring Boot and PostgreSQL.

## Technologies Used

- **Java**: 21
- **Spring Boot**: 3.5.10
- **Database**: PostgreSQL 15
- **Build Tool**: Gradle (Kotlin DSL)
- **Containerization**: Docker & Docker Compose

## Project Structure

- `src/main/java`: Source code for the application.
- `src/main/resources`: Configuration files, including `application.properties`.
- `docker-compose.yml`: Docker configuration for the PostgreSQL database.
- `.env`: Environment variables for the database.
- `start.sh` & `stop.sh`: Helper scripts for managing the database container.

## Getting Started

### Prerequisites

- Java 21 JDK
- Docker and Docker Compose

### Running the Database

To start the PostgreSQL database container:

```bash
chmod +x start.sh stop.sh
./start.sh
```

To stop the database:

```bash
./stop.sh
```

### Running the Application

Once the database is running, you can start the Spring Boot application using Gradle:

```bash
./gradlew bootRun
```

The API and bundled frontend will be available at `http://localhost:8080`.

### Running the Modern React Frontend (Vite)

The modern React frontend is located in the `frontend` directory:

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server will start at `http://localhost:5173` and automatically proxy API calls to the backend on port 8080.

To build and update the backend's static assets:

```bash
npm run build:static
```

## Configuration

The application is configured via `src/main/resources/application.properties` and the `.env` file for Docker. Default database credentials are:

- **Database**: `taskmanager`
- **User**: `postgres`
- **Password**: `password`
- **Port**: `5432`
