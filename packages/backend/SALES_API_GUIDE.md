# API de Ventas - Guía de Uso

## 📋 Resumen

El sistema de ventas permite registrar ventas directas de productos y el consumo de insumos en procedimientos. Incluye:

- ✅ Ventas directas de productos
- ✅ Control de stock por sucursal o global
- ✅ Múltiples métodos de pago
- ✅ Descuentos e impuestos automáticos
- ✅ Cálculo automático de ganancia
- ✅ Registro de consumo en procedimientos
- ✅ Cancelaciones y devoluciones con reversión de stock
- ✅ Integración con turnos de caja

---

## 🛒 Endpoints de Ventas

### 1. Crear Venta

**POST** `/api/sales`

Crea una nueva venta con uno o más productos. Valida stock, calcula totales automáticamente y genera movimientos de inventario.

#### Request Body:

```json
{
  "branchId": "uuid-sucursal", // Opcional - para stock por sucursal
  "clientId": "uuid-cliente", // Opcional
  "shiftId": "uuid-turno", // Opcional - si está en turno activo
  "items": [
    {
      "productId": "uuid-producto-1",
      "quantity": 2,
      "discountType": "PERCENTAGE", // PERCENTAGE | FIXED | NONE
      "discountValue": 10 // 10%
    },
    {
      "productId": "uuid-producto-2",
      "quantity": 1
    }
  ],
  "discount": 5000, // Descuento general en la venta (opcional)
  "discountType": "FIXED", // Tipo de descuento general
  "discountValue": 5000,
  "taxPercentage": 19, // IVA o impuesto aplicable (por defecto 0)
  "paymentMethod": "CASH", // CASH | CARD | TRANSFER | MIXED | OTHER
  "paymentDetails": {
    "cardNumber": "****1234",
    "transactionId": "ABC123"
  },
  "paidAmount": 200000, // Monto pagado
  "notes": "Cliente preferencial"
}
```

#### Response (201):

```json
{
  "success": true,
  "message": "Venta registrada exitosamente",
  "data": {
    "id": "uuid-venta",
    "saleNumber": "VENTA-1736730000000-ABC123XYZ",
    "businessId": "uuid-negocio",
    "branchId": "uuid-sucursal",
    "userId": "uuid-usuario",
    "clientId": "uuid-cliente",
    "subtotal": 150000,
    "discount": 15000,
    "discountType": "PERCENTAGE",
    "discountValue": 10,
    "tax": 25650,
    "taxPercentage": 19,
    "total": 160650,
    "paymentMethod": "CASH",
    "paidAmount": 200000,
    "changeAmount": 39350,
    "status": "COMPLETED",
    "items": [
      {
        "id": "uuid-item-1",
        "productId": "uuid-producto-1",
        "quantity": 2,
        "unitPrice": 50000,
        "unitCost": 30000,
        "subtotal": 100000,
        "discount": 10000,
        "tax": 17100,
        "total": 107100,
        "profit": 30000,
        "product": {
          "id": "uuid-producto-1",
          "name": "Shampoo Premium",
          "sku": "SHP-001"
        }
      }
    ],
    "user": {
      "id": "uuid-usuario",
      "firstName": "María",
      "lastName": "García"
    },
    "createdAt": "2025-01-13T10:30:00.000Z"
  }
}
```

#### Validaciones:

- ✅ Usuario autenticado con rol válido (no OWNER)
- ✅ Al menos un producto en items[]
- ✅ Productos existen y están activos
- ✅ Productos tienen productType: FOR_SALE o BOTH
- ✅ Stock suficiente en la sucursal o global
- ✅ paidAmount >= total

---

### 2. Listar Ventas

**GET** `/api/sales`

Lista ventas con filtros y paginación.

#### Query Parameters:

```
?businessId=uuid-negocio
&branchId=uuid-sucursal
&userId=uuid-usuario
&clientId=uuid-cliente
&shiftId=uuid-turno
&status=COMPLETED          // COMPLETED | CANCELLED | REFUNDED | PENDING
&startDate=2025-01-01
&endDate=2025-01-31
&page=1
&limit=20
```

#### Response (200):

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-venta",
      "saleNumber": "VENTA-1736730000000-ABC123XYZ",
      "total": 160650,
      "status": "COMPLETED",
      "paymentMethod": "CASH",
      "items": [...],
      "user": {...},
      "client": {...},
      "createdAt": "2025-01-13T10:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

---

### 3. Ver Detalle de Venta

**GET** `/api/sales/:id`

Obtiene el detalle completo de una venta incluyendo items, cliente, movimientos de inventario y recibo.

#### Response (200):

```json
{
  "success": true,
  "data": {
    "id": "uuid-venta",
    "saleNumber": "VENTA-1736730000000-ABC123XYZ",
    "total": 160650,
    "status": "COMPLETED",
    "items": [
      {
        "id": "uuid-item",
        "product": {
          "id": "uuid-producto",
          "name": "Shampoo Premium",
          "sku": "SHP-001",
          "images": ["url-imagen"]
        },
        "quantity": 2,
        "unitPrice": 50000,
        "total": 107100,
        "inventoryMovement": {
          "id": "uuid-movimiento",
          "previousStock": 50,
          "newStock": 48
        }
      }
    ],
    "user": {...},
    "client": {...},
    "branch": {...},
    "shift": {...},
    "receipt": {...},
    "createdAt": "2025-01-13T10:30:00.000Z"
  }
}
```

---

### 4. Cancelar Venta

**PATCH** `/api/sales/:id/cancel`

Cancela una venta y revierte los movimientos de inventario.

#### Request Body:

```json
{
  "reason": "Cliente solicitó cancelación"
}
```

#### Response (200):

```json
{
  "success": true,
  "message": "Venta cancelada exitosamente",
  "data": {
    "id": "uuid-venta",
    "status": "CANCELLED",
    "cancelledAt": "2025-01-13T11:00:00.000Z",
    "cancelledBy": "uuid-usuario",
    "cancellationReason": "Cliente solicitó cancelación"
  }
}
```

#### Validaciones:

- ✅ Solo ventas con status COMPLETED pueden ser canceladas
- ✅ Se revierte el stock automáticamente
- ✅ Se crean movimientos de tipo RETURN

---

### 5. Resumen de Ventas

**GET** `/api/sales/summary`

Obtiene estadísticas agregadas de ventas.

#### Query Parameters:

```
?businessId=uuid-negocio
&branchId=uuid-sucursal
&startDate=2025-01-01
&endDate=2025-01-31
```

#### Response (200):

```json
{
  "success": true,
  "data": {
    "summary": {
      "totalSales": 150,
      "totalRevenue": 25000000,
      "averageTicket": 166666,
      "subtotalSum": 21000000,
      "totalDiscount": 2100000,
      "totalTax": 3990000
    },
    "byPaymentMethod": [
      {
        "paymentMethod": "CASH",
        "count": 90,
        "total": 15000000
      },
      {
        "paymentMethod": "CARD",
        "count": 50,
        "total": 8500000
      },
      {
        "paymentMethod": "TRANSFER",
        "count": 10,
        "total": 1500000
      }
    ]
  }
}
```

---

## 💉 Endpoints de Consumo de Productos en Procedimientos

### 1. Registrar Consumo

**POST** `/api/procedure-supplies`

Registra el consumo de productos/insumos durante un procedimiento.

#### Request Body:

```json
{
  "branchId": "uuid-sucursal", // Opcional
  "appointmentId": "uuid-turno", // Opcional
  "shiftId": "uuid-turno-caja", // Opcional
  "specialistId": "uuid-especialista",
  "productId": "uuid-producto",
  "quantity": 250.5, // Acepta decimales para líquidos
  "unit": "ml", // unit | ml | gr | kg
  "reason": "Tratamiento capilar con keratina",
  "notes": "Cliente con alergia a formol"
}
```

#### Response (201):

```json
{
  "success": true,
  "message": "Consumo registrado exitosamente",
  "data": {
    "id": "uuid-consumo",
    "businessId": "uuid-negocio",
    "branchId": "uuid-sucursal",
    "appointmentId": "uuid-turno",
    "specialistId": "uuid-especialista",
    "productId": "uuid-producto",
    "quantity": 250.5,
    "unit": "ml",
    "unitCost": 50,
    "totalCost": 12525,
    "reason": "Tratamiento capilar con keratina",
    "product": {
      "id": "uuid-producto",
      "name": "Keratina Profesional",
      "sku": "KER-500"
    },
    "specialist": {
      "id": "uuid-especialista",
      "firstName": "Ana",
      "lastName": "Martínez"
    },
    "registeredAt": "2025-01-13T10:30:00.000Z"
  }
}
```

#### Validaciones:

- ✅ Cantidad mayor a 0
- ✅ Producto existe y está activo
- ✅ Producto tiene productType: FOR_PROCEDURES o BOTH
- ✅ Stock suficiente
- ✅ Especialista existe y está activo

---

### 2. Listar Consumos

**GET** `/api/procedure-supplies`

Lista consumos de productos con filtros.

#### Query Parameters:

```
?businessId=uuid-negocio
&branchId=uuid-sucursal
&specialistId=uuid-especialista
&productId=uuid-producto
&appointmentId=uuid-turno
&shiftId=uuid-turno-caja
&startDate=2025-01-01
&endDate=2025-01-31
&page=1
&limit=50
```

---

### 3. Ver Detalle de Consumo

**GET** `/api/procedure-supplies/:id`

Obtiene el detalle completo de un registro de consumo.

---

### 4. Consumos por Turno

**GET** `/api/procedure-supplies/appointment/:appointmentId`

Obtiene todos los consumos de un turno específico con totales.

#### Response (200):

```json
{
  "success": true,
  "data": {
    "supplies": [
      {
        "id": "uuid-consumo-1",
        "product": {
          "name": "Keratina Profesional",
          "sku": "KER-500"
        },
        "quantity": 250.5,
        "unit": "ml",
        "totalCost": 12525
      },
      {
        "id": "uuid-consumo-2",
        "product": {
          "name": "Tinte Color Castaño",
          "sku": "TIN-001"
        },
        "quantity": 1,
        "unit": "unit",
        "totalCost": 35000
      }
    ],
    "summary": {
      "totalItems": 2,
      "totalCost": 47525
    }
  }
}
```

---

### 5. Estadísticas de Consumo

**GET** `/api/procedure-supplies/stats`

Obtiene estadísticas agregadas de consumo.

#### Query Parameters:

```
?businessId=uuid-negocio
&branchId=uuid-sucursal
&specialistId=uuid-especialista
&productId=uuid-producto
&startDate=2025-01-01
&endDate=2025-01-31
&groupBy=specialist  // specialist | product | day | month
```

#### Response (200):

```json
{
  "success": true,
  "data": {
    "stats": [
      {
        "specialistId": "uuid-especialista-1",
        "specialist": {
          "firstName": "Ana",
          "lastName": "Martínez"
        },
        "totalRecords": 45,
        "totalQuantity": 5250.5,
        "totalCost": 350000
      }
    ],
    "totals": {
      "totalRecords": 150,
      "totalQuantity": 15000,
      "totalCost": 1200000
    }
  }
}
```

---

## 🔑 Roles y Permisos

### Ventas (POST /api/sales)
- ✅ BUSINESS
- ✅ BUSINESS_SPECIALIST
- ✅ RECEPTIONIST
- ✅ SPECIALIST
- ❌ OWNER (propietarios de la plataforma no pueden realizar ventas)

### Cancelar Ventas (PATCH /api/sales/:id/cancel)
- ✅ BUSINESS
- ✅ BUSINESS_SPECIALIST
- ✅ RECEPTIONIST
- ❌ SPECIALIST (solo puede ver)

### Consumo de Productos (POST /api/procedure-supplies)
- ✅ BUSINESS
- ✅ BUSINESS_SPECIALIST
- ✅ RECEPTIONIST
- ✅ SPECIALIST

---

## 📊 Integración con Inventario

### Movimientos Automáticos

Cada venta o consumo genera automáticamente:

1. **InventoryMovement** con:
   - `movementType`: `SALE` (salida de stock)
   - `referenceId`: ID de la venta o consumo
   - `referenceType`: `SALE` o `PROCEDURE`
   - `previousStock`: Stock antes del movimiento
   - `newStock`: Stock después del movimiento

2. **Actualización de Stock**:
   - Si hay `branchId`: actualiza `BranchStock.currentStock`
   - Si no hay `branchId`: actualiza `Product.currentStock`

3. **Reversión en Cancelaciones**:
   - Crea movimiento tipo `RETURN`
   - Restaura el stock automáticamente

---

## 💡 Ejemplos de Uso

### Ejemplo 1: Venta en Caja

```javascript
// Cliente compra 2 shampoos y 1 acondicionador
const response = await fetch('http://localhost:3001/api/sales', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({
    branchId: 'uuid-sucursal-centro',
    clientId: 'uuid-cliente-123',
    items: [
      {
        productId: 'uuid-shampoo',
        quantity: 2
      },
      {
        productId: 'uuid-acondicionador',
        quantity: 1,
        discountType: 'PERCENTAGE',
        discountValue: 15
      }
    ],
    paymentMethod: 'CASH',
    paidAmount: 100000
  })
});
```

### Ejemplo 2: Venta en Turno Activo

```javascript
// Venta durante un turno, se asocia automáticamente
const response = await fetch('http://localhost:3001/api/sales', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({
    shiftId: 'uuid-turno-caja-activo',
    branchId: 'uuid-sucursal',
    items: [
      {
        productId: 'uuid-producto',
        quantity: 3
      }
    ],
    paymentMethod: 'CARD',
    paymentDetails: {
      cardType: 'Visa',
      last4: '4567'
    },
    paidAmount: 75000
  })
});
```

### Ejemplo 3: Registrar Consumo en Procedimiento

```javascript
// Especialista registra uso de keratina en tratamiento
const response = await fetch('http://localhost:3001/api/procedure-supplies', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({
    appointmentId: 'uuid-turno',
    specialistId: 'uuid-especialista',
    productId: 'uuid-keratina',
    quantity: 150.5,
    unit: 'ml',
    reason: 'Alisado con keratina',
    notes: 'Cliente solicitó menos producto'
  })
});
```

---

## ⚠️ Errores Comunes

### Error 400: Stock Insuficiente

```json
{
  "success": false,
  "error": "Stock insuficiente para Shampoo Premium. Disponible: 5, Solicitado: 10"
}
```

**Solución**: Verificar stock antes de la venta o hacer pedido al proveedor.

### Error 403: Rol No Permitido

```json
{
  "success": false,
  "error": "Los propietarios de la plataforma no pueden realizar ventas"
}
```

**Solución**: Usuario con rol OWNER no puede crear ventas. Usar cuenta de negocio.

### Error 400: Producto No Disponible

```json
{
  "success": false,
  "error": "Producto uuid-123 no encontrado o no disponible para venta"
}
```

**Solución**: Verificar que el producto existe, está activo y tiene `productType: FOR_SALE` o `BOTH`.

---

## 🚀 Próximos Pasos

1. Implementar frontend para registro de ventas
2. Agregar generación automática de recibos
3. Integrar con CashRegisterShift para reportes
4. Crear reportes de rentabilidad por producto
5. Implementar alertas de stock bajo basadas en velocidad de venta

---

**Fecha de Creación**: 13 de Enero 2025  
**Versión**: 1.0.0
