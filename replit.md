# Document Management System (DMS)

## Project Overview

A microservices-based Document Management System built with Java and Spring Boot. It provides authentication, document storage, and commenting functionality through a gateway-routed API.

## Architecture

| Service | Port | Description |
|---------|------|-------------|
| Gateway | 5000 | API gateway routing all external requests |
| Auth | 8087 | JWT authentication & user management |
| Documents | 8084 | Document metadata & file storage (MinIO) |
| Comments | 8086 | Document comments (Cassandra-backed) |

## Infrastructure (Replit Native)

- **PostgreSQL**: Replit built-in PostgreSQL (`helium` host)
  - `auth_db` — auth-service database
  - `documents_db` — documents-service database
- **Redis**: Native Redis 7.x on port 6379 (started in `start.sh`)
- **Cassandra**: Not available natively; comments-service disabled
- **MinIO**: Not available natively; documents-service connects but file upload requires MinIO

## Running the Project

The main workflow (`Start application`) runs `bash start.sh`, which:
1. Starts Redis
2. Sets up PostgreSQL databases
3. Starts auth-service (port 8087)
4. Starts documents-service (port 8084)
5. Starts gateway-service (port 5000) — the main entry point

## Key API Endpoints (via Gateway on port 5000)

- `POST /api/auth/register` — Register a new user
- `POST /api/auth/login` — Login and get JWT token
- `GET /api/documents` — List documents (requires JWT)
- `GET /api/comments/{documentId}` — Get comments for a document

## Build System

All services use **Maven** (except the legacy `authentication service` which uses Gradle).

Build a specific service:
```bash
cd <service-dir> && mvn clean package -DskipTests
```

## User Preferences

- Keep services running natively (no Docker in Replit)
- Gateway always runs on port 5000 (Replit webview port)
- Backend services use localhost as host
