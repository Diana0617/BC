# 📋 PLAN DE MIGRACIÓN: APP MOBILE → WEB APP
## Beauty Control - Replicación de Funcionalidades

---

## 🎯 OBJETIVO
Replicar todas las funcionalidades de la aplicación móvil en la web para que el cliente pueda gestionar completamente su negocio desde la webapp.

---

## 📊 ANÁLISIS DE DIFERENCIAS

### ✅ FUNCIONALIDADES YA EXISTENTES EN WEB
- ✓ Dashboard general (DashboardPage.jsx)
- ✓ Gestión de clientes (customers)
- ✓ Gestión de inventario
- ✓ Configuración de perfil de negocio
- ✓ Gestión de turnos (turnos online en CalendarAccessSection)
- ✓ Sistema de citas básico
- ✓ Configuración de horarios y calendario
- ✓ Sistema de pagos Wompi
- ✓ Planes y suscripciones (owner)

### ❌ FUNCIONALIDADES FALTANTES EN WEB (desde Mobile)

#### 1. **DASHBOARDS ESPECÍFICOS POR ROL**
Mobile tiene dashboards especializados que la web no tiene:

**a) Business Dashboard** (BusinessDashboard.js)
- Métricas de negocio en tiempo real
- Ventas del día/semana/mes
- Ingresos netos
- Citas completadas vs canceladas
- Gastos del día
- Acceso rápido a webapp desde mobile
- Vista de métricas con cards visuales

**b) Specialist Dashboard** (SpecialistDashboardV2.js)
- Vista de agenda personal del especialista
- Filtros por día/semana/mes
- Vista calendario interactiva
- Gestión de citas propias (Iniciar/Completar/Cancelar)
- Métricas de comisiones propias
- Estados de citas en tiempo real
- Modal de creación de citas
- Modal de detalles de citas
- Sistema de gestión de evidencias
- Sistema de consentimiento de clientes

**c) Receptionist Dashboard** (ReceptionistDashboard.js)
- Vista de todas las citas de todos los especialistas
- Calendario multi-especialista
- Filtros avanzados (sucursal, especialista, estado)
- Creación de citas para cualquier especialista
- Gestión de estados de citas
- Vista de métricas generales del negocio
- Integración con caja registradora

**d) Receptionist-Specialist Dashboard** (ReceptionistSpecialistDashboard.js)
- Dashboard dual (recepcionista + especialista)
- Toggle entre "Todas las citas" y "Mis citas"
- Funcionalidades combinadas de ambos roles

#### 2. **SISTEMA DE CAJA REGISTRADORA (Cash Register)**
Mobile tiene 3 pantallas completas que web no tiene:

**a) OpenShiftScreen.js**
- Apertura de turno de caja
- Registro de monto inicial en caja
- Validaciones de negocio
- Registro de quien abre el turno

**b) ActiveShiftScreen.js**
- Vista del turno activo
- Métricas en tiempo real del turno
- Ventas del turno
- Métodos de pago utilizados
- Ingresos vs egresos
- Opción para cerrar turno

**c) CloseShiftScreen.js**
- Cierre de turno de caja
- Conteo final de efectivo
- Reconciliación de pagos
- Reporte de diferencias
- Resumen completo del turno
- Generación de reporte de cierre

#### 3. **COMPONENTES ESPECIALIZADOS**

**a) Sistema de Pagos Avanzado**
Mobile tiene componentes que web necesita:
- `PaymentFlowManager.js` - Gestión completa del flujo de pago
- `PaymentProcessor.js` - Procesamiento de pagos
- `WompiIntegration.js` - Integración con Wompi
- `TransferPayment.js` - Pagos por transferencia
- `PaymentProofUpload.js` - Subida de comprobantes
- `PaymentMethodSelector.js` - Selector de métodos de pago
- `PaymentSummary.js` - Resumen de pagos
- `ProductSelector.js` - Selector de productos/servicios

**b) Sistema de Evidencias**
- `EvidenceUploader.js` - Carga de fotos de evidencia
- `EvidenceCaptureModal.js` - Captura desde la cámara

**c) Sistema de Consentimientos**
- `ConsentCaptureModal.js` - Captura de consentimiento del cliente

**d) Sistema de Citas Completo**
- `AppointmentCreateModal.js` - Modal de creación de citas
- `AppointmentDetailsModal.js` - Modal de detalles de citas
- `AppointmentClosureValidator.js` - Validación de cierre de citas
- `PaymentStep.js` - Paso de pago en el flujo de citas

**e) Sistema de Permisos**
- `PermissionGuard.js` - Guard de permisos por rol
- `PermissionButton.js` - Botones con permisos

**f) Componentes de Configuración**
- `NumberingSettings.js` - Configuración de numeración de documentos
- `CommissionManager.js` - Gestor de comisiones
- `CashRegisterCard.js` - Card de información de caja

**g) Componentes de Branding**
- `BrandedHeader.js` - Header con branding personalizado
- `BrandedButton.js` - Botones con colores de marca

#### 4. **HOOKS PERSONALIZADOS**
Mobile tiene hooks que web podría necesitar:
- `useAppointments.js` - Gestión de citas
- `useAppointmentValidation.js` - Validación de citas
- `useBusinessRules.js` - Reglas de negocio
- `useCommissionManager.js` - Gestión de comisiones
- `usePaymentMethodsReadOnly.js` - Métodos de pago
- `usePermissions.js` - Sistema de permisos
- `useSchedule.js` - Gestión de horarios
- `useTimeSlot.js` - Gestión de slots de tiempo

#### 5. **PANTALLAS DE AUTH ADICIONALES**
- `RoleSelectionScreen.js` - Selección de rol al iniciar sesión

#### 6. **INTEGRACIONES**
- WhatsApp Helper (WhatsAppHelper.js)
- Sistema de timezone (timezone.js)

---

## 📝 PLAN DE IMPLEMENTACIÓN POR FASES

### **FASE 1: DASHBOARDS ESPECÍFICOS POR ROL** 
**Prioridad: ALTA** | **Duración estimada: 2-3 semanas**

#### 1.1. Business Dashboard Web
**Archivos a crear:**
- `packages/web-app/src/pages/dashboard/BusinessOwnerDashboard.jsx`
- `packages/web-app/src/components/dashboard/MetricCard.jsx`
- `packages/web-app/src/components/dashboard/RevenueChart.jsx`

**Funcionalidades:**
- [ ] Métricas en tiempo real (ventas, ingresos, gastos)
- [ ] Cards visuales con gradientes
- [ ] Gráficos de tendencias
- [ ] Filtros por período (día/semana/mes)
- [ ] Resumen de citas
- [ ] Estado de la caja registradora

**APIs necesarias:**
- GET `/api/business/metrics` - Métricas generales
- GET `/api/business/sales-summary` - Resumen de ventas
- GET `/api/business/appointments-summary` - Resumen de citas

#### 1.2. Specialist Dashboard Web
**Archivos a crear:**
- `packages/web-app/src/pages/dashboard/SpecialistDashboard.jsx`
- `packages/web-app/src/components/specialist/AppointmentCalendar.jsx`
- `packages/web-app/src/components/specialist/AppointmentCard.jsx`
- `packages/web-app/src/components/specialist/CommissionSummary.jsx`

**Funcionalidades:**
- [ ] Agenda personal del especialista
- [ ] Vista calendario interactiva
- [ ] Filtros por período
- [ ] Gestión de citas (Iniciar/Completar/Cancelar)
- [ ] Métricas de comisiones
- [ ] Vista de ingresos propios
- [ ] Modales de citas (crear/editar/detalles)

**Componentes a migrar:**
- AppointmentCreateModal
- AppointmentDetailsModal
- PaymentStep
- EvidenceCaptureModal
- ConsentCaptureModal

#### 1.3. Receptionist Dashboard Web
**Archivos a crear:**
- `packages/web-app/src/pages/dashboard/ReceptionistDashboard.jsx`
- `packages/web-app/src/components/receptionist/MultiSpecialistCalendar.jsx`
- `packages/web-app/src/components/receptionist/AppointmentFilters.jsx`

**Funcionalidades:**
- [ ] Vista de todas las citas
- [ ] Calendario multi-especialista
- [ ] Filtros avanzados (sucursal, especialista, estado)
- [ ] Creación de citas para cualquier especialista
- [ ] Gestión de estados
- [ ] Métricas generales del negocio
- [ ] Integración con caja

#### 1.4. Receptionist-Specialist Dashboard Web
**Archivos a crear:**
- `packages/web-app/src/pages/dashboard/ReceptionistSpecialistDashboard.jsx`

**Funcionalidades:**
- [ ] Toggle entre vistas (Recepcionista/Especialista)
- [ ] Vista "Todas las citas"
- [ ] Vista "Mis citas"
- [ ] Funcionalidades combinadas

---

### **FASE 2: SISTEMA DE CAJA REGISTRADORA**
**Prioridad: ALTA** | **Duración estimada: 2 semanas**

#### 2.1. Módulo de Caja Registradora
**Archivos a crear:**
- `packages/web-app/src/pages/cashRegister/OpenShift.jsx`
- `packages/web-app/src/pages/cashRegister/ActiveShift.jsx`
- `packages/web-app/src/pages/cashRegister/CloseShift.jsx`
- `packages/web-app/src/components/cashRegister/ShiftSummary.jsx`
- `packages/web-app/src/components/cashRegister/PaymentMethodBreakdown.jsx`
- `packages/web-app/src/components/cashRegister/ShiftReportPDF.jsx`

**Funcionalidades:**
- [ ] Apertura de turno
  - Registro de monto inicial
  - Validación de usuario
  - Registro de timestamp
  
- [ ] Turno activo
  - Vista en tiempo real
  - Métricas del turno
  - Ventas por método de pago
  - Ingresos vs egresos
  
- [ ] Cierre de turno
  - Conteo final de efectivo
  - Reconciliación
  - Reporte de diferencias
  - Generación de PDF de cierre

**APIs necesarias:**
- POST `/api/cash-register/open-shift` - Abrir turno
- GET `/api/cash-register/active-shift` - Obtener turno activo
- PATCH `/api/cash-register/active-shift` - Actualizar turno
- POST `/api/cash-register/close-shift` - Cerrar turno
- GET `/api/cash-register/shift/:id/report` - Reporte de turno

#### 2.2. Integración con Dashboards
- [ ] Widget de estado de caja en Business Dashboard
- [ ] Widget de estado de caja en Receptionist Dashboard
- [ ] Botones de acceso rápido a caja

---

### **FASE 3: SISTEMA DE PAGOS AVANZADO**
**Prioridad: ALTA** | **Duración estimada: 2 semanas**

#### 3.1. Componentes de Pago
**Archivos a crear:**
- `packages/web-app/src/components/payments/PaymentFlowManager.jsx`
- `packages/web-app/src/components/payments/PaymentMethodSelector.jsx`
- `packages/web-app/src/components/payments/PaymentSummary.jsx`
- `packages/web-app/src/components/payments/TransferPayment.jsx`
- `packages/web-app/src/components/payments/PaymentProofUpload.jsx`
- `packages/web-app/src/components/payments/WompiIntegration.jsx`
- `packages/web-app/src/components/payments/ProductServiceSelector.jsx`

**Funcionalidades:**
- [ ] Flujo completo de pago paso a paso
- [ ] Selector de métodos de pago
- [ ] Integración con Wompi
- [ ] Pagos por transferencia con comprobante
- [ ] Pagos en efectivo
- [ ] Pagos mixtos (múltiples métodos)
- [ ] Validación de montos
- [ ] Generación de recibos

---

### **FASE 4: SISTEMA DE EVIDENCIAS Y CONSENTIMIENTOS**
**Prioridad: MEDIA** | **Duración estimada: 1 semana**

#### 4.1. Evidencias
**Archivos a crear:**
- `packages/web-app/src/components/evidence/EvidenceUploader.jsx`
- `packages/web-app/src/components/evidence/EvidenceGallery.jsx`
- `packages/web-app/src/components/evidence/EvidencePreview.jsx`

**Funcionalidades:**
- [ ] Subida de fotos de evidencia
- [ ] Captura desde webcam (opcional)
- [ ] Galería de evidencias
- [ ] Asociación con citas
- [ ] Almacenamiento en cloud

#### 4.2. Consentimientos
**Archivos a crear:**
- `packages/web-app/src/components/consent/ConsentCaptureModal.jsx`
- `packages/web-app/src/components/consent/ConsentViewer.jsx`

**Funcionalidades:**
- [ ] Captura de consentimiento del cliente
- [ ] Firma digital
- [ ] Plantillas de consentimiento
- [ ] Visualización de consentimientos

---

### **FASE 5: SISTEMA DE PERMISOS Y VALIDACIONES**
**Prioridad: MEDIA** | **Duración estimada: 1 semana**

#### 5.1. Sistema de Permisos
**Archivos a crear:**
- `packages/web-app/src/components/permissions/PermissionGuard.jsx`
- `packages/web-app/src/components/permissions/PermissionButton.jsx`
- `packages/web-app/src/hooks/usePermissions.js`

**Funcionalidades:**
- [ ] Guards de permisos por rol
- [ ] Botones condicionales por permisos
- [ ] Validación de acceso a rutas
- [ ] Hook de permisos reutilizable

#### 5.2. Validaciones de Negocio
**Archivos a crear:**
- `packages/web-app/src/hooks/useBusinessRules.js`
- `packages/web-app/src/hooks/useAppointmentValidation.js`
- `packages/web-app/src/components/appointments/AppointmentClosureValidator.jsx`

**Funcionalidades:**
- [ ] Validaciones de reglas de negocio
- [ ] Validaciones de citas
- [ ] Validación de cierre de citas
- [ ] Validación de pagos

---

### **FASE 6: MEJORAS DE UX Y COMPONENTES ADICIONALES**
**Prioridad: BAJA** | **Duración estimada: 1 semana**

#### 6.1. Componentes de UI
**Archivos a crear:**
- `packages/web-app/src/components/common/BrandedButton.jsx`
- `packages/web-app/src/components/common/BrandedHeader.jsx`
- `packages/web-app/src/components/common/MetricCard.jsx`
- `packages/web-app/src/components/common/StatusBadge.jsx`

#### 6.2. Hooks Utilitarios
**Archivos a crear:**
- `packages/web-app/src/hooks/useAppointments.js`
- `packages/web-app/src/hooks/useCommissionManager.js`
- `packages/web-app/src/hooks/useSchedule.js`
- `packages/web-app/src/hooks/useTimeSlot.js`

#### 6.3. Configuraciones Adicionales
**Archivos a crear:**
- `packages/web-app/src/pages/settings/NumberingSettings.jsx`
- `packages/web-app/src/pages/settings/CommissionSettings.jsx`

---

### **FASE 7: INTEGRACIÓN DE NAVEGACIÓN Y ROUTING**
**Prioridad: ALTA** | **Duración estimada: 3 días**

**Archivos a modificar:**
- `packages/web-app/src/App.jsx`
- `packages/web-app/src/layouts/MainLayout.jsx`

**Funcionalidades:**
- [ ] Rutas para dashboards específicos
- [ ] Rutas para caja registradora
- [ ] Protección de rutas por rol
- [ ] Redirección automática según rol
- [ ] Menú de navegación actualizado

**Rutas a agregar:**
```javascript
// Dashboards
/dashboard/business-owner
/dashboard/specialist
/dashboard/receptionist
/dashboard/receptionist-specialist

// Caja Registradora
/cash-register/open
/cash-register/active
/cash-register/close
/cash-register/history

// Configuración
/settings/numbering
/settings/commissions
```

---

## 🔄 ESTRATEGIA DE MIGRACIÓN

### **Enfoque: Adaptación Progressive Web**

1. **Mantener la estructura backend actual** - Las APIs ya soportan ambas apps
2. **Adaptar componentes de React Native a React Web:**
   - Convertir componentes de `react-native` a `react` + `tailwindcss`
   - Mantener la lógica de negocio
   - Adaptar estilos de StyleSheet a Tailwind/CSS
   
3. **Reutilizar Redux Store:**
   - El store `@shared` ya es compartido
   - Agregar slices adicionales si es necesario

4. **Adaptar navegación:**
   - React Navigation (mobile) → React Router (web)
   - Mantener misma estructura de rutas

---

## 📦 COMPONENTES A REUTILIZAR VS RECREAR

### ✅ Reutilizar (lógica compartida desde @shared)
- Redux Store y Slices
- Hooks de negocio (adaptar para web)
- Utilidades y helpers
- Validaciones de negocio
- Constantes y configuraciones

### 🔄 Adaptar (convertir de React Native a React Web)
- Todos los componentes de UI
- Navegación
- Modales y overlays
- Formularios
- Calendario (usar librería web)

### ⚠️ Consideraciones Especiales

**Cámara y Evidencias:**
- Mobile usa `expo-camera`
- Web usará `getUserMedia` API o input file
- Considerar upload desde galería como fallback

**Almacenamiento:**
- Mobile usa `AsyncStorage`
- Web usa `localStorage` / `sessionStorage`

**Notificaciones:**
- Mobile usa push notifications
- Web usará notificaciones del navegador + toast messages

---

## 🎨 CONSIDERACIONES DE DISEÑO

### Responsive Design
- Desktop first (principal uso)
- Tablet compatible
- Mobile responsive (fallback)

### Componentes UI
- Usar TailwindCSS (ya está en web)
- Mantener el mismo esquema de colores
- Componentes consistentes con la web actual
- Usar ShadcnUI o librería similar para componentes complejos

### Calendario
- Usar `react-big-calendar` o `fullcalendar`
- Vista mes/semana/día
- Drag & drop de citas
- Color coding por estado

---

## 🧪 TESTING

### Por Fase
- [ ] Testing unitario de componentes
- [ ] Testing de integración con APIs
- [ ] Testing de flujos completos
- [ ] Testing de permisos por rol
- [ ] Testing de validaciones de negocio

### Testing de Usuario
- [ ] Business owner flujo completo
- [ ] Specialist flujo completo
- [ ] Receptionist flujo completo
- [ ] Receptionist-Specialist flujo completo

---

## 📊 MÉTRICAS DE ÉXITO

### Funcionalidad
- ✅ 100% de funcionalidades mobile replicadas en web
- ✅ Paridad de features entre ambas plataformas
- ✅ Todos los roles pueden operar completamente desde web

### Performance
- ✅ Carga inicial < 3 segundos
- ✅ Interacciones < 300ms
- ✅ Optimización de imágenes y assets

### UX
- ✅ Navegación intuitiva
- ✅ Feedback visual inmediato
- ✅ Manejo de errores claro

---

## 📅 TIMELINE ESTIMADO

| Fase | Duración | Acumulado |
|------|----------|-----------|
| Fase 1: Dashboards | 2-3 semanas | 3 semanas |
| Fase 2: Caja Registradora | 2 semanas | 5 semanas |
| Fase 3: Pagos Avanzados | 2 semanas | 7 semanas |
| Fase 4: Evidencias y Consentimientos | 1 semana | 8 semanas |
| Fase 5: Permisos y Validaciones | 1 semana | 9 semanas |
| Fase 6: UX y Componentes | 1 semana | 10 semanas |
| Fase 7: Integración y Testing | 1 semana | 11 semanas |

**Total estimado: 2.5 - 3 meses**

---

## 🚀 PRIORIZACIÓN SUGERIDA

### Sprint 1 (Semana 1-2): Dashboards Base
- Business Dashboard
- Specialist Dashboard básico

### Sprint 2 (Semana 3-4): Dashboards Avanzados
- Receptionist Dashboard
- Receptionist-Specialist Dashboard
- Integración de calendarios

### Sprint 3 (Semana 5-6): Caja Registradora
- OpenShift
- ActiveShift
- CloseShift

### Sprint 4 (Semana 7-8): Sistema de Pagos
- PaymentFlowManager
- Integraciones de pago
- Métodos de pago

### Sprint 5 (Semana 9-10): Refinamiento
- Evidencias y Consentimientos
- Permisos
- Validaciones

### Sprint 6 (Semana 11): Testing y Pulido
- Testing completo
- Corrección de bugs
- Optimización de performance

---

## 📝 NOTAS IMPORTANTES

### Ventajas de tener todo en Web:
1. ✅ Un solo codebase para mantener (menos duplicación)
2. ✅ Actualizaciones instantáneas (sin app stores)
3. ✅ Mejor experiencia en desktop
4. ✅ Facilidad de acceso desde cualquier dispositivo
5. ✅ Mejor para reportes y análisis de datos
6. ✅ Integración más fácil con otras herramientas

### Consideraciones:
1. ⚠️ La app mobile seguirá existiendo para uso en campo
2. ⚠️ Mantener sincronización de features entre ambas
3. ⚠️ Algunas features son mejor en mobile (cámara, notificaciones push)
4. ⚠️ La web debe ser Progressive Web App (PWA) para soporte offline

---

## 🎯 SIGUIENTE PASO INMEDIATO

**Recomendación: Comenzar con Fase 1 - Dashboards**

¿Por qué?
- Es la funcionalidad más visible para el cliente
- Tiene el mayor impacto en la experiencia de usuario
- Es la base para las demás funcionalidades
- Permite validar temprano con el cliente

**Archivos a crear primero:**
1. `packages/web-app/src/pages/dashboard/BusinessOwnerDashboard.jsx`
2. `packages/web-app/src/components/dashboard/MetricCard.jsx`
3. Rutas en App.jsx

---

## 📞 CONTACTO Y DUDAS

Para cualquier duda durante la implementación, revisar:
- Mobile: `packages/business-control-mobile/src/screens/dashboards/`
- Web actual: `packages/web-app/src/pages/dashboard/`
- Backend APIs: `packages/backend/src/controllers/`

---

**¿Quieres que comience con alguna fase específica o prefieres que te ayude a implementar algo en particular?**
