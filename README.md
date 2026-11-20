# Task Manager API & Web Application

A full-stack project and task management system built with Spring Boot, PostgreSQL, Redis, and a modern React frontend.

## Technologies Used

- **Backend**: Spring Boot 3.5.10, Java 21, Spring Security, JWT, Flyway
- **Frontend**: React 19, TypeScript, Vite, Lucide Icons
- **Database & Cache**: PostgreSQL 15, Redis 7
- **Build Tools**: Gradle (Kotlin DSL), npm
- **Containerization**: Docker & Docker Compose

## Quick Start (Deploy Anywhere with Docker)

To run the entire system (Database, Redis, and Application with React UI) on any Linux, macOS, or Windows machine with Docker installed:

```bash
chmod +x start.sh stop.sh

# Start on default port (8080 or value configured in .env):
./start.sh

# Start on a custom port (e.g. 9090 or 3000):
./start.sh 9090
# or
./start.sh -p 9090

# Prompt interactively for the port:
./start.sh -i
```

*(Or run `APP_PORT=9090 docker compose up -d --build`)*

Once started, open **`http://localhost:<PORT>`** (default: `http://localhost:8080`) in your browser.

To view application logs:
```bash
docker compose logs -f app
```

To stop all services:
```bash
./stop.sh
```

---

## Cloud Deployment

For deploying the application online:

- **Decoupled Architecture (Recommended for Free Tier / Production)**:
  Host the React frontend on **Vercel** / **Cloudflare Pages** (zero cold starts) with the backend API on **Railway** / **Render**, backed by **Neon / Supabase** (PostgreSQL) and **Upstash** (Redis).
  👉 Follow the detailed [**Decoupled Cloud Deployment Guide**](docs/decoupled_cloud_deployment.md).
- **Single-Server Docker Compose**:
  Deploy directly to any Linux Cloud VPS (Hetzner, DigitalOcean, AWS Lightsail) using the standard `start.sh` and `docker-compose.yml`.

---

## Local Development (Without Docker for App)

If you are developing features locally and prefer to run the database in Docker while running the code from your IDE:

### 1. Start Database & Redis Only
```bash
docker compose up -d db redis
```

### 2. Run the Spring Boot Backend
Ensure `JAVA_HOME` is set to Java 21+:
```bash
./gradlew bootRun
```

### 3. Run the Frontend (Vite Dev Server)
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
The Vite dev server will start at `http://localhost:5173` and automatically proxy API calls to the backend on port `8080`.

### 4. Build Static Frontend Bundle
To update the embedded React assets served by Spring Boot:
```bash
cd frontend
npm run build:static
```

## Demo Account Credentials

When deployed or running locally, a demo account with pre-populated workspaces, tags, and tasks is automatically seeded:

- **Email**: `demo@example.com`
- **Password**: `Password123!`
- *(Or click **"Auto-fill Demo Account"** directly on the sign-in screen)*

Additional sample team members seeded for task assignment:
- `sarah.chen@example.com` (`Password123!`)
- `marcus.taylor@example.com` (`Password123!`)

---

## Configuration

The application is configured via `src/main/resources/application.properties` and `.env`:

- **Database**: `taskmanager` (port `5432`)
- **Default User**: `postgres`
- **Default Password**: `d3v3l0p3r`
- **Redis Port**: `6379`
- **Web App / API Port**: `8080`
