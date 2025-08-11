# Interfaces de Datos Principales

## Estructuras para Refrendo Vehicular

### VehicleData
```typescript
interface VehicleData {
  placa: string;
  marca: string;
  modelo: number;
  propietario: string;
  rfcPropietario: string;
  estado: 'VIGENTE'|'BAJA'|'ROBADO';
  ultimoPago?: Date;
}
```

### RefrendoRequest
```typescript
interface RefrendoRequest {
  placa: string;
  tipoVehiculo: string; // 'AUTOMOVIL'|'CAMIONETA'|'MOTOCICLETA'
  modelo: number;
  uso: 'PARTICULAR'|'PUBLICO'|'SERVICIO';
}
```

### CalculoConcepto
```typescript
interface CalculoConcepto {
  concepto: string;
  codigo: string;
  importe: number;
  recargos: number;
  descuentos?: number;
  total: number;
  ejercicio: number;
}
```

## Estructuras para Pagos

### PagoRequest
```typescript
interface PagoRequest {
  folio: string;
  conceptos: CalculoConcepto[];
  total: number;
  metodoPago: 'TARJETA'|'TRANSFERENCIA'|'EFECTIVO';
  datosTarjeta?: {
    numero: string;
    nombre: string;
    expiracion: string;
    cvv: string;
  };
}
```

### Comprobante
```typescript
interface Comprobante {
  pdf: string; // Base64
  xml: string; // Base64 para CFDI
  folioFiscal: string;
  fechaEmision: Date;
  qrCode: string;
}
```

## Catálogos y Configuraciones

### Catalogo
```typescript
interface Catalogo {
  codigo: string;
  descripcion: string;
  valor?: string;
  activo: boolean;
}
```

### OficinaTramite
```typescript
interface OficinaTramite {
  id: number;
  nombre: string;
  direccion: string;
  horario: string;
  municipio: string;
  servicios: string[];
}
