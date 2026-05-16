# Kubernetes Deployment Guide

This directory contains all Kubernetes manifests for deploying the Docker Minio microservices architecture.

## Prerequisites

- Kubernetes cluster (local minikube or cloud cluster)
- Docker installed
- kubectl installed
- PersistentVolume provisioner configured

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    kubernetes cluster               │
│  (docker-minio namespace)                           │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │ Gateway Service (LoadBalancer)               │  │
│  │ Replicas: 1                                  │  │
│  └──────────────────────────────────────────────┘  │
│            ↓                      ↓                 │
│  ┌──────────────────┐  ┌──────────────────┐       │
│  │ Documents Svc    │  │ Comments Svc     │       │
│  │ Replicas: 2      │  │ Replicas: 2      │       │
│  └──────────────────┘  └──────────────────┘       │
│            ↓                      ↓                 │
│  ┌──────────────────┐  ┌──────────────────┐       │
│  │ Postgres Docs    │  │ Postgres Cmts    │       │
│  │ PVC: 10Gi        │  │ PVC: 10Gi        │       │
│  └──────────────────┘  └──────────────────┘       │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │ MinIO (LoadBalancer)                         │  │
│  │ PVC: 50Gi                                    │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Files

- `00-namespace.yaml` - Creates the docker-minio namespace
- `01-postgres-documents.yaml` - PostgreSQL for Documents service
- `02-postgres-comments.yaml` - PostgreSQL for Comments service
- `03-minio.yaml` - MinIO S3 storage
- `04-documents-service.yaml` - Documents microservice (2 replicas)
- `05-comments-service.yaml` - Comments microservice (2 replicas)
- `06-gateway-service.yaml` - API Gateway
- `deploy.sh` - Automated deployment script

## Quick Start (Automated)

### On Linux/Mac:
```bash
chmod +x deploy.sh
./deploy.sh
```

### On Windows (PowerShell):
```powershell
# Build images
docker build -t docker-minio-documents:latest ../documents-service
docker build -t docker-minio-comments:latest ../comments-service
docker build -t docker-minio-gateway:latest ../gateway-service

# Apply manifests
kubectl apply -f 00-namespace.yaml
kubectl apply -f 01-postgres-documents.yaml
kubectl apply -f 02-postgres-comments.yaml
kubectl apply -f 03-minio.yaml
kubectl apply -f 04-documents-service.yaml
kubectl apply -f 05-comments-service.yaml
kubectl apply -f 06-gateway-service.yaml

# Check status
kubectl get pods -n docker-minio
kubectl get svc -n docker-minio
```

## Manual Deployment

### Step 1: Build Docker Images
```bash
cd ..
docker build -t docker-minio-documents:latest ./documents-service
docker build -t docker-minio-comments:latest ./comments-service
docker build -t docker-minio-gateway:latest ./gateway-service
cd k8s
```

### Step 2: Load into Minikube (if using minikube)
```bash
eval $(minikube docker-env)
minikube image load docker-minio-d:latest
minikube image load docker-minio-m:latest
minikube image load docker-minio-gateway:latest
```

### Step 3: Apply Manifests in Order
```bash
kubectl apply -f 00-namespace.yaml           # Create namespace
kubectl apply -f 01-postgres-documents.yaml  # Documents DB
kubectl apply -f 02-postgres-comments.yaml   # Comments DB
kubectl apply -f 03-minio.yaml               # MinIO storage
kubectl apply -f 04-documents-service.yaml   # Documents service
kubectl apply -f 05-comments-service.yaml    # Comments service
kubectl apply -f 06-gateway-service.yaml     # API Gateway
```

### Step 4: Verify Deployment
```bash
kubectl get pods -n docker-minio
kubectl get svc -n docker-minio
kubectl get pvc -n docker-minio
```

## Accessing Services

### Gateway Service (External)
```bash
# Using port-forward
kubectl port-forward -n docker-minio svc/gateway-service 8085:8085

# Or for minikube
minikube service gateway-service -n docker-minio

# Then access: http://localhost:8085/api/documents/list
```

### MinIO Console (External)
```bash
# Using port-forward
kubectl port-forward -n docker-minio svc/minio 9001:9001

# Then access: http://localhost:9001
# Credentials: admin / ensia123456
```

### MinIO API (Internal)
```bash
# Only accessible from within the cluster
# URL: http://minio:9000
```

### Documents Service (Internal)
```bash
# Direct access from pod (for debugging)
kubectl run -it --rm debug --image=curlimages/curl --restart=Never -n docker-minio -- \
  curl http://documents-service:8084/api/documents/list
```

### Comments Service (Internal)
```bash
# Direct access from pod (for debugging)
kubectl run -it --rm debug --image=curlimages/curl --restart=Never -n docker-minio -- \
  curl http://comments-service:8086/api/comments/list
```

## Monitoring & Logs

### View Logs
```bash
# All pods
kubectl logs -n docker-minio -f --all-containers=true

# Specific service
kubectl logs -n docker-minio -l app=documents-service -f
kubectl logs -n docker-minio -l app=comments-service -f
kubectl logs -n docker-minio -l app=gateway-service -f

# Specific pod
kubectl logs -n docker-minio <pod-name> -f
```

### Check Pod Status
```bash
kubectl describe pod -n docker-minio <pod-name>
```

### Port Forward to Debug
```bash
# Documents service
kubectl port-forward -n docker-minio svc/documents-service 8084:8084

# Comments service
kubectl port-forward -n docker-minio svc/comments-service 8086:8086
```

## Database Access

### Connect to Documents Database
```bash
kubectl run -it --rm postgresql-client --image=postgres:16-alpine --restart=Never \
  -n docker-minio -- \
  psql -h postgres-documents -U docuser -d documents_db
```

### Connect to Comments Database
```bash
kubectl run -it --rm postgresql-client --image=postgres:16-alpine --restart=Never \
  -n docker-minio -- \
  psql -h postgres-comments -U commentuser -d comments_db
```

## Resource Limits

Each service has resource requests and limits:

| Service | Memory Request | Memory Limit | CPU Request | CPU Limit |
|---------|---|---|---|---|
| PostgreSQL | 256Mi | 512Mi | 100m | 500m |
| Documents | 512Mi | 1Gi | 250m | 500m |
| Comments | 512Mi | 1Gi | 250m | 500m |
| Gateway | 256Mi | 512Mi | 100m | 250m |
| MinIO | 512Mi | 1Gi | 250m | 500m |

## Persistence

- **Documents DB**: `postgres_documents_pvc` (10Gi)
- **Comments DB**: `postgres_comments_pvc` (10Gi)
- **MinIO**: `minio_pvc` (50Gi)

All PersistentVolumeClaims use `ReadWriteOnce` access mode.

## Cleanup

### Remove Specific Service
```bash
kubectl delete deployment documents-service -n docker-minio
```

### Remove Everything
```bash
kubectl delete namespace docker-minio
```

## Scaling

### Scale up Documents Service
```bash
kubectl scale deployment documents-service -n docker-minio --replicas=3
```

### Scale Comments Service
```bash
kubectl scale deployment comments-service -n docker-minio --replicas=3
```

## Updating Images

After rebuilding Docker images, force pod restart:

```bash
kubectl rollout restart deployment/documents-service -n docker-minio
kubectl rollout restart deployment/comments-service -n docker-minio
kubectl rollout restart deployment/gateway-service -n docker-minio
```

## Troubleshooting

### Pods not starting
```bash
kubectl describe pod -n docker-minio <pod-name>
kubectl logs -n docker-minio <pod-name>
```

### Database connection issues
- Ensure postgres pods are running: `kubectl get pods -n docker-minio -l app=postgres-documents`
- Check service DNS: `kubectl get svc -n docker-minio`

### Service not accessible
- Check LoadBalancer IP: `kubectl get svc -n docker-minio`
- Use port-forward for testing: `kubectl port-forward svc/gateway-service 8085:8085`

### Storage issues
```bash
kubectl get pvc -n docker-minio
kubectl describe pvc -n docker-minio <pvc-name>
```

## Production Considerations

For production deployment:

1. **Use managed databases** instead of in-cluster PostgreSQL
2. **Configure auto-scaling** with HPA (Horizontal Pod Autoscaler)
3. **Add ingress controller** for better routing
4. **Use ConfigMaps** for non-sensitive configuration
5. **Implement NetworkPolicies** for security
6. **Add resource quotas** per namespace
7. **Use health checks** appropriately
8. **Implement logging aggregation** (ELK, Loki, etc.)
9. **Add monitoring** (Prometheus, Grafana)
10. **Use Helm** for templating and package management

## Next Steps

1. Test the deployed services
2. Configure ingress for production access
3. Set up CI/CD pipeline for deployments
4. Implement monitoring and logging
5. Create Helm charts for better management

