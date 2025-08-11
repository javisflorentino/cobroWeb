# Servicios Principales del Sistema

## SmytService
**Ruta:** `src/app/portal-hacienda/services/smyt.service.ts`

### Responsabilidad
Gestiona las operaciones relacionadas con el pago de refrendo vehicular (SMYT)

### Métodos Clave
```typescript
validarVehiculo(placa: string): Observable<VehicleData>
  /**
   * Valida los datos de un vehículo mediante WebService
   * @param placa - Placa del vehículo (formato: XXX-0000)
   * @returns Observable con datos del vehículo
   * @throws Error si la placa es inválida o el vehículo no existe
   */

calcularRefrendo(datos: RefrendoRequest): Observable<CalculoConcepto[]>
  /**
   * Calcula los conceptos e importes para refrendo
   * @param datos - Objeto con:
   *   - placa: string
   *   - tipoVehiculo: string
   *   - modelo: number
   * @returns Array de conceptos calculados
   */

generarComprobante(pago: PagoRequest): Observable<Comprobante>
  /**
   * Genera comprobante de pago en PDF
   * @param pago - Datos del pago:
   *   - folio: string
   *   - conceptos: CalculoConcepto[]
   *   - total: number
   * @returns Comprobante en formato PDF
   */
```

### Dependencias
- `HttpClient` - Para consumo de APIs REST
- `ToastrService` - Notificaciones al usuario
- Interfaces:
  - `VehicleData`: { placa, marca, modelo, propietario }
  - `RefrendoRequest`: { placa, tipoVehiculo, modelo }
  - `CalculoConcepto`: { concepto, importe, recargos }

### Ejemplo de Uso
```typescript
this.smytService.validarVehiculo('ABC-1234')
  .pipe(
    catchError(err => {
      this.toastr.error('Error al validar vehículo');
      return throwError(err);
    })
  )
  .subscribe(data => {
    this.vehiculo = data;
  });
```

---

## GeneralesService
**Ruta:** `src/app/portal-hacienda/services/generales.service.ts`

### Funcionalidades Principales
- Obtener catálogos (municipios, tipos de vehículo)
- Consultar información de contribuyentes
- Validar datos de trámites

### Métodos Importantes
```typescript
getCatalogos(tipo: string): Observable<Catalogo[]>
getContribuyente(rfc: string): Observable<Contribuyente>
```

---

## IngresosService
**Ruta:** `src/app/portal-hacienda/services/ingresos.service.ts`

### Responsabilidad
Gestiona el proceso completo de pagos e ingresos

### Métodos Principales
```typescript
registrarPago(pago: Pago): Observable<FolioPago>
  /**
   * Registra un pago en el sistema contable
   * @returns Folio único del pago
   */

generarFactura(folio: string): Observable<Factura>
  /**
   * Genera factura electrónica (CFDI)
   */

procesarPagoBancario(pago: PagoBancario): Observable<RespuestaBanco>
```

### Flujo Completo
1. Validación de datos (SmytService)
2. Cálculo de conceptos (SmytService)
3. Generación de folio (UUID)
4. Registro contable (SAP)
5. Emisión de CFDI (Facturación)
6. Confirmación bancaria (Pago en línea)
7. Generación de comprobante (PDF)

### Configuraciones API
```json
{
  "endpoints": {
    "facturacion": "https://api.facturacion.morelos.gob.mx",
    "contabilidad": "https://sap.morelos.gob.mx/api",
    "bancos": {
      "banorte": "https://pagos.banorte.com/api",
      "banamex": "https://gateway.banamex.com/v1"
    }
  }
}
```

### Seguridad
- Autenticación mediante JWT
- Roles requeridos:
  - `pagos:write` para registrar pagos
  - `facturacion:emitir` para generar CFDI
