#!/bin/bash
set -e

echo "======================================"
echo "Docker Minio - Kubernetes Deployment"
echo "======================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Build Docker images
echo -e "${YELLOW}Step 1: Building Docker images...${NC}"
docker build -t docker-minio-documents:latest ../documents-service
docker build -t docker-minio-comments:latest ../comments-service
docker build -t docker-minio-gateway:latest ../gateway-service
echo -e "${GREEN}✓ Docker images built${NC}"
echo ""

# 2. Check for minikube
if command -v minikube &> /dev/null; then
    echo -e "${YELLOW}Step 2: Loading images into minikube...${NC}"
    eval $(minikube docker-env)
    minikube image load docker-minio-d:latest
    minikube image load docker-minio-m:latest
    minikube image load docker-minio-gateway:latest
    echo -e "${GREEN}✓ Images loaded into minikube${NC}"
    echo ""
fi

# 3. Create namespace
echo -e "${YELLOW}Step 3: Creating namespace...${NC}"
kubectl apply -f 00-namespace.yaml
echo -e "${GREEN}✓ Namespace created${NC}"
echo ""

# 4. Deploy PostgreSQL instances
echo -e "${YELLOW}Step 4: Deploying PostgreSQL instances...${NC}"
kubectl apply -f 01-postgres-documents.yaml
kubectl apply -f 02-postgres-comments.yaml
echo -e "${GREEN}✓ PostgreSQL instances deployed${NC}"
echo ""

# 5. Deploy MinIO
echo -e "${YELLOW}Step 5: Deploying MinIO...${NC}"
kubectl apply -f 03-minio.yaml
echo -e "${GREEN}✓ MinIO deployed${NC}"
echo ""

# 6. Wait for databases
echo -e "${YELLOW}Step 6: Waiting for PostgreSQL to be ready...${NC}"
kubectl wait --for=condition=ready pod -l app=postgres-documents -n docker-minio --timeout=300s || true
kubectl wait --for=condition=ready pod -l app=postgres-comments -n docker-minio --timeout=300s || true
echo -e "${GREEN}✓ PostgreSQL ready${NC}"
echo ""

# 7. Deploy services
echo -e "${YELLOW}Step 7: Deploying microservices...${NC}"
kubectl apply -f 04-documents-service.yaml
kubectl apply -f 05-comments-service.yaml
echo -e "${GREEN}✓ Microservices deployed${NC}"
echo ""

# 8. Deploy Gateway
echo -e "${YELLOW}Step 8: Deploying Gateway...${NC}"
kubectl apply -f 06-gateway-service.yaml
echo -e "${GREEN}✓ Gateway deployed${NC}"
echo ""

# 9. Show status
echo -e "${YELLOW}Step 9: Checking deployment status...${NC}"
echo ""
echo "Pods:"
kubectl get pods -n docker-minio
echo ""
echo "Services:"
kubectl get svc -n docker-minio
echo ""

echo -e "${GREEN}======================================"
echo "Deployment Complete!"
echo "=====================================${NC}"
echo ""
echo "To access the gateway:"
echo "  kubectl port-forward -n docker-minio svc/gateway-service 8085:8085"
echo ""
echo "Then visit: http://localhost:8085/api/documents/list"
echo ""
echo "To access MinIO console:"
echo "  kubectl port-forward -n docker-minio svc/minio 9001:9001"
echo "  Then visit: http://localhost:9001 (admin/ensia123456)"
echo ""
echo "To view logs:"
echo "  kubectl logs -n docker-minio -l app=documents-service -f"
echo "  kubectl logs -n docker-minio -l app=comments-service -f"
echo ""

