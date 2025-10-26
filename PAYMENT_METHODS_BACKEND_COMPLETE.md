# Sistema de Métodos de Pago y Pagos - Resumen de Implementación

## ✅ Estado: BACKEND COMPLETADO

**Fecha:** 19 de Enero de 2025  
**Fase:** Backend implementado, Frontend pendiente

---

## 📋 Resumen Ejecutivo

Se implementó un sistema completo de gestión de métodos de pago personalizables y registro de pagos para citas. Cada negocio puede definir sus propios métodos de pago (Yape, Plin, Transferencia BCP, etc.) y los especialistas pueden registrar pagos parciales o completos con comprobantes.

### Características Principales

1. **Métodos de Pago Personalizables**
   - Cada negocio define sus propios métodos (no ENUMs fijos)
   - Tipos: CASH, CARD, TRANSFER, QR, ONLINE, OTHER
   - Información bancaria opcional (cuenta, teléfono, etc.)
   - Activación/desactivación sin eliminar datos
   - Ordenamiento personalizable

2. **Registro de Pagos**
   - Pagos parciales y completos
   - Upload de comprobantes a Cloudinary
   - Generación automática de recibos al completar pago
   - Sistema de reembolsos
   - Tracking de quién registró el pago

3. **Seguridad y Auditoría**
   - Registro de IP, dispositivo, ubicación
   - Historial completo de pagos
   - Snapshot de métodos de pago (no se pierde info si se edita/elimina método)

---

## 🗂️ Arquitectura de Base de Datos

### Modelo: BusinessPaymentConfig (MODIFICADO)

**Cambio Principal:**
```javascript
// ANTES: Boolean flags fijos
enabledMethods: {
  creditCard: true,
  debitCard: false,
  pse: true,
  ...
}

// AHORA: Array dinámico de métodos personalizados
paymentMethods: {
  type: DataTypes.JSONB,
  defaultValue: [
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Efectivo',
      type: 'CASH',
      isActive: true,
      requiresProof: false,
      icon: 'cash-outline',
      order: 1,
      createdAt: '2025-01-19T00:00:00Z',
      updatedAt: '2025-01-19T00:00:00Z'
    },
    // ... más métodos
  ]
}
```

**Estructura de Método de Pago:**
```typescript
interface PaymentMethod {
  id: string;                    // UUID generado
  name: string;                  // "Yape", "Plin", "Efectivo"
  type: 'CASH' | 'CARD' | 'TRANSFER' | 'QR' | 'ONLINE' | 'OTHER';
  isActive: boolean;             // Para soft delete
  requiresProof: boolean;        // Si requiere comprobante
  icon: string;                  // Ionicons name
  order: number;                 // Orden de visualización
  bankInfo?: {
    bankName?: string;
    accountNumber?: string;
    accountType?: string;
    holderName?: string;
    cci?: string;
    phoneNumber?: string;        // Para Yape/Plin
  };
  metadata?: Record<string, any>; // Info adicional
  createdAt: string;
  updatedAt: string;
}
```

### Modelo: AppointmentPayment (NUEVO)

**Ubicación:** `packages/backend/src/models/AppointmentPayment.js`

```javascript
AppointmentPayment {
  id: UUID (PK),
  appointmentId: UUID (FK → appointments),
  businessId: UUID (FK → businesses),
  clientId: UUID (FK → clients),
  
  // Detalles del pago
  amount: DECIMAL(10,2),
  paymentMethodId: STRING(50),       // ID del método
  paymentMethodName: STRING(100),    // Snapshot del nombre
  paymentMethodType: STRING(50),     // Snapshot del tipo
  reference: STRING(100),            // Número de operación
  notes: TEXT,
  
  // Comprobante
  proofUrl: STRING(500),             // URL Cloudinary
  proofType: STRING(50),             // MIME type
  
  // Estado
  status: ENUM('PENDING', 'COMPLETED', 'REFUNDED', 'CANCELLED'),
  paymentDate: DATE,
  
  // Auditoría
  registeredBy: UUID (FK → users),
  registeredByRole: STRING(50),      // OWNER, SPECIALIST, RECEPTIONIST
  receiptId: UUID (FK → receipts),   // Auto-generado cuando pago completo
  
  // Metadata
  metadata: JSONB {
    ip: string,
    device: string,
    location: { lat, lng },
    refundReason?: string,
    refundedBy?: UUID,
    refundedAt?: string
  },
  onlinePaymentData: JSONB          // Para Wompi/Stripe
}
```

**Índices Creados:**
- `appointmentId` (individual)
- `businessId` (individual)
- `clientId` (individual)
- `paymentDate` (individual)
- `status` (individual)
- `registeredBy` (individual)
- `appointmentId + status` (compuesto)
- `businessId + paymentDate` (compuesto para reportes)

---

## 🔌 API Endpoints Implementados

### Grupo 1: Configuración de Métodos de Pago

**Base URL:** `/api/business/:businessId/payment-methods`

#### 1. GET `/` - Obtener métodos activos
**Descripción:** Devuelve solo los métodos activos ordenados por `order`  
**Autenticación:** Requerida (Bearer Token)  
**Autorización:** OWNER, RECEPTIONIST, SPECIALIST

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "paymentMethods": [
      {
        "id": "uuid-1",
        "name": "Efectivo",
        "type": "CASH",
        "isActive": true,
        "requiresProof": false,
        "icon": "cash-outline",
        "order": 1
      }
    ]
  }
}
```

#### 2. GET `/all` - Obtener todos los métodos
**Descripción:** Incluye métodos activos e inactivos  
**Uso:** Pantalla de configuración admin

#### 3. POST `/` - Crear método de pago
**Body:**
```json
{
  "name": "Yape",
  "type": "QR",
  "requiresProof": true,
  "icon": "qr-code-outline",
  "bankInfo": {
    "phoneNumber": "+51987654321",
    "holderName": "Juan Pérez"
  }
}
```

**Validaciones:**
- `name` y `type` requeridos
- `type` debe ser uno de: CASH, CARD, TRANSFER, QR, ONLINE, OTHER
- No duplicados de nombre

**Respuesta:**
```json
{
  "success": true,
  "message": "Método de pago creado exitosamente",
  "data": {
    "paymentMethod": {
      "id": "uuid-generated",
      "name": "Yape",
      "type": "QR",
      "isActive": true,
      "requiresProof": true,
      "icon": "qr-code-outline",
      "order": 4,
      "bankInfo": { ... },
      "createdAt": "2025-01-19T...",
      "updatedAt": "2025-01-19T..."
    }
  }
}
```

#### 4. PUT `/:methodId` - Actualizar método
**Body:** (Todos los campos son opcionales)
```json
{
  "name": "Yape - Actualizado",
  "requiresProof": false,
  "bankInfo": {
    "phoneNumber": "+51999999999"
  }
}
```

**Comportamiento:**
- Solo actualiza campos enviados
- Preserva campos no enviados
- Actualiza `updatedAt` automáticamente

#### 5. DELETE `/:methodId` - Eliminar/Desactivar método
**Query Params:**
- `hardDelete=true` → Elimina permanentemente del array
- `hardDelete=false` (default) → Soft delete (isActive = false)

**Soft Delete (recomendado):**
```json
{
  "success": true,
  "message": "Método de pago desactivado exitosamente"
}
```

#### 6. POST `/:methodId/activate` - Reactivar método
**Descripción:** Cambia `isActive = true` en un método desactivado

#### 7. POST `/reorder` - Reordenar métodos
**Body:**
```json
{
  "methodIds": [
    "uuid-3",  // order: 1
    "uuid-1",  // order: 2
    "uuid-2"   // order: 3
  ]
}
```

**Comportamiento:**
- Métodos no incluidos mantienen su orden original
- Útil para drag-and-drop en UI

---

### Grupo 2: Pagos de Citas

**Base URL:** `/api/appointments/:appointmentId/payments`

#### 1. POST `/` - Registrar pago
**Body:**
```json
{
  "amount": 50.00,
  "paymentMethodId": "uuid-of-yape",
  "reference": "OP-123456",
  "notes": "Pago parcial mediante Yape"
}
```

**Validaciones:**
- `amount` > 0
- `amount` <= monto pendiente de la cita
- `paymentMethodId` debe existir y estar activo

**Proceso:**
1. Valida monto y método de pago
2. Crea registro en `appointment_payments`
3. Actualiza `Appointment.paidAmount += amount`
4. Calcula nuevo `paymentStatus`:
   - `PENDING`: paidAmount = 0
   - `PARTIAL`: 0 < paidAmount < totalPrice
   - `PAID`: paidAmount >= totalPrice
5. Si `paymentStatus = PAID` → genera Receipt automáticamente
6. Devuelve pago + recibo (si se generó) + estado actualizado

**Respuesta:**
```json
{
  "success": true,
  "message": "Pago registrado exitosamente",
  "data": {
    "payment": {
      "id": "payment-uuid",
      "amount": 50.00,
      "paymentMethodName": "Yape",
      "paymentMethodType": "QR",
      "reference": "OP-123456",
      "status": "COMPLETED",
      "registeredBy": "user-uuid",
      "registeredByRole": "SPECIALIST",
      "metadata": {
        "ip": "192.168.1.100",
        "device": "iPhone 14 Pro"
      }
    },
    "receipt": null,  // o Receipt si pago completo
    "appointment": {
      "id": "appt-uuid",
      "totalPrice": 150.00,
      "paidAmount": 50.00,
      "paymentStatus": "PARTIAL"
    }
  }
}
```

#### 2. GET `/` - Obtener pagos de cita
**Descripción:** Historial completo de pagos con resumen

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "id": "payment-1",
        "amount": 50.00,
        "paymentMethodName": "Yape",
        "paymentDate": "2025-01-15T10:30:00Z",
        "status": "COMPLETED",
        "proofUrl": "https://cloudinary.com/...",
        "registeredBy": { "firstName": "Juan", "lastName": "Pérez" }
      },
      {
        "id": "payment-2",
        "amount": 100.00,
        "paymentMethodName": "Efectivo",
        "paymentDate": "2025-01-16T14:00:00Z",
        "status": "COMPLETED"
      }
    ],
    "summary": {
      "totalPaid": 150.00,
      "totalRefunded": 0.00,
      "netPaid": 150.00,
      "appointmentTotal": 150.00,
      "pendingAmount": 0.00,
      "paymentStatus": "PAID"
    }
  }
}
```

#### 3. POST `/:paymentId/proof` - Subir comprobante
**Content-Type:** `multipart/form-data`  
**Field Name:** `proof`  
**Formatos:** JPEG, PNG, WEBP, PDF  
**Tamaño Max:** 10 MB

**Proceso:**
1. Valida archivo (formato y tamaño)
2. Sube a Cloudinary: `beauty-control/payments/{appointmentId}/{timestamp}-{filename}`
3. Actualiza `payment.proofUrl` y `payment.proofType`
4. Elimina archivo temporal

**Respuesta:**
```json
{
  "success": true,
  "message": "Comprobante de pago subido exitosamente",
  "data": {
    "payment": {
      "id": "payment-uuid",
      "proofUrl": "https://res.cloudinary.com/beauty-control/payments/appt-123/1737244800000-comprobante.jpg",
      "proofType": "image/jpeg"
    }
  }
}
```

#### 4. POST `/:paymentId/refund` - Reembolsar pago
**Body:**
```json
{
  "reason": "Cliente solicitó cancelación del servicio"
}
```

**Proceso:**
1. Valida que pago no esté ya reembolsado
2. Actualiza `payment.status = 'REFUNDED'`
3. Resta `amount` de `Appointment.paidAmount`
4. Recalcula `Appointment.paymentStatus`
5. Registra en `metadata`: `refundReason`, `refundedBy`, `refundedAt`

**Respuesta:**
```json
{
  "success": true,
  "message": "Pago reembolsado exitosamente",
  "data": {
    "payment": {
      "id": "payment-uuid",
      "status": "REFUNDED",
      "metadata": {
        "refundReason": "Cliente solicitó cancelación",
        "refundedBy": "user-uuid",
        "refundedAt": "2025-01-19T15:30:00Z"
      }
    },
    "appointment": {
      "paidAmount": 0.00,
      "paymentStatus": "PENDING"
    }
  }
}
```

---

## 🛠️ Controladores Implementados

### PaymentConfigController.js (450 líneas)
**Ubicación:** `packages/backend/src/controllers/PaymentConfigController.js`

**Métodos:**
```javascript
class PaymentConfigController {
  static async getPaymentMethods(req, res)      // GET /payment-methods
  static async getAllPaymentMethods(req, res)   // GET /payment-methods/all
  static async createPaymentMethod(req, res)    // POST /payment-methods
  static async updatePaymentMethod(req, res)    // PUT /payment-methods/:methodId
  static async deletePaymentMethod(req, res)    // DELETE /payment-methods/:methodId
  static async activatePaymentMethod(req, res)  // POST /payment-methods/:methodId/activate
  static async reorderPaymentMethods(req, res)  // POST /payment-methods/reorder
}
```

**Características:**
- Auto-crea BusinessPaymentConfig con métodos default si no existe
- Genera UUIDs para nuevos métodos con `uuid.v4()`
- Valida tipos de pago contra lista permitida
- Previene duplicados de nombre
- Maneja soft/hard delete
- Reordenamiento con manejo de IDs faltantes

### AppointmentPaymentControllerV2.js (480 líneas)
**Ubicación:** `packages/backend/src/controllers/AppointmentPaymentControllerV2.js`

**Métodos:**
```javascript
class AppointmentPaymentControllerV2 {
  static async registerPayment(req, res)        // POST /payments
  static async getAppointmentPayments(req, res) // GET /payments
  static async uploadPaymentProof(req, res)     // POST /payments/:id/proof
  static async refundPayment(req, res)          // POST /payments/:id/refund
  
  // Helpers privados
  static async generateReceipt(appointment, payment)
  static getPaymentProofMulter()                // Configuración Multer
}
```

**Características:**
- Validación de montos vs saldo pendiente
- Actualización automática de `Appointment.paymentStatus`
- Generación automática de Receipts con numeración secuencial
- Upload a Cloudinary con organización por cita
- Tracking completo de auditoría (IP, device, user)
- Sistema de reembolsos con logging

---

## 🚀 Archivos Creados/Modificados

### Creados
- ✅ `packages/backend/src/models/AppointmentPayment.js` (200 líneas)
- ✅ `packages/backend/src/controllers/PaymentConfigController.js` (450 líneas)
- ✅ `packages/backend/src/controllers/AppointmentPaymentControllerV2.js` (480 líneas)
- ✅ `packages/backend/src/routes/paymentRoutes.js` (150 líneas)
- ✅ `packages/backend/migrations/20250119000000-create-appointment-payments.js` (200 líneas)
- ✅ `payment_methods_insomnia.json` (colección de Insomnia con 15+ requests)

### Modificados
- ✅ `packages/backend/src/models/BusinessPaymentConfig.js`
  - Cambió `enabledMethods` (boolean flags) → `paymentMethods` (JSONB array)
  - Agregó métodos default: Efectivo, Tarjeta, Transferencia

- ✅ `packages/backend/src/app.js`
  - Agregado: `const paymentRoutes = require('./routes/paymentRoutes');`
  - Agregado: `app.use('/api', paymentRoutes);`

---

## 🧪 Testing

### Colección Insomnia
**Archivo:** `payment_methods_insomnia.json`

**Variables de Entorno:**
```json
{
  "base_url": "http://localhost:3000/api",
  "auth_token": "tu-token-aqui",
  "business_id": "uuid-del-negocio",
  "appointment_id": "uuid-de-cita",
  "payment_method_id": "uuid-de-metodo",
  "payment_id": "uuid-de-pago"
}
```

**Carpetas:**
1. **Payment Methods Configuration** (8 requests)
   - Get active methods
   - Get all methods
   - Create: Yape, Plin, Transferencia BCP
   - Update method
   - Delete (soft/hard)
   - Activate
   - Reorder

2. **Appointment Payments** (5 requests)
   - Register payment (partial/full)
   - Get payments
   - Upload proof
   - Refund

3. **Test Scenarios** (3 requests)
   - Pago parcial 1/3 (S/. 100 via Yape)
   - Pago parcial 2/3 (S/. 100 efectivo)
   - Pago final 3/3 (S/. 100 transferencia) → genera recibo

### Flujo de Prueba Recomendado

**Paso 1: Configurar Métodos de Pago**
```bash
# 1. Obtener métodos default del negocio
GET /api/business/{businessId}/payment-methods

# 2. Crear método Yape
POST /api/business/{businessId}/payment-methods
{
  "name": "Yape",
  "type": "QR",
  "requiresProof": true,
  "icon": "qr-code-outline",
  "bankInfo": {
    "phoneNumber": "+51987654321",
    "holderName": "Beauty Salon"
  }
}

# 3. Crear método Plin
# 4. Reordenar métodos si es necesario
```

**Paso 2: Registrar Pagos**
```bash
# Suponer: Cita con totalPrice = S/. 300

# 1. Primer pago parcial (S/. 100)
POST /api/appointments/{appointmentId}/payments
{
  "amount": 100.00,
  "paymentMethodId": "{yape-uuid}",
  "reference": "YAPE-001",
  "notes": "Primera cuota"
}
# Respuesta: paymentStatus = "PARTIAL"

# 2. Subir comprobante
POST /api/appointments/{appointmentId}/payments/{paymentId}/proof
(form-data con archivo comprobante.jpg)

# 3. Segundo pago parcial (S/. 100)
POST /api/appointments/{appointmentId}/payments
{
  "amount": 100.00,
  "paymentMethodId": "{efectivo-uuid}",
  "notes": "Segunda cuota - Efectivo"
}
# Respuesta: paymentStatus = "PARTIAL"

# 4. Pago final (S/. 100)
POST /api/appointments/{appointmentId}/payments
{
  "amount": 100.00,
  "paymentMethodId": "{transfer-uuid}",
  "reference": "TRF-789",
  "notes": "Última cuota"
}
# Respuesta: paymentStatus = "PAID", receipt = { receiptNumber: "R-001", ... }

# 5. Ver historial de pagos
GET /api/appointments/{appointmentId}/payments
# Respuesta: 3 pagos + summary con totalPaid = 300
```

**Paso 3: Probar Reembolso**
```bash
# Reembolsar el segundo pago
POST /api/appointments/{appointmentId}/payments/{payment2-id}/refund
{
  "reason": "Error en el registro"
}
# Respuesta: paymentStatus vuelve a "PARTIAL", paidAmount = 200
```

---

## 📱 Pendiente: Frontend

### Pantallas a Implementar

#### 1. PaymentMethodsScreen
**Ubicación:** `packages/business-control-mobile/src/screens/settings/PaymentMethodsScreen.js`

**Funcionalidad:**
- Lista de métodos de pago con drag-to-reorder
- Botón "+" para agregar método nuevo
- Switch para activar/desactivar métodos
- Modal de edición con formulario completo

**Componentes:**
```typescript
<PaymentMethodsScreen>
  <FlatList>
    <PaymentMethodCard
      method={method}
      onEdit={() => openEditModal(method)}
      onToggle={(id) => toggleMethod(id)}
      onDelete={(id) => confirmDelete(id)}
    />
  </FlatList>
  <FAB onPress={openCreateModal} />
  
  <PaymentMethodFormModal
    visible={modalVisible}
    method={selectedMethod}  // null para crear, object para editar
    onSave={handleSave}
    onCancel={closeModal}
  />
</PaymentMethodsScreen>
```

**Campos del Formulario:**
- Nombre del método (text input)
- Tipo (picker: Efectivo, Tarjeta, Transferencia, QR, etc.)
- ¿Requiere comprobante? (switch)
- Icono (picker de Ionicons)
- Información bancaria (conditional):
  - Si tipo = TRANSFER: banco, cuenta, CCI, titular
  - Si tipo = QR: teléfono, titular
- Notas/descripción (textarea)

#### 2. PaymentRegistrationModal
**Ubicación:** `packages/business-control-mobile/src/components/appointments/PaymentRegistrationModal.js`

**Props:**
```typescript
interface PaymentRegistrationModalProps {
  visible: boolean;
  appointment: Appointment;  // Incluye totalPrice, paidAmount
  onClose: () => void;
  onSuccess: () => void;
}
```

**UI:**
```typescript
<Modal visible={visible}>
  <View>
    <Text>Total: S/. {appointment.totalPrice}</Text>
    <Text>Pagado: S/. {appointment.paidAmount}</Text>
    <Text>Pendiente: S/. {pendingAmount}</Text>
    
    <TextInput
      label="Monto a pagar"
      keyboardType="decimal-pad"
      value={amount}
      maxValue={pendingAmount}
    />
    
    <Picker
      label="Método de pago"
      selectedValue={selectedMethod}
      onValueChange={setSelectedMethod}
    >
      {paymentMethods.map(method => (
        <Picker.Item
          key={method.id}
          label={method.name}
          value={method.id}
        />
      ))}
    </Picker>
    
    {selectedMethod?.requiresProof && (
      <TouchableOpacity onPress={pickImage}>
        <Text>📎 Adjuntar comprobante *</Text>
      </TouchableOpacity>
    )}
    
    {proofUri && <Image source={{ uri: proofUri }} />}
    
    <TextInput
      label="Número de referencia"
      value={reference}
      placeholder="OP-123456"
    />
    
    <TextInput
      label="Notas"
      multiline
      value={notes}
    />
    
    <Button
      title="Registrar Pago"
      onPress={handleRegisterPayment}
      disabled={!amount || !selectedMethod || (selectedMethod.requiresProof && !proofUri)}
    />
  </View>
</Modal>
```

**Lógica:**
```typescript
const handleRegisterPayment = async () => {
  // 1. Registrar pago
  const response = await api.post(`/appointments/${appointmentId}/payments`, {
    amount,
    paymentMethodId: selectedMethod.id,
    reference,
    notes
  });
  
  const { payment } = response.data;
  
  // 2. Si hay comprobante, subirlo
  if (proofUri) {
    const formData = new FormData();
    formData.append('proof', {
      uri: proofUri,
      type: 'image/jpeg',
      name: 'comprobante.jpg'
    });
    
    await api.post(
      `/appointments/${appointmentId}/payments/${payment.id}/proof`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
  }
  
  // 3. Mostrar éxito
  Alert.alert('Éxito', 'Pago registrado correctamente');
  onSuccess();
  onClose();
};
```

#### 3. AppointmentDetailModal (Modificar Existente)
**Agregar Sección de Pagos:**

```typescript
<View style={styles.paymentSection}>
  <View style={styles.paymentSummary}>
    <Text>Total: S/. {appointment.totalPrice}</Text>
    <Text>Pagado: S/. {appointment.paidAmount}</Text>
    <Text>Pendiente: S/. {pendingAmount}</Text>
    <Badge
      value={appointment.paymentStatus}
      color={getStatusColor(appointment.paymentStatus)}
    />
  </View>
  
  {appointment.payments?.length > 0 && (
    <View style={styles.paymentHistory}>
      <Text style={styles.sectionTitle}>Historial de Pagos</Text>
      {appointment.payments.map(payment => (
        <PaymentHistoryItem
          key={payment.id}
          payment={payment}
          onViewProof={() => openProof(payment.proofUrl)}
        />
      ))}
    </View>
  )}
  
  <View style={styles.actions}>
    {pendingAmount > 0 && (
      <Button
        title="Registrar Pago"
        onPress={() => setPaymentModalVisible(true)}
      />
    )}
    <Button
      title="Ver Todos los Pagos"
      variant="outline"
      onPress={() => navigate('PaymentHistory', { appointmentId })}
    />
  </View>
</View>

<PaymentRegistrationModal
  visible={paymentModalVisible}
  appointment={appointment}
  onClose={() => setPaymentModalVisible(false)}
  onSuccess={refreshAppointment}
/>
```

**Badges de Estado:**
```typescript
const getStatusColor = (status) => {
  switch(status) {
    case 'PENDING': return '#FF9800';  // Naranja
    case 'PARTIAL': return '#2196F3';  // Azul
    case 'PAID': return '#4CAF50';     // Verde
    default: return '#9E9E9E';         // Gris
  }
};
```

---

## 📊 Flujos de Usuario

### Flujo 1: Configurar Métodos de Pago (Owner)
```
1. Owner abre Configuración
2. Navega a "Métodos de Pago"
3. Ve lista de métodos default (Efectivo, Tarjeta, Transferencia)
4. Toca "+" para agregar nuevo
5. Completa formulario:
   - Nombre: "Yape"
   - Tipo: QR
   - Requiere comprobante: Sí
   - Teléfono: +51987654321
6. Guarda → POST /api/business/{id}/payment-methods
7. Método aparece en lista
8. Puede drag-to-reorder → POST /api/business/{id}/payment-methods/reorder
```

### Flujo 2: Registrar Pago Completo (Specialist)
```
1. Specialist ve calendario de citas
2. Toca cita de cliente
3. AppointmentDetailModal muestra:
   - Total: S/. 150
   - Pagado: S/. 0
   - Pendiente: S/. 150
   - Estado: PENDIENTE 🟠
4. Toca "Registrar Pago"
5. PaymentRegistrationModal se abre
6. Completa:
   - Monto: S/. 150
   - Método: Efectivo
   - Notas: "Pago completo en efectivo"
7. Toca "Registrar Pago"
8. Backend:
   - Crea AppointmentPayment
   - Actualiza Appointment.paidAmount = 150
   - Actualiza Appointment.paymentStatus = PAID
   - Genera Receipt R-001
9. Modal cierra, detalle se actualiza:
   - Total: S/. 150
   - Pagado: S/. 150 ✅
   - Pendiente: S/. 0
   - Estado: PAGADO 🟢
   - Recibo: R-001
```

### Flujo 3: Registrar Pagos Parciales con Comprobante (Receptionist)
```
1. Cliente paga S/. 100 de S/. 300 via Yape
2. Receptionist abre cita
3. Toca "Registrar Pago"
4. Completa:
   - Monto: S/. 100
   - Método: Yape (requiresProof = true)
   - Campo de comprobante aparece obligatorio
5. Toca "Adjuntar comprobante"
6. Selecciona foto de galería
7. Número de referencia: YAPE-123
8. Toca "Registrar Pago"
9. Backend:
   - POST /appointments/{id}/payments → crea pago
   - POST /appointments/{id}/payments/{id}/proof → sube imagen a Cloudinary
   - Actualiza paymentStatus = PARTIAL
10. Detalle muestra:
   - Total: S/. 300
   - Pagado: S/. 100
   - Pendiente: S/. 200
   - Estado: PARCIAL 🔵
11. Cliente paga otros S/. 100 en efectivo (no requiere comprobante)
12. Specialist repite proceso sin adjuntar archivo
13. Detalle actualiza: Pagado S/. 200, Pendiente S/. 100
14. Cliente paga últimos S/. 100 via transferencia
15. Backend genera Receipt R-001 automáticamente
16. Estado final: PAGADO 🟢
```

---

## 🔒 Seguridad y Permisos

### Autenticación
Todos los endpoints requieren:
```javascript
router.use(authenticateToken);
```

### Autorización por Endpoint

**Configuración de Métodos de Pago:**
```javascript
// Solo OWNER puede gestionar métodos de pago
router.post('/.../payment-methods', authorizeRole(['OWNER']), ...)
router.put('/.../payment-methods/:id', authorizeRole(['OWNER']), ...)
router.delete('/.../payment-methods/:id', authorizeRole(['OWNER']), ...)
```

**Registro de Pagos:**
```javascript
// OWNER, RECEPTIONIST, SPECIALIST pueden registrar pagos
router.post('/appointments/:id/payments', 
  authorizeRole(['OWNER', 'RECEPTIONIST', 'SPECIALIST']), 
  ...
)
```

**Reembolsos:**
```javascript
// Solo OWNER puede reembolsar
router.post('/appointments/:id/payments/:id/refund',
  authorizeRole(['OWNER']),
  ...
)
```

### Validación de Negocio
```javascript
// Verificar que el appointment pertenece al negocio del usuario
const appointment = await Appointment.findOne({
  where: {
    id: appointmentId,
    businessId: req.user.businessId
  }
});

if (!appointment) {
  return res.status(404).json({ error: 'Cita no encontrada' });
}
```

### Auditoría
Cada pago registra:
```javascript
metadata: {
  ip: req.ip,
  userAgent: req.headers['user-agent'],
  device: extractDevice(req.headers['user-agent']),
  location: req.body.location,  // Si frontend envía geolocation
  registeredAt: new Date(),
  registeredBy: req.user.id,
  registeredByRole: req.user.role
}
```

---

## 🚦 Estados de Pago

### Appointment.paymentStatus
```javascript
ENUM('PENDING', 'PARTIAL', 'PAID')

// Calculado automáticamente en cada pago:
if (paidAmount === 0) {
  paymentStatus = 'PENDING';
} else if (paidAmount < totalPrice) {
  paymentStatus = 'PARTIAL';
} else {
  paymentStatus = 'PAID';
}
```

### AppointmentPayment.status
```javascript
ENUM('PENDING', 'COMPLETED', 'REFUNDED', 'CANCELLED')

// Estados normales:
'COMPLETED' → Pago exitoso (default)
'REFUNDED' → Pago reembolsado
'CANCELLED' → Pago cancelado antes de completarse
'PENDING' → Pago online pendiente de confirmación (Wompi/Stripe)
```

---

## 🧩 Integraciones

### Cloudinary
**Configuración en `.env`:**
```
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**Upload de Comprobantes:**
```javascript
const result = await cloudinary.uploader.upload(file.path, {
  folder: `beauty-control/payments/${appointmentId}`,
  resource_type: 'auto',
  public_id: `${Date.now()}-${file.originalname}`
});

payment.proofUrl = result.secure_url;
payment.proofType = file.mimetype;
```

**Formatos Soportados:**
- Imágenes: JPEG, PNG, WEBP
- Documentos: PDF
- Tamaño máximo: 10 MB

### Receipts
**Generación Automática:**
```javascript
// Cuando paymentStatus cambia a 'PAID'
const lastReceipt = await Receipt.findOne({
  where: { businessId },
  order: [['receiptNumber', 'DESC']]
});

const nextNumber = lastReceipt ? lastReceipt.receiptNumber + 1 : 1;

const receipt = await Receipt.create({
  receiptNumber: nextNumber,
  businessId,
  appointmentId,
  clientId,
  totalAmount: appointment.totalPrice,
  receiptDate: new Date(),
  generatedBy: payment.registeredBy
});

payment.receiptId = receipt.id;
```

---

## 📈 Reportes y Analytics (Futuro)

### Queries Preparadas para Reportes

**1. Pagos por Método (Último Mes):**
```sql
SELECT 
  payment_method_name,
  COUNT(*) as total_transactions,
  SUM(amount) as total_amount
FROM appointment_payments
WHERE business_id = ? 
  AND payment_date >= NOW() - INTERVAL '30 days'
  AND status = 'COMPLETED'
GROUP BY payment_method_name
ORDER BY total_amount DESC;
```

**2. Pagos por Día:**
```sql
SELECT 
  DATE(payment_date) as date,
  COUNT(*) as transactions,
  SUM(amount) as total
FROM appointment_payments
WHERE business_id = ? 
  AND payment_date >= NOW() - INTERVAL '7 days'
  AND status = 'COMPLETED'
GROUP BY DATE(payment_date)
ORDER BY date DESC;
```

**3. Tasa de Pagos Completos vs Parciales:**
```sql
SELECT 
  payment_status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM appointments
WHERE business_id = ?
  AND appointment_date >= NOW() - INTERVAL '30 days'
GROUP BY payment_status;
```

---

## ✅ Checklist de Implementación

### Backend
- [x] Modificar modelo BusinessPaymentConfig (JSONB array)
- [x] Crear modelo AppointmentPayment
- [x] Crear PaymentConfigController
- [x] Crear AppointmentPaymentControllerV2
- [x] Crear paymentRoutes.js
- [x] Registrar rutas en app.js
- [x] Crear migración appointment_payments
- [x] Ejecutar migración
- [ ] Testear endpoints con Insomnia
- [ ] Validar generación de receipts
- [ ] Validar reembolsos

### Frontend
- [ ] Crear PaymentMethodsScreen
- [ ] Crear PaymentMethodFormModal
- [ ] Crear PaymentRegistrationModal
- [ ] Modificar AppointmentDetailModal (agregar sección de pagos)
- [ ] Crear PaymentHistoryItem component
- [ ] Implementar image picker para comprobantes
- [ ] Agregar navegación a Payment Methods en Settings
- [ ] Testear flujo completo de pagos
- [ ] Testear upload de comprobantes
- [ ] Validar actualización en tiempo real de estados

### Documentación
- [x] Crear PAYMENT_METHODS_BACKEND_COMPLETE.md
- [x] Crear colección Insomnia
- [ ] Crear guía de usuario (Owner)
- [ ] Crear guía de usuario (Specialist/Receptionist)
- [ ] Screenshots de UI
- [ ] Video demo del flujo completo

---

## 🎯 Próximos Pasos

### Paso 1: Testing Backend
```bash
# 1. Importar colección en Insomnia
# 2. Configurar variables de entorno
# 3. Ejecutar requests en orden:
#    - GET payment methods (verificar defaults)
#    - POST crear Yape
#    - POST crear Plin
#    - POST crear Transferencia BCP
#    - POST reorder
#    - POST registrar pago parcial
#    - POST upload proof
#    - POST registrar pago final (verificar receipt)
#    - GET historial de pagos
#    - POST refund
```

### Paso 2: Implementar Frontend
```bash
# 1. Crear PaymentMethodsScreen (configuración admin)
# 2. Crear PaymentRegistrationModal (registro de pagos)
# 3. Modificar AppointmentDetailModal (mostrar pagos)
# 4. Testear flujo completo
```

### Paso 3: Integrar Sistema de Consentimientos
```bash
# Próxima feature:
# - ConsentSignatureModal con react-native-signature-canvas
# - Vincular consentimientos a servicios
# - Validar firma antes de permitir servicio
```

---

## 🐛 Troubleshooting

### Error: "Payment method not found"
**Causa:** El `paymentMethodId` enviado no existe en BusinessPaymentConfig.paymentMethods  
**Solución:** 
```javascript
// Verificar métodos disponibles primero
GET /api/business/{businessId}/payment-methods

// Usar el ID correcto del método
{
  "paymentMethodId": "550e8400-e29b-41d4-a716-446655440001"  // ✅ UUID válido
}
```

### Error: "Payment amount exceeds pending amount"
**Causa:** Intentar pagar más del monto pendiente  
**Solución:**
```javascript
// Calcular monto pendiente
const pendingAmount = appointment.totalPrice - appointment.paidAmount;

// Validar antes de enviar
if (amount > pendingAmount) {
  Alert.alert('Error', `Monto máximo permitido: S/. ${pendingAmount}`);
  return;
}
```

### Error: "Proof upload failed"
**Causa:** Archivo muy grande o formato no soportado  
**Solución:**
```javascript
// Validar archivo antes de subir
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

if (file.size > MAX_SIZE) {
  Alert.alert('Error', 'El archivo es muy grande (máx. 10 MB)');
  return;
}

if (!ALLOWED_TYPES.includes(file.type)) {
  Alert.alert('Error', 'Formato no soportado. Use JPEG, PNG, WEBP o PDF');
  return;
}
```

### Error: "Cannot refund payment - already refunded"
**Causa:** Intentar reembolsar un pago ya reembolsado  
**Solución:**
```javascript
// Verificar estado antes de mostrar opción de reembolso
if (payment.status === 'REFUNDED') {
  return null; // No mostrar botón de reembolso
}

return (
  <Button
    title="Reembolsar"
    onPress={() => confirmRefund(payment)}
  />
);
```

---

## 📞 Contacto y Soporte

Para dudas o problemas con la implementación:
- Revisar este documento primero
- Consultar `PAYMENT_METHODS_IMPLEMENTATION.md` para detalles técnicos
- Testear endpoints con colección Insomnia
- Revisar logs del backend para errores específicos

---

**Última Actualización:** 19 de Enero de 2025  
**Versión del Sistema:** 1.0.0  
**Estado:** Backend Completo - Frontend Pendiente
