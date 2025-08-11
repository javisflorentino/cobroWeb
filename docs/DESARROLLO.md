# Guía de Desarrollo

## Estándares de Codificación

### TypeScript/Angular
```typescript
// Nombrado de componentes: PascalCase + sufijo Component
// Ejemplo: PagoRefrendoComponent

// Servicios: PascalCase + sufijo Service
// Ejemplo: SmytService

// Interfaces: PascalCase + prefijo I (opcional)
// Ejemplo: IVehicleData

// Variables y métodos: camelCase
const placaVehicular = 'ABC-1234';

function calcularImporte() {
  // ...
}
```

### Estructura de Componentes
```
componente/
├── componente.component.ts    # Lógica
├── componente.component.html  # Template 
├── componente.component.scss  # Estilos
├── componente.spec.ts         # Pruebas
└── componente.interface.ts    # Tipos
```

## Ejemplo de Código Comentado

```typescript
/**
 * Servicio para gestión de pagos de refrendo
 */
@Injectable({
  providedIn: 'root'
})
export class SmytService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Valida los datos de un vehículo
   * @param placa - Formato XXX-0000
   * @returns Observable con datos del vehículo
   */
  validarVehiculo(placa: string): Observable<IVehicleData> {
    // Validar formato de placa
    if (!this.validarFormatoPlaca(placa)) {
      throw new Error('Formato de placa inválido');
    }

    return this.http.get<IVehicleData>(
      `${this.apiUrl}/vehiculos/${placa}`
    ).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    // Lógica de manejo de errores
  }
}
```

## Convenciones de Commits

| Prefijo    | Descripción                |
|------------|----------------------------|
| feat:      | Nueva funcionalidad        |
| fix:       | Corrección de bug          |
| docs:      | Cambios en documentación   |
| refactor:  | Mejoras de código          |
| test:      | Pruebas                    |

Ejemplo:
```
git commit -m "feat: agregar validación de placas internacionales"
```

## Pruebas Unitarias

Estructura básica de spec:
```typescript
describe('SmytService', () => {
  let service: SmytService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(SmytService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('debe validar placa correctamente', () => {
    const mockResponse: IVehicleData = { /* ... */ };
    
    service.validarVehiculo('ABC-1234').subscribe(data => {
      expect(data).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/vehiculos/ABC-1234`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });
});
