# 💰 Sistema de Inventario, Caja y Flujo de Efectivo
## Diagrama Completo de Arquitectura

---

## 🎯 Módulos Integrados

```
┌─────────────────────────────────────────────────────────────┐
│                    BEAUTY CONTROL                           │
│                 Sistema de Gestión Integral                 │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
   📦 INVENTARIO      💵 CAJA/TURNOS       📊 CONTABILIDAD
        │                   │                   │
        ├─ Productos        ├─ Ingresos         ├─ Gastos
        ├─ Stock           ├─ Egresos          ├─ Cuentas por Pagar
        ├─ Compras         ├─ Arqueo           ├─ Reportes
        └─ Movimientos     └─ Cierres          └─ Balance
```

---

## 📦 1. MÓDULO DE INVENTARIO

### 1.1 Entidades Principales

```javascript
// PRODUCTOS
Product {
  id, businessId, name, sku, barcode,
  price, cost, currentStock, minStock,
  category, brand, isActive,
  trackInventory, unit, images,
  supplier, expirationTracking
}

// MOVIMIENTOS DE INVENTARIO
InventoryMovement {
  id, businessId, productId, userId,
  movementType, // PURCHASE, SALE, ADJUSTMENT, CONSUMPTION, etc.
  quantity, // + o -
  unitCost, totalCost,
  previousStock, newStock,
  reason, notes,
  referenceType, referenceId,
  batchNumber, expirationDate,
  documentUrl, // Factura del proveedor
  createdAt
}

// ÓRDENES DE COMPRA
PurchaseOrder {
  id, businessId, supplierId,
  orderNumber, status,
  items, subtotal, tax, total,
  deliveryDate, notes,
  invoiceUrl, // ⭐ Factura del proveedor
  invoiceNumber,
  invoiceDueDate, // ⭐ Fecha de vencimiento
  isPaid, paidAt,
  paymentProofUrl, // ⭐ Comprobante de pago
  createdBy, approvedBy
}
```

### 1.2 Flujos de Inventario

```
┌─────────────────────────────────────────────────────────┐
│               FLUJOS DE MOVIMIENTO                      │
└─────────────────────────────────────────────────────────┘

1️⃣ COMPRA A PROVEEDOR
   ┌──────────────────────────────────────────┐
   │ 1. Crear Purchase Order                  │
   │ 2. Cargar factura proveedor (PDF)        │ ⭐
   │ 3. Fecha vencimiento de pago             │ ⭐
   │ 4. Recibir mercancía                     │
   │ 5. Crear InventoryMovement(PURCHASE)     │
   │ 6. Actualizar stock (+)                  │
   │ 7. Crear cuenta por pagar                │ ⭐
   └──────────────────────────────────────────┘
                    │
                    ▼
   ┌──────────────────────────────────────────┐
   │ CUANDO SE PAGA:                          │
   │ 8. Registrar pago                        │
   │ 9. Cargar comprobante (PDF/imagen)       │ ⭐
   │ 10. Marcar como pagado                   │
   │ 11. Registrar egreso en Caja             │ ⭐
   │ 12. Actualizar balance                   │
   └──────────────────────────────────────────┘

2️⃣ VENTA DE PRODUCTO
   ┌──────────────────────────────────────────┐
   │ 1. Seleccionar productos + cantidad      │
   │ 2. Calcular total                        │
   │ 3. Método de pago                        │
   │ 4. Crear Receipt (PDF)                   │
   │ 5. Crear InventoryMovement(SALE)         │
   │ 6. Actualizar stock (-)                  │
   │ 7. Registrar ingreso en Caja             │ ⭐
   └──────────────────────────────────────────┘

3️⃣ CONSUMO INTERNO (Servicios)
   ┌──────────────────────────────────────────┐
   │ 1. Especialista retira producto          │
   │ 2. Cantidad + razón                      │
   │ 3. ¿Para quién? (si es receptionist)     │
   │ 4. Asociar a cita (opcional)             │
   │ 5. Crear InventoryMovement(CONSUMPTION)  │
   │ 6. Actualizar stock (-)                  │
   │ 7. NO afecta Caja (es consumo)           │
   └──────────────────────────────────────────┘

4️⃣ AJUSTE DE INVENTARIO
   ┌──────────────────────────────────────────┐
   │ 1. Conteo físico vs sistema              │
   │ 2. Diferencia encontrada                 │
   │ 3. Razón del ajuste                      │
   │ 4. Crear InventoryMovement(ADJUSTMENT)   │
   │ 5. Actualizar stock                      │
   └──────────────────────────────────────────┘
```

---

## 💵 2. MÓDULO DE CAJA Y TURNOS

### 2.1 Entidades Principales

```javascript
// TURNO DE CAJA
CashRegisterShift {
  id, businessId,
  shiftNumber, // Consecutivo
  openedBy, closedBy,
  openedAt, closedAt,
  status, // OPEN, CLOSED
  
  // Saldos
  initialCash, // Efectivo inicial
  expectedCash, // Según movimientos
  actualCash, // Conteo físico
  difference, // Diferencia (faltante/sobrante)
  
  // Resumen de movimientos
  totalSales, // Ventas de productos
  totalServices, // Pagos de servicios
  totalExpenses, // Gastos del turno
  totalWithdrawals, // Retiros de efectivo
  
  // Desglose por método
  cashPayments,
  cardPayments,
  transferPayments,
  voucherPayments,
  
  notes,
  createdAt
}

// MOVIMIENTOS DE CAJA
CashMovement {
  id, businessId, shiftId,
  movementType, // SALE, SERVICE, EXPENSE, WITHDRAWAL, INITIAL, ADJUSTMENT
  amount,
  paymentMethod, // CASH, CARD, TRANSFER, etc.
  category, // Para gastos: SUPPLIES, UTILITIES, SALARIES, etc.
  description,
  
  // Referencias
  referenceType, // RECEIPT, APPOINTMENT, PURCHASE_ORDER, EXPENSE
  referenceId,
  
  userId, // Quien registró
  approvedBy, // Si requiere aprobación
  
  documentUrl, // Comprobante
  createdAt
}

// GASTOS GENERALES
Expense {
  id, businessId,
  expenseNumber, // Consecutivo
  category, // SUPPLIES, UTILITIES, RENT, SALARIES, MARKETING, etc.
  description,
  amount,
  
  // Fechas
  expenseDate,
  dueDate, // Si es cuenta por pagar
  paidAt,
  
  // Pagos
  paymentMethod,
  isPaid,
  paymentProofUrl, // Comprobante
  
  // Proveedor (opcional)
  supplierId,
  supplierName,
  invoiceNumber,
  invoiceUrl,
  
  userId, // Quien registró
  approvedBy, // Si requiere aprobación
  
  notes,
  createdAt
}
```

### 2.2 Flujo de Turno de Caja

```
┌─────────────────────────────────────────────────────────┐
│                CICLO DE TURNO DE CAJA                   │
└─────────────────────────────────────────────────────────┘

🔓 APERTURA DE TURNO
   ┌──────────────────────────────────────────┐
   │ 1. Usuario inicia turno                  │
   │ 2. Contar efectivo inicial               │
   │ 3. Registrar monto inicial               │
   │ 4. Crear CashRegisterShift(OPEN)         │
   │ 5. A partir de aquí se registran         │
   │    todos los movimientos                 │
   └──────────────────────────────────────────┘

💰 DURANTE EL TURNO - INGRESOS
   ┌──────────────────────────────────────────┐
   │ VENTA DE PRODUCTOS                       │
   │ ├─ Receipt creado                        │
   │ ├─ Método de pago seleccionado           │
   │ └─ CashMovement(SALE) creado             │
   │                                          │
   │ PAGO DE SERVICIO/CITA                    │
   │ ├─ Appointment pagado                    │
   │ ├─ Receipt creado                        │
   │ └─ CashMovement(SERVICE) creado          │
   │                                          │
   │ OTROS INGRESOS                           │
   │ └─ CashMovement(OTHER_INCOME)            │
   └──────────────────────────────────────────┘

💸 DURANTE EL TURNO - EGRESOS
   ┌──────────────────────────────────────────┐
   │ GASTOS GENERALES                         │
   │ ├─ Crear Expense                         │
   │ ├─ Cargar comprobante                    │
   │ └─ CashMovement(EXPENSE) creado          │
   │                                          │
   │ PAGO A PROVEEDOR                         │
   │ ├─ Marcar Purchase Order como pagado     │
   │ ├─ Cargar comprobante de pago            │
   │ └─ CashMovement(EXPENSE) creado          │
   │                                          │
   │ RETIRO DE EFECTIVO                       │
   │ ├─ Razón del retiro                      │
   │ └─ CashMovement(WITHDRAWAL) creado       │
   └──────────────────────────────────────────┘

🔒 CIERRE DE TURNO
   ┌──────────────────────────────────────────┐
   │ 1. Contar efectivo físico                │
   │ 2. Sistema calcula esperado:             │
   │    inicial + ingresos - egresos          │
   │ 3. Comparar: físico vs esperado          │
   │ 4. Diferencia (faltante/sobrante)        │
   │ 5. Justificar diferencia (si hay)        │
   │ 6. Generar reporte de cierre (PDF)       │
   │ 7. Actualizar CashRegisterShift(CLOSED)  │
   │ 8. Depositar/Guardar efectivo            │
   └──────────────────────────────────────────┘

📊 RESUMEN DEL TURNO
   ┌──────────────────────────────────────────┐
   │ Efectivo inicial:        $100,000        │
   │                                          │
   │ INGRESOS:                                │
   │ ├─ Ventas productos:    $450,000         │
   │ ├─ Servicios pagados:   $320,000         │
   │ └─ Total ingresos:      $770,000         │
   │                                          │
   │ EGRESOS:                                 │
   │ ├─ Gastos generales:    $80,000          │
   │ ├─ Pago proveedores:    $150,000         │
   │ ├─ Retiros:             $200,000         │
   │ └─ Total egresos:       $430,000         │
   │                                          │
   │ Efectivo esperado:       $440,000        │
   │ Efectivo contado:        $438,000        │
   │ Diferencia:             -$2,000 ⚠️       │
   │                                          │
   │ Desglose por método:                     │
   │ ├─ Efectivo:            $438,000         │
   │ ├─ Tarjeta:             $250,000         │
   │ ├─ Transferencia:       $82,000          │
   │ └─ Total:               $770,000         │
   └──────────────────────────────────────────┘
```

---

## 📊 3. MÓDULO DE CONTABILIDAD

### 3.1 Cuentas por Pagar

```javascript
// Vista consolidada de deudas
AccountsPayable {
  purchaseOrders: [
    {
      id, orderNumber, supplier,
      total, dueDate,
      status: 'PENDING' | 'OVERDUE' | 'PAID',
      daysUntilDue: 5,
      invoiceUrl,
      paymentProofUrl
    }
  ],
  
  expenses: [
    {
      id, expenseNumber, description,
      amount, dueDate,
      status, invoiceUrl
    }
  ],
  
  summary: {
    totalPending: 5000000,
    totalOverdue: 800000,
    dueThisWeek: 1200000,
    dueThisMonth: 3000000
  }
}
```

### 3.2 Categorías de Gastos

```javascript
ExpenseCategories = {
  // Operativos
  SUPPLIES: 'Insumos y Materiales',
  INVENTORY: 'Compra de Productos',
  
  // Servicios
  UTILITIES: 'Servicios Públicos',
  RENT: 'Arriendo',
  INTERNET: 'Internet/Teléfono',
  
  // Personal
  SALARIES: 'Salarios',
  COMMISSIONS: 'Comisiones',
  BENEFITS: 'Prestaciones',
  
  // Marketing
  MARKETING: 'Publicidad y Marketing',
  SOCIAL_MEDIA: 'Redes Sociales',
  
  // Mantenimiento
  MAINTENANCE: 'Mantenimiento',
  REPAIRS: 'Reparaciones',
  
  // Financieros
  TAXES: 'Impuestos',
  BANK_FEES: 'Comisiones Bancarias',
  
  // Otros
  OFFICE: 'Papelería y Oficina',
  TRANSPORT: 'Transporte',
  OTHER: 'Otros Gastos'
}
```

---

## 🏗️ 4. ESTRUCTURA DE COMPONENTES WEB

### 4.1 Navegación del Módulo

```
web-app/src/pages/
├── inventory/
│   ├── InventoryDashboard.jsx        // Vista general
│   ├── products/
│   │   ├── ProductList.jsx           // CRUD productos
│   │   ├── ProductForm.jsx
│   │   └── ProductDetail.jsx
│   ├── stock/
│   │   ├── StockInitial.jsx          // Primera carga
│   │   ├── StockAdjustment.jsx       // Ajustes
│   │   └── StockAlerts.jsx           // Alertas de stock bajo
│   ├── purchases/
│   │   ├── PurchaseOrderList.jsx
│   │   ├── PurchaseOrderForm.jsx     // ⭐ Con upload factura
│   │   ├── ReceiveMerchandise.jsx    // Registrar recepción
│   │   └── PaymentRegister.jsx       // ⭐ Registrar pago + comprobante
│   ├── sales/
│   │   ├── ProductSale.jsx           // Venta (WebView mobile)
│   │   └── SalesHistory.jsx
│   ├── consumption/
│   │   ├── InternalConsumption.jsx   // Retiro para servicios
│   │   └── ConsumptionHistory.jsx
│   └── movements/
│       ├── MovementsList.jsx         // Historial completo
│       └── MovementDetail.jsx
│
├── cash-register/                     // ⭐ NUEVO MÓDULO
│   ├── CashRegisterDashboard.jsx     // Vista general
│   ├── shifts/
│   │   ├── OpenShift.jsx             // Abrir turno
│   │   ├── CurrentShift.jsx          // Turno activo
│   │   ├── CloseShift.jsx            // Cerrar turno + arqueo
│   │   └── ShiftHistory.jsx          // Historial de turnos
│   ├── movements/
│   │   ├── RegisterIncome.jsx        // Registrar ingreso manual
│   │   ├── RegisterExpense.jsx       // Registrar gasto
│   │   ├── RegisterWithdrawal.jsx    // Retiro de efectivo
│   │   └── MovementsList.jsx
│   └── reports/
│       ├── DailyCashReport.jsx       // Reporte diario
│       └── CashFlowReport.jsx        // Flujo de efectivo
│
├── expenses/                          // ⭐ NUEVO MÓDULO
│   ├── ExpensesDashboard.jsx
│   ├── ExpenseForm.jsx                // ⭐ Con upload comprobante
│   ├── ExpensesList.jsx
│   ├── ExpenseCategories.jsx          // Configurar categorías
│   └── ExpenseReports.jsx
│
└── accounting/                        // ⭐ NUEVO MÓDULO
    ├── AccountingDashboard.jsx
    ├── AccountsPayable.jsx            // Cuentas por pagar
    ├── FinancialReports.jsx           // Balance, P&L
    └── TaxReports.jsx                 // Reportes fiscales
```

### 4.2 Componentes Compartidos

```
web-app/src/components/
├── cash/
│   ├── ShiftSummaryCard.jsx          // Card resumen turno
│   ├── CashMovementItem.jsx          // Item de movimiento
│   ├── PaymentMethodSelector.jsx     // Selector método pago
│   └── CashCountForm.jsx             // Formulario conteo
│
├── inventory/
│   ├── ProductSelector.jsx           // Buscador productos
│   ├── StockBadge.jsx                // Badge stock (alto/bajo/agotado)
│   └── MovementTypeBadge.jsx         // Badge tipo movimiento
│
├── expenses/
│   ├── ExpenseCategorySelect.jsx     // Selector categoría
│   └── DueDateAlert.jsx              // Alerta próximo vencimiento
│
└── shared/
    ├── FileUpload.jsx                // ⭐ Upload facturas/comprobantes
    ├── PDFViewer.jsx                 // Visor de PDFs
    └── ReceiptGenerator.jsx          // Generador de recibos
```

---

## 🔄 5. FLUJOS INTEGRADOS

### 5.1 Flujo Completo: Compra a Proveedor

```
┌─────────────────────────────────────────────────────────┐
│     COMPRA DE PRODUCTOS A PROVEEDOR - FLUJO COMPLETO    │
└─────────────────────────────────────────────────────────┘

PASO 1: Crear Orden de Compra
   ├─ Seleccionar proveedor
   ├─ Agregar productos + cantidades
   ├─ Calcular total
   ├─ Cargar factura del proveedor (PDF) ⭐
   ├─ Número de factura
   ├─ Fecha de vencimiento de pago ⭐
   └─ Guardar PurchaseOrder(status: SENT)

PASO 2: Recibir Mercancía
   ├─ Buscar orden de compra
   ├─ Verificar productos recibidos
   ├─ Confirmar cantidades
   ├─ Lote/Batch (opcional)
   ├─ Fecha expiración (opcional)
   ├─ Por cada producto:
   │   └─ Crear InventoryMovement(PURCHASE)
   └─ Actualizar PurchaseOrder(status: RECEIVED)

PASO 3: Registrar en Cuentas por Pagar
   ├─ Automático al crear PO
   ├─ Aparece en AccountsPayable
   ├─ Status: PENDING
   └─ Alerta si se acerca vencimiento

PASO 4: Pagar Factura (cuando llegue fecha)
   ├─ Desde AccountsPayable o PurchaseOrder
   ├─ Método de pago seleccionado
   ├─ Cargar comprobante de pago (PDF/imagen) ⭐
   ├─ Marcar PurchaseOrder(isPaid: true, paidAt: now)
   ├─ Crear CashMovement(EXPENSE) ⭐
   ├─ Si hay turno abierto: registrar en shift
   └─ Actualizar balance

RESULTADO FINAL:
   ✅ Stock actualizado
   ✅ Factura almacenada
   ✅ Pago registrado con comprobante
   ✅ Egreso reflejado en Caja
   ✅ Cuenta saldada
```

### 5.2 Flujo Completo: Venta de Producto

```
┌─────────────────────────────────────────────────────────┐
│         VENTA DE PRODUCTO - FLUJO COMPLETO              │
└─────────────────────────────────────────────────────────┘

PASO 1: Realizar Venta (Web o Mobile WebView)
   ├─ Verificar permisos usuario
   ├─ Buscar productos (barcode/nombre)
   ├─ Agregar al carrito
   ├─ Calcular total
   ├─ Seleccionar método de pago
   ├─ Cliente (nombre/teléfono opcional)
   └─ Confirmar venta

PASO 2: Registrar en Sistema
   ├─ Crear Receipt(type: PRODUCT_SALE)
   ├─ Por cada producto vendido:
   │   ├─ Crear InventoryMovement(SALE)
   │   └─ Actualizar Product(currentStock -=)
   ├─ Crear CashMovement(SALE) ⭐
   └─ Si hay turno abierto: sumar a shift

PASO 3: Generar Documentos
   ├─ PDF de recibo de venta
   ├─ Opción: Enviar por WhatsApp ⭐
   ├─ Opción: Imprimir
   └─ Opción: Email

RESULTADO FINAL:
   ✅ Stock reducido
   ✅ Ingreso registrado en Caja
   ✅ Recibo generado
   ✅ Cliente satisfecho
```

### 5.3 Flujo Completo: Gasto General

```
┌─────────────────────────────────────────────────────────┐
│         REGISTRO DE GASTO GENERAL - FLUJO COMPLETO      │
└─────────────────────────────────────────────────────────┘

EJEMPLO: Pago de servicios públicos

PASO 1: Registrar Gasto
   ├─ Categoría: UTILITIES
   ├─ Descripción: "Energía Enero 2025"
   ├─ Monto: $150,000
   ├─ Fecha del gasto
   ├─ Fecha de vencimiento (si aplica)
   ├─ Cargar factura/comprobante (PDF) ⭐
   ├─ Número de factura
   └─ Crear Expense(isPaid: false)

PASO 2: Pagar Gasto
   ├─ Método de pago
   ├─ Cargar comprobante de pago ⭐
   ├─ Marcar Expense(isPaid: true, paidAt: now)
   ├─ Crear CashMovement(EXPENSE) ⭐
   └─ Si hay turno abierto: registrar egreso

RESULTADO FINAL:
   ✅ Gasto registrado y categorizado
   ✅ Comprobantes almacenados
   ✅ Egreso reflejado en Caja
   ✅ Balance actualizado
```

---

## 📱 6. COMPONENTE DE CAJA - PANTALLA PRINCIPAL

### Vista de Turno Activo

```
┌─────────────────────────────────────────────────────────┐
│  🏪 TURNO DE CAJA #47                    [Cerrar Turno] │
├─────────────────────────────────────────────────────────┤
│  Abierto por: María López                               │
│  Inicio: 30 Ene 2025 - 08:00 AM                        │
│  Duración: 6h 23min                                     │
└─────────────────────────────────────────────────────────┘

┌──────────────────┬──────────────────┬──────────────────┐
│  💵 EFECTIVO     │  💳 TARJETAS     │  📱 DIGITAL      │
├──────────────────┼──────────────────┼──────────────────┤
│  Inicial:        │  Ventas:         │  Transferencias: │
│  $100,000        │  $450,000        │  $120,000        │
│                  │                  │                  │
│  Ingresos:       │  Comisión:       │                  │
│  $320,000        │  -$22,500        │                  │
│                  │                  │                  │
│  Egresos:        │  Neto:           │                  │
│  -$80,000        │  $427,500        │                  │
│                  │                  │                  │
│  Esperado:       │                  │                  │
│  $340,000        │                  │                  │
└──────────────────┴──────────────────┴──────────────────┘

┌─────────────────────────────────────────────────────────┐
│  📊 RESUMEN DEL DÍA                                     │
├─────────────────────────────────────────────────────────┤
│  ✅ Ingresos                                            │
│  ├─ Ventas de productos:        15  →  $320,000        │
│  ├─ Servicios pagados:          8   →  $450,000        │
│  └─ Total ingresos:                    $770,000        │
│                                                         │
│  ❌ Egresos                                             │
│  ├─ Gastos generales:           3   →  -$80,000        │
│  ├─ Pago proveedores:           1   →  -$150,000       │
│  ├─ Retiros:                    1   →  -$200,000       │
│  └─ Total egresos:                     -$430,000       │
│                                                         │
│  💰 Balance del turno:                  $340,000        │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  📋 ÚLTIMOS MOVIMIENTOS                [Ver todos →]    │
├─────────────────────────────────────────────────────────┤
│  14:23  💵 Venta producto    +$45,000    María López   │
│  14:10  💳 Pago servicio     +$80,000    Efectivo      │
│  13:45  ❌ Gasto general     -$25,000    Insumos       │
│  13:20  💵 Venta producto    +$35,000    María López   │
│  12:50  💳 Pago servicio     +$120,000   Tarjeta       │
└─────────────────────────────────────────────────────────┘

[Registrar Ingreso]  [Registrar Gasto]  [Retiro Efectivo]
```

---

## 📊 7. REPORTES Y DASHBOARDS

### 7.1 Dashboard de Inventario

```
┌─────────────────────────────────────────────────────────┐
│  📦 INVENTARIO - RESUMEN                                │
├─────────────────────────────────────────────────────────┤
│  📊 Productos activos: 87                               │
│  💰 Valor total inventario: $12,450,000                 │
│  ⚠️ Stock bajo: 12 productos                            │
│  🔴 Agotados: 3 productos                               │
│  ⏰ Próximos a vencer: 5 productos                      │
└─────────────────────────────────────────────────────────┘

Gráfica: Valor de inventario por categoría
Gráfica: Movimientos del mes (compras vs ventas vs consumo)
Tabla: Top 10 productos más vendidos
Alerta: Productos que requieren reorden
```

### 7.2 Dashboard de Caja

```
┌─────────────────────────────────────────────────────────┐
│  💵 CAJA - RESUMEN DEL MES                              │
├─────────────────────────────────────────────────────────┤
│  📈 Total ingresos: $15,250,000                         │
│  📉 Total egresos: $8,420,000                           │
│  💰 Balance neto: $6,830,000                            │
│  🔄 Turnos cerrados: 24                                 │
│  ⚖️ Diferencias totales: -$15,000 (0.1%)                │
└─────────────────────────────────────────────────────────┘

Gráfica: Ingresos vs egresos diarios
Gráfica: Distribución por método de pago
Tabla: Turnos con mayores diferencias
```

### 7.3 Dashboard Contable

```
┌─────────────────────────────────────────────────────────┐
│  📊 CONTABILIDAD - ESTADO FINANCIERO                    │
├─────────────────────────────────────────────────────────┤
│  💸 Cuentas por pagar:                                  │
│  ├─ Total pendiente: $3,200,000                         │
│  ├─ Vence esta semana: $800,000  ⚠️                     │
│  └─ Vencidas: $450,000  🔴                              │
│                                                         │
│  💰 Gastos del mes por categoría:                       │
│  ├─ Inventario: $4,200,000 (50%)                        │
│  ├─ Salarios: $2,100,000 (25%)                          │
│  ├─ Servicios: $840,000 (10%)                           │
│  └─ Otros: $1,280,000 (15%)                             │
└─────────────────────────────────────────────────────────┘

Gráfica: Gastos mensuales por categoría
Tabla: Próximos pagos programados
Alerta: Facturas próximas a vencer
```

---

## 🗄️ 8. ESTRUCTURA DE BASE DE DATOS

### 8.1 Tablas Nuevas Requeridas

```sql
-- TURNOS DE CAJA
CREATE TABLE cash_register_shifts (
  id UUID PRIMARY KEY,
  business_id UUID REFERENCES businesses(id),
  shift_number INTEGER,
  
  opened_by UUID REFERENCES users(id),
  closed_by UUID REFERENCES users(id),
  opened_at TIMESTAMP,
  closed_at TIMESTAMP,
  status VARCHAR, -- OPEN, CLOSED
  
  initial_cash DECIMAL(15,2),
  expected_cash DECIMAL(15,2),
  actual_cash DECIMAL(15,2),
  difference DECIMAL(15,2),
  
  total_sales DECIMAL(15,2),
  total_services DECIMAL(15,2),
  total_expenses DECIMAL(15,2),
  total_withdrawals DECIMAL(15,2),
  
  cash_payments DECIMAL(15,2),
  card_payments DECIMAL(15,2),
  transfer_payments DECIMAL(15,2),
  
  notes TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- MOVIMIENTOS DE CAJA
CREATE TABLE cash_movements (
  id UUID PRIMARY KEY,
  business_id UUID REFERENCES businesses(id),
  shift_id UUID REFERENCES cash_register_shifts(id),
  
  movement_type VARCHAR, -- SALE, SERVICE, EXPENSE, WITHDRAWAL, etc.
  amount DECIMAL(15,2),
  payment_method VARCHAR,
  category VARCHAR,
  description TEXT,
  
  reference_type VARCHAR,
  reference_id UUID,
  
  user_id UUID REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  
  document_url VARCHAR,
  created_at TIMESTAMP
);

-- GASTOS GENERALES
CREATE TABLE expenses (
  id UUID PRIMARY KEY,
  business_id UUID REFERENCES businesses(id),
  expense_number VARCHAR UNIQUE,
  
  category VARCHAR,
  description TEXT,
  amount DECIMAL(15,2),
  
  expense_date DATE,
  due_date DATE,
  paid_at TIMESTAMP,
  
  payment_method VARCHAR,
  is_paid BOOLEAN,
  payment_proof_url VARCHAR,
  
  supplier_id UUID REFERENCES suppliers(id),
  supplier_name VARCHAR,
  invoice_number VARCHAR,
  invoice_url VARCHAR,
  
  user_id UUID REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  
  notes TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### 8.2 Modificaciones a Tablas Existentes

```sql
-- Agregar campos a purchase_orders
ALTER TABLE purchase_orders ADD COLUMN invoice_url VARCHAR;
ALTER TABLE purchase_orders ADD COLUMN invoice_number VARCHAR;
ALTER TABLE purchase_orders ADD COLUMN invoice_due_date DATE;
ALTER TABLE purchase_orders ADD COLUMN is_paid BOOLEAN DEFAULT FALSE;
ALTER TABLE purchase_orders ADD COLUMN paid_at TIMESTAMP;
ALTER TABLE purchase_orders ADD COLUMN payment_proof_url VARCHAR;
ALTER TABLE purchase_orders ADD COLUMN payment_method VARCHAR;

-- Agregar campos a inventory_movements si no existen
ALTER TABLE inventory_movements ADD COLUMN document_url VARCHAR;
```

---

## 🎯 9. PLAN DE IMPLEMENTACIÓN SUGERIDO

### Fase 1: Base de Inventario (Semana 1-2)
```
✅ ProductList.jsx - CRUD básico
✅ ProductForm.jsx - Crear/editar
✅ StockInitial.jsx - Carga inicial
✅ API endpoints productos
✅ Migraciones DB
```

### Fase 2: Compras y Proveedores (Semana 3)
```
✅ PurchaseOrderForm.jsx - Con upload factura
✅ ReceiveMerchandise.jsx - Recibir stock
✅ InventoryMovements - Tracking
✅ Cuentas por pagar - Vista inicial
```

### Fase 3: Ventas (Semana 4)
```
✅ ProductSale.jsx - WebView mobile
✅ Receipt PDF generator
✅ Integración con WhatsApp
✅ Permisos de venta
```

### Fase 4: Caja y Turnos (Semana 5-6)
```
✅ CashRegisterShift - Abrir/Cerrar
✅ CashMovements - Registro
✅ Arqueo de caja
✅ Reportes de turno
```

### Fase 5: Gastos y Contabilidad (Semana 7)
```
✅ Expense management
✅ Categorías de gastos
✅ Cuentas por pagar completo
✅ Pago de facturas
```

### Fase 6: Reportes y Analytics (Semana 8)
```
✅ Dashboards
✅ Reportes financieros
✅ Alertas automáticas
✅ Exportación de datos
```

---

## 📋 CONCLUSIÓN

Este sistema integrado permite:

✅ **Inventario completo** - Stock, compras, ventas, consumo
✅ **Trazabilidad total** - Quién, cuándo, por qué
✅ **Control de caja** - Turnos, arqueos, diferencias
✅ **Gestión financiera** - Gastos, cuentas por pagar, reportes
✅ **Documentación** - Facturas, comprobantes, recibos
✅ **Permisos granulares** - Quién puede hacer qué
✅ **Reportes en tiempo real** - Decisiones basadas en datos

---

**¿Por dónde comenzamos?**
Recomiendo empezar por **Fase 1: Base de Inventario** para tener la fundación sólida, y luego construir sobre ella.

---

Documento creado: 30 de Enero de 2025
Sistema: Beauty Control - Inventory & Cash Flow
Versión: 1.0.0
