# 🧪 Guía de Pruebas - Sistema de Métodos de Pago (Web-App)

## ⚠️ CORRECCIÓN IMPORTANTE

**La configuración de métodos de pago se hace desde la WEB-APP, NO desde el mobile.**

- ✅ **Web-App:** Configurar, editar, eliminar métodos (BUSINESS/OWNER)
- ✅ **Mobile:** Solo usar métodos configurados para registrar pagos (SPECIALIST)

---

## ✅ Pre-requisitos Completados

- ✅ Backend corriendo en `http://localhost:3001`
- ✅ Migración ejecutada (tabla `appointment_payments` creada)
- ✅ Rutas registradas en `app.js`
- ✅ Frontend web con `PaymentMethodsSection` creado
- ✅ Integrado en `BusinessProfile`

---

## 🚀 Paso 1: Iniciar el Backend

```bash
cd packages/backend
npm start
```

**Verificar:**
```
✅ Conexión a la base de datos establecida correctamente
🚀 Servidor Business Control corriendo en puerto 3001
```

---

## 🌐 Paso 2: Iniciar la Web-App

```bash
cd packages/web-app
npm run dev
```

**Verificar:**
```
  VITE v5.x.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## 🔑 Paso 3: Login en Web-App

1. Abre el navegador en `http://localhost:5173`
2. Login como **BUSINESS/OWNER**:
   - Email: (tu email de business/owner)
   - Password: (tu password)

**Importante:** Solo usuarios con rol **BUSINESS** u **OWNER** pueden configurar métodos de pago.

---

## 📱 Paso 4: Navegar a Métodos de Pago

### Ruta de Navegación:
```
1. Dashboard de Business
2. Perfil de Negocio (Business Profile)
3. Sidebar izquierdo
4. Sección "Métodos de Pago"
```

### URL Directa:
```
http://localhost:5173/business/profile?section=payment-methods
```

### Lo que deberías ver:

#### Si es la primera vez (Sin métodos configurados):
```
┌──────────────────────────────────────────────────┐
│  💳 Métodos de Pago                        [+]   │
│  Configura los métodos de pago que aceptarás    │
├──────────────────────────────────────────────────┤
│                                                  │
│               � (icono grande)                  │
│                                                  │
│        No hay métodos de pago configurados      │
│                                                  │
│   Crea tu primer método de pago para empezar    │
│            a recibir pagos                       │
│                                                  │
│          [ 📝 Crear Primer Método ]             │
│                                                  │
└──────────────────────────────────────────────────┘
```

#### Si ya hay métodos configurados:
```
┌──────────────────────────────────────────────────┐
│  💳 Métodos de Pago                        [+]   │
│  Configura los métodos de pago que aceptarás    │
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌────────────────┐  ┌────────────────┐  ┌─────┐│
│  │ 💰 Efectivo    │  │ 📱 Yape        │  │ ...││
│  │ CASH           │  │ QR             │  │    ││
│  │ Orden #1    ✓  │  │ +51987654321   │  │    ││
│  │                │  │ ☑ Comprobante  │  │    ││
│  │ [Editar]       │  │ [Editar]       │  │    ││
│  │ [Eliminar]     │  │ [Eliminar]     │  │    ││
│  └────────────────┘  └────────────────┘  └─────┘│
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## 🧪 Paso 4: Pruebas Funcionales

### Test 1: Crear Método "Yape"

1. **Toca el botón [+] o "Crear Método"**

2. **Completa el formulario:**
   ```
   Nombre del Método: Yape
   Tipo: Código QR
   Icono: Selecciona 📱 (qr-code-outline)
   ¿Requiere comprobante?: ✓ (activar)
   
   --- Información Bancaria ---
   Teléfono: +51987654321
   Titular: Beauty Salon SAC
   
   Descripción: Pago mediante código QR de Yape
   ```

3. **Toca "Crear"**

4. **Verificar:**
   - ✅ Toast/Alert: "Método de pago creado correctamente"
   - ✅ Modal se cierra
   - ✅ Nuevo card "Yape" aparece en la lista
   - ✅ Color naranja (#f59e0b) en el gradiente
   - ✅ Badge "Requiere comprobante" visible
   - ✅ Info: "📱 +51987654321"
   - ✅ Toggle verde ✓ (activo)
   - ✅ Orden #1 visible

### Test 2: Crear Método "Plin"

1. **Toca [+]**

2. **Completa:**
   ```
   Nombre: Plin
   Tipo: Código QR
   Icono: 📱
   Requiere comprobante: ✓
   Teléfono: +51912345678
   Titular: Beauty Salon SAC
   ```

3. **Verificar:**
   - ✅ Aparece en la lista
   - ✅ Orden #2

### Test 3: Crear Método "Transferencia BCP"

1. **Toca [+]**

2. **Completa:**
   ```
   Nombre: Transferencia BCP
   Tipo: Transferencia
   Icono: 🔄 (swap-horizontal-outline)
   Requiere comprobante: ✓
   
   --- Info Bancaria ---
   Nombre del Banco: Banco de Crédito del Perú
   Número de Cuenta: 1234567890123456
   Tipo de Cuenta: Cuenta Corriente
   CCI: 00212300123456789012
   Titular: Beauty Salon SAC
   ```

3. **Verificar:**
   - ✅ Card con color púrpura (#8b5cf6)
   - ✅ Muestra info bancaria completa
   - ✅ Badge "Requiere comprobante"

### Test 4: Crear Método "Efectivo" (sin comprobante)

1. **Toca [+]**

2. **Completa:**
   ```
   Nombre: Efectivo
   Tipo: Efectivo (CASH)
   Icono: 💰 (cash-outline)
   Requiere comprobante: ✗ (desactivado)
   ```

3. **Verificar:**
   - ✅ Color verde (#10b981)
   - ✅ NO muestra badge de comprobante
   - ✅ NO muestra sección de info bancaria

### Test 5: Editar Método Existente

1. **Selecciona "Yape"**
2. **Toca "Editar"**
3. **Modifica:**
   ```
   Teléfono: +51999999999 (cambiar)
   Requiere comprobante: ✗ (desactivar)
   ```
4. **Toca "Actualizar"**

5. **Verificar:**
   - ✅ Card actualizado con nuevo teléfono
   - ✅ Badge de comprobante desaparecido
   - ✅ Toast: "Método actualizado"

### Test 6: Desactivar Método

1. **En el card de "Plin"**
2. **Toca el toggle verde ✓**
3. **Confirma en el Alert: "Desactivar"**

4. **Verificar:**
   - ✅ Card se vuelve gris con opacity 0.7
   - ✅ Toggle cambia a rojo ✗
   - ✅ Método sigue visible pero inactivo

### Test 7: Reactivar Método

1. **En el card de "Plin" (ahora gris)**
2. **Toca el toggle rojo ✗**
3. **Confirma: "Activar"**

4. **Verificar:**
   - ✅ Card vuelve a color naranja
   - ✅ Toggle verde ✓
   - ✅ Opacity normal

### Test 8: Eliminar Método

1. **En el card de "Transferencia BCP"**
2. **Toca "Eliminar"**
3. **Confirma en Alert:**
   ```
   "¿Estás seguro de eliminar 'Transferencia BCP'?
   Esta acción no se puede deshacer."
   → Toca "Eliminar"
   ```

4. **Verificar:**
   - ✅ Card desaparece de la lista
   - ✅ Toast: "Método eliminado correctamente"
   - ✅ Contador en header actualizado

### Test 9: Pull-to-Refresh

1. **Desliza hacia abajo en la lista**
2. **Suelta para refrescar**

3. **Verificar:**
   - ✅ Spinner de loading visible
   - ✅ Lista se recarga
   - ✅ Datos se mantienen consistentes

### Test 10: Validación de Formulario

1. **Toca [+] para crear método**
2. **Intenta crear SIN nombre:**
   - Deja "Nombre" vacío
   - Toca "Crear"

3. **Verificar:**
   - ✅ Alert: "Por favor completa todos los campos requeridos"
   - ✅ Campo "Nombre" con borde rojo
   - ✅ Mensaje de error debajo

4. **Intenta crear Transferencia sin cuenta:**
   - Nombre: "Test"
   - Tipo: Transferencia
   - NO completes "Número de Cuenta"
   - Toca "Crear"

5. **Verificar:**
   - ✅ Error: "Número de cuenta requerido"

6. **Intenta crear QR sin teléfono:**
   - Nombre: "Test QR"
   - Tipo: Código QR
   - NO completes "Teléfono"
   - Toca "Crear"

7. **Verificar:**
   - ✅ Error: "Teléfono requerido para QR"

---

## 🔍 Paso 5: Verificar en Backend

### Usando Insomnia/Postman:

1. **Importar colección:**
   - Archivo: `payment_methods_insomnia.json`
   - Ubicación: Raíz del proyecto

2. **Configurar variables:**
   ```
   base_url: http://localhost:3001/api
   auth_token: (tu token JWT del login)
   business_id: (tu businessId)
   ```

3. **Probar endpoint GET:**
   ```
   GET http://localhost:3001/api/business/{businessId}/payment-methods
   ```

   **Respuesta esperada:**
   ```json
   {
     "success": true,
     "data": {
       "paymentMethods": [
         {
           "id": "uuid-generated",
           "name": "Yape",
           "type": "QR",
           "isActive": true,
           "requiresProof": false,
           "icon": "qr-code-outline",
           "order": 1,
           "bankInfo": {
             "phoneNumber": "+51999999999",
             "holderName": "Beauty Salon SAC"
           },
           "createdAt": "2025-01-19T...",
           "updatedAt": "2025-01-19T..."
         },
         {
           "id": "uuid-generated-2",
           "name": "Efectivo",
           "type": "CASH",
           "isActive": true,
           "requiresProof": false,
           "icon": "cash-outline",
           "order": 2
         }
       ]
     }
   }
   ```

---

## 🐛 Troubleshooting

### Problema 1: "Cannot read property 'businessId' of undefined"

**Causa:** No estás logueado como BUSINESS

**Solución:**
1. Hacer logout
2. Login con usuario BUSINESS
3. Verificar en Redux DevTools que `state.auth.user.role === 'BUSINESS'`

### Problema 2: "Network request failed"

**Causa:** Backend no está corriendo o URL incorrecta

**Solución:**
```bash
# Verificar backend
cd packages/backend
npm start

# Verificar que esté en puerto 3001
# Debe mostrar: "🚀 Servidor Business Control corriendo en puerto 3001"
```

### Problema 3: Modal no abre

**Causa:** Error en el componente

**Solución:**
1. Abrir consola del emulador (Cmd+D en iOS, Cmd+M en Android)
2. Ver errores en "Show Dev Menu" → "Debug"
3. Verificar que `@react-native-picker/picker` esté instalado

### Problema 4: Métodos no se guardan

**Causa:** Error en el backend o token expirado

**Solución:**
1. Ver logs del backend en terminal
2. Verificar que ruta esté registrada: buscar `app.use('/api', paymentRoutes)` en logs
3. Si token expiró: logout y login de nuevo

### Problema 5: Campos bancarios no aparecen

**Causa:** Lógica condicional

**Solución:**
- Campos solo aparecen si:
  - `type === 'TRANSFER'` → Campos bancarios completos
  - `type === 'QR'` → Campo de teléfono
  - `requiresProof === true` → Campos opcionales

---

## 📊 Checklist de Pruebas

### Funcionalidad Básica
- [ ] App inicia correctamente
- [ ] Login como BUSINESS funciona
- [ ] Navegación a "Métodos de Pago" funciona
- [ ] Lista carga (vacía o con datos)

### CRUD Operaciones
- [ ] Crear método "Yape" → ✅
- [ ] Crear método "Plin" → ✅
- [ ] Crear método "Transferencia" → ✅
- [ ] Crear método "Efectivo" → ✅
- [ ] Editar método existente → ✅
- [ ] Desactivar método → ✅
- [ ] Reactivar método → ✅
- [ ] Eliminar método → ✅

### Validaciones
- [ ] Nombre vacío → Error
- [ ] Transferencia sin cuenta → Error
- [ ] QR sin teléfono → Error
- [ ] Campos requeridos marcados con *

### UI/UX
- [ ] Colores correctos por tipo
- [ ] Gradientes renderizando
- [ ] Iconos mostrándose
- [ ] Toggle funciona visualmente
- [ ] Loading states visibles
- [ ] Pull-to-refresh funciona
- [ ] Empty state se muestra
- [ ] Confirmaciones de eliminación

### Backend
- [ ] GET métodos funciona (Insomnia)
- [ ] POST crear funciona
- [ ] PUT editar funciona
- [ ] DELETE funciona
- [ ] Datos persisten en BD

---

## 📸 Capturas Esperadas

1. **Empty State**
   - Icono grande de wallet
   - Texto "No hay métodos de pago"
   - Botón "Crear Método"

2. **Lista con Métodos**
   - 3-4 cards con diferentes colores
   - Badges visibles donde corresponda
   - Toggles verdes (activos)

3. **Modal de Creación**
   - Formulario completo visible
   - Selector de iconos
   - Switch de comprobante

4. **Modal con Info Bancaria**
   - Campos de banco, cuenta, CCI
   - O campo de teléfono para QR

5. **Método Inactivo**
   - Card gris con opacity
   - Toggle rojo

---

## 🎬 Siguiente Fase

Una vez que todo funcione correctamente:

### Fase 2: Registro de Pagos
1. Modificar `AppointmentDetailModal`
2. Crear `PaymentRegistrationModal`
3. Crear `PaymentHistoryItem`
4. Integrar con endpoints de pagos

**Endpoints a usar:**
```
POST   /api/appointments/:id/payments
GET    /api/appointments/:id/payments
POST   /api/appointments/:id/payments/:id/proof
POST   /api/appointments/:id/payments/:id/refund
```

---

**¡Buena suerte con las pruebas! 🚀**

Si encuentras algún problema, revisa los logs del backend y la consola del emulador.
