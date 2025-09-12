# Beauty Control API - Endpoints Actualizados

## Nuevos Endpoints Agregados

### 💳 Pagos de Negocios
Gestión de pagos de suscripciones desde el lado del negocio

```bash
# Verificar estado de suscripción
GET /api/business/payments/subscription-status
Headers: Authorization: Bearer {token}

# Subir comprobante de pago
POST /api/business/payments/upload-receipt
Headers: Authorization: Bearer {token}
Body: multipart/form-data
- receipt: file (imagen)
- planId: number
- amount: number
- description: string

# Historial de pagos
GET /api/business/payments/history?page=1&limit=10
Headers: Authorization: Bearer {token}
```

### 🏦 Pagos Wompi
Integración con gateway de pagos Wompi

```bash
# Iniciar pago con Wompi
POST /api/wompi/initiate-subscription-payment
Headers: Authorization: Bearer {token}
Body: { "planId": 1 }

# Webhook de Wompi (automático)
POST /api/wompi/webhook
Headers: X-Signature: {signature}
Body: {wompi_webhook_data}

# Consultar estado de pago
GET /api/wompi/payment-status/{reference}
Headers: Authorization: Bearer {token}

# Obtener configuración Wompi
GET /api/wompi/config
Headers: Authorization: Bearer {token}
```

### 👑 Dashboard Owner
Dashboard y métricas para administradores

```bash
# Resumen del dashboard
GET /api/owner/dashboard/summary
Headers: Authorization: Bearer {token}

# Métricas principales
GET /api/owner/dashboard/metrics?period=thisMonth
Headers: Authorization: Bearer {token}
# period: thisMonth, lastMonth, last3Months, lastYear

# Gráfico de ingresos
GET /api/owner/dashboard/revenue-chart?months=6
Headers: Authorization: Bearer {token}
# months: 1-24

# Distribución de planes
GET /api/owner/dashboard/plan-distribution
Headers: Authorization: Bearer {token}

# Top negocios activos
GET /api/owner/dashboard/top-businesses?limit=10
Headers: Authorization: Bearer {token}
# limit: máximo 50

# Estadísticas de crecimiento
GET /api/owner/dashboard/growth-stats?period=thisMonth
Headers: Authorization: Bearer {token}

# Exportar datos
GET /api/owner/dashboard/export?format=json&period=thisMonth
Headers: Authorization: Bearer {token}
# format: json, csv
```

### ⚙️ Sistema
Endpoints de sistema y monitoreo

```bash
# Test sistema de suscripciones
GET /api/test/subscription-system

# Health check
GET /health
```

## Variables de Entorno Nuevas

Agregar al archivo `.env`:

```bash
# Wompi Configuration
WOMPI_PUBLIC_KEY=your_wompi_public_key
WOMPI_PRIVATE_KEY=your_wompi_private_key
WOMPI_ENVIRONMENT=sandbox
WOMPI_EVENT_SECRET=your_wompi_event_secret_for_webhooks
WOMPI_API_URL=https://sandbox.wompi.co
```

## Dependencias Nuevas

Se agregó `axios` para integración con Wompi:
```bash
npm install axios
```

## Estructura de Respuestas

### Dashboard Summary
```json
{
  "success": true,
  "data": {
    "widgets": [
      {
        "title": "Ingresos Totales",
        "value": 250000,
        "format": "currency",
        "icon": "dollar"
      },
      {
        "title": "Suscripciones Activas", 
        "value": 15,
        "format": "number",
        "icon": "subscription"
      }
    ]
  }
}
```

### Dashboard Metrics
```json
{
  "success": true,
  "data": {
    "revenue": {
      "total": 500000,
      "thisMonth": 85000,
      "trend": 12.5
    },
    "subscriptions": {
      "active": 15,
      "byStatus": {
        "ACTIVE": 15,
        "TRIAL": 3,
        "EXPIRED": 2
      },
      "conversionRate": 75.5
    },
    "businesses": {
      "total": 20,
      "newThisMonth": 5,
      "growthRate": 33.3
    }
  }
}
```

### Wompi Payment Response
```json
{
  "success": true,
  "data": {
    "paymentReference": "REF_SUB_20240912_001",
    "amount": 50000,
    "publicKey": "pub_test_...",
    "redirectUrl": "https://checkout.wompi.co/...",
    "planName": "Plan Básico"
  }
}
```