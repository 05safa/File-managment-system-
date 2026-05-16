@echo off
REM Windows PowerShell deployment script for Kubernetes
REM This script builds Docker images and deploys to Kubernetes cluster

echo ======================================
echo Docker Minio - Kubernetes Deployment
echo ======================================
echo.

REM Build Docker images
echo Building Docker images...
docker build -t docker-minio-documents:latest "..\documents-service"
if %errorlevel% neq 0 exit /b %errorlevel%

docker build -t docker-minio-comments:latest "..\comments-service"
if %errorlevel% neq 0 exit /b %errorlevel%

docker build -t docker-minio-gateway:latest "..\gateway-service"
if %errorlevel% neq 0 exit /b %errorlevel%

echo.
echo Creating namespace...
kubectl apply -f 00-namespace.yaml

echo.
echo Deploying PostgreSQL instances...
kubectl apply -f 01-postgres-documents.yaml
kubectl apply -f 02-postgres-comments.yaml

echo.
echo Deploying MinIO...
kubectl apply -f 03-minio.yaml

echo.
echo Waiting for databases to be ready...
kubectl wait --for=condition=ready pod -l app=postgres-documents -n docker-minio --timeout=300s
kubectl wait --for=condition=ready pod -l app=postgres-comments -n docker-minio --timeout=300s

echo.
echo Deploying microservices...
kubectl apply -f 04-documents-service.yaml
kubectl apply -f 05-comments-service.yaml
kubectl apply -f 06-gateway-service.yaml

echo.
echo Deployment status:
echo.
echo Pods:
kubectl get pods -n docker-minio
echo.
echo Services:
kubectl get svc -n docker-minio
echo.
echo ======================================
echo Deployment Complete!
echo ======================================
echo.
echo To access the gateway:
echo   kubectl port-forward -n docker-minio svc/gateway-service 8085:8085
echo   Then visit: http://localhost:8085/api/documents/list
echo.
echo To access MinIO console:
echo   kubectl port-forward -n docker-minio svc/minio 9001:9001
echo   Then visit: http://localhost:9001 (admin/ensia123456)
echo.

