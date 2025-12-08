# ⚡ Plan de Ejecución Inmediato

## 🎯 Objetivo
Probar la configuración de métodos de pago en la **web-app** y validar que todo funciona correctamente.

---

## 📋 Pre-requisitos (Verificar)

### 1. Backend Corriendo ✅
```bash
cd packages/backend
npm start
```

**Esperar ver:**
```
✅ Conexión a la base de datos establecida correctamente
🚀 Servidor Business Control corriendo en puerto 3001
```

### 2. Web-App Lista ✅
```bash
cd packages/web-app
npm run dev
```

**Esperar ver:**
```
VITE v5.x.x  ready in XXX ms
➜  Local:   http://localhost:5173/
```

---

## 🧪 Plan de Pruebas (Paso a Paso)

### Test 1: Acceso a la Sección ⏱️ 2 min

**Pasos:**
1. Abrir navegador: `http://localhost:5173`
2. Login como BUSINESS:
   - Email: `tu-email@ejemplo.com`
   - Password: `tu-password`
3. Verificar que redirige a `/business/profile`
4. En el sidebar izquierdo, buscar "Métodos de Pago"
5. Click en "Métodos de Pago"

**Resultado Esperado:**
- ✅ Pantalla carga sin errores
- ✅ Se ve el header "💳 Métodos de Pago"
- ✅ Se ve botón "[+] Agregar Método de Pago"
- ✅ Se ve mensaje de "No hay métodos configurados" (primera vez)

**Si falla:**
- Verificar console del navegador (F12)
- Verificar que backend está corriendo
- Verificar token en localStorage

---

### Test 2: Crear Método "Efectivo" ⏱️ 3 min

**Pasos:**
1. Click en botón "[+] Agregar Método de Pago"
2. Formulario debe abrir (modal)
3. Llenar:
   - Nombre: `Efectivo`
   - Tipo: `Efectivo (CASH)`
   - Requiere comprobante: **NO** (dejar sin marcar)
4. Click "Crear"

**Resultado Esperado:**
- ✅ Modal se cierra
- ✅ Toast verde: "Método creado correctamente"
- ✅ Aparece card verde con "💰 Efectivo"
- ✅ Card muestra tipo "CASH"
- ✅ Toggle verde (activo) ✓
- ✅ Orden #1 visible

**Verificar en Backend:**
```bash
# En otra terminal
curl -H "Authorization: Bearer TU_TOKEN" \
  http://localhost:3001/api/business/TU_BUSINESS_ID/payment-methods
```

Debe retornar JSON con el método creado.

---

### Test 3: Crear Método "Yape" ⏱️ 4 min

**Pasos:**
1. Click "[+]"
2. Llenar:
   - Nombre: `Yape`
   - Tipo: `Código QR`
   - Requiere comprobante: **SÍ** ✓
   - **Sección de info QR debe aparecer**
   - Teléfono: `+51987654321`
   - Titular: `Beauty Salon SAC`
   - Descripción: `Pago mediante código QR de Yape`
3. Click "Crear"

**Resultado Esperado:**
- ✅ Card naranja con "📱 Yape"
- ✅ Tipo "Código QR"
- ✅ Badge azul "Requiere comprobante"
- ✅ Info bancaria visible: "📱 +51987654321"
- ✅ Orden #2

---

### Test 4: Crear Método "Transferencia BCP" ⏱️ 5 min

**Pasos:**
1. Click "[+]"
2. Llenar:
   - Nombre: `Transferencia BCP`
   - Tipo: `Transferencia Bancaria`
   - Requiere comprobante: **SÍ** ✓
   - **Sección de info bancaria debe aparecer**
   - Banco: `Banco de Crédito del Perú`
   - Tipo de Cuenta: `Cuenta Corriente`
   - Número de Cuenta: `1234567890123456`
   - CCI: `00212300123456789012`
   - Titular: `Beauty Salon SAC`
3. Click "Crear"

**Resultado Esperado:**
- ✅ Card púrpura con "🔄 Transferencia BCP"
- ✅ Tipo "Transferencia"
- ✅ Info bancaria completa visible:
  - 🏦 Banco de Crédito del Perú
  - 💳 Cuenta Corriente: 1234567890123456
  - 🔢 CCI: 00212300123456789012
  - 👤 Beauty Salon SAC
- ✅ Badge "Requiere comprobante"
- ✅ Orden #3

---

### Test 5: Editar Método Existente ⏱️ 3 min

**Pasos:**
1. En el card "Yape", click "Editar"
2. Modificar:
   - Teléfono: `+51999888777` (cambiar)
   - Requiere comprobante: **NO** (desmarcar)
3. Click "Actualizar"

**Resultado Esperado:**
- ✅ Modal cierra
- ✅ Toast: "Método actualizado correctamente"
- ✅ Card actualiza con nuevo teléfono
- ✅ Badge "Requiere comprobante" desaparece

---

### Test 6: Desactivar Método ⏱️ 2 min

**Pasos:**
1. En card "Transferencia BCP", click en toggle verde ✓
2. Confirmar en diálogo

**Resultado Esperado:**
- ✅ Card se vuelve gris/opaco
- ✅ Toggle cambia a rojo ✗ (inactivo)
- ✅ Toast: "Método desactivado"

---

### Test 7: Reactivar Método ⏱️ 2 min

**Pasos:**
1. En card gris "Transferencia BCP", click toggle rojo ✗
2. Confirmar

**Resultado Esperado:**
- ✅ Card vuelve a color púrpura normal
- ✅ Toggle verde ✓
- ✅ Toast: "Método activado"

---

### Test 8: Eliminar Método ⏱️ 2 min

**Pasos:**
1. En card "Transferencia BCP", click "Eliminar"
2. Aparece confirmación:
   ```
   ¿Eliminar permanentemente "Transferencia BCP"?
   Esta acción no se puede deshacer.
   ```
3. Click "Eliminar"

**Resultado Esperado:**
- ✅ Card desaparece
- ✅ Toast: "Método eliminado correctamente"
- ✅ Solo quedan "Efectivo" y "Yape"

---

### Test 9: Validaciones de Formulario ⏱️ 3 min

**Test 9.1: Nombre vacío**
1. Click "[+]"
2. Dejar "Nombre" vacío
3. Click "Crear"

**Resultado Esperado:**
- ✅ Toast rojo: "El nombre es requerido"
- ✅ Modal NO se cierra

---

**Test 9.2: Transferencia sin cuenta**
1. Click "[+]"
2. Llenar:
   - Nombre: `Test Transfer`
   - Tipo: `Transferencia Bancaria`
   - **NO llenar "Número de Cuenta"**
3. Click "Crear"

**Resultado Esperado:**
- ✅ Toast rojo: "El número de cuenta es requerido para transferencias"
- ✅ Modal NO se cierra

---

**Test 9.3: QR sin teléfono**
1. Click "[+]"
2. Llenar:
   - Nombre: `Test QR`
   - Tipo: `Código QR`
   - **NO llenar "Teléfono"**
3. Click "Crear"

**Resultado Esperado:**
- ✅ Toast rojo: "El teléfono es requerido para métodos QR"
- ✅ Modal NO se cierra

---

### Test 10: Persistencia de Datos ⏱️ 2 min

**Pasos:**
1. Refrescar la página (F5)
2. Navegar nuevamente a "Métodos de Pago"

**Resultado Esperado:**
- ✅ Métodos siguen ahí ("Efectivo" y "Yape")
- ✅ Datos correctos (teléfono actualizado de Yape)
- ✅ Estados correctos (activos)

---

## 📊 Checklist de Resultados

### Funcionalidad Básica
- [ ] Navegación a sección funciona
- [ ] Lista carga sin errores
- [ ] Botón "[+]" abre modal
- [ ] Modal cierra con "Cancelar"

### CRUD Operaciones
- [ ] Crear "Efectivo" → ✅
- [ ] Crear "Yape" → ✅
- [ ] Crear "Transferencia" → ✅
- [ ] Editar "Yape" → ✅
- [ ] Desactivar método → ✅
- [ ] Reactivar método → ✅
- [ ] Eliminar método → ✅

### Validaciones
- [ ] Nombre vacío → Error ✅
- [ ] Transfer sin cuenta → Error ✅
- [ ] QR sin teléfono → Error ✅
- [ ] Campos requeridos marcados con *

### UI/UX
- [ ] Colores correctos por tipo
- [ ] Gradientes renderizando
- [ ] Badges visibles
- [ ] Toggle funciona
- [ ] Toasts aparecen
- [ ] Modal responsive

### Persistencia
- [ ] Datos persisten después de refresh
- [ ] Backend confirma datos guardados
- [ ] Métodos activos/inactivos correctos

---

## 🐛 Troubleshooting

### Error: "Cannot read property 'id' of undefined"
**Causa:** No hay business cargado  
**Solución:** Logout y login de nuevo como BUSINESS

---

### Error: "Network request failed"
**Causa:** Backend no está corriendo  
**Solución:**
```bash
cd packages/backend
npm start
```

---

### Error: Modal no abre
**Causa:** Error de JavaScript  
**Solución:** Abrir console (F12), buscar error rojo, reportar

---

### Error: "403 Forbidden"
**Causa:** Usuario no tiene rol BUSINESS  
**Solución:** Verificar en BD que user.role === 'BUSINESS'

---

### Los métodos no persisten
**Causa:** Error al guardar en BD  
**Solución:** Ver logs del backend, verificar migración ejecutada

---

## ✅ Criterios de Éxito

Para considerar la prueba **exitosa**, debe cumplir:

- ✅ Todos los tests (1-10) pasan sin errores
- ✅ No hay errores en console del navegador
- ✅ No hay errores en logs del backend
- ✅ Datos persisten después de refresh
- ✅ Validaciones funcionan correctamente
- ✅ UI renderiza correctamente en desktop

---

## 📸 Capturas a Tomar

1. **Empty State** (sin métodos)
2. **Lista con 3 métodos** (Efectivo, Yape, Transfer)
3. **Modal de creación** abierto
4. **Card de Yape** con info de teléfono
5. **Card de Transfer** con info bancaria completa
6. **Método inactivo** (gris)
7. **Toast de éxito** al crear
8. **Error de validación** (nombre vacío)

---

## 🕐 Tiempo Estimado Total

**30 minutos** para completar todos los tests

---

## 📝 Reporte de Resultados

Después de probar, reportar:

```markdown
## Resultados de Testing - Métodos de Pago Web-App

**Fecha:** [fecha]
**Tester:** [nombre]
**Navegador:** [Chrome/Firefox/Edge]

### Tests Pasados
- [x] Test 1: Acceso
- [x] Test 2: Crear Efectivo
- [ ] Test 3: Crear Yape
...

### Errores Encontrados
1. [Descripción del error]
   - Pasos para reproducir
   - Screenshot
   - Mensaje de error

### Observaciones
- UI se ve bien en desktop
- Falta testear en mobile
- Sugerencia: [...]

### Conclusión
✅ APROBADO / ❌ REQUIERE CORRECCIONES
```

---

## 🚀 Siguiente Paso

Si todos los tests pasan:
→ Proceder a limpiar el mobile app
→ Ver `MOBILE_CLEANUP_PLAN.md`

Si hay errores:
→ Reportar en issue
→ Corregir antes de continuar

---

**Estado:** Listo para ejecutar  
**Plataforma:** Web-App (http://localhost:5173)  
**Rol:** BUSINESS  
**Duración:** ~30 minutos
