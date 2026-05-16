#!/bin/bash

echo "======================================"
echo "Cleaning up Docker Minio Kubernetes"
echo "======================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

read -p "Are you sure you want to delete all resources in docker-minio namespace? (yes/no): " -r
echo
if [[ $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo -e "${YELLOW}Deleting namespace docker-minio...${NC}"
    kubectl delete namespace docker-minio
    echo -e "${GREEN}✓ Namespace deleted${NC}"
    echo ""
    echo "Waiting for namespace deletion..."
    kubectl wait --for=delete namespace/docker-minio --timeout=300s 2>/dev/null || true
    echo -e "${GREEN}✓ Cleanup complete${NC}"
else
    echo -e "${RED}Cleanup cancelled${NC}"
fi
