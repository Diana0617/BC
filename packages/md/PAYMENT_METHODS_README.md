# 💳 Sistema de Métodos de Pago - Beauty Control

> Sistema de configuración de métodos de pago personalizado por negocio

## 🎯 Descripción

Permite a los administradores de negocio (BUSINESS/OWNER) configurar los métodos de pago que aceptarán, y a los especialistas (SPECIALIST) usar esos métodos para registrar pagos en citas.

---

## ✅ Estado Actual

- ✅ **Backend:** Implementado y funcionando
- ✅ **Web-App:** Implementado y listo para probar
- ⏳ **Mobile:** Pendiente de limpieza y refactorización

---

## 🏗️ Arquitectura

```
┌──────────────┐         ┌──────────────┐
│   WEB-APP    │         │  MOBILE APP  │
│ (Config)     │         │  (Uso)       │
│              │         │              │
│ ✅ CRUD      │         │ ✅ Lectura   │
│              │         │ ✅ Registro  │
└──────┬───────┘         └──────┬───────┘
       │                        │
       └────────┬───────────────┘
                │
                ▼
       ┌────────────────┐
       │   BACKEND      │
       │   (API)        │
       └────────┬───────┘
                │
                ▼
       ┌────────────────┐
       │   PostgreSQL   │
       └────────────────┘
```

---

## 🚀 Inicio Rápido

### 1. Iniciar Backend
```bash
cd packages/backend
npm start
```

### 2. Iniciar Web-App
```bash
cd packages/web-app
npm run dev
```

### 3. Acceder
```
http://localhost:5173/business/profile
→ Sidebar → "Métodos de Pago"
```

---

## 📱 Plataformas

### Web-App (Administración)
**Ruta:** `/business/profile` → Métodos de Pago  
**Usuarios:** BUSINESS, OWNER  
**Funciones:**
- ✅ Crear métodos de pago
- ✅ Editar métodos existentes
- ✅ Activar/desactivar métodos
- ✅ Eliminar métodos
- ✅ Configurar información bancaria

### Mobile App (Operación)
**Ubicación:** Detalle de cita → Registrar pago  
**Usuarios:** SPECIALIST  
**Funciones:**
- ✅ Ver métodos disponibles (solo activos)
- ✅ Seleccionar método para pago
- ✅ Registrar monto de pago
- ✅ Subir comprobante (si requerido)
- ❌ **NO** puede crear/editar métodos

---

## 💰 Tipos de Pago Soportados

| Tipo | Código | Campos Adicionales | Color |
|------|--------|-------------------|-------|
| Efectivo | `CASH` | Ninguno | Verde |
| Tarjeta | `CARD` | Ninguno | Azul |
| Transferencia | `TRANSFER` | Banco, cuenta, CCI | Púrpura |
| Código QR | `QR` | Teléfono (Yape/Plin) | Naranja |
| Pago en Línea | `ONLINE` | Ninguno | Índigo |
| Otro | `OTHER` | Ninguno | Gris |

---

## 🔌 API Endpoints

### Configuración (Web-App)
```http
GET    /api/business/:businessId/payment-methods
POST   /api/business/:businessId/payment-methods
PUT    /api/business/:businessId/payment-methods/:methodId
DELETE /api/business/:businessId/payment-methods/:methodId
POST   /api/business/:businessId/payment-methods/reorder
```

### Uso (Mobile)
```http
GET    /api/business/:businessId/payment-methods (solo activos)
POST   /api/appointments/:id/payments
GET    /api/appointments/:id/payments
POST   /api/appointments/:id/payments/:paymentId/proof
POST   /api/appointments/:id/payments/:paymentId/refund
```

---

## 📊 Estructura de Datos

### PaymentMethod (JSONB)
```javascript
{
  id: "uuid",
  name: "Yape",
  type: "QR",
  isActive: true,
  requiresProof: true,
  icon: "qr-code-outline",
  order: 1,
  bankInfo: {
    phoneNumber: "+51987654321",
    holderName: "Beauty Salon SAC"
  },
  metadata: {
    description: "Pago mediante código QR de Yape"
  }
}
```

### AppointmentPayment (Tabla)
```sql
id UUID PRIMARY KEY
appointment_id UUID
amount DECIMAL(10,2)
payment_method_id UUID
reference_number VARCHAR(100)
proof_url TEXT
status VARCHAR(50)
registered_by UUID
registered_at TIMESTAMP
```

---

## 🧪 Testing

### Probar Web-App
```bash
# Ver guía completa
cat IMMEDIATE_TESTING_PLAN.md

# Resumen rápido:
1. Login como BUSINESS
2. Business Profile → Métodos de Pago
3. Crear "Yape" (QR, +51987654321)
4. Crear "Efectivo" (CASH)
5. Editar, desactivar, eliminar
```

---

## 📚 Documentación

| Documento | Propósito |
|-----------|-----------|
| `PAYMENT_METHODS_SUMMARY.md` | Resumen completo |
| `IMMEDIATE_TESTING_PLAN.md` | Plan de pruebas paso a paso |
| `PAYMENT_METHODS_ARCHITECTURE.md` | Arquitectura técnica |
| `MOBILE_CLEANUP_PLAN.md` | Plan de refactorización mobile |
| `PAYMENT_METHODS_DOCUMENTATION_INDEX.md` | Índice de docs |

**Ver más:** `PAYMENT_METHODS_DOCUMENTATION_INDEX.md`

---

## 🔐 Permisos

### Web-App (BUSINESS/OWNER)
```javascript
requireRole(['BUSINESS', 'OWNER'])
```
- Acceso completo a configuración
- Crear, editar, eliminar métodos
- Activar/desactivar métodos

### Mobile (SPECIALIST)
```javascript
requireAuth() + businessId match
```
- Solo lectura de métodos activos
- Registrar pagos en citas
- Subir comprobantes

---

## ⚙️ Configuración

### Variables de Entorno

**Backend (.env)**
```bash
PORT=3001
DB_NAME=beauty_control
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
```

**Web-App (.env)**
```bash
VITE_API_BASE_URL=http://localhost:3001/api
```

---

## 🎨 UI/UX

### Web-App
- Grid de cards responsivo
- Gradientes de colores por tipo
- Estados visuales (activo/inactivo)
- Modal de formulario con validaciones
- Toasts de confirmación

### Mobile (Futuro)
- Selector dropdown simple
- Upload de foto (cámara/galería)
- Preview de comprobante
- Lista de historial de pagos

---

## 🔄 Flujo de Trabajo

### Configuración (Web)
```
1. BUSINESS crea método "Yape"
2. Define tipo QR, teléfono, requiere comprobante
3. Backend guarda en JSONB
4. Método disponible para todos los specialists
```

### Uso (Mobile)
```
1. SPECIALIST abre cita
2. Ve métodos activos (solo lectura)
3. Selecciona "Yape"
4. Ingresa monto, sube comprobante
5. Backend registra pago
6. Genera recibo automático
```

---

## 🐛 Troubleshooting

### Backend no responde
```bash
cd packages/backend
npm start
```

### Web-app no carga métodos
- Verificar token en localStorage
- Verificar rol BUSINESS/OWNER
- Ver console del navegador (F12)

### Error 403 Forbidden
- Usuario no tiene rol correcto
- Verificar en BD: `user.role === 'BUSINESS'`

---

## 📈 Próximos Pasos

### Inmediato
- [ ] Probar configuración en web-app
- [ ] Validar persistencia de datos

### Corto Plazo
- [ ] Limpiar mobile (eliminar componentes de config)
- [ ] Crear componentes de uso en mobile
- [ ] Integrar en AppointmentDetailModal

### Mediano Plazo
- [ ] Sistema de comprobantes
- [ ] Generación de recibos
- [ ] Reportes por método de pago
- [ ] Estadísticas de ingresos

---

## 👥 Contribuir

### Desarrollo Web-App
```bash
cd packages/web-app
# Modificar: src/pages/business/profile/sections/PaymentMethodsSection.jsx
```

### Desarrollo Mobile
```bash
cd packages/business-control-mobile
# Ver: MOBILE_CLEANUP_PLAN.md
```

---

## 📞 Soporte

**Documentación:** Ver `PAYMENT_METHODS_DOCUMENTATION_INDEX.md`  
**Testing:** Ver `IMMEDIATE_TESTING_PLAN.md`  
**Arquitectura:** Ver `PAYMENT_METHODS_ARCHITECTURE.md`

---

## 📝 Changelog

### [1.0.0] - 2025-01-19

#### Agregado
- ✅ Configuración de métodos de pago en web-app
- ✅ CRUD completo de métodos
- ✅ 6 tipos de pago soportados
- ✅ Validaciones de formulario
- ✅ UI con gradientes y badges

#### Corregido
- ❌ Removida configuración incorrecta del mobile
- ✅ Separación correcta de responsabilidades

#### Pendiente
- ⏳ Componentes de uso en mobile
- ⏳ Registro de pagos en citas
- ⏳ Upload de comprobantes

---

## 📄 Licencia

Proyecto privado - Beauty Control © 2025

---

**Version:** 1.0.0  
**Estado:** Web-App lista, Mobile pendiente  
**Última actualización:** 19 de Enero, 2025
