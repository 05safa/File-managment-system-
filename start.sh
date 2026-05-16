#!/bin/bash
set -e

# Parse DATABASE_URL for PostgreSQL connection details
DB_HOST="helium"
DB_PORT="5432"
DB_USER="postgres"
DB_PASS="password"

echo "=== Starting DMS Microservices ==="

# Start Redis
echo "[1/5] Starting Redis..."
redis-server --daemonize yes --logfile /tmp/redis.log --port 6379 2>/dev/null || true
sleep 1
if redis-cli ping > /dev/null 2>&1; then
    echo "    Redis: OK"
else
    echo "    Redis: FAILED to start"
fi

# Ensure databases exist
echo "[2/5] Setting up PostgreSQL databases..."
psql postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}/${DB_USER} -c "SELECT 1 FROM pg_database WHERE datname='auth_db'" | grep -q 1 || \
    psql postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}/${DB_USER} -c "CREATE DATABASE auth_db OWNER postgres;" 2>/dev/null || true
psql postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}/${DB_USER} -c "SELECT 1 FROM pg_database WHERE datname='documents_db'" | grep -q 1 || \
    psql postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}/${DB_USER} -c "CREATE DATABASE documents_db OWNER postgres;" 2>/dev/null || true
echo "    PostgreSQL databases: OK"

# Start Auth Service (port 8087)
echo "[3/5] Starting Auth Service on port 8087..."
AUTH_JAR="auth-service/target/auth-service-0.0.1-SNAPSHOT.jar"
java \
    -DAUTH_DB_HOST=${DB_HOST} \
    -DAUTH_DB_NAME=auth_db \
    -DAUTH_DB_USER=${DB_USER} \
    -DAUTH_DB_PASSWORD=${DB_PASS} \
    -DJWT_SECRET="ensia-dms-jwt-secret-key-for-lab-11-minimum-256-bits-long!!" \
    -jar ${AUTH_JAR} \
    --spring.datasource.url="jdbc:postgresql://${DB_HOST}:${DB_PORT}/auth_db?sslmode=disable" \
    --spring.datasource.username=${DB_USER} \
    --spring.datasource.password=${DB_PASS} \
    > /tmp/auth-service.log 2>&1 &
AUTH_PID=$!
echo "    Auth Service PID: ${AUTH_PID}"

# Start Documents Service (port 8084)
echo "[4/5] Starting Documents Service on port 8084..."
DOCS_JAR="documents-service/target/documents-service-0.0.1-SNAPSHOT.jar"
java \
    -DJWT_SECRET="ensia-dms-jwt-secret-key-for-lab-11-minimum-256-bits-long!!" \
    -jar ${DOCS_JAR} \
    --spring.datasource.url="jdbc:postgresql://${DB_HOST}:${DB_PORT}/documents_db?sslmode=disable" \
    --spring.datasource.username=${DB_USER} \
    --spring.datasource.password=${DB_PASS} \
    --spring.data.redis.host=localhost \
    --spring.data.redis.port=6379 \
    --minio.url=http://localhost:9000 \
    --minio.public-url=http://localhost:9000 \
    --minio.access-key=admin \
    --minio.secret-key=ensia123456 \
    > /tmp/documents-service.log 2>&1 &
DOCS_PID=$!
echo "    Documents Service PID: ${DOCS_PID}"

# Start Gateway Service on port 5000 (frontend-facing port)
echo "[5/5] Starting Gateway Service on port 5000..."
GW_JAR="gateway-service/target/gateway-service-0.0.1-SNAPSHOT.jar"
java \
    -jar ${GW_JAR} \
    --server.port=5000 \
    --DOCUMENTS_SERVICE_URL=http://localhost:8084 \
    --COMMENTS_SERVICE_URL=http://localhost:8086 \
    --AUTH_SERVICE_URL=http://localhost:8087 \
    > /tmp/gateway-service.log 2>&1 &
GW_PID=$!
echo "    Gateway Service PID: ${GW_PID}"

echo ""
echo "=== All services starting... ==="
echo "  Gateway  : http://localhost:5000"
echo "  Auth     : http://localhost:8087"
echo "  Documents: http://localhost:8084"
echo ""
echo "Logs:"
echo "  Gateway  : /tmp/gateway-service.log"
echo "  Auth     : /tmp/auth-service.log"
echo "  Documents: /tmp/documents-service.log"
echo ""

# Wait for gateway to keep the process alive
wait ${GW_PID}
