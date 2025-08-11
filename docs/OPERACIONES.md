# Guía de Operaciones (DevOps)

## Requisitos de Infraestructura

### Entorno de Producción
- **Servidores**: 
  - 2 instancias EC2 (t3.medium)
  - Load Balancer AWS
- **Base de Datos**: 
  - SQL Server Standard (4 vCPU, 16GB RAM)
- **Storage**: 
  - 100GB EBS para aplicaciones
  - 500GB EBS para base de datos

## Configuración de Entornos

| Parámetro       | Desarrollo  | Producción |
|-----------------|-------------|------------|
| API URL         | http://dev-api | https://api.morelos.gob.mx |
| Base de Datos   | SQL Express | SQL Cluster |
| Autenticación   | Mock        | Azure AD   |
| Logging         | Console     | ELK Stack  |

## Scripts de Despliegue

### Docker Compose (Desarrollo)
```yaml
version: '3'
services:
  web:
    build: .
    ports:
      - "4200:4200"
    volumes:
      - ./src:/app/src
  api:
    image: node:16
    ports:
      - "3000:3000"
```

### Despliegue en Producción
```bash
#!/bin/bash
# deploy.sh

# Build Docker image
docker build -t cobro-web:latest .

# Push to ECR
aws ecr get-login-password | docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com
docker tag cobro-web:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/cobro-web:latest
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/cobro-web:latest

# Update ECS service
aws ecs update-service --cluster cobro-cluster --service cobro-service --force-new-deployment
```

## Variables de Entorno

`.env.prod` ejemplo:
```ini
API_URL=https://api.morelos.gob.mx
DB_HOST=sql-prod.morelos.gob.mx
DB_USER=app_user
DB_PASSWORD=*****
JWT_SECRET=*****
```

## Monitoreo

- **CloudWatch**: Métricas de rendimiento
- **New Relic**: APM para frontend/backend
- **Pingdom**: Monitoreo de disponibilidad

## Backup Strategy

```mermaid
gantt
    title Plan de Backups
    dateFormat  YYYY-MM-DD
    section Base de Datos
    Backup Diario   :active, db1, 2025-07-25, 1d
    section Archivos
    Backup Semanal  :crit, files, 2025-07-28, 7d
