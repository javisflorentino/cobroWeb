# Arquitectura del Sistema cobroWeb

## Estructura de Directorios Detallada

```
cobroWeb/
├── src/
│   ├── app/
│   │   ├── portal-hacienda/       # Módulo principal de Hacienda
│   │   │   ├── components/        # Componentes compartidos
│   │   │   ├── pages/             # Páginas principales
│   │   │   ├── services/          # Servicios de negocio
│   │   │   └── interface/         # Interfaces de datos
│   │   ├── shared/                # Módulo compartido
│   │   │   ├── components/        # Componentes reutilizables
│   │   │   ├── services/          # Servicios compartidos
│   │   │   └── interfaces/        # Interfaces compartidas
│   │   └── app.module.ts          # Módulo raíz
│   ├── assets/                    # Recursos estáticos
│   └── environments/              # Configuración por entorno
├── data/                          # Datos JSON de configuración
└── docs/                          # Documentación
```

## Diagrama de Módulos Principales

