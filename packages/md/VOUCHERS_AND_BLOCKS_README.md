# Sistema de Vouchers y Bloqueos de Clientes

## ✅ Implementación Completada

### 📊 Base de Datos

#### Tablas Creadas

1. **`vouchers`** - Gestión de cupones de reagendamiento
   - Columnas principales:
     - `id` (UUID, PK)
     - `code` (VARCHAR(20), UNIQUE) - Código único tipo "VCH-ABC123XYZ"
     - `businessId` (UUID, FK → businesses)
     - `customerId` (UUID, FK → users)
     - `originalBookingId` (UUID, FK → appointments)
     - `amount` (DECIMAL) - Valor del voucher
     - `currency` (VARCHAR(3)) - Moneda (default: COP)
     - `status` (ENUM) - ACTIVE, USED, EXPIRED, CANCELLED
     - `issuedAt`, `expiresAt`, `usedAt` (TIMESTAMP)
     - `usedInBookingId` (UUID, FK → appointments)
     - `notes` (TEXT)

2. **`customer_booking_blocks`** - Bloqueos temporales de clientes
   - Columnas principales:
     - `id` (UUID, PK)
     - `businessId` (UUID, FK → businesses)
     - `customerId` (UUID, FK → users)
     - `status` (ENUM) - ACTIVE, LIFTED, EXPIRED
     - `reason` (ENUM) - EXCESSIVE_CANCELLATIONS, MANUAL, NO_SHOW, OTHER
     - `blockedAt`, `expiresAt`, `liftedAt` (TIMESTAMP)
     - `liftedBy` (UUID, FK → users)
     - `cancellationCount` (INTEGER)
     - `notes` (TEXT)
     - `metadata` (JSONB)

### 🛠️ Backend

#### Migraciones
- ✅ `create-vouchers-table.sql`
- ✅ `create-customer-booking-blocks-table.sql`
- ✅ Script de ejecución: `scripts/run-voucher-migrations.js`

#### Modelos Sequelize
- ✅ `Voucher.js` - Ya existía
- ✅ `CustomerBookingBlock.js` - Ya existía

#### Controladores
- ✅ **VoucherController** (`src/controllers/VoucherController.js`)
  - Métodos agregados para panel de clientes:
    - `getCustomerVouchers()` - Obtener vouchers de un cliente específico
    - `blockCustomer()` - Bloquear cliente manualmente
    - `getCustomerBlockStatus()` - Obtener estado de bloqueo

- ✅ **ClientController** (`src/controllers/ClientController.js`)
  - Corregidos:
    - Uso de `status: 'ACTIVE'` en lugar de `isActive: true`
    - Campos correctos al crear bloqueos (`blockedAt`, `expiresAt`, etc.)

#### Rutas API
- ✅ **Rutas de Clientes** (`src/routes/clients.js`)
  ```
  Base: /api/business/:businessId/clients
  
  VOUCHERS:
  GET    /:clientId/vouchers              - Listar vouchers del cliente
  POST   /:clientId/vouchers              - Crear voucher manual
  PUT    /:clientId/vouchers/:voucherId/cancel - Cancelar voucher
  
  BLOQUEOS:
  POST   /:clientId/block                 - Bloquear cliente
  POST   /:clientId/unblock               - Desbloquear cliente
  GET    /:clientId/block-status          - Estado de bloqueo
  ```

### 🎨 Frontend (Pendiente)

#### Componentes a Crear

1. **VoucherListModal.jsx**
   - Lista de vouchers del cliente
   - Filtros por estado (ACTIVE, USED, EXPIRED)
   - Botón para crear voucher manual
   - Acciones: ver detalle, cancelar

2. **CreateVoucherModal.jsx**
   - Formulario para crear voucher manual
   - Campos:
     - Monto (requerido)
     - Días de validez (default: 90)
     - Notas/Razón
   - Validación de monto > 0

3. **VoucherDetailCard.jsx**
   - Tarjeta individual de voucher
   - Muestra:
     - Código (con botón copiar)
     - Monto y moneda
     - Estado con badge de color
     - Fechas (emitido, expira, usado)
     - Cita original (si aplica)
   - Acciones según estado

4. **BlockClientModal.jsx**
   - Formulario para bloquear cliente
   - Campos:
     - Razón (dropdown: MANUAL, NO_SHOW, EXCESSIVE_CANCELLATIONS, OTHER)
     - Duración en días (default: 30)
     - Notas adicionales
   - Confirmación con advertencia

5. **BlockStatusAlert.jsx**
   - Alert/Banner mostrando estado de bloqueo
   - Información:
     - Razón del bloqueo
     - Fecha de inicio
     - Fecha de expiración
     - Número de cancelaciones (si aplica)
   - Botón "Levantar Bloqueo"

#### Integraciones en Componentes Existentes

**ClientDetailModal.jsx:**
- ✅ Ya tiene botón "Editar"
- ➕ Agregar tab "Vouchers" con VoucherListModal
- ➕ Agregar tab "Bloqueos" con historial de bloqueos
- ➕ Mostrar BlockStatusAlert si cliente está bloqueado
- ➕ Agregar botones de acción:
  - "Crear Voucher" → Abre CreateVoucherModal
  - "Bloquear Cliente" → Abre BlockClientModal
  - "Desbloquear" → Confirma y llama API

**CustomerHistorySection.jsx:**
- ✅ Ya muestra lista de clientes
- ➕ Agregar indicador visual de cliente bloqueado en lista
- ➕ Agregar badge "X vouchers activos" en cada tarjeta

### 📡 Endpoints API Disponibles

#### Vouchers
```http
# Listar vouchers de un cliente
GET /api/business/:businessId/clients/:clientId/vouchers
Query: includeExpired=true/false

# Crear voucher manual
POST /api/business/:businessId/clients/:clientId/vouchers
Body: {
  "amount": 50000,
  "expiresInDays": 90,
  "notes": "Voucher de compensación"
}

# Cancelar voucher
PUT /api/business/:businessId/clients/:clientId/vouchers/:voucherId/cancel
Body: {
  "reason": "Razón de cancelación"
}
```

#### Bloqueos
```http
# Obtener estado de bloqueo
GET /api/business/:businessId/clients/:clientId/block-status

# Bloquear cliente
POST /api/business/:businessId/clients/:clientId/block
Body: {
  "reason": "MANUAL",
  "durationDays": 30,
  "notes": "Bloqueo por incumplimiento"
}

# Desbloquear cliente
POST /api/business/:businessId/clients/:clientId/unblock
Body: {
  "notes": "Bloqueo levantado por..."
}
```

### 🔄 Flujo de Uso

#### Crear Voucher Manual
1. Usuario abre detalle del cliente
2. Clic en "Crear Voucher"
3. Modal con formulario (monto, validez, notas)
4. Submit → POST /api/.../vouchers
5. Success → Recarga lista de vouchers
6. Notificación toast "Voucher creado: VCH-ABC123"

#### Bloquear Cliente
1. Usuario abre detalle del cliente
2. Clic en "Bloquear Cliente"
3. Modal con formulario (razón, duración, notas)
4. Confirmación "¿Estás seguro?"
5. Submit → POST /api/.../block
6. Success → Muestra BlockStatusAlert
7. Cliente no puede hacer reservas online

#### Desbloquear Cliente
1. Usuario ve cliente bloqueado (badge rojo)
2. Clic en "Levantar Bloqueo"
3. Confirmación con notas opcionales
4. Submit → POST /api/.../unblock
5. Success → Remueve BlockStatusAlert
6. Cliente puede reservar nuevamente

### 🧪 Testing

#### Casos de Prueba Backend
- ✅ Crear tablas con migraciones
- ✅ Listar clientes con bloqueos activos
- ⏳ Crear voucher manual
- ⏳ Cancelar voucher
- ⏳ Bloquear cliente
- ⏳ Desbloquear cliente
- ⏳ Verificar estado de bloqueo

#### Casos de Prueba Frontend
- ⏳ Ver lista de vouchers de un cliente
- ⏳ Crear voucher manual con validación
- ⏳ Cancelar voucher (solo ACTIVE)
- ⏳ Bloquear cliente con diferentes razones
- ⏳ Desbloquear cliente con confirmación
- ⏳ Ver indicadores visuales de estado

### 📝 Notas Técnicas

#### Errores Corregidos
1. **`isActive` → `status: 'ACTIVE'`**
   - La tabla usa `status` (ENUM) no `isActive` (boolean)
   - Corregido en `ClientController.listClients()` y `toggleClientStatus()`

2. **Campos faltantes en creación de bloqueo**
   - Agregados: `blockedAt`, `expiresAt`, `cancellationCount`
   - Uso de `status: 'ACTIVE'` en lugar de `isActive: true`

3. **Operador `Op.gt` para fecha de expiración**
   - Agregado para filtrar solo bloqueos activos no vencidos

#### Mejoras Futuras
- [ ] Generación automática de vouchers al cancelar citas (según reglas de negocio)
- [ ] Bloqueo automático tras N cancelaciones en X días
- [ ] Notificaciones por email/SMS al generar voucher
- [ ] Dashboard de vouchers y bloqueos para owner
- [ ] Reporte de vouchers: emitidos, usados, expirados
- [ ] Historial completo de bloqueos por cliente

### 🚀 Próximos Pasos

1. **Frontend - Componentes de Vouchers**
   - Crear VoucherListModal
   - Crear CreateVoucherModal
   - Integrar en ClientDetailModal

2. **Frontend - Componentes de Bloqueos**
   - Crear BlockClientModal
   - Crear BlockStatusAlert
   - Integrar en ClientDetailModal y lista

3. **Testing E2E**
   - Probar flujo completo de vouchers
   - Probar flujo completo de bloqueos
   - Validar permisos y roles

4. **Documentación**
   - Guía de usuario para vouchers
   - Guía de usuario para bloqueos
   - API documentation con Swagger

---

## 📦 Archivos Modificados/Creados

### Backend
- ✅ `migrations/create-vouchers-table.sql`
- ✅ `migrations/create-customer-booking-blocks-table.sql`
- ✅ `scripts/run-voucher-migrations.js`
- ✅ `src/controllers/VoucherController.js` (métodos agregados)
- ✅ `src/controllers/ClientController.js` (corregidos errores)
- ✅ `src/routes/clients.js` (rutas de vouchers y bloqueos)

### Frontend (Pendiente)
- ⏳ `components/VoucherListModal.jsx`
- ⏳ `components/CreateVoucherModal.jsx`
- ⏳ `components/VoucherDetailCard.jsx`
- ⏳ `components/BlockClientModal.jsx`
- ⏳ `components/BlockStatusAlert.jsx`
- ⏳ Modificaciones en `ClientDetailModal.jsx`
- ⏳ Modificaciones en `CustomerHistorySection.jsx`
