# Ejemplo: Aplicando Permisos al AppointmentController

## 📋 Caso de Uso

Queremos proteger las rutas de citas con permisos granulares:
- `GET /appointments` - Requiere `appointments.view_own` O `appointments.view_all`
- `POST /appointments` - Requiere `appointments.create`
- `PATCH /:id/complete` - Requiere `appointments.complete`
- `PATCH /:id/close-with-payment` - Requiere `appointments.complete` Y `payments.create`

## 🔧 Implementación

### 1. Actualizar Rutas (appointments.js)

**ANTES:**
```javascript
const express = require('express');
const router = express.Router();
const AppointmentController = require('../controllers/AppointmentController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', AppointmentController.getAppointments);
router.post('/', AppointmentController.createAppointment);
router.patch('/:id/complete', AppointmentController.completeAppointment);
```

**DESPUÉS:**
```javascript
const express = require('express');
const router = express.Router();
const AppointmentController = require('../controllers/AppointmentController');
const { authenticateToken } = require('../middleware/auth');
const { 
  checkPermission, 
  checkAnyPermission, 
  checkAllPermissions,
  injectUserPermissions 
} = require('../middleware/permissions');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// GET /appointments - Puede ver propias O todas
router.get('/', 
  checkAnyPermission(['appointments.view_own', 'appointments.view_all']),
  injectUserPermissions, // Para filtrar en el controlador
  AppointmentController.getAppointments
);

// GET /appointments/date-range - Igual que anterior
router.get('/date-range',
  checkAnyPermission(['appointments.view_own', 'appointments.view_all']),
  injectUserPermissions,
  AppointmentController.getAppointmentsByDateRange
);

// POST /appointments - Requiere poder crear citas
router.post('/',
  checkPermission('appointments.create'),
  AppointmentController.createAppointment
);

// GET /:id - Requiere ver propias o todas
router.get('/:id',
  checkAnyPermission(['appointments.view_own', 'appointments.view_all']),
  injectUserPermissions,
  AppointmentController.getAppointmentDetail
);

// PATCH /:id - Requiere editar citas
router.patch('/:id',
  checkPermission('appointments.edit'),
  AppointmentController.updateAppointment
);

// PATCH /:id/cancel - Requiere cancelar citas
router.patch('/:id/cancel',
  checkPermission('appointments.cancel'),
  AppointmentController.cancelAppointment
);

// PATCH /:id/complete - Requiere completar citas
router.patch('/:id/complete',
  checkPermission('appointments.complete'),
  AppointmentController.completeAppointment
);

// PATCH /:id/close-with-payment - Requiere completar Y cobrar
router.patch('/:id/close-with-payment',
  checkAllPermissions(['appointments.complete', 'payments.create']),
  AppointmentController.closeAppointmentWithPayment
);

// PATCH /:id/close-without-payment - Requiere completar sin cobrar
router.patch('/:id/close-without-payment',
  checkPermission('appointments.close_without_payment'),
  AppointmentController.closeAppointmentWithoutPayment
);

module.exports = router;
```

---

### 2. Actualizar Controlador (AppointmentController.js)

**Método getAppointments - Filtrar según permisos:**

```javascript
static async getAppointments(req, res) {
  try {
    const { businessId } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    // Obtener permisos del usuario desde middleware
    const { permissions } = req.userPermissions;

    let whereClause = { businessId };
    
    // Si el usuario tiene view_all, puede ver todas las citas
    if (permissions.includes('appointments.view_all')) {
      // whereClause ya tiene solo businessId
    } 
    // Si solo tiene view_own, filtrar por sus citas
    else if (permissions.includes('appointments.view_own')) {
      // Si es especialista, buscar por specialistId
      if (['SPECIALIST', 'RECEPTIONIST_SPECIALIST'].includes(userRole)) {
        whereClause.specialistId = userId;
      }
    }
    // Si no tiene ningún permiso (no debería llegar aquí por el middleware)
    else {
      return res.status(403).json({
        success: false,
        error: 'No tienes permiso para ver citas'
      });
    }

    const appointments = await Appointment.findAll({
      where: whereClause,
      include: [
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'firstName', 'lastName', 'phone', 'email']
        },
        {
          model: Service,
          as: 'service',
          attributes: ['id', 'name', 'duration', 'price']
        },
        {
          model: User,
          as: 'specialist',
          attributes: ['id', 'firstName', 'lastName'],
          include: [{
            model: SpecialistProfile,
            as: 'specialistProfile',
            attributes: ['profileColor']
          }]
        },
        {
          model: Branch,
          as: 'branch',
          attributes: ['id', 'name']
        }
      ],
      order: [['scheduledDate', 'DESC'], ['startTime', 'DESC']]
    });

    return res.json({
      success: true,
      data: appointments
    });
  } catch (error) {
    console.error('Error en getAppointments:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al obtener citas'
    });
  }
}
```

**Método getAppointmentDetail - Verificar ownership:**

```javascript
static async getAppointmentDetail(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    const { permissions } = req.userPermissions;

    const appointment = await Appointment.findByPk(id, {
      include: [
        { model: Client, as: 'client' },
        { model: Service, as: 'service' },
        { 
          model: User, 
          as: 'specialist',
          include: [{ model: SpecialistProfile, as: 'specialistProfile' }]
        },
        { model: Branch, as: 'branch' }
      ]
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Cita no encontrada'
      });
    }

    // Si solo tiene view_own, verificar que sea su cita
    if (permissions.includes('appointments.view_own') && 
        !permissions.includes('appointments.view_all')) {
      if (appointment.specialistId !== userId) {
        return res.status(403).json({
          success: false,
          error: 'No tienes permiso para ver esta cita'
        });
      }
    }

    return res.json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Error en getAppointmentDetail:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al obtener detalle de cita'
    });
  }
}
```

**Nuevo método closeAppointmentWithPayment:**

```javascript
static async closeAppointmentWithPayment(req, res) {
  try {
    const { id } = req.params;
    const { paymentMethod, amount, notes } = req.body;
    const userId = req.user.id;

    // Buscar la cita
    const appointment = await Appointment.findByPk(id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Cita no encontrada'
      });
    }

    // Verificar que no esté ya completada
    if (appointment.status === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        error: 'La cita ya está completada'
      });
    }

    // Iniciar transacción
    const transaction = await sequelize.transaction();

    try {
      // 1. Actualizar cita
      appointment.status = 'COMPLETED';
      appointment.completedAt = new Date();
      appointment.completedBy = userId;
      await appointment.save({ transaction });

      // 2. Registrar pago
      const payment = await Payment.create({
        appointmentId: id,
        businessId: appointment.businessId,
        amount,
        paymentMethod,
        status: 'COMPLETED',
        paidBy: appointment.clientId,
        receivedBy: userId,
        notes
      }, { transaction });

      // 3. Calcular y registrar comisión si aplica
      const commissionConfig = await CommissionConfig.findOne({
        where: { 
          businessId: appointment.businessId,
          specialistId: appointment.specialistId,
          serviceId: appointment.serviceId
        }
      });

      if (commissionConfig) {
        const commissionAmount = (amount * commissionConfig.percentage) / 100;
        await Commission.create({
          appointmentId: id,
          specialistId: appointment.specialistId,
          amount: commissionAmount,
          status: 'PENDING'
        }, { transaction });
      }

      await transaction.commit();

      return res.json({
        success: true,
        message: 'Cita completada y pago registrado',
        data: {
          appointment,
          payment
        }
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error en closeAppointmentWithPayment:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al cerrar cita con pago'
    });
  }
}
```

---

### 3. Verificación Manual con Insomnia

**Test 1: Usuario con solo view_own**

```http
GET http://localhost:5000/api/appointments?businessId=XXX
Authorization: Bearer {token_especialista}

Expected:
- Solo devuelve citas donde specialistId = userId del token
- Status 200
```

**Test 2: Usuario sin create intenta crear**

```http
POST http://localhost:5000/api/appointments
Authorization: Bearer {token_especialista_sin_permisos}
Content-Type: application/json

{
  "businessId": "XXX",
  "clientId": "YYY",
  "serviceId": "ZZZ",
  ...
}

Expected:
- Status 403
- Error: "No tienes permiso para realizar esta acción"
- requiredPermission: "appointments.create"
```

**Test 3: Usuario con create concedido extra**

```http
POST http://localhost:5000/api/appointments
Authorization: Bearer {token_especialista_con_create}
Content-Type: application/json

{...}

Expected:
- Status 201
- Cita creada exitosamente
```

**Test 4: Cerrar cita cobrando (requiere 2 permisos)**

```http
PATCH http://localhost:5000/api/appointments/{id}/close-with-payment
Authorization: Bearer {token_especialista}
Content-Type: application/json

{
  "paymentMethod": "CASH",
  "amount": 50000,
  "notes": "Pago completo"
}

Expected:
- Si NO tiene payments.create: Status 403
- Si tiene ambos permisos: Status 200, cita completada + pago registrado
```

---

## 🎯 Beneficios de este Enfoque

### 1. Separación de Responsabilidades
- **Middleware**: Verifica permisos antes de llegar al controlador
- **Controlador**: Lógica de negocio + validaciones adicionales

### 2. Código Limpio
```javascript
// Antes (sin permisos)
router.post('/', authenticateToken, AppointmentController.create);

// Después (con permisos)
router.post('/', 
  authenticateToken,
  checkPermission('appointments.create'),
  AppointmentController.create
);
```

### 3. Flexibilidad
- Algunos usuarios SPECIALIST pueden crear citas
- Otros SPECIALIST solo ven sus citas
- Sin cambiar código, solo configurando permisos

### 4. Auditoría
- Cada concesión/revocación queda registrada
- Se puede ver quién concedió el permiso y cuándo

### 5. Escalabilidad
- Fácil agregar nuevos permisos sin tocar código existente
- Solo agregar al seed de permisos y usar en middleware

---

## 📊 Comparación: Antes vs Después

### ANTES (Solo Roles)
```javascript
// Todos los especialistas tienen los mismos permisos
if (role === 'SPECIALIST') {
  // Solo puede ver sus citas
  whereClause.specialistId = userId;
}
```

**Problema:** Inflexible, todos los especialistas iguales

---

### DESPUÉS (Permisos Granulares)
```javascript
// Cada especialista puede tener permisos diferentes
if (permissions.includes('appointments.view_all')) {
  // Este especialista senior puede ver todas
} else if (permissions.includes('appointments.view_own')) {
  // Este especialista solo ve las suyas
  whereClause.specialistId = userId;
}
```

**Ventaja:** Flexible, personalizado por usuario

---

## ✅ Checklist de Migración

Para migrar un controlador existente:

- [ ] Identificar endpoints del controlador
- [ ] Mapear cada endpoint a un permiso
- [ ] Actualizar rutas con middleware `checkPermission`
- [ ] Actualizar controlador para leer `req.userPermissions`
- [ ] Agregar lógica condicional basada en permisos
- [ ] Testing manual con usuarios con diferentes permisos
- [ ] Documentar permisos requeridos en Swagger

---

**Ejemplo creado:** Octubre 19, 2025  
**Controlador:** AppointmentController  
**Permisos aplicados:** appointments.*, payments.create
