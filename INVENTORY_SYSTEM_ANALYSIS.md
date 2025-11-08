# Sistema de Inventario - Análisis Completo

## 📋 RESUMEN EJECUTIVO

Estás construyendo un sistema de inventario multi-sucursal para el sector de belleza con las siguientes características clave:
- Multi-tenant (businessId)
- Multi-sucursal (branchId)
- Gestión de proveedores y catálogos
- Control de stock por sucursal
- Seguimiento de productos para venta vs procedimientos
- Facturación con vencimientos y pagos parciales
- Integración con Cloudinary para imágenes

---

## ✅ LO QUE YA TIENES IMPLEMENTADO

### 1. **Modelos de Base de Datos**

#### ✅ Product.js - Modelo Principal
```javascript
- businessId (UUID) ✅
- name, description, sku, barcode ✅
- category, brand ✅
- price, cost ✅
- currentStock, minStock, maxStock ✅
- trackInventory (boolean) ✅
- unit (string) ✅
- images (JSONB array) ✅
- expirationTracking, batchTracking, serialTracking ✅
- supplier (JSONB) ✅
```

**⚠️ FALTA:**
- ❌ branchId (para stock por sucursal)
- ❌ productType: ENUM('FOR_SALE', 'FOR_PROCEDURES', 'BOTH')
- ❌ requiresSpecialistTracking (boolean)

#### ✅ Supplier.js - Proveedores
```javascript
- businessId (UUID) ✅
- name, code, type, status ✅
- taxId, email, phone, website ✅
- address, contactPerson ✅
- categories, paymentTerms, bankInfo ✅
- certifications, notes ✅
- stats (orders, spent, rating) ✅
```

**✅ COMPLETO** - No requiere modificaciones mayores

#### ✅ InventoryMovement.js - Movimientos
```javascript
- businessId, productId, userId ✅
- movementType (ENUM) ✅
- quantity, unitCost, totalCost ✅
- previousStock, newStock ✅
- referenceId, referenceType ✅
- batchNumber, expirationDate ✅
- supplierInfo (JSONB) ✅
```

**⚠️ FALTA:**
- ❌ branchId (para rastrear sucursal origen/destino)
- ❌ specialistId (para retiros de productos en procedimientos)
- ❌ fromBranchId, toBranchId (para transferencias entre sucursales)

#### ✅ PurchaseOrder.js - Órdenes de Compra
```javascript
- businessId, supplierId ✅
- orderNumber, status ✅
- items (JSON array) ✅
- subtotal, tax, total, currency ✅
- deliveryDate, deliveryAddress ✅
- createdBy, approvedBy, approvedAt ✅
```

**⚠️ FALTA:**
- ❌ branchId (destino de la orden)

#### ✅ SupplierInvoice.js - Facturas de Proveedores
```javascript
- businessId, supplierId, purchaseOrderId ✅
- invoiceNumber, status ✅
- issueDate, dueDate ✅
- items, subtotal, tax, total ✅
- payments (JSON array) ✅
- paidAmount, remainingAmount ✅
- attachments ✅
```

**⚠️ FALTA:**
- ❌ branchId
- ❌ paymentSchedule (JSONB para pagos parciales programados)
- ❌ paymentReminders (JSONB para recordatorios)
- ❌ cloudinaryInvoiceUrl (URL de factura en Cloudinary)

#### ✅ SupplierCatalogItem.js - Catálogo de Proveedores
```javascript
- supplierId, supplierSku ✅
- name, description, category, subcategory ✅
- brand, price, currency, unit ✅
- minimumOrder, maximumOrder, leadTime ✅
- available, specifications ✅
- images (JSON array) ✅
- lastUpdate, validUntil ✅
```

**⚠️ MEJORA SUGERIDA:**
- ⚠️ Vincular con productId interno (opcional)
- ⚠️ businessId para que cada negocio vea su propio catálogo curado

#### ✅ SupplierContact.js - Contactos
✅ COMPLETO - No requiere cambios

#### ✅ SupplierEvaluation.js - Evaluaciones
✅ COMPLETO - No requiere cambios

---

### 2. **Controladores Backend**

#### ✅ productController.js
```javascript
✅ getProducts (con filtros)
✅ getProductById
✅ createProduct
✅ updateProduct
✅ deleteProduct (soft delete)
✅ getCategories
✅ bulkInitialStock
```

**⚠️ FALTA:**
- ❌ Stock por sucursal
- ❌ Transferencias entre sucursales
- ❌ Retiros por especialistas

#### ⚠️ BusinessInventoryController.js
```javascript
✅ CRUD de productos
✅ Gestión de categorías
✅ Ajuste de stock
⚠️ Reportes básicos
```

**⚠️ FALTA:**
- ❌ Multi-sucursal support
- ❌ Cloudinary integration para imágenes

#### ✅ BusinessSupplierController.js
```javascript
✅ CRUD de proveedores
✅ Gestión de contactos
✅ Órdenes de compra
✅ Procesamiento de facturas
✅ Evaluación de proveedores
✅ Catálogo de productos
✅ Reportes
```

**⚠️ FALTA:**
- ❌ Pagos parciales programados
- ❌ Recordatorios de pago
- ❌ Dashboard de facturas pendientes
- ❌ Upload de facturas a Cloudinary

#### ⚠️ AppointmentProductController.js
```javascript
✅ recordUsedProducts (registra productos en citas)
✅ getUsedProducts
✅ updateUsedProduct
✅ deleteUsedProduct
✅ getAvailableProducts
```

**⚠️ FALTA:**
- ❌ Registro de especialista que retira
- ❌ Stock por sucursal

---

### 3. **Frontend Components**

#### ✅ InventoryDashboard.jsx
```javascript
✅ Tabs: Stock Inicial, Productos, Compras, Ventas, Movimientos, Reportes
⚠️ Solo Stock Inicial implementado
```

#### ✅ StockInitial.jsx
```javascript
✅ Carga masiva de stock inicial
✅ Selección de productos
✅ Cantidad y costo por producto
✅ Confirmación de carga
```

**⚠️ FALTA:**
- ❌ Selección de sucursal
- ❌ Upload de imágenes con Cloudinary

#### ⚠️ InventoryConfigSection.jsx
```javascript
✅ Habilitación de inventario
✅ Configuraciones básicas
✅ Gestión de categorías
```

**⚠️ FALTA:**
- ❌ Configuración de Cloudinary
- ❌ Configuración multi-sucursal

#### ⚠️ SuppliersConfigSection.jsx
```javascript
✅ CRUD de proveedores
✅ Categorías de proveedores
✅ Términos de pago
```

**⚠️ FALTA:**
- ❌ Vista completa de catálogo
- ❌ Upload de imágenes de productos

---

## ❌ LO QUE FALTA IMPLEMENTAR

### 🔴 PRIORIDAD ALTA - Funcionalidad Core

#### 1. **Stock Multi-Sucursal**

**Database Changes:**
```sql
-- Nuevo modelo: BranchStock
CREATE TABLE branch_stocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id),
  branch_id UUID NOT NULL REFERENCES branches(id),
  product_id UUID NOT NULL REFERENCES products(id),
  current_stock INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER NOT NULL DEFAULT 0,
  max_stock INTEGER NOT NULL DEFAULT 0,
  last_count_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(branch_id, product_id)
);

CREATE INDEX idx_branch_stocks_branch ON branch_stocks(branch_id);
CREATE INDEX idx_branch_stocks_product ON branch_stocks(product_id);
CREATE INDEX idx_branch_stocks_business ON branch_stocks(business_id);
```

**Modelo Sequelize:**
```javascript
// BranchStock.js
const BranchStock = sequelize.define('BranchStock', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  businessId: { type: DataTypes.UUID, allowNull: false },
  branchId: { type: DataTypes.UUID, allowNull: false },
  productId: { type: DataTypes.UUID, allowNull: false },
  currentStock: { type: DataTypes.INTEGER, defaultValue: 0 },
  minStock: { type: DataTypes.INTEGER, defaultValue: 0 },
  maxStock: { type: DataTypes.INTEGER, defaultValue: 0 },
  lastCountDate: { type: DataTypes.DATE }
});
```

**Endpoints necesarios:**
```javascript
GET    /api/branches/:branchId/inventory/products
GET    /api/branches/:branchId/inventory/products/:productId
POST   /api/branches/:branchId/inventory/adjust-stock
POST   /api/branches/:branchId/inventory/transfer (transferir entre sucursales)
GET    /api/branches/:branchId/inventory/low-stock
```

#### 2. **Transferencias Entre Sucursales**

**Modelo:**
```javascript
// BranchTransfer.js
const BranchTransfer = sequelize.define('BranchTransfer', {
  id: UUID,
  businessId: UUID,
  productId: UUID,
  fromBranchId: UUID,
  toBranchId: UUID,
  quantity: INTEGER,
  status: ENUM('PENDING', 'IN_TRANSIT', 'RECEIVED', 'CANCELLED'),
  requestedBy: UUID,
  approvedBy: UUID,
  receivedBy: UUID,
  notes: TEXT,
  requestedAt: DATE,
  approvedAt: DATE,
  receivedAt: DATE
});
```

**Endpoints:**
```javascript
POST   /api/inventory/transfers (solicitar transferencia)
GET    /api/inventory/transfers (listar transferencias)
PUT    /api/inventory/transfers/:id/approve
PUT    /api/inventory/transfers/:id/receive
PUT    /api/inventory/transfers/:id/cancel
```

#### 3. **Registro de Retiros por Especialistas**

**Actualizar InventoryMovement:**
```sql
ALTER TABLE inventory_movements 
ADD COLUMN specialist_id UUID REFERENCES users(id),
ADD COLUMN appointment_id UUID REFERENCES appointments(id),
ADD COLUMN branch_id UUID REFERENCES branches(id);

CREATE INDEX idx_inventory_movements_specialist ON inventory_movements(specialist_id);
CREATE INDEX idx_inventory_movements_appointment ON inventory_movements(appointment_id);
CREATE INDEX idx_inventory_movements_branch ON inventory_movements(branch_id);
```

**Endpoints:**
```javascript
POST   /api/appointments/:appointmentId/products/withdraw
GET    /api/specialists/:specialistId/product-usage
GET    /api/reports/product-usage-by-specialist
```

#### 4. **Tipo de Producto (Venta vs Procedimientos)**

**Actualizar Product Model:**
```sql
ALTER TABLE products 
ADD COLUMN product_type VARCHAR(20) DEFAULT 'BOTH',
ADD COLUMN requires_specialist_tracking BOOLEAN DEFAULT false;

-- product_type: 'FOR_SALE', 'FOR_PROCEDURES', 'BOTH'
```

**Lógica:**
- `FOR_SALE`: Solo se vende, no se usa en procedimientos
- `FOR_PROCEDURES`: Solo se usa en procedimientos (con tracking de especialista)
- `BOTH`: Puede venderse o usarse en procedimientos

---

### 🟡 PRIORIDAD MEDIA - Gestión de Proveedores Avanzada

#### 5. **Catálogo de Proveedores con Imágenes (Cloudinary)**

**Frontend Component:**
```javascript
// SupplierCatalog.jsx
- Vista de catálogo por proveedor
- Grid de productos con imágenes
- Upload de imágenes con Cloudinary
- Sincronización con productos internos
- Importar productos del catálogo al inventario
```

**Cloudinary Integration:**
```javascript
// services/cloudinary.js
const uploadProductImage = async (file, businessId, supplierId) => {
  const folder = `businesses/${businessId}/suppliers/${supplierId}/catalog`;
  // Upload logic
};
```

**Actualizar SupplierCatalogItem:**
```javascript
images: {
  type: DataTypes.JSONB,
  defaultValue: [],
  // Estructura: [{ url, publicId, thumbnail, order }]
}
```

#### 6. **Facturas con Pagos Parciales y Recordatorios**

**Actualizar SupplierInvoice:**
```sql
ALTER TABLE supplier_invoices
ADD COLUMN payment_schedule JSONB DEFAULT '[]',
ADD COLUMN payment_reminders JSONB DEFAULT '[]',
ADD COLUMN cloudinary_invoice_url VARCHAR(500);
```

**Estructura de payment_schedule:**
```javascript
paymentSchedule: [
  {
    id: 'uuid',
    dueDate: '2025-01-15',
    amount: 500000,
    status: 'PENDING', // 'PENDING', 'PAID', 'OVERDUE'
    paidDate: null,
    paymentMethod: null,
    notes: ''
  }
]
```

**Estructura de payment_reminders:**
```javascript
paymentReminders: [
  {
    id: 'uuid',
    dueDate: '2025-01-15',
    reminderDate: '2025-01-10',
    status: 'PENDING', // 'PENDING', 'SENT', 'DISMISSED'
    sentAt: null,
    sentTo: ['email@example.com']
  }
]
```

**Endpoints:**
```javascript
POST   /api/supplier-invoices (con upload a Cloudinary)
PUT    /api/supplier-invoices/:id/payment-schedule
POST   /api/supplier-invoices/:id/record-payment
GET    /api/supplier-invoices/pending-payments
GET    /api/supplier-invoices/upcoming-payments (próximos 7/15/30 días)
POST   /api/supplier-invoices/:id/send-reminder
```

**Background Jobs:**
```javascript
// Cron job diario para enviar recordatorios
const checkPaymentReminders = async () => {
  const today = new Date();
  // Buscar invoices con recordatorios para hoy
  // Enviar emails/notificaciones
};
```

#### 7. **Dashboard de Facturas Pendientes**

**Frontend Component:**
```javascript
// PendingInvoicesDashboard.jsx
- Lista de facturas pendientes
- Filtros por proveedor, fecha, monto
- Indicadores de vencimiento (color coding)
- Calendario de pagos programados
- Alertas de facturas vencidas
- Botón de pago rápido
- Historial de pagos por factura
```

---

### 🟢 PRIORIDAD BAJA - Mejoras y Reportes

#### 8. **Reportes de Inventario**

**Endpoints:**
```javascript
GET    /api/reports/inventory/valuation (valorización total)
GET    /api/reports/inventory/turnover (rotación de productos)
GET    /api/reports/inventory/low-stock
GET    /api/reports/inventory/expiring-products
GET    /api/reports/inventory/movements-by-branch
GET    /api/reports/inventory/specialist-usage
GET    /api/reports/supplier-performance
```

#### 9. **Configuración de Cloudinary en Settings**

**BusinessSettings Update:**
```javascript
cloudinaryConfig: {
  cloudName: '',
  uploadPreset: '',
  folder: 'beauty-control',
  maxFileSize: 5242880, // 5MB
  allowedFormats: ['jpg', 'jpeg', 'png', 'webp']
}
```

---

## 📊 PLAN DE IMPLEMENTACIÓN SUGERIDO

### **FASE 1: Multi-Sucursal Core (2-3 días)**
1. ✅ Crear modelo BranchStock
2. ✅ Actualizar Product con branchId reference
3. ✅ Actualizar InventoryMovement con branchId, specialistId
4. ✅ Endpoints de stock por sucursal
5. ✅ Actualizar StockInitial.jsx con selector de sucursal
6. ✅ Testing

### **FASE 2: Transferencias Entre Sucursales (2 días)**
1. ✅ Crear modelo BranchTransfer
2. ✅ Endpoints CRUD de transferencias
3. ✅ Frontend: Vista de transferencias
4. ✅ Workflow de aprobación
5. ✅ Testing

### **FASE 3: Productos para Procedimientos (1-2 días)**
1. ✅ Actualizar Product con productType
2. ✅ Actualizar AppointmentProductController
3. ✅ Registro de especialista en retiros
4. ✅ Reportes de uso por especialista
5. ✅ Testing

### **FASE 4: Cloudinary Integration (2 días)**
1. ✅ Configuración de Cloudinary en settings
2. ✅ Service de upload
3. ✅ Actualizar ProductForm con image upload
4. ✅ Actualizar SupplierCatalog con images
5. ✅ Gallery component
6. ✅ Testing

### **FASE 5: Facturas Avanzadas (3 días)**
1. ✅ Actualizar SupplierInvoice con payment_schedule
2. ✅ Upload de facturas a Cloudinary
3. ✅ Endpoints de pagos parciales
4. ✅ Frontend: InvoiceForm con schedule
5. ✅ Frontend: PaymentRecordModal
6. ✅ Cron job de recordatorios
7. ✅ Testing

### **FASE 6: Dashboards y Reportes (2-3 días)**
1. ✅ PendingInvoicesDashboard
2. ✅ InventoryReports
3. ✅ SpecialistUsageReports
4. ✅ SupplierPerformanceReports
5. ✅ Gráficos y visualizaciones
6. ✅ Testing

---

## 🎯 CHECKLIST DE DESARROLLO

### Database Migrations
- [ ] `create-branch-stock-table.sql`
- [ ] `create-branch-transfer-table.sql`
- [ ] `update-products-add-type.sql`
- [ ] `update-inventory-movements-add-fields.sql`
- [ ] `update-supplier-invoices-add-payments.sql`
- [ ] `update-purchase-orders-add-branchId.sql`

### Backend Models
- [ ] BranchStock.js
- [ ] BranchTransfer.js
- [ ] Actualizar Product.js
- [ ] Actualizar InventoryMovement.js
- [ ] Actualizar SupplierInvoice.js
- [ ] Actualizar PurchaseOrder.js
- [ ] Actualizar SupplierCatalogItem.js

### Backend Controllers
- [ ] BranchInventoryController.js
- [ ] BranchTransferController.js
- [ ] Actualizar productController.js
- [ ] Actualizar BusinessSupplierController.js
- [ ] Actualizar AppointmentProductController.js
- [ ] InvoicePaymentController.js

### Backend Services
- [ ] CloudinaryService.js
- [ ] InventoryReportService.js
- [ ] PaymentReminderService.js (cron)

### Backend Routes
- [ ] /api/branches/:branchId/inventory/*
- [ ] /api/inventory/transfers/*
- [ ] /api/supplier-invoices/*/payments
- [ ] /api/reports/inventory/*

### Frontend Components
- [ ] BranchInventoryDashboard.jsx
- [ ] BranchStockList.jsx
- [ ] TransferRequestForm.jsx
- [ ] TransferList.jsx
- [ ] ProductImageUpload.jsx
- [ ] SupplierCatalogView.jsx
- [ ] InvoicePaymentSchedule.jsx
- [ ] PaymentRecordModal.jsx
- [ ] PendingInvoicesDashboard.jsx
- [ ] InventoryReports.jsx
- [ ] SpecialistUsageReport.jsx

### Frontend Redux Slices
- [ ] branchInventorySlice.js
- [ ] branchTransferSlice.js
- [ ] supplierInvoiceSlice.js (actualizar)

---

## 🚀 PRÓXIMOS PASOS INMEDIATOS

**RECOMENDACIÓN:** Empezar con FASE 1 (Multi-Sucursal Core)

1. **Crear migraciones de base de datos**
2. **Crear modelos BranchStock**
3. **Actualizar modelos existentes**
4. **Endpoints de stock por sucursal**
5. **Actualizar frontend para seleccionar sucursal**

¿Quieres que comencemos con la Fase 1? 

