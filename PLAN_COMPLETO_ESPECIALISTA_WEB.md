# 📋 PLAN COMPLETO DE MIGRACIÓN: ESPECIALISTA MOBILE → WEB

## Estado Actual: 47% Completado (7/15 componentes principales)

---

## ✅ FASE 1: COMPONENTES ESENCIALES (COMPLETADA)

### 1.1 Dashboard y Navegación ✅
- [x] **SpecialistDashboard.jsx** - Dashboard principal con estadísticas
- [x] **AppointmentCalendarView.jsx** - Calendario día/semana/mes
- [x] **AppointmentCard.jsx** - Tarjeta de cita con toda la info
- [x] **AppointmentDetailsModal.jsx** - Modal con transiciones de estado

### 1.2 Sistema de Comisiones Básico ✅
- [x] **CommissionSummary.jsx** - Resumen de comisiones (pendientes/pagadas)

### 1.3 Sistema de Caja Básico ✅
- [x] **CashRegisterCard.jsx** - Card de estado de caja

### 1.4 Sistema de Evidencias Básico ✅
- [x] **EvidenceUploader.jsx** - Subir fotos antes/después

---

## ⏳ FASE 2: GESTIÓN DE CITAS AVANZADA

### 2.1 Sistema de Consentimientos
**Archivos Mobile:**
- `ConsentCaptureModal.js` (709 líneas)

**Componentes a Crear:**
- [ ] `ConsentCapture.jsx` - Captura de consentimiento con firma digital
  - Editor de texto enriquecido para términos
  - Canvas para firma digital
  - Generación de PDF con consentimiento
  - Almacenamiento en Cloudinary

**Features:**
- Captura de firma digital (canvas HTML5)
- Visualización de términos personalizados
- Generación automática de PDF
- Almacenamiento seguro
- Validación obligatoria según reglas del negocio

### 2.2 Validador de Cierre de Citas
**Archivos Mobile:**
- `AppointmentClosureValidator.js` (350 líneas)

**Componentes a Crear:**
- [ ] `AppointmentClosureFlow.jsx` - Flujo completo de cierre
  - Step 1: Consentimiento (si aplica)
  - Step 2: Evidencias fotográficas
  - Step 3: Pago
  - Step 4: Inventario (si usa productos)

**Features:**
- Wizard paso a paso
- Validación de cada etapa
- Bloqueo de cierre sin completar pasos
- Solicitud de aprobación gerencial
- Indicadores de progreso

### 2.3 Modal de Creación de Citas Mejorado
**Componentes a Crear:**
- [ ] `AppointmentCreateForm.jsx` - Formulario completo
  - Selección de cliente (búsqueda/crear nuevo)
  - Selección de servicio
  - Selección de horario disponible
  - Notas y observaciones
  - Origen de la cita

---

## ⏳ FASE 3: SISTEMA DE PAGOS COMPLETO

### 3.1 Procesador de Pagos
**Archivos Mobile:**
- `PaymentProcessor.js` (638 líneas)
- `PaymentStep.js`
- `payments/PaymentFlowManager.js`
- `payments/PaymentMethodSelector.js`
- `payments/PaymentSummary.js`
- `payments/WompiIntegration.js`

**Componentes a Crear:**
- [ ] `PaymentFlowManager.jsx` - Gestor principal de pagos
- [ ] `PaymentMethodSelector.jsx` - Selector de métodos de pago
  - Efectivo
  - Tarjeta (Wompi)
  - Transferencia
  - Mixto (múltiples métodos)
- [ ] `PaymentSummary.jsx` - Resumen de pago
- [ ] `WompiIntegration.jsx` - Integración con Wompi
  - WebView/iFrame para checkout
  - Verificación de transacción
  - Webhooks
- [ ] `PaymentProofUpload.jsx` - Subir comprobantes
- [ ] `TransferPayment.jsx` - Pago por transferencia

**Features:**
- Múltiples métodos de pago
- Pagos mixtos (ej: $50k efectivo + $100k tarjeta)
- Integración completa con Wompi
- Subida de comprobantes de transferencia
- Generación automática de recibos
- Envío por email y WhatsApp

### 3.2 Integración con Wompi
**Componentes a Crear:**
- [ ] `WompiCheckout.jsx` - Checkout embebido
- [ ] `WompiVerification.jsx` - Verificación de transacción
- [ ] Webhook handler (backend ya existe)

---

## ⏳ FASE 4: SISTEMA DE COMISIONES COMPLETO

### 4.1 Gestor de Comisiones
**Archivos Mobile:**
- `CommissionManager.js` (397 líneas)

**Componentes a Crear:**
- [ ] `CommissionManager.jsx` - Gestor completo
  - Tab: Pendientes
  - Tab: Solicitadas
  - Tab: Pagadas
- [ ] `CommissionCard.jsx` - Card de comisión individual
- [ ] `CommissionRequestModal.jsx` - Solicitar pago
- [ ] `CommissionHistoryList.jsx` - Historial completo

**Features:**
- Ver comisiones por estado
- Seleccionar múltiples comisiones
- Crear solicitud de pago
- Ver historial de pagos
- Filtros por fecha/estado
- Resumen financiero mensual

### 4.2 Página de Comisiones
**Páginas a Crear:**
- [ ] `pages/specialist/CommissionsPage.jsx` - Página completa de comisiones

---

## ⏳ FASE 5: SISTEMA DE CAJA REGISTRADORA COMPLETO

### 5.1 Gestión de Turnos de Caja
**Archivos Mobile:**
- `cashRegister/OpenShiftScreen.js`
- `cashRegister/ActiveShiftScreen.js`
- `cashRegister/CloseShiftScreen.js`

**Componentes a Crear:**
- [ ] `OpenShiftModal.jsx` - Abrir turno de caja
  - Balance inicial
  - Selección de sucursal
  - Notas de apertura
- [ ] `ActiveShiftView.jsx` - Vista de turno activo
  - Balance actual
  - Movimientos del día
  - Registro de transacciones
  - Botón cerrar turno
- [ ] `CloseShiftModal.jsx` - Cerrar turno
  - Conteo de efectivo
  - Reconciliación
  - Diferencias (sobrante/faltante)
  - Motivo de diferencias
  - Resumen final

**Features:**
- Abrir/cerrar turnos
- Registro de movimientos (entradas/salidas)
- Reconciliación de efectivo
- Reporte de diferencias
- Historial de turnos
- Validación de permisos

### 5.2 Páginas de Caja
**Páginas a Crear:**
- [ ] `pages/cash-register/OpenShiftPage.jsx`
- [ ] `pages/cash-register/ActiveShiftPage.jsx`
- [ ] `pages/cash-register/CloseShiftPage.jsx`
- [ ] `pages/cash-register/ShiftHistoryPage.jsx`

---

## ⏳ FASE 6: SISTEMA DE RECIBOS Y FACTURAS

### 6.1 Generación de Recibos
**Archivos Mobile:**
- `ReceiptActions.js` (272 líneas)
- `NumberingSettings.js` (457 líneas)

**Componentes a Crear:**
- [ ] `ReceiptGenerator.jsx` - Generar recibos PDF
  - Plantilla personalizable
  - Logo del negocio
  - Numeración automática
  - Información fiscal
- [ ] `ReceiptPreview.jsx` - Vista previa de recibo
- [ ] `ReceiptSender.jsx` - Enviar por email/WhatsApp
- [ ] `NumberingConfig.jsx` - Configuración de numeración
  - Prefijos personalizados
  - Numeración secuencial
  - Reset anual
  - Formato personalizado

**Features:**
- Generación automática de recibos
- Plantillas personalizables
- Envío automático por email
- Envío por WhatsApp
- Numeración fiscal
- Almacenamiento en Cloudinary

---

## ⏳ FASE 7: SISTEMA DE PERMISOS

### 7.1 Componentes de Permisos
**Archivos Mobile:**
- `permissions/PermissionButton.js`
- `permissions/PermissionGuard.js`

**Componentes a Crear:**
- [ ] `PermissionButton.jsx` - Botón con validación de permisos
  - Deshabilitado si no tiene permiso
  - Tooltip explicativo
  - Feedback visual
- [ ] `PermissionGuard.jsx` - Guardia de permisos
  - Wrapper para componentes
  - Renderizado condicional
  - Redirección si no autorizado
- [ ] `usePermissions.js` - Hook de permisos
  - hasPermission(permissionKey)
  - hasAnyPermission([...])
  - hasAllPermissions([...])

**Features:**
- Validación granular de permisos
- Cache de permisos
- Feedback visual claro
- Integración con backend

---

## ⏳ FASE 8: COMPONENTES DE SOPORTE

### 8.1 Componentes de Marca
**Archivos Mobile:**
- `BrandedButton.js`
- `BrandedHeader.js`

**Componentes a Crear:**
- [ ] `BrandedButton.jsx` - Botón con colores del negocio
- [ ] `BrandedHeader.jsx` - Header con logo personalizado
- [ ] `useBranding.js` - Hook para branding
  - Colores corporativos
  - Logo
  - Tipografía

### 8.2 Selectores de Productos
**Archivos Mobile:**
- `payments/ProductSelector.js`

**Componentes a Crear:**
- [ ] `ProductSelector.jsx` - Selector de productos para venta
  - Búsqueda de productos
  - Cantidad
  - Precio unitario
  - Subtotal

---

## ⏳ FASE 9: HOOKS Y UTILIDADES

### 9.1 Custom Hooks
**Hooks a Crear:**
- [ ] `useAppointments.js` - Hook de citas
  - loadAppointments()
  - confirmAppointment()
  - startAppointment()
  - completeAppointment()
  - cancelAppointment()
- [ ] `useCommissions.js` - Hook de comisiones
  - loadCommissions()
  - createPaymentRequest()
  - getCommissionsByStatus()
- [ ] `useCashRegister.js` - Hook de caja
  - openShift()
  - closeShift()
  - addTransaction()
- [ ] `useBusinessRules.js` - Hook de reglas de negocio
  - validateAction()
  - getRequirements()

### 9.2 Utilidades
**Utilidades a Crear:**
- [ ] `timezone.js` - Utilidades de zona horaria
  - formatDateColombia()
  - toColombiaTime()
  - formatTimeColombia()
- [ ] `currency.js` - Utilidades de moneda
  - formatCurrency()
  - parseCurrency()
- [ ] `validation.js` - Utilidades de validación
  - validateEmail()
  - validatePhone()
  - validateRequired()

---

## ⏳ FASE 10: PÁGINAS PRINCIPALES

### 10.1 Páginas de Especialista
**Páginas a Crear:**
- [ ] `pages/specialist/SpecialistDashboard.jsx` ✅ (Ya creado)
- [ ] `pages/specialist/AppointmentsPage.jsx` - Lista completa de citas
- [ ] `pages/specialist/CommissionsPage.jsx` - Gestión de comisiones
- [ ] `pages/specialist/ProfilePage.jsx` - Perfil del especialista
- [ ] `pages/specialist/SchedulePage.jsx` - Horarios de trabajo
- [ ] `pages/specialist/StatsPage.jsx` - Estadísticas detalladas

### 10.2 Rutas y Navegación
**Configuración a Crear:**
- [ ] Rutas protegidas para especialista
- [ ] Navegación lateral/superior
- [ ] Breadcrumbs
- [ ] Tabs de navegación

---

## 📊 PRIORIZACIÓN POR IMPORTANCIA

### 🔥 CRÍTICO (Semana 1)
1. ✅ Dashboard principal
2. ✅ Vista de calendario
3. ✅ Gestión básica de citas
4. ⏳ Sistema de pagos básico
5. ⏳ Validador de cierre de citas

### ⚡ IMPORTANTE (Semana 2)
6. ⏳ Sistema de consentimientos
7. ⏳ Sistema de evidencias completo
8. ⏳ Gestión de comisiones completo
9. ⏳ Sistema de recibos

### 📌 DESEABLE (Semana 3)
10. ⏳ Sistema de caja completo
11. ⏳ Integración Wompi completa
12. ⏳ Sistema de permisos granular
13. ⏳ Componentes de marca

### 🎯 OPCIONAL (Semana 4)
14. ⏳ Estadísticas avanzadas
15. ⏳ Reportes personalizados
16. ⏳ Notificaciones en tiempo real
17. ⏳ Chat interno

---

## 📝 ESTIMACIÓN DE ESFUERZO

### Componentes Completados: 7
- SpecialistDashboard ✅
- AppointmentCalendarView ✅
- AppointmentCard ✅
- AppointmentDetailsModal ✅
- CommissionSummary ✅
- CashRegisterCard ✅
- EvidenceUploader ✅

### Componentes Pendientes: 43
- Sistema de Consentimientos: 3 componentes
- Sistema de Pagos: 7 componentes
- Sistema de Comisiones: 4 componentes
- Sistema de Caja: 5 componentes
- Sistema de Recibos: 4 componentes
- Sistema de Permisos: 3 componentes
- Componentes de Soporte: 5 componentes
- Hooks y Utilidades: 8 archivos
- Páginas: 4 páginas adicionales

### Total: 50 componentes/archivos
- **Completados:** 7 (14%)
- **Pendientes:** 43 (86%)

**Tiempo estimado:** 3-4 semanas de desarrollo a tiempo completo

---

## 🚀 SIGUIENTE PASO RECOMENDADO

**Opción A: Flujo Crítico (Recomendado)**
Completar el flujo completo de gestión de citas:
1. ConsentCapture.jsx
2. AppointmentClosureFlow.jsx
3. PaymentFlowManager.jsx
4. ReceiptGenerator.jsx

**Opción B: Por Sistema**
Completar un sistema a la vez:
1. Sistema de Pagos (100%)
2. Sistema de Caja (100%)
3. Sistema de Comisiones (100%)

**Opción C: Incremental**
Agregar funcionalidades poco a poco según prioridad de negocio.

---

## 💡 DECISIÓN ESTRATÉGICA

¿Qué enfoque prefieres?
1. **Flujo Crítico** - Todo lo necesario para que un especialista pueda trabajar end-to-end
2. **Por Sistema** - Completar sistemas completos uno por uno
3. **Incremental** - Ir agregando según necesidad inmediata

¿Por dónde continuamos?
