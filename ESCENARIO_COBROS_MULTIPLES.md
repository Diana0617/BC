# 🔐 Escenario: Recepcionista + Especialista con Permiso de Cobrar

## 📋 Situación Planteada

**Negocio tiene:**
- 1 Recepcionista que cobra turnos de TODOS los especialistas
- 1 Especialista con permiso `payments.create` que puede cobrar SUS propios turnos

**Pregunta:** ¿Cómo evitar conflictos cuando ambos tienen turnos de caja abiertos?

---

## ✅ BUENAS NOTICIAS: El Sistema YA lo Soporta

### 🎯 Cómo Funciona Actualmente:

#### 1. **Turnos de Caja son Personales**
```javascript
// Cada usuario tiene SU propio turno
CashRegisterShift {
  userId: "recepcionista-uuid",  // Turno de la recepcionista
  status: "OPEN"
}

CashRegisterShift {
  userId: "especialista-uuid",   // Turno del especialista
  status: "OPEN"
}
```

**✅ Pueden coexistir** porque están separados por `userId`

#### 2. **Los Pagos Registran Quién Cobró**
```javascript
AppointmentPayment {
  appointmentId: "cita-uuid",
  amount: 50000,
  registeredBy: "recepcionista-uuid",  // 👈 Quién registró el pago
  registeredByRole: "RECEPTIONIST",
  paymentDate: "2026-01-24T10:30:00Z"
}
```

**✅ Rastreable:** Siempre se sabe quién cobró cada turno

#### 3. **Recibos se Asocian al Turno del Que Cobra**
```javascript
Receipt {
  appointmentId: "cita-uuid",
  specialistId: "especialista-uuid",  // 👈 Quien atendió
  businessId: "negocio-uuid",
  totalAmount: 50000,
  cashRegisterShiftId: null // ⚠️ AQUÍ HAY UNA OPORTUNIDAD
}
```

---

## 🎯 Flujos de Trabajo

### **Escenario A: Recepcionista Cobra Todo**
```
1. Recepcionista abre turno de caja (Turno #1)
2. Especialista atiende Cita A
3. Especialista atiende Cita B
4. Recepcionista cobra Cita A → va a SU turno (#1)
5. Recepcionista cobra Cita B → va a SU turno (#1)
6. Recepcionista cierra turno con $100,000
```

### **Escenario B: Especialista con Permiso Cobra Sus Turnos**
```
1. Recepcionista abre turno de caja (Turno #1)
2. Especialista abre SU turno de caja (Turno #2)
3. Especialista atiende Cita A
4. Especialista cobra Cita A → va a SU turno (#2)
5. Otro especialista atiende Cita B
6. Recepcionista cobra Cita B → va a SU turno (#1)
7. Especialista cierra turno con $50,000
8. Recepcionista cierra turno con $50,000
```

### **Escenario C: Mixto (Más Realista)**
```
1. Recepcionista abre turno (Turno #1)
2. Especialista atiende Cita A y cobra → Necesita abrir turno
3. Especialista atiende Cita B pero NO cobra → Recepcionista cobra después
```

---

## ⚠️ Puntos a Validar/Mejorar

### 1. **¿Un Turno Puede Ser Cobrado Dos Veces?**

**Problema Potencial:**
- Especialista cobra Cita A
- Recepcionista (sin darse cuenta) vuelve a cobrar Cita A

**Solución Actual:**
- ✅ `Appointment.paymentStatus` previene esto:
  ```javascript
  if (appointment.paymentStatus === 'PAID') {
    return error('Esta cita ya fue pagada completamente');
  }
  ```

**Validación:** ✅ YA ESTÁ PROTEGIDO

---

### 2. **Visibilidad de Turnos Pendientes**

**Situación:**
```javascript
// PendingPayments.jsx - Lista de turnos por cobrar
loadPendingPayments() {
  // ¿Debe mostrar TODOS los turnos o solo los del especialista?
  const params = {
    paymentStatus: 'PENDING',
    // ¿Filtrar por specialistId del usuario actual?
  }
}
```

**Opciones:**

#### A) **Especialista ve SOLO SUS turnos** ✅ RECOMENDADO
```javascript
// Si rol = SPECIALIST con payments.create
const params = {
  paymentStatus: 'PENDING',
  specialistId: user.id  // 👈 Solo mis turnos
};
```

#### B) **Recepcionista ve TODOS** ✅ YA FUNCIONA ASÍ
```javascript
// Si rol = RECEPTIONIST
const params = {
  paymentStatus: 'PENDING'
  // Sin filtro de specialistId
};
```

**Estado Actual:** Revisar código en `PendingPayments.jsx`

---

### 3. **Asociar Pagos al Turno de Caja**

**Mejora Sugerida:** Agregar `cashRegisterShiftId` a los modelos

#### AppointmentPayment
```javascript
// Agregar campo
cashRegisterShiftId: {
  type: DataTypes.UUID,
  allowNull: true,
  references: {
    model: 'cash_register_shifts',
    key: 'id'
  },
  comment: 'Turno de caja donde se registró este pago'
}
```

#### Receipt
```javascript
// Agregar campo
cashRegisterShiftId: {
  type: DataTypes.UUID,
  allowNull: true,
  references: {
    model: 'cash_register_shifts',
    key: 'id'
  },
  comment: 'Turno de caja que emitió este recibo'
}
```

**Beneficios:**
- ✅ Rastreo exacto de qué turno cobró qué
- ✅ Cuadre de caja más preciso
- ✅ Auditoría completa

---

### 4. **Flujo de Registro de Pago**

**Modificar:** `AppointmentPaymentControllerV2.registerPayment()`

```javascript
static async registerPayment(req, res) {
  const { appointmentId, amount, paymentMethodId, shiftId } = req.body;
  
  // 1. Validar que el turno esté abierto
  const shift = await CashRegisterShift.findOne({
    where: {
      id: shiftId,
      userId: req.user.id,
      status: 'OPEN'
    }
  });
  
  if (!shift) {
    return res.status(400).json({
      error: 'Debes tener un turno de caja abierto para registrar pagos'
    });
  }
  
  // 2. Registrar pago con referencia al turno
  const payment = await AppointmentPayment.create({
    appointmentId,
    amount,
    paymentMethodId,
    registeredBy: req.user.id,
    registeredByRole: req.user.role,
    cashRegisterShiftId: shiftId,  // 👈 Asociar al turno
    ...
  });
  
  // 3. Crear recibo con referencia al turno
  const receipt = await Receipt.create({
    appointmentId,
    cashRegisterShiftId: shiftId,  // 👈 Asociar al turno
    ...
  });
}
```

---

## 🚀 Plan de Implementación

### **Fase 1: Validaciones (Ya Funciona)**
- ✅ Prevenir cobro duplicado (`paymentStatus`)
- ✅ Turnos independientes por usuario
- ✅ Tracking de `registeredBy`

### **Fase 2: Mejoras Recomendadas**

#### A) **Migración de Base de Datos**
```sql
-- Agregar cashRegisterShiftId a AppointmentPayment
ALTER TABLE appointment_payments
ADD COLUMN cash_register_shift_id UUID REFERENCES cash_register_shifts(id);

-- Agregar cashRegisterShiftId a Receipt
ALTER TABLE receipts
ADD COLUMN cash_register_shift_id UUID REFERENCES cash_register_shifts(id);
```

#### B) **Actualizar Modelos**
- [x] AppointmentPayment.js
- [x] Receipt.js

#### C) **Actualizar Controladores**
- [ ] AppointmentPaymentControllerV2.js
- [ ] CashRegisterController.js

#### D) **Actualizar Frontend**
- [ ] PendingPayments.jsx (filtrar por specialistId si es SPECIALIST)
- [ ] PaymentModal.jsx (pasar shiftId al registrar pago)
- [ ] CashRegisterCard.jsx (validar turno abierto antes de cobrar)

### **Fase 3: Testing**

#### Test 1: Especialista Sin Permiso
```
1. Login como especialista sin payments.create
2. NO debe ver "Caja" en dashboard
3. NO debe poder cobrar turnos
```

#### Test 2: Especialista Con Permiso
```
1. Login como especialista con payments.create
2. SÍ ve "Caja" en dashboard
3. Abre turno de caja
4. Solo ve SUS turnos pendientes (no los de otros)
5. Cobra su turno → va a SU turno de caja
```

#### Test 3: Recepcionista + Especialista Simultáneos
```
1. Recepcionista abre turno (#1)
2. Especialista abre turno (#2)
3. Especialista atiende Cita A
4. Especialista cobra Cita A → va a turno #2
5. Recepcionista NO puede volver a cobrar Cita A (ya está PAID)
6. Otro especialista atiende Cita B
7. Recepcionista cobra Cita B → va a turno #1
8. Ambos cierran sus turnos con montos correctos
```

---

## 📊 Resumen

| Aspecto | Estado Actual | Acción Necesaria |
|---------|---------------|------------------|
| Turnos independientes | ✅ Funciona | Ninguna |
| Prevención de cobro duplicado | ✅ Funciona | Ninguna |
| Tracking de quién cobra | ✅ Funciona | Ninguna |
| Filtrado de turnos pendientes | ⚠️ Revisar | Filtrar por specialistId |
| Asociación pago-turno | ❌ No existe | Agregar cashRegisterShiftId |
| Validación de turno abierto | ❌ No existe | Requerir shiftId en pagos |

---

## ✅ Conclusión

**El sistema actual YA SOPORTA el escenario**, pero puede mejorarse para mayor precisión en el cuadre de caja.

**Recomendación:**
1. **Corto plazo:** Filtrar turnos pendientes por especialista (solo ver los propios)
2. **Mediano plazo:** Agregar `cashRegisterShiftId` para rastreo completo
3. **Siempre:** Validar permisos en frontend Y backend

¿Quieres que implemente alguna de estas mejoras ahora?
