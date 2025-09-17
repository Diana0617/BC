# 📋 Flujo Completo del Especialista - Documentación

## 🎯 **Visión General**

El Especialista tiene un flujo complejo de trabajo que incluye validación de reglas de negocio, captura de consentimiento, evidencia multimedia, procesamiento de pagos, gestión de inventario y manejo de comisiones.

---

## ✅ **CHECKLIST DE DESARROLLO - APP MÓVIL**

### 🔐 **1. Autenticación y Acceso**
- [ ] **Login del especialista**
  - [ ] Pantalla de login con email/contraseña
  - [ ] Validación de credenciales contra API backend
  - [ ] Manejo de errores de autenticación
  - [ ] Recuperación de contraseña
  - [ ] Logout seguro con limpieza de tokens

- [ ] **Gestión de sesión**
  - [ ] Token JWT almacenado de forma segura
  - [ ] Renovación automática de sesión
  - [ ] Expiración de sesión por inactividad
  - [ ] Navegación protegida por autenticación

### 📅 **2. Agenda y Dashboard**
- [ ] **Vista de agenda diaria** (`AgendaView`)
  - [ ] Lista de turnos del día actual
  - [ ] Estados visuales (pendiente, en progreso, completado)
  - [ ] Información del cliente por turno
  - [ ] Indicadores de reglas de negocio
  - [ ] Filtros por fecha/estado

- [ ] **Dashboard del especialista**
  - [ ] Resumen del día (citas, ingresos proyectados)
  - [ ] Comisiones pendientes
  - [ ] Alertas de validación
  - [ ] Estadísticas rápidas

### 🏥 **3. Gestión de Citas** (`AppointmentClosureValidator`)
- [ ] **Detalle de la cita**
  - [ ] Información completa del paciente
  - [ ] Tipo de procedimiento y configuración
  - [ ] Historia clínica previa del negocio
  - [ ] Validaciones paso a paso

- [ ] **Iniciar procedimiento**
  - [ ] Cambiar estado a "EN PROGRESO"
  - [ ] Cargar reglas de negocio específicas
  - [ ] Validar requisitos previos

### 📄 **4. Documentos de Consentimiento** (`ConsentCaptureModal`)
- [ ] **Verificación de requerimiento**
  - [ ] Consultar si `Service.requiresConsent = true`
  - [ ] Mostrar template de consentimiento
  - [ ] Captura de firma digital del cliente

- [ ] **Upload y validación**
  - [ ] Generar PDF con firma
  - [ ] Upload a Cloudinary vía `AppointmentMediaController`
  - [ ] Validar documento antes de continuar

### 📸 **5. Evidencia Multimedia** (`EvidenceUploader`)
- [ ] **Captura de evidencia**
  - [ ] Fotos ANTES del procedimiento
  - [ ] Fotos DESPUÉS del procedimiento
  - [ ] Videos opcionales
  - [ ] Compresión automática de archivos

- [ ] **Gestión de archivos**
  - [ ] Upload a Cloudinary
  - [ ] Progreso de subida
  - [ ] Previsualización de archivos
  - [ ] Eliminación de archivos erróneos

### 💰 **6. Procesamiento de Pagos** (`PaymentProcessor`)
- [ ] **Validación de reglas de pago**
  - [ ] Verificar `BusinessRules.allowCloseWithoutPayment`
  - [ ] Manejar `BusinessRules.requiresManagerApproval`
  - [ ] Integración con Wompi para pagos

- [ ] **Flujo de pago**
  - [ ] Cálculo automático del monto
  - [ ] Procesamiento con Wompi (si requerido)
  - [ ] Registro en `FinancialMovementController`
  - [ ] Generación de comprobante

### 📦 **7. Gestión de Inventario** (`InventoryTracker`)
- [ ] **Productos utilizados**
  - [ ] Lista de productos disponibles del negocio
  - [ ] Selección de productos usados
  - [ ] Especificación de cantidades
  - [ ] Cálculo de costos

- [ ] **Actualización de inventario**
  - [ ] Descuento automático de stock
  - [ ] Registro en `InventoryMovementController`
  - [ ] Alertas de stock bajo
  - [ ] Reporte de consumo

### 💼 **8. Gestión de Comisiones** (`CommissionManager`) ⭐
- [ ] **Generación automática**
  - [ ] Cálculo de porcentaje de comisión
  - [ ] Creación de registro PENDIENTE
  - [ ] Asociación con especialista y cita
  - [ ] Integración con `SpecialistCommissionController`

- [ ] **Dashboard de comisiones**
  - [ ] Lista de comisiones pendientes
  - [ ] Total acumulado
  - [ ] Estadísticas mensuales
  - [ ] Historial de pagos

### 📋 **9. Solicitudes de Pago** (`PaymentRequestGenerator`) ⭐
- [ ] **Selección de comisiones**
  - [ ] Filtros por fecha/estado
  - [ ] Selección múltiple
  - [ ] Validación de montos

- [ ] **Generación de documentos**
  - [ ] PDF con detalle de servicios
  - [ ] Formato profesional
  - [ ] Datos del especialista y negocio
  - [ ] Envío vía `CommissionPaymentRequestController`

### 📋 **10. Historia Clínica** (Específica del Negocio)
- [ ] **Consulta de historia**
  - [ ] Procedimientos anteriores en este negocio
  - [ ] Documentos y evidencia previa
  - [ ] Alergias y contraindicaciones
  - [ ] Resultados históricos

- [ ] **Actualización de historia**
  - [ ] Notas del procedimiento actual
  - [ ] Resultados obtenidos
  - [ ] Recomendaciones post-procedimiento
  - [ ] Documentación de complicaciones

### 🔄 **11. Finalización de Cita**
- [ ] **Validaciones completas**
  - [ ] ✅ Consentimiento (si requerido)
  - [ ] ✅ Evidencia multimedia
  - [ ] ✅ Pago procesado/registrado
  - [ ] ✅ Inventario actualizado
  - [ ] ✅ Comisión generada
  - [ ] ✅ Historia clínica actualizada

- [ ] **Cierre de cita**
  - [ ] Cambio de estado a COMPLETED
  - [ ] Generación de resumen
  - [ ] Notificaciones al cliente/negocio
  - [ ] Liberación del slot de agenda

### 🔔 **12. Notificaciones y UX**
- [ ] **Notificaciones push**
  - [ ] Recordatorios de citas próximas
  - [ ] Cambios en agenda
  - [ ] Estados de validación
  - [ ] Confirmaciones de pago

- [ ] **Experiencia de usuario**
  - [ ] Diseño responsive
  - [ ] Funcionamiento offline básico
  - [ ] Indicadores de progreso
  - [ ] Validaciones en tiempo real

---

## 🚀 **Plan de Implementación por Fases**

### **Fase 1: Base (Semanas 1-2)**
- [ ] 1. Autenticación y Login
- [ ] 2. Dashboard básico y Agenda
- [ ] 3. Detalle de citas

### **Fase 2: Funcionalidades Core (Semanas 3-4)**
- [ ] 4. Captura de consentimiento
- [ ] 5. Upload de evidencia multimedia
- [ ] 6. Gestión básica de inventario

### **Fase 3: Pagos y Comisiones (Semanas 5-6)**
- [ ] 7. Integración de pagos con Wompi
- [ ] 8. Sistema de comisiones automáticas
- [ ] 9. Solicitudes de pago de comisiones

### **Fase 4: Optimización (Semanas 7-8)**
- [ ] 10. Historia clínica completa
- [ ] 11. Validaciones avanzadas
- [ ] 12. Notificaciones y UX final

---

## 🔄 **Flujo Completo de Cierre de Cita**

### **1. Pre-Validación de Cita**
```
┌─ Cita Programada ─┐
│                   │
├─ Verificar Reglas ─┤
│  del Negocio      │
│                   │
├─ Validar Servicio ─┤
│  y Requerimientos │
│                   │
└─ Iniciar Proceso ─┘
```

#### **APIs Involucradas:**
- `businessValidationApi.getBusinessContext(businessId)`
- `businessRuleSlice.getBusinessAssignedRules()`
- `AppointmentMediaController.validateAppointmentCompletion()`

### **2. Captura de Consentimiento** (Si `Service.requiresConsent = true`)
```
┌─ Revisar Template ─┐
│   de Consentimiento│
│                   │
├─ Cliente Firma ───┤
│   Digitalmente    │
│                   │
├─ Subir PDF ──────┤
│   Firmado         │
│                   │
└─ Validar Upload ─┘
```

#### **APIs Involucradas:**
- `AppointmentMediaController.uploadConsent()`
- Cloudinary para almacenamiento
- Validación de PDF firmado

### **3. Evidencia Multimedia** (Recomendado)
```
┌─ Fotos ANTES ─────┐
│   del Procedimiento│
│                   │
├─ Realizar ────────┤
│   Procedimiento   │
│                   │
├─ Fotos DESPUÉS ──┤
│   del Procedimiento│
│                   │
└─ Videos/Extras ──┘
```

#### **APIs Involucradas:**
- `AppointmentMediaController.uploadEvidence()`
- Cloudinary para imágenes/videos
- Compresión automática de archivos

### **4. Procesamiento de Pago**
```
┌─ Verificar Reglas ─┐
│   de Pago         │
│                   │
├─ allowCloseWithout─┤
│   Payment?        │
│                   │
├─ SI: Cerrar ──────┤
│   sin Pago       │
│                   │
├─ NO: Procesar ────┤
│   Pago Wompi     │
│                   │
└─ Registrar ──────┘
│   Transacción    │
```

#### **Reglas de Negocio:**
- `BusinessRules.allowCloseWithoutPayment`
- `BusinessRules.requiresManagerApproval`
- Integración con Wompi para pagos

#### **APIs Involucradas:**
- `businessRuleSlice.getBusinessAssignedRules()`
- `AppointmentPaymentController` (Wompi)
- `FinancialMovementController`

### **5. Gestión de Inventario**
```
┌─ Productos ───────┐
│   Utilizados      │
│                   │
├─ Descontar ──────┤
│   del Inventario  │
│                   │
├─ Registrar ──────┤
│   Movimiento      │
│                   │
└─ Actualizar ─────┘
│   Stock           │
```

#### **APIs Involucradas:**
- `InventoryMovementController`
- `ProductController`
- Registro automático de consumos

### **6. Generación de Comisión** ⭐ **NUEVA FUNCIONALIDAD**
```
┌─ Calcular % ─────┐
│   Comisión       │
│                  │
├─ Crear Registro ─┤
│   PENDIENTE      │
│                  │
├─ Asociar a ─────┤
│   Especialista   │
│                  │
└─ Disponible ────┘
│   para Cobro     │
```

#### **Datos de Comisión:**
```json
{
  "specialistId": "uuid",
  "businessId": "uuid",
  "serviceId": "uuid",
  "appointmentId": "uuid",
  "clientId": "uuid",
  "baseAmount": 150000,
  "commissionPercentage": 40,
  "commissionAmount": 60000,
  "status": "PENDING",
  "generatedAt": "2025-09-15T10:30:00Z",
  "serviceDate": "2025-09-15",
  "clientName": "María García",
  "serviceName": "Tratamiento Facial"
}
```

#### **APIs Involucradas:**
- `SpecialistCommissionController.generateCommission()`
- `businessSpecialistsApi.calculatePendingCommissions()`

### **7. Solicitud de Pago de Comisiones** ⭐ **NUEVA FUNCIONALIDAD**
```
┌─ Seleccionar ────┐
│   Comisiones     │
│   Pendientes     │
│                  │
├─ Generar ───────┤
│   Documento PDF  │
│                  │
├─ Enviar ────────┤
│   Solicitud      │
│                  │
└─ Tracking ──────┘
│   Estado         │
```

#### **Documento de Solicitud PDF:**
```
🏢 SOLICITUD DE PAGO DE COMISIONES
=======================================

Especialista: [Nombre Completo]
Período: [Fecha Inicio] - [Fecha Fin]
Total Comisiones: $[Monto Total]

DETALLE DE SERVICIOS:
┌─────────────┬─────────────┬─────────────┬─────────────┐
│ Fecha       │ Cliente     │ Servicio    │ Comisión    │
├─────────────┼─────────────┼─────────────┼─────────────┤
│ 15/09/2025  │ María G.    │ Facial      │ $60,000     │
│ 16/09/2025  │ Ana L.      │ Manicure    │ $25,000     │
│ 17/09/2025  │ Carmen R.   │ Corte       │ $35,000     │
└─────────────┴─────────────┴─────────────┴─────────────┘

TOTAL A PAGAR: $120,000
```

#### **APIs Involucradas:**
- `CommissionPaymentRequestController.create()`
- `businessSpecialistsApi.processCommissionPayment()`
- Generación de PDF automática

## 🏗️ **Arquitectura del SpecialistDashboard**

### **Componentes Principales:**

1. **AgendaView** - Vista del día con indicadores de reglas
2. **AppointmentClosureValidator** - Validador paso a paso
3. **ConsentCaptureModal** - Captura de consentimiento
4. **EvidenceUploader** - Upload de fotos/videos
5. **PaymentProcessor** - Integración Wompi
6. **InventoryTracker** - Gestión de productos
7. **CommissionManager** - Gestión de comisiones ⭐
8. **PaymentRequestGenerator** - Generador de solicitudes ⭐

### **Estados de Redux:**

```javascript
{
  specialist: {
    profile: {},
    agenda: [],
    currentAppointment: null,
    appointmentValidation: {
      canComplete: false,
      requirements: [],
      warnings: []
    }
  },
  businessRules: {
    assignedRules: [],
    currentValidation: {}
  },
  commissions: {
    pending: [],
    paymentRequests: [],
    stats: {
      totalPending: 0,
      thisMonth: 0,
      totalEarned: 0
    }
  },
  appointments: {
    today: [],
    inProgress: [],
    completed: []
  }
}
```

## 🔄 **Flujo de Estados de Cita**

```
PENDING ──────┐
              │
              ▼
         IN_PROGRESS
              │
              ├─ Consent ✓
              ├─ Evidence ✓  
              ├─ Payment ✓
              ├─ Inventory ✓
              └─ Commission ✓
              │
              ▼
          COMPLETED
```

## 📱 **Diseño del Dashboard**

### **Sección 1: Resumen del Día**
- Citas programadas
- Ingresos proyectados
- Comisiones pendientes
- Alertas de reglas

### **Sección 2: Agenda Interactiva**
- Lista de citas con estados
- Indicadores de validación
- Acceso rápido a acciones

### **Sección 3: Cita en Progreso**
- Checklist de validación
- Progreso visual
- Acciones contextuales

### **Sección 4: Comisiones**
- Pendientes de cobro
- Solicitudes en proceso
- Historial de pagos

### **Sección 5: Estadísticas**
- Rendimiento del mes
- Servicios más realizados
- Tendencias de comisiones

## 🔧 **Implementación Técnica**

### **Hooks Personalizados:**
- `useAppointmentValidation()`
- `useBusinessRules()`
- `useCommissionManager()`
- `usePaymentProcessor()`

### **Integraciones:**
- Redux con `businessRuleSlice`
- APIs de validación en tiempo real
- Cloudinary para multimedia
- Wompi para pagos
- Generación de PDFs

### **Performance:**
- Carga lazy de componentes
- Cache de reglas de negocio
- Optimización de imágenes
- Estados locales para UX fluida

Este flujo asegura que cada cierre de cita genere automáticamente las comisiones correspondientes y permita al especialista gestionarlas de manera eficiente a través de solicitudes documentadas.