# Documentación de Diseño Técnico

## Diagrama de Arquitectura

```mermaid
graph TD
    A[Frontend Angular] --> B[API REST]
    B --> C[Base de Datos]
    B --> D[SAP]
    B --> E[WS Vehículos]
    B --> F[Facturación CFDI]
    A --> G[Auth Service]
```

## Patrones de Diseño Implementados

### Frontend
- **Componentes Reutilizables**: Tablas, modales, formularios
- **State Management**: Servicios RxJS para estado compartido
- **Lazy Loading**: Carga bajo demanda de módulos

### Backend
- **CQRS**: Separación consultas/comandos
- **Repository**: Acceso a datos
- **Strategy**: Para diferentes métodos de pago

## Modelo de Datos

```mermaid
erDiagram
    VEHICULO ||--o{ PAGO : tiene
    VEHICULO {
        string placa PK
        string marca
        number modelo
        string propietario
    }
    PAGO {
        string folio PK
        date fecha
        number total
        string estado
    }
    CONCEPTO {
        string codigo PK
        string descripcion
        number importe
    }
    PAGO ||--|{ CONCEPTO : incluye
```

## Tecnologías Clave

| Área          | Tecnologías                     |
|---------------|---------------------------------|
| Frontend      | Angular 15, Material UI, RxJS   |
| Backend       | Node.js, Express, TypeORM       |
| Base de Datos | SQL Server                      |
| Integraciones | SOAP, REST, SAP RFC             |
| DevOps        | Docker, Jenkins, Nginx          |
