# Especificación de Requisitos Software (SRS)

## 1. Introducción
Sistema de cobro en línea para el Gobierno de Morelos que permite:
- Pago de refrendo vehicular (SMYT)
- Trámites de Hacienda
- Facturación electrónica
- Integración con sistemas contables

## 2. Requisitos Funcionales

### 2.1 Gestión de Vehículos
- RF001: Validar placa vehicular (formato XXX-0000)
- RF002: Consultar historial de pagos
- RF003: Calcular importes de refrendo

### 2.2 Proceso de Pago
- RF004: Generar folio único de pago
- RF005: Registrar pago en sistema contable
- RF006: Emitir CFDI
- RF007: Generar comprobante PDF

### 2.3 Catálogos
- RF008: Mantener catálogos de:
  - Tipos de vehículo
  - Municipios  
  - Oficinas receptoras

## 3. Requisitos No Funcionales

### 3.1 Seguridad
- RNF001: Autenticación con JWT
- RNF002: Roles de usuario (ciudadano, administrador)
- RNF003: Encriptación de datos sensibles

### 3.2 Rendimiento  
- RNF004: Tiempo respuesta < 2s (90% peticiones)
- RNF005: Soporte 100 usuarios concurrentes

### 3.3 Compatibilidad
- RNF006: Navegadores soportados: Chrome, Edge, Firefox
- RNF007: Mobile responsive

## 4. Casos de Uso

### UC01: Pago de Refrendo
1. Usuario ingresa placa
2. Sistema valida y muestra datos
3. Usuario confirma y selecciona pago
4. Sistema calcula importes
5. Usuario completa pago
6. Sistema emite comprobante

### UC02: Consulta Histórico
1. Usuario ingresa RFC
2. Sistema muestra trámites/pagos
3. Usuario puede filtrar por fecha/tipo

## 5. Historias de Usuario

```markdown
### HU001: Como ciudadano quiero pagar refrendo para mantener mi vehículo regular
**Criterios aceptación:**
- Validar placa correctamente
- Mostrar importes calculados
- Permitir pago con tarjeta/transferencia
- Generar comprobante descargable

### HU002: Como administrador quiero actualizar catálogos para mantener información actualizada
**Criterios aceptación:**
- Interfaz CRUD para catálogos  
- Validación de datos ingresados
- Registro de cambios
