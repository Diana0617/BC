# 💰 IMPLEMENTACIÓN DE MÉTODOS DE PAGO PERSONALIZADOS

## 📋 RESUMEN

Cada negocio podrá configurar sus propios métodos de pago personalizados en lugar de usar un ENUM fijo. Esto permite flexibilidad total para que cada negocio defina sus métodos según su realidad (ej: "Efectivo", "Yape", "Plin", "Transferencia BCP", etc.).

---

## 🗂️ CAMBIOS EN EL BACKEND

### ✅ 1. Modelo BusinessPaymentConfig (MODIFICADO)

**Archivo**: `packages/backend/src/models/BusinessPaymentConfig.js`

**Campo nuevo**: `paymentMethods` (JSONB)

```javascript
paymentMethods: {
  type: DataTypes.JSONB,
  allowNull: true,
  defaultValue: [
    {
      id: 'cash',
      name: 'Efectivo',
      type: 'CASH',
      isActive: true,
      requiresProof: false,
      icon: 'cash-outline',
      order: 1
    },
    {
      id: 'card',
      name: 'Tarjeta',
      type: 'CARD',
      isActive: true,
      requiresProof: false,
      icon: 'card-outline',
      order: 2
    },
    {
      id: 'transfer',
      name: 'Transferencia',
      type: 'TRANSFER',
      isActive: true,
      requiresProof: true,
      icon: 'swap-horizontal-outline',
      order: 3,
      bankInfo: {
        bankName: '',
        accountNumber: '',
        accountType: '',
        holderName: ''
      }
    }
  ],
  comment: 'Métodos de pago configurados por el negocio'
}
```

**Estructura de cada método**:
```typescript
{
  id: string;              // Identificador único (ej: 'cash', 'yape', 'transfer_bcp')
  name: string;            // Nombre visible (ej: 'Efectivo', 'Yape', 'Transferencia BCP')
  type: string;            // Tipo general: CASH, CARD, TRANSFER, QR, ONLINE, OTHER
  isActive: boolean;       // Si está activo para usar
  requiresProof: boolean;  // Si requiere comprobante
  icon: string;            // Nombre del ícono (Ionicons)
  order: number;           // Orden de visualización
  bankInfo?: {             // Opcional, para transferencias
    bankName: string;
    accountNumber: string;
    accountType: string;
    holderName: string;
  };
  metadata?: object;       // Cualquier dato adicional
}
```

---

### ✅ 2. Nuevo Modelo AppointmentPayment (CREADO)

**Archivo**: `packages/backend/src/models/AppointmentPayment.js`

**Propósito**: Registrar cada pago realizado para una cita (permite pagos parciales).

**Campos clave**:
- `appointmentId`: Cita a la que pertenece
- `amount`: Monto del pago
- `paymentMethodId`: ID del método usado (referencia a `BusinessPaymentConfig.paymentMethods`)
- `paymentMethodName`: Nombre del método (snapshot)
- `paymentMethodType`: Tipo general (CASH, CARD, etc.)
- `reference`: Número de referencia/transacción
- `proofUrl`: URL del comprobante
- `status`: PENDING, COMPLETED, REFUNDED, CANCELLED
- `registeredBy`: Usuario que registró el pago
- `receiptId`: Recibo generado (auto)
- `metadata`: Datos adicionales (IP, device, etc.)

---

### 🔄 3. Migración para appointment_payments

**Crear archivo**: `packages/backend/migrations/YYYYMMDDHHMMSS-create-appointment-payments.js`

```javascript
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('appointment_payments', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      appointmentId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'appointments',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      businessId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'businesses',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      clientId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'clients',
          key: 'id'
        }
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      paymentMethodId: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      paymentMethodName: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      paymentMethodType: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      reference: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      proofUrl: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      proofType: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('PENDING', 'COMPLETED', 'REFUNDED', 'CANCELLED'),
        allowNull: false,
        defaultValue: 'COMPLETED'
      },
      registeredBy: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      registeredByRole: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      paymentDate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      receiptId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'receipts',
          key: 'id'
        }
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {}
      },
      onlinePaymentData: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Índices
    await queryInterface.addIndex('appointment_payments', ['appointmentId']);
    await queryInterface.addIndex('appointment_payments', ['businessId']);
    await queryInterface.addIndex('appointment_payments', ['clientId']);
    await queryInterface.addIndex('appointment_payments', ['status']);
    await queryInterface.addIndex('appointment_payments', ['paymentDate']);
    await queryInterface.addIndex('appointment_payments', ['registeredBy']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('appointment_payments');
  }
};
```

---

### 📡 4. Rutas de API a crear

**Archivo**: `packages/backend/src/routes/paymentRoutes.js` (NUEVO)

```javascript
const express = require('express');
const router = express.Router();
const PaymentConfigController = require('../controllers/PaymentConfigController');
const AppointmentPaymentController = require('../controllers/AppointmentPaymentController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// ==================== CONFIGURACIÓN DE MÉTODOS DE PAGO ====================

// Obtener métodos de pago del negocio
router.get(
  '/business/:businessId/payment-methods',
  authenticateToken,
  PaymentConfigController.getPaymentMethods
);

// Crear nuevo método de pago
router.post(
  '/business/:businessId/payment-methods',
  authenticateToken,
  authorizeRole(['BUSINESS', 'OWNER']),
  PaymentConfigController.createPaymentMethod
);

// Actualizar método de pago
router.put(
  '/business/:businessId/payment-methods/:methodId',
  authenticateToken,
  authorizeRole(['BUSINESS', 'OWNER']),
  PaymentConfigController.updatePaymentMethod
);

// Eliminar método de pago
router.delete(
  '/business/:businessId/payment-methods/:methodId',
  authenticateToken,
  authorizeRole(['BUSINESS', 'OWNER']),
  PaymentConfigController.deletePaymentMethod
);

// Reordenar métodos de pago
router.post(
  '/business/:businessId/payment-methods/reorder',
  authenticateToken,
  authorizeRole(['BUSINESS', 'OWNER']),
  PaymentConfigController.reorderPaymentMethods
);

// ==================== PAGOS DE CITAS ====================

// Registrar pago de cita
router.post(
  '/appointments/:appointmentId/payments',
  authenticateToken,
  AppointmentPaymentController.registerPayment
);

// Obtener pagos de una cita
router.get(
  '/appointments/:appointmentId/payments',
  authenticateToken,
  AppointmentPaymentController.getAppointmentPayments
);

// Subir comprobante de pago
router.post(
  '/appointments/:appointmentId/payments/:paymentId/proof',
  authenticateToken,
  AppointmentPaymentController.uploadPaymentProof
);

// Anular/reembolsar pago
router.post(
  '/appointments/:appointmentId/payments/:paymentId/refund',
  authenticateToken,
  authorizeRole(['BUSINESS', 'OWNER']),
  AppointmentPaymentController.refundPayment
);

module.exports = router;
```

---

### 🎮 5. Controladores a crear

**Archivo**: `packages/backend/src/controllers/PaymentConfigController.js` (NUEVO)

```javascript
const BusinessPaymentConfig = require('../models/BusinessPaymentConfig');
const { v4: uuidv4 } = require('uuid');

class PaymentConfigController {
  
  // GET /api/business/:businessId/payment-methods
  static async getPaymentMethods(req, res) {
    try {
      const { businessId } = req.params;
      
      const config = await BusinessPaymentConfig.findOne({
        where: { businessId }
      });
      
      if (!config) {
        // Retornar métodos por defecto
        return res.json({
          success: true,
          data: [
            { id: 'cash', name: 'Efectivo', type: 'CASH', isActive: true, requiresProof: false, icon: 'cash-outline', order: 1 },
            { id: 'card', name: 'Tarjeta', type: 'CARD', isActive: true, requiresProof: false, icon: 'card-outline', order: 2 },
            { id: 'transfer', name: 'Transferencia', type: 'TRANSFER', isActive: true, requiresProof: true, icon: 'swap-horizontal-outline', order: 3 }
          ]
        });
      }
      
      const methods = (config.paymentMethods || [])
        .filter(m => m.isActive)
        .sort((a, b) => a.order - b.order);
      
      res.json({
        success: true,
        data: methods
      });
      
    } catch (error) {
      console.error('Error obteniendo métodos de pago:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener métodos de pago'
      });
    }
  }
  
  // POST /api/business/:businessId/payment-methods
  static async createPaymentMethod(req, res) {
    try {
      const { businessId } = req.params;
      const { name, type, requiresProof, icon, bankInfo, metadata } = req.body;
      
      // Validaciones
      if (!name || !type) {
        return res.status(400).json({
          success: false,
          error: 'Nombre y tipo son requeridos'
        });
      }
      
      let config = await BusinessPaymentConfig.findOne({
        where: { businessId }
      });
      
      if (!config) {
        // Crear configuración con método por defecto
        config = await BusinessPaymentConfig.create({
          businessId,
          paymentMethods: []
        });
      }
      
      const methods = config.paymentMethods || [];
      const newMethod = {
        id: uuidv4(),
        name,
        type,
        isActive: true,
        requiresProof: requiresProof || false,
        icon: icon || 'cash-outline',
        order: methods.length + 1,
        bankInfo: bankInfo || null,
        metadata: metadata || {}
      };
      
      methods.push(newMethod);
      
      await config.update({
        paymentMethods: methods
      });
      
      res.json({
        success: true,
        data: newMethod
      });
      
    } catch (error) {
      console.error('Error creando método de pago:', error);
      res.status(500).json({
        success: false,
        error: 'Error al crear método de pago'
      });
    }
  }
  
  // PUT /api/business/:businessId/payment-methods/:methodId
  static async updatePaymentMethod(req, res) {
    try {
      const { businessId, methodId } = req.params;
      const updates = req.body;
      
      const config = await BusinessPaymentConfig.findOne({
        where: { businessId }
      });
      
      if (!config) {
        return res.status(404).json({
          success: false,
          error: 'Configuración no encontrada'
        });
      }
      
      const methods = config.paymentMethods || [];
      const methodIndex = methods.findIndex(m => m.id === methodId);
      
      if (methodIndex === -1) {
        return res.status(404).json({
          success: false,
          error: 'Método de pago no encontrado'
        });
      }
      
      // Actualizar método
      methods[methodIndex] = {
        ...methods[methodIndex],
        ...updates,
        id: methodId // No permitir cambiar el ID
      };
      
      await config.update({
        paymentMethods: methods
      });
      
      res.json({
        success: true,
        data: methods[methodIndex]
      });
      
    } catch (error) {
      console.error('Error actualizando método de pago:', error);
      res.status(500).json({
        success: false,
        error: 'Error al actualizar método de pago'
      });
    }
  }
  
  // DELETE /api/business/:businessId/payment-methods/:methodId
  static async deletePaymentMethod(req, res) {
    try {
      const { businessId, methodId } = req.params;
      
      const config = await BusinessPaymentConfig.findOne({
        where: { businessId }
      });
      
      if (!config) {
        return res.status(404).json({
          success: false,
          error: 'Configuración no encontrada'
        });
      }
      
      const methods = config.paymentMethods || [];
      const filteredMethods = methods.map(m => 
        m.id === methodId ? { ...m, isActive: false } : m
      );
      
      await config.update({
        paymentMethods: filteredMethods
      });
      
      res.json({
        success: true,
        message: 'Método de pago desactivado'
      });
      
    } catch (error) {
      console.error('Error eliminando método de pago:', error);
      res.status(500).json({
        success: false,
        error: 'Error al eliminar método de pago'
      });
    }
  }
  
  // POST /api/business/:businessId/payment-methods/reorder
  static async reorderPaymentMethods(req, res) {
    try {
      const { businessId } = req.params;
      const { orderedIds } = req.body; // Array de IDs en el nuevo orden
      
      const config = await BusinessPaymentConfig.findOne({
        where: { businessId }
      });
      
      if (!config) {
        return res.status(404).json({
          success: false,
          error: 'Configuración no encontrada'
        });
      }
      
      const methods = config.paymentMethods || [];
      const reorderedMethods = [];
      
      orderedIds.forEach((id, index) => {
        const method = methods.find(m => m.id === id);
        if (method) {
          reorderedMethods.push({
            ...method,
            order: index + 1
          });
        }
      });
      
      await config.update({
        paymentMethods: reorderedMethods
      });
      
      res.json({
        success: true,
        data: reorderedMethods
      });
      
    } catch (error) {
      console.error('Error reordenando métodos de pago:', error);
      res.status(500).json({
        success: false,
        error: 'Error al reordenar métodos de pago'
      });
    }
  }
  
}

module.exports = PaymentConfigController;
```

---

## 🎨 FRONTEND - PANTALLAS A CREAR

### 1. **PaymentMethodsScreen.js** (Configuración)

**Ubicación**: `packages/business-control-mobile/src/screens/settings/PaymentMethodsScreen.js`

**Funcionalidades**:
- Listar métodos de pago actuales
- Agregar nuevo método
- Editar método existente
- Desactivar/activar método
- Reordenar métodos (drag & drop)
- Vista previa de iconos

---

### 2. **PaymentMethodFormModal.js**

**Ubicación**: `packages/business-control-mobile/src/components/payments/PaymentMethodFormModal.js`

**Campos**:
- Nombre del método
- Tipo (CASH, CARD, TRANSFER, QR, ONLINE, OTHER)
- Icono (selector visual)
- ¿Requiere comprobante? (switch)
- Información bancaria (si es TRANSFER)
  - Banco
  - Número de cuenta
  - Tipo de cuenta
  - Titular

---

### 3. **PaymentRegistrationModal.js** (Para citas)

**Ubicación**: `packages/business-control-mobile/src/components/appointments/PaymentRegistrationModal.js`

**Funcionalidades**:
- Mostrar total de la cita
- Mostrar pagos ya realizados
- Calcular saldo pendiente
- Seleccionar método de pago (dropdown con métodos del negocio)
- Ingresar monto
- Número de referencia (opcional)
- Upload de comprobante (si el método lo requiere)
- Notas
- Botón "Registrar Pago"

---

## 🔄 FLUJO COMPLETO

### Configuración Inicial (Una sola vez por negocio)

1. Business Owner va a **Configuración > Métodos de Pago**
2. Ve métodos por defecto (Efectivo, Tarjeta, Transferencia)
3. Puede:
   - Agregar nuevos (ej: "Yape", "Plin", "PayPal")
   - Editar existentes (cambiar nombre, ícono, config bancaria)
   - Desactivar los que no usa
   - Reordenar para priorizar los más usados

### Registro de Pago (Cada vez que se cobra una cita)

1. Especialista abre detalle de cita
2. Ve sección "Pagos":
   - Total: $100,000
   - Pagado: $50,000
   - Pendiente: $50,000
3. Click en "Registrar Pago"
4. Modal aparece con:
   - Dropdown de métodos configurados
   - Input de monto (máx: saldo pendiente)
   - Campos según método elegido
5. Sube comprobante (si aplica)
6. Click "Guardar"
7. Backend:
   - Crea AppointmentPayment
   - Actualiza Appointment.paidAmount
   - Si pago completo → genera Receipt automático
   - Actualiza Appointment.paymentStatus (PENDING/PARTIAL/PAID)

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Backend
- [x] Modificar BusinessPaymentConfig.paymentMethods
- [x] Crear modelo AppointmentPayment
- [ ] Crear migración de appointment_payments
- [ ] Crear PaymentConfigController
- [ ] Crear rutas /api/business/:id/payment-methods
- [ ] Crear rutas /api/appointments/:id/payments
- [ ] Actualizar AppointmentController para calcular paymentStatus
- [ ] Integrar con Receipt automático

### Frontend
- [ ] Instalar dependencias (expo-image-picker, react-native-signature-canvas)
- [ ] Crear PaymentMethodsScreen
- [ ] Crear PaymentMethodFormModal
- [ ] Crear PaymentRegistrationModal
- [ ] Crear service paymentService.js
- [ ] Integrar en AppointmentDetailModal
- [ ] Agregar ruta en navegación Settings

---

## 🚀 SIGUIENTE PASO

¿Quieres que comencemos con:
1. **Crear los controladores y rutas del backend**
2. **Crear la pantalla de configuración de métodos de pago (frontend)**
3. **Crear el modal de registro de pagos (frontend)**

¿Cuál prefieres que hagamos primero?
