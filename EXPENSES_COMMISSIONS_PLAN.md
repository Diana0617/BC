# 📋 Plan de Trabajo: Sistema de Gastos y Comisiones

## 🎯 Objetivo
Implementar un sistema completo de gestión de gastos del negocio y seguimiento de comisiones a especialistas, integrando ambos en la sección de Movimientos.

---

## 📊 Análisis del Sistema Actual

### Modelos Existentes (✅ Ya creados)
1. **BusinessExpense** - Gastos del negocio con categorías personalizadas
2. **BusinessExpenseCategory** - Categorías de gastos por negocio
3. **CommissionPaymentRequest** - Solicitudes de pago de comisiones
4. **CommissionDetail** - Detalles de comisiones por servicio/turno
5. **BusinessCommissionConfig** - Configuración de cálculo de comisiones
6. **FinancialMovement** - Movimientos financieros (ya conectado con gastos)

### Relaciones Clave
```
FinancialMovement 
├── businessExpenseId → BusinessExpense (cuando type='EXPENSE')
├── businessExpenseCategoryId → BusinessExpenseCategory
└── referenceId (puede apuntar a CommissionPaymentRequest)

BusinessExpense
├── categoryId → BusinessExpenseCategory
└── puede ser de categoría "Comisiones a Especialistas"

CommissionPaymentRequest
├── specialistId → User
├── businessId → Business
└── hasMany → CommissionDetail

CommissionDetail
├── appointmentId → Appointment
├── serviceId → Service
├── clientId → Client
└── commissionAmount (monto calculado)
```

---

## 🏗️ Arquitectura de Solución

### Tab 1: Movimientos Financieros (✅ Existente)
- Resumen de ingresos y gastos
- Tabla de movimientos con filtros de fecha
- Totales: Ingresos / Gastos / Balance Neto

### Tab 2: Resumen de Turnos (✅ Existente)
- Estadísticas de turnos por estado
- Ingresos potenciales y reales

### Tab 3: Gastos del Negocio (🆕 Nueva)
```jsx
<ExpensesTab>
  <ExpensesSummaryCards>
    - Total Gastos del Mes
    - Gastos Pendientes de Aprobación
    - Categoría con más gastos
    - Comisiones Pagadas del Mes
  </ExpensesSummaryCards>
  
  <ExpensesFilters>
    - Rango de fechas
    - Categoría (select)
    - Estado (PENDING/APPROVED/PAID/REJECTED)
    - Proveedor (search)
  </ExpensesFilters>
  
  <ExpensesTable>
    Columnas: Fecha | Categoría | Descripción | Proveedor | Monto | Estado | Acciones
  </ExpensesTable>
  
  <CreateExpenseButton />
</ExpensesTab>
```

### Tab 4: Comisiones Especialistas (🆕 Nueva)
```jsx
<CommissionsTab>
  <CommissionConfigCard>
    - Tipo de cálculo: General / Por Servicio / Mixto
    - Porcentaje general: 50%
    - Estado: Activo
    - [Botón: Configurar Comisiones]
  </CommissionConfigCard>
  
  <SpecialistsCommissionsList>
    {specialists.map(specialist => (
      <SpecialistCommissionCard>
        <SpecialistInfo>
          - Foto + Nombre
          - Servicios que ofrece
        </SpecialistInfo>
        
        <CommissionStats>
          - Comisiones Generadas (mes actual): $XXX,XXX
          - Comisiones Pagadas: $XXX,XXX
          - Comisiones Pendientes: $XXX,XXX
          - Servicios realizados: X
        </CommissionStats>
        
        <Actions>
          [Ver Detalle] [Registrar Pago]
        </Actions>
      </SpecialistCommissionCard>
    ))}
  </SpecialistsCommissionsList>
</CommissionsTab>
```

---

## 🔧 Componentes a Crear

### 1. ExpensesTab.jsx
- **Ubicación**: `packages/web-app/src/pages/business/profile/sections/tabs/`
- **Responsabilidades**:
  - Mostrar tarjetas de resumen
  - Filtros de gastos
  - Tabla de gastos con paginación
  - Botón para crear nuevo gasto
  - Modales de crear/editar/ver gasto

### 2. ExpenseForm.jsx (Modal)
- **Campos**:
  ```
  - Descripción* (textarea)
  - Monto* (number)
  - Categoría* (select - BusinessExpenseCategory)
  - Fecha del Gasto* (date)
  - Proveedor (text)
  - NIT/ID Proveedor (text)
  - Teléfono Proveedor (text)
  - Email Proveedor (email)
  - Método de Pago (select)
  - Referencia de Transacción (text)
  - Comprobante (file upload - Cloudinary)
  - Impuestos (number + % rate)
  - Es Recurrente? (checkbox)
  - Frecuencia (si es recurrente)
  - Notas (textarea)
  ```

### 3. CommissionsTab.jsx
- **Ubicación**: `packages/web-app/src/pages/business/profile/sections/tabs/`
- **Responsabilidades**:
  - Mostrar configuración de comisiones
  - Listar especialistas con sus estadísticas
  - Permitir ver detalle de comisiones
  - Registrar pagos de comisiones

### 4. SpecialistCommissionCard.jsx
- **Props**: `specialist, commissionStats`
- **Muestra**:
  - Info del especialista
  - Estadísticas de comisiones (generadas/pagadas/pendientes)
  - Botones de acción

### 5. CommissionPaymentForm.jsx (Modal)
- **Campos**:
  ```
  - Especialista* (readonly)
  - Período* (date range - readonly si viene de selección)
  - Monto Total* (calculated, readonly)
  - Detalles de Servicios (tabla readonly con las comisiones incluidas)
  - Método de Pago* (select)
  - Referencia de Pago (text)
  - Cuenta Bancaria (JSON - banco, tipo, número)
  - Fecha de Pago* (date)
  - Comprobante de Pago (file upload)
  - Notas (textarea)
  ```

### 6. CommissionDetailsModal.jsx
- **Muestra**:
  - Lista de servicios realizados en el período
  - Por cada servicio: Fecha, Cliente, Servicio, Precio, % Comisión, Monto Comisión
  - Totales por período
  - Histórico de pagos realizados

---

## 🚀 API Endpoints

### Gastos del Negocio

#### `GET /api/businesses/:businessId/expenses`
**Query params**: `?startDate=&endDate=&categoryId=&status=&vendor=&page=&limit=`
**Response**:
```json
{
  "expenses": [...],
  "pagination": {...},
  "summary": {
    "totalExpenses": 5000000,
    "pendingApproval": 500000,
    "topCategory": "Arriendos",
    "commissionsThisMonth": 2000000
  }
}
```

#### `POST /api/businesses/:businessId/expenses`
**Body**: ExpenseFormData
**Response**: Created expense + FinancialMovement

#### `PUT /api/businesses/:businessId/expenses/:expenseId`
**Body**: Updated fields
**Response**: Updated expense

#### `DELETE /api/businesses/:businessId/expenses/:expenseId`
**Response**: Soft delete (isActive=false)

#### `GET /api/businesses/:businessId/expense-categories`
**Response**: Lista de categorías activas del negocio
**Nota**: Si no existen, crear categorías por defecto:
- Arriendos
- Servicios Públicos
- Nómina
- **Comisiones a Especialistas** ⭐
- Insumos y Materiales
- Mantenimiento
- Marketing y Publicidad
- Otros

---

### Comisiones de Especialistas

#### `GET /api/businesses/:businessId/commissions/config`
**Response**:
```json
{
  "commissionsEnabled": true,
  "calculationType": "POR_SERVICIO",
  "generalPercentage": 50.00,
  "notes": "..."
}
```

#### `GET /api/businesses/:businessId/commissions/specialists-summary`
**Query params**: `?month=&year=` (default: current)
**Response**:
```json
{
  "specialists": [
    {
      "specialistId": "uuid",
      "name": "María García",
      "avatar": "url",
      "services": ["Corte", "Tinte"],
      "stats": {
        "generated": 1500000,
        "paid": 1000000,
        "pending": 500000,
        "servicesCount": 45
      }
    }
  ]
}
```

#### `GET /api/businesses/:businessId/commissions/specialist/:specialistId/details`
**Query params**: `?startDate=&endDate=`
**Response**:
```json
{
  "specialist": {...},
  "period": {...},
  "commissionDetails": [
    {
      "appointmentId": "uuid",
      "date": "2024-01-15",
      "client": "Cliente X",
      "service": "Corte de Cabello",
      "price": 50000,
      "commissionRate": 50,
      "commissionAmount": 25000,
      "status": "PAID"
    }
  ],
  "totals": {
    "generated": 1500000,
    "paid": 1000000,
    "pending": 500000
  },
  "paymentHistory": [...]
}
```

#### `POST /api/businesses/:businessId/commissions/pay`
**Body**:
```json
{
  "specialistId": "uuid",
  "periodFrom": "2024-01-01",
  "periodTo": "2024-01-31",
  "amount": 1500000,
  "paymentMethod": "BANK_TRANSFER",
  "paymentReference": "TRX123456",
  "bankAccount": {...},
  "paidDate": "2024-02-01",
  "notes": "...",
  "commissionDetailIds": ["uuid1", "uuid2", ...] // IDs de los CommissionDetail a marcar como pagados
}
```
**Proceso**:
1. Crear CommissionPaymentRequest con status='PAID'
2. Actualizar CommissionDetail.paymentStatus = 'PAID'
3. Crear BusinessExpense con categoryId = "Comisiones a Especialistas"
4. Crear FinancialMovement tipo 'EXPENSE' vinculado al BusinessExpense
5. Retornar todo el paquete creado

---

## 🎨 Redux State Management

### businessExpensesSlice.js
```javascript
{
  expenses: [],
  categories: [],
  summary: {
    totalExpenses: 0,
    pendingApproval: 0,
    topCategory: null,
    commissionsThisMonth: 0
  },
  filters: {
    startDate: null,
    endDate: null,
    categoryId: null,
    status: null,
    vendor: null
  },
  pagination: {...},
  loading: false,
  error: null
}
```

**Thunks**:
- `fetchExpenses`
- `fetchExpenseCategories`
- `createExpense`
- `updateExpense`
- `deleteExpense`

### specialistCommissionsSlice.js
```javascript
{
  config: {
    commissionsEnabled: true,
    calculationType: 'POR_SERVICIO',
    generalPercentage: 50.00
  },
  specialists: [
    {
      specialistId: 'uuid',
      name: '...',
      stats: {...}
    }
  ],
  selectedSpecialistDetails: {
    specialist: {...},
    commissionDetails: [],
    totals: {...},
    paymentHistory: [...]
  },
  filters: {
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  },
  loading: false,
  error: null
}
```

**Thunks**:
- `fetchCommissionConfig`
- `fetchSpecialistsSummary`
- `fetchSpecialistCommissionDetails`
- `registerCommissionPayment`

---

## 🔄 Flujo de Integración: Comisión → Gasto

### Cuando se paga una comisión:

1. **Usuario hace clic en "Registrar Pago"** en SpecialistCommissionCard
2. **Se abre CommissionPaymentForm** con:
   - Especialista seleccionado
   - Período del mes actual (o personalizado)
   - Lista de comisiones pendientes del período
   - Monto total calculado automáticamente
3. **Usuario completa el formulario**:
   - Método de pago
   - Referencia de transacción
   - Fecha de pago
   - Cuenta bancaria (opcional)
   - Comprobante (opcional)
4. **Backend procesa** (`POST /api/businesses/:businessId/commissions/pay`):
   ```javascript
   // a) Crear CommissionPaymentRequest
   const paymentRequest = await CommissionPaymentRequest.create({
     requestNumber: 'CPR-2024-001',
     specialistId,
     businessId,
     periodFrom,
     periodTo,
     totalAmount,
     status: 'PAID',
     paymentMethod,
     paymentReference,
     paidAt: new Date(),
     paidBy: req.user.id
   });
   
   // b) Actualizar CommissionDetails
   await CommissionDetail.update(
     { paymentStatus: 'PAID', paymentRequestId: paymentRequest.id },
     { where: { id: commissionDetailIds } }
   );
   
   // c) Buscar categoría "Comisiones a Especialistas"
   let category = await BusinessExpenseCategory.findOne({
     where: { businessId, name: 'Comisiones a Especialistas' }
   });
   
   if (!category) {
     category = await BusinessExpenseCategory.create({
       businessId,
       name: 'Comisiones a Especialistas',
       description: 'Pagos de comisiones a especialistas',
       color: '#8B5CF6',
       icon: 'CurrencyDollarIcon',
       requiresReceipt: false,
       isActive: true,
       createdBy: req.user.id
     });
   }
   
   // d) Crear BusinessExpense
   const expense = await BusinessExpense.create({
     businessId,
     categoryId: category.id,
     description: `Comisión ${specialist.name} - ${format(periodFrom, 'MMM yyyy')}`,
     amount: totalAmount,
     expenseDate: paidDate,
     paidDate,
     status: 'PAID',
     paymentMethod,
     transactionReference: paymentReference,
     createdBy: req.user.id
   });
   
   // e) Crear FinancialMovement
   const movement = await FinancialMovement.create({
     businessId,
     userId: req.user.id,
     type: 'EXPENSE',
     category: 'Comisiones a Especialistas',
     businessExpenseCategoryId: category.id,
     businessExpenseId: expense.id,
     amount: totalAmount,
     description: `Comisión ${specialist.name} - ${format(periodFrom, 'MMM yyyy')}`,
     paymentMethod,
     transactionId: paymentReference,
     referenceId: paymentRequest.id,
     referenceType: 'CommissionPaymentRequest',
     date: paidDate
   });
   
   return { paymentRequest, expense, movement };
   ```

5. **Frontend actualiza**:
   - Redux: `specialistCommissionsSlice` (stats actualizadas)
   - Redux: `businessExpensesSlice` (nuevo gasto)
   - Redux: `financialMovementsSlice` (nuevo movimiento EXPENSE)
   - UI: Todos los tabs se actualizan automáticamente

---

## 📱 Experiencia de Usuario

### Escenario 1: Registrar un Gasto Normal
1. Usuario va a tab "Gastos del Negocio"
2. Clic en "Nuevo Gasto"
3. Completa formulario (ej: Arriendo $2,000,000)
4. Sube comprobante (opcional)
5. Guarda → Aparece en tabla de gastos y en movimientos financieros

### Escenario 2: Pagar Comisión a Especialista
1. Usuario va a tab "Comisiones Especialistas"
2. Ve lista de especialistas con stats
3. Clic en "Registrar Pago" de María García
4. Modal muestra:
   - María García
   - Período: Enero 2024
   - Detalles: 45 servicios realizados
   - Monto total: $1,500,000
5. Usuario completa:
   - Método: Transferencia Bancaria
   - Referencia: TRX123456
   - Fecha: Hoy
6. Guarda → Sistema automáticamente:
   - Crea registro de pago de comisión
   - Crea gasto en categoría "Comisiones a Especialistas"
   - Crea movimiento financiero tipo EXPENSE
7. Usuario ve actualizado:
   - Tab Comisiones: María tiene $0 pendiente
   - Tab Gastos: Nuevo gasto de comisión
   - Tab Movimientos: Nuevo egreso

### Escenario 3: Ver Configuración de Comisiones
1. Usuario va a tab "Comisiones Especialistas"
2. Ve card de configuración:
   ```
   📊 Configuración de Comisiones
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Tipo: Por Servicio
   Porcentaje General: 50%
   Estado: ✅ Activo
   
   [Configurar Comisiones]
   ```
3. Puede hacer clic para editar (esto abre otro modal/página de configuración)

---

## ✅ Validaciones y Reglas de Negocio

1. **Categoría "Comisiones a Especialistas"**:
   - Se crea automáticamente si no existe
   - No se puede eliminar si tiene gastos asociados
   - Siempre debe estar activa

2. **Pago de Comisiones**:
   - Solo se pueden pagar comisiones de servicios completados
   - No se puede pagar dos veces la misma comisión
   - El monto total debe coincidir con la suma de las comisiones seleccionadas

3. **Gastos**:
   - Requieren aprobación si el monto > umbral configurado
   - Categorías con `requiresReceipt=true` obligan a subir comprobante
   - No se pueden eliminar gastos pagados (solo soft delete)

4. **Filtros de Fecha**:
   - Por defecto: mes actual
   - Rango máximo: 1 año
   - Sincronizados entre tabs

---

## 🎯 Orden de Implementación Sugerido

### Fase 1: Backend Gastos (2-3 horas)
1. ✅ Revisar modelos (ya existen)
2. Crear ExpenseController
3. Crear endpoints de gastos
4. Validar con Insomnia/Postman

### Fase 2: Backend Comisiones (2-3 horas)
1. Crear CommissionController
2. Crear endpoints de comisiones
3. Implementar lógica de integración (comisión → gasto)
4. Validar con Insomnia/Postman

### Fase 3: Redux (1-2 horas)
1. Crear businessExpensesSlice
2. Crear specialistCommissionsSlice
3. Integrar en store

### Fase 4: UI Gastos (3-4 horas)
1. Crear ExpensesTab
2. Crear ExpenseForm
3. Integrar con Redux
4. Testing

### Fase 5: UI Comisiones (4-5 horas)
1. Crear CommissionsTab
2. Crear SpecialistCommissionCard
3. Crear CommissionPaymentForm
4. Crear CommissionDetailsModal
5. Integrar con Redux
6. Testing

### Fase 6: Testing E2E (2 horas)
1. Crear gasto normal
2. Registrar pago de comisión
3. Verificar integración en todos los tabs
4. Validar filtros y búsquedas

---

## 📝 Notas Importantes

- **Cloudinary**: Ya está configurado para subir comprobantes
- **Permisos**: Validar que solo OWNER y ADMIN puedan ver/editar gastos
- **Especialistas**: Solo SPECIALIST_LEVEL_1 y SPECIALIST_LEVEL_2 aparecen en lista de comisiones
- **Moneda**: Siempre en COP, pero preparado para multi-moneda
- **Reportes**: Considerar agregar exportación a PDF/Excel en futuro

---

## 🚀 ¿Empezamos?

¿Quieres que comience por el backend de gastos o prefieres otro enfoque?
