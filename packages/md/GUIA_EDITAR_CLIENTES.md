# 📝 Guía Rápida - Cómo Editar Clientes

## 🎯 Pasos para Editar un Cliente

### 1. Navegar a Historial de Clientes
- En el **sidebar izquierdo**, busca el ícono de usuarios 👥
- Haz clic en **"Historial de Clientes"**
- Deberías ver la lista de todos los clientes

### 2. Abrir Detalle del Cliente
- En la lista de clientes, haz clic en cualquier tarjeta de cliente
- Se abrirá un **modal grande** con todos los detalles del cliente
- El modal tiene 4 tabs: Info, Citas, Vouchers, Estadísticas

### 3. Abrir Modal de Edición
- En el **header del modal** (parte superior derecha)
- Verás dos botones:
  - 🖊️ **"Editar"** (botón blanco con borde)
  - ❌ **"X"** (para cerrar)
- Haz clic en el botón **"Editar"**

### 4. Editar Información del Cliente
Se abrirá un **segundo modal** encima del primero con un formulario dividido en 4 secciones:

#### 📋 Sección 1: Información Personal
- **Nombre** (obligatorio)
- **Apellido** (obligatorio)
- **Fecha de Nacimiento**
- **Género** (dropdown)

#### 📞 Sección 2: Información de Contacto
- **Email** (obligatorio, válido)
- **Teléfono Principal** (obligatorio)
- **Teléfono Secundario** (opcional)

#### 🏠 Sección 3: Dirección
- **Dirección**
- **Ciudad**
- **Departamento**
- **Código Postal**

#### 📝 Sección 4: Notas
- **Notas adicionales** (texto largo, opcional)

### 5. Guardar Cambios
- Edita los campos que necesites
- Haz clic en el botón **"Guardar Cambios"** (parte inferior del formulario)
- Verás una notificación verde: **"Cliente actualizado exitosamente"**
- El modal de edición se cerrará automáticamente
- Los cambios se reflejarán en el modal de detalle

### 6. Cancelar Edición
- Si no quieres guardar los cambios, haz clic en:
  - Botón **"Cancelar"** (parte inferior)
  - Botón **"X"** (esquina superior derecha)
  - Clic fuera del modal (overlay oscuro)

---

## 🐛 Solución de Problemas

### ❌ No veo el botón "Editar"
**Solución:**
1. Asegúrate de estar en el modal de detalle del cliente
2. El botón está en la esquina superior derecha, al lado del botón X
3. Es un botón blanco con borde gris y un ícono de lápiz

### ❌ El modal no se abre al hacer clic en "Editar"
**Solución:**
1. Abre la consola del navegador (F12)
2. Busca errores en rojo
3. Verifica que el archivo `EditClientModal.jsx` exista en:
   ```
   packages/web-app/src/pages/business/customers/components/EditClientModal.jsx
   ```

### ❌ No puedo guardar: "Error al actualizar cliente"
**Solución:**
1. Verifica que el **backend esté corriendo** en puerto 3001
2. Verifica que todos los **campos obligatorios** estén llenos:
   - Nombre ✓
   - Apellido ✓
   - Email válido ✓
   - Teléfono ✓
3. Revisa la consola del navegador para más detalles

### ❌ Los cambios no se reflejan en la lista
**Solución:**
- Cierra el modal de detalle
- La lista se recargará automáticamente
- Busca al cliente nuevamente para ver los cambios

---

## 🎨 Vista Visual del Flujo

```
1. Lista de Clientes
   ├─ [Tarjeta Cliente 1] ← Click aquí
   ├─ [Tarjeta Cliente 2]
   └─ [Tarjeta Cliente 3]
          ↓
2. Modal de Detalle (Grande)
   ┌─────────────────────────────┐
   │ [Foto] Juan Pérez           │ ← Header
   │        juan@email.com       │
   │ [🖊️ Editar] [❌]             │ ← Click en "Editar"
   ├─────────────────────────────┤
   │ [Info] [Citas] [Vouchers]   │ ← Tabs
   ├─────────────────────────────┤
   │ ... Contenido ...           │
   └─────────────────────────────┘
          ↓
3. Modal de Edición (Encima)
   ┌─────────────────────────────┐
   │ Editar Cliente         [❌]  │
   ├─────────────────────────────┤
   │ 📋 Información Personal     │
   │ ├─ Nombre: [___________]    │
   │ └─ Apellido: [________]     │
   │                              │
   │ 📞 Contacto                  │
   │ ├─ Email: [___________]     │
   │ └─ Teléfono: [________]     │
   │                              │
   │ 🏠 Dirección                 │
   │ └─ ... campos ...            │
   │                              │
   │ 📝 Notas                     │
   │ └─ [________________]        │
   ├─────────────────────────────┤
   │ [Cancelar] [Guardar Cambios]│ ← Botones
   └─────────────────────────────┘
```

---

## ✅ Verificación de Instalación

### Backend
```bash
# Verificar que el backend esté corriendo
cd packages/backend
npm start

# Deberías ver:
✅ Servidor corriendo en puerto 3001
```

### Frontend
```bash
# Verificar que el frontend esté corriendo
cd packages/web-app
npm run dev

# Deberías ver:
✅ Servidor corriendo en puerto 3000
```

### Base de Datos
```bash
# Verificar que las tablas existan
cd packages/backend
node scripts/run-voucher-migrations.js

# Deberías ver:
✅ Tabla "vouchers" creada exitosamente
✅ Tabla "customer_booking_blocks" creada exitosamente
```

---

## 📋 Checklist de Funcionalidad

- [ ] Puedo ver la lista de clientes
- [ ] Puedo abrir el detalle de un cliente
- [ ] Puedo ver el botón "Editar" en el detalle
- [ ] El modal de edición se abre al hacer clic
- [ ] Los campos se cargan con los datos del cliente
- [ ] Puedo modificar los campos
- [ ] La validación funciona (nombre, email obligatorios)
- [ ] Puedo guardar los cambios
- [ ] Veo notificación de éxito
- [ ] Los cambios se reflejan en el modal de detalle
- [ ] Puedo cancelar la edición

---

## 🚀 Próximas Funcionalidades

Una vez que la edición funcione, el siguiente paso será implementar:

1. **Sistema de Vouchers** 🎫
   - Ver vouchers del cliente
   - Crear voucher manual
   - Cancelar vouchers

2. **Sistema de Bloqueos** 🚫
   - Bloquear cliente manualmente
   - Ver estado de bloqueo
   - Desbloquear cliente

---

## 📞 Soporte

Si tienes problemas:
1. Revisa la consola del navegador (F12)
2. Revisa la terminal del backend (errores)
3. Verifica que ambos servidores estén corriendo
4. Comparte el error exacto que ves
