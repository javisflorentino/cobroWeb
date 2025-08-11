# Documentación de API

## Autenticación

```http
POST /auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "*****"
}

Response:
{
  "token": "eyJhbGci...",
  "expiresIn": 3600
}
```

## Endpoints Principales

### Vehículos

```http
GET /api/vehiculos/{placa}
Headers:
  Authorization: Bearer {token}

Response:
{
  "placa": "ABC-1234",
  "marca": "Nissan",
  "modelo": 2020,
  "estado": "VIGENTE",
  "adeudos": [
    {
      "concepto": "Refrendo",
      "importe": 1500.00
    }
  ]
}
```

### Pagos

```http
POST /api/pagos
Headers:
  Authorization: Bearer {token}
Content-Type: application/json

{
  "placa": "ABC-1234",
  "conceptos": [
    {
      "codigo": "REF-2024",
      "importe": 1500.00
    }
  ],
  "metodoPago": "TARJETA"
}

Response:
{
  "folio": "PAY-123456",
  "estado": "PROCESANDO",
  "fecha": "2025-07-25T11:15:00Z"
}
```

## Códigos de Error

| Código | Descripción               |
|--------|---------------------------|
| 400    | Bad Request               |
| 401    | No autorizado             |
| 403    | Prohibido                 |
| 404    | No encontrado             |
| 500    | Error interno del servidor|

## Rate Limiting

- 100 requests/minuto por IP
- 10 requests/segundo por usuario autenticado

## Ejemplo Curl

```bash
curl -X GET \
  https://api.morelos.gob.mx/api/vehiculos/ABC-1234 \
  -H 'Authorization: Bearer eyJhbGci...'
