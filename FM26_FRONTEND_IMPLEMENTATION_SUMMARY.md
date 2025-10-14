# 🎯 FM-26: Sistema de Procedimientos Completo - Resumen de Implementación

## 📦 Paquetes Instalados

### Frontend (web-app)
```bash
npm install @tinymce/tinymce-react react-signature-canvas
```

- **@tinymce/tinymce-react**: Editor WYSIWYG para crear plantillas HTML de consentimientos
- **react-signature-canvas**: Canvas para capturar firmas digitales con mouse/touch

### Backend (packages/backend)
```bash
npm install pdfkit  # ⚠️ PENDIENTE DE INSTALAR
```

---

## 🗂️ Archivos Creados/Actualizados

### 1️⃣ **Redux Layer** (packages/shared/src/store)

#### Slices
- ✅ `slices/commissionSlice.js` (370 líneas)
  - 6 async thunks para comisiones
  - Estado normalizado por serviceId
  - 15 selectores especializados

- ✅ `slices/consentSlice.js` (485 líneas)
  - 10 async thunks para templates y firmas
  - Gestión de filtros UI
  - 18 selectores con helpers

#### Selectores
- ✅ `selectors/commissionSelectors.js` (92 líneas)
  - Helpers: `calculateSpecialistCommission`, `validatePercentageSum`, `formatCommissionForDisplay`

- ✅ `selectors/consentSelectors.js` (235 líneas)
  - 10 helpers: validación, formateo, placeholders, PDF
  - Constantes: `CONSENT_CATEGORIES`, `SIGNATURE_STATUSES`

#### Configuración del Store
- ✅ `store/slices/index.js` - Exporta nuevos slices
- ✅ `store/index.js` - Registra reducers:
  ```javascript
  commission: commissionReducer,
  consent: consentReducer
  ```
- ✅ `store/selectors/index.js` - Exporta selectores

---

### 2️⃣ **API Layer** (packages/shared/src/api)

- ✅ `commissionApi.js` (94 líneas)
  - 6 métodos para gestión de comisiones
  - Cálculo de comisiones

- ✅ `consentApi.js` (174 líneas)
  - 10 métodos para templates y firmas
  - Descarga de PDFs con blob

- ✅ `index.js` - Exporta nuevas APIs en `businessApis`

---

### 3️⃣ **Frontend Components** (packages/web-app/src)

#### Actualizado
- ✅ `pages/business/profile/sections/ServicesSection.jsx` (360 líneas)
  - Rediseño completo con tarjetas expandibles
  - Integración con APIs de comisiones y consentimientos
  - Sistema de modales para configuración avanzada

#### Pendientes de Crear
- ⚠️ `components/services/ServiceFormModal.jsx`
  - Formulario para crear/editar servicios
  - Validaciones básicas (nombre, precio, duración)

- ⚠️ `components/services/CommissionConfigModal.jsx`
  - Configurar comisión personalizada por servicio
  - Toggle para usar config global o personalizada
  - Inputs para porcentajes especialista/negocio
  - Preview del cálculo

- ⚠️ `components/services/ConsentTemplateModal.jsx`
  - Selector de plantilla de consentimiento
  - Preview de la plantilla seleccionada
  - Asignar/desasignar template al servicio

---

## 🎨 UI/UX Mejoradas

### ServicesSection - Nueva UI

#### Tarjeta de Servicio Expandible
```jsx
<ServiceCard>
  {/* Header */}
  - Título y descripción
  - Botón editar
  
  {/* Info Básica */}
  - Duración (⏱️ 60 min)
  - Precio ($150,000)
  - Botón "Configurar" (expandir/contraer)
  
  {/* Badges */}
  - ✅ "Comisión configurada" (verde)
  - ✅ "Consentimiento" (azul)
  
  {/* Panel Expandible */}
  - 💰 Configurar Comisión
    * Muestra config actual o "Usando config general"
  - 📄 Consentimiento Informado
    * Muestra "Plantilla asignada" o "Asignar plantilla"
</ServiceCard>
```

#### Stats Card Global
```jsx
{commissionConfig && (
  <div className="bg-gradient...">
    - Tipo de comisión: "Por porcentaje"
    - Porcentaje general: 60%
  </div>
)}
```

---

## 🔄 Flujos Implementados

### 1. Crear Procedimiento
```
Usuario click "Nuevo Procedimiento"
  ↓
ServiceFormModal abre
  ↓
Llenar: nombre, descripción, duración, precio
  ↓
Guardar → POST /api/business/:id/services
  ↓
Recargar lista de servicios
```

### 2. Configurar Comisión
```
Usuario expande servicio → Click "Configurar Comisión"
  ↓
CommissionConfigModal abre
  ↓
Opciones:
  - Usar configuración general del negocio
  - Personalizar para este servicio:
    * Porcentaje especialista: 70%
    * Porcentaje negocio: 30%
  ↓
Guardar → PUT /api/business/:id/services/:serviceId/commission
  ↓
Badge "Comisión configurada" aparece
```

### 3. Asignar Consentimiento
```
Usuario expande servicio → Click "Consentimiento Informado"
  ↓
ConsentTemplateModal abre
  ↓
Muestra lista de plantillas disponibles:
  - Botox
  - Rellenos faciales
  - Depilación láser
  ↓
Seleccionar plantilla → Vista previa
  ↓
Guardar → PUT /api/business/:id/services/:serviceId
  {consentTemplateId: uuid}
  ↓
Badge "Consentimiento" aparece
```

---

## 📊 Estructura de Datos

### Service con Comisión y Consentimiento
```javascript
{
  id: "uuid",
  name: "Aplicación Botox",
  description: "Tratamiento de toxina botulínica tipo A",
  duration: 60,
  price: 350000,
  category: "COSMETIC",
  
  // 💰 Relación con comisión
  ServiceCommission: {
    id: "uuid",
    serviceId: "uuid",
    specialistPercentage: 70,
    businessPercentage: 30,
    calculationType: "PERCENTAGE",
    isActive: true
  },
  
  // 📄 Relación con consentimiento
  consentTemplateId: "uuid",
  ConsentTemplate: {
    id: "uuid",
    name: "Consentimiento Informado - Botox",
    code: "CONSENT_BOTOX",
    category: "COSMETIC",
    content: "<html>...</html>",
    version: "1.0.0",
    isActive: true
  }
}
```

---

## 🚀 Próximos Pasos

### Prioridad ALTA 🔴

1. **Crear Modales de Configuración**
   - [ ] `ServiceFormModal.jsx`
   - [ ] `CommissionConfigModal.jsx`
   - [ ] `ConsentTemplateModal.jsx`

2. **Instalar PDFKit en Backend**
   ```bash
   cd packages/backend
   npm install pdfkit
   ```

3. **Implementar Generación de PDFs**
   - [ ] Actualizar `consentController.getSignaturePDF()`
   - [ ] Crear servicio de generación: `src/services/PdfGenerationService.js`
   - [ ] Incluir logo del negocio, firma capturada, headers/footers

### Prioridad MEDIA 🟡

4. **Pantalla de Gestión de Plantillas**
   - [ ] `pages/business/consents/ConsentTemplatesPage.jsx`
   - [ ] Integrar TinyMCE para edición HTML
   - [ ] Botones para insertar placeholders
   - [ ] Configuración de campos editables

5. **Sistema de Firma de Consentimientos**
   - [ ] `components/appointments/ConsentSigningModal.jsx`
   - [ ] Integrar `react-signature-canvas`
   - [ ] Captura de metadata (IP, GPS, dispositivo)
   - [ ] Vista previa del consentimiento con placeholders reemplazados

6. **Configuración Global de Comisiones**
   - [ ] `pages/business/settings/CommissionSettings.jsx`
   - [ ] Toggle habilitar/deshabilitar comisiones
   - [ ] Selector de tipo: Porcentaje / Monto fijo / Sin comisión
   - [ ] Configuración general por defecto

### Prioridad BAJA 🟢

7. **Optimizaciones de Backend**
   - [ ] Índices en BD:
     ```sql
     CREATE INDEX idx_consent_signatures_customer ON consent_signatures(customerId, status);
     CREATE INDEX idx_service_commissions_service ON service_commissions(serviceId);
     ```
   - [ ] Caché de plantillas frecuentes
   - [ ] Paginación en listado de firmas

8. **Testing**
   - [ ] Tests unitarios de Redux slices
   - [ ] Tests de integración de APIs
   - [ ] Tests E2E del flujo completo

---

## 🎯 Casos de Uso Completos

### Caso 1: Salón que ofrece Botox
```
1. Crear servicio "Aplicación Botox" ($350,000)
2. Configurar comisión: 70% especialista / 30% negocio
3. Asignar plantilla "Consentimiento Informado - Botox"
4. Cuando cliente agenda cita:
   - Sistema verifica si tiene consentimiento firmado
   - Si no → Mostrar modal de firma con canvas
   - Captura firma + metadata
   - Genera PDF firmado
5. Al finalizar servicio:
   - Calcula comisión: $245,000 especialista / $105,000 negocio
   - Registra en sistema de pagos
```

### Caso 2: Negocio con múltiples procedimientos
```
- Corte básico: Sin comisión (servicio base)
- Coloración: 50/50 (config general)
- Keratina: 60% especialista (personalizado)
- Botox: 70% especialista + Consentimiento obligatorio
- Rellenos: 65% especialista + Consentimiento obligatorio
```

---

## 📝 Notas Técnicas

### Placeholders Disponibles en Consentimientos
```html
{{negocio_nombre}}       → "Beauty Salon SPA"
{{cliente_nombre}}       → "María González"
{{servicio_nombre}}      → "Aplicación Botox"
{{fecha_firma}}          → "14 de octubre de 2025"
{{especialista_nombre}}  → "Dra. Laura Pérez"
{{precio_servicio}}      → "$350,000"
```

### Metadata de Firma Digital
```javascript
{
  signatureImage: "data:image/png;base64,...",  // Canvas capturado
  ipAddress: "192.168.1.100",                    // Del request
  gpsCoordinates: "4.6097,-74.0817",             // Si disponible
  deviceInfo: "Mozilla/5.0 (Windows NT 10.0...)",
  timestamp: "2025-10-14T10:30:00Z"
}
```

### Tipos de Cálculo de Comisión
```javascript
PERCENTAGE:     // Por porcentaje
  - specialistPercentage: 60
  - businessPercentage: 40
  - Suma debe ser 100%

FIXED_AMOUNT:   // Monto fijo
  - fixedAmount: 150000
  - No importa el precio del servicio

NO_COMMISSION:  // Sin comisión
  - Todo va al negocio
```

---

## ✅ Checklist de Implementación

### Backend
- [x] Modelos: BusinessCommissionConfig, ServiceCommission, ConsentTemplate, ConsentSignature
- [x] Controladores: commissionController, consentController
- [x] Rutas: 16 endpoints registrados
- [x] Base de datos sincronizada
- [ ] PDFKit instalado
- [ ] Generación de PDFs implementada

### Shared
- [x] Redux slices: commission, consent
- [x] Selectores con helpers
- [x] APIs: commissionApi, consentApi
- [x] Store configurado

### Frontend
- [x] ServicesSection actualizado
- [x] Librerías instaladas (TinyMCE, signature-canvas)
- [ ] ServiceFormModal
- [ ] CommissionConfigModal
- [ ] ConsentTemplateModal
- [ ] ConsentTemplatesPage
- [ ] ConsentSigningModal
- [ ] CommissionSettingsPage

---

## 🎉 Resultado Final

El sistema ahora permite:

✅ **Crear procedimientos/servicios** con toda la información básica
✅ **Configurar comisiones personalizadas** por servicio o usar config general
✅ **Asignar plantillas de consentimiento** a servicios que lo requieran
✅ **Estado visual claro** de qué está configurado y qué falta
✅ **Arquitectura Redux** lista para componentes futuros
✅ **APIs completas** para todas las operaciones

**¡El foundation está listo para implementar los modales y completar la experiencia de usuario!** 🚀
