# Plan de Pruebas - Sistema de Pagos de Citas

## Fecha: 11 de Enero de 2026
## Versión: 1.0

---

## 📋 Configuración Inicial

### Precondiciones Generales
- ✅ Usuario autenticado (BUSINESS, RECEPTIONIST, SPECIALIST)
- ✅ Negocio configurado con métodos de pago activos
- ✅ Al menos un servicio creado
- ✅ Al menos un especialista activo
- ✅ Al menos un cliente registrado

### Datos de Prueba Recomendados
- **Servicio Simple**: "Corte de Cabello" - $50,000 - 30 min
- **Servicio Paquete**: "Botox (3 sesiones)" - $300,000 - 45 min por sesión
- **Cliente**: Juan Pérez - +57 300 123 4567
- **Especialista**: María López

---

## 🧪 CASOS DE PRUEBA

### **Categoría 1: Pagos Completos**

#### **TC-PAY-001: Pago completo en efectivo**
**Objetivo**: Verificar pago total de un turno con efectivo

**Precondiciones**:
- Turno completado con monto $50,000
- Caja registradora abierta
- Usuario con permisos de pago

**Pasos**:
1. Ir al calendario/dashboard
2. Seleccionar turno completado
3. Click en "Registrar Pago"
4. Ingresar monto: $50,000
5. Seleccionar método: "Efectivo"
6. Click en "Procesar Pago"

**Resultado Esperado**:
- ✅ Toast: "Pago registrado exitosamente"
- ✅ Estado del turno cambia a "PAID"
- ✅ Monto pagado: $50,000
- ✅ Saldo pendiente: $0
- ✅ Registro en caja registradora
- ✅ Turno desaparece de "Pagos Pendientes"

---

#### **TC-PAY-002: Pago completo con tarjeta**
**Objetivo**: Verificar pago total con tarjeta de crédito/débito

**Precondiciones**:
- Turno completado con monto $80,000
- Caja registradora abierta

**Pasos**:
1. Abrir modal de pago
2. Ingresar monto: $80,000
3. Seleccionar método: "Tarjeta de Crédito"
4. Click en "Procesar Pago"

**Resultado Esperado**:
- ✅ Pago registrado correctamente
- ✅ Estado: PAID
- ✅ Método de pago guardado: "CREDIT_CARD"

---

#### **TC-PAY-003: Pago completo con transferencia**
**Objetivo**: Verificar pago con transferencia bancaria

**Precondiciones**:
- Turno completado con monto $100,000

**Pasos**:
1. Abrir modal de pago
2. Ingresar monto: $100,000
3. Seleccionar método: "Transferencia Bancaria"
4. Click en "Procesar Pago"

**Resultado Esperado**:
- ✅ Pago registrado
- ✅ Estado: PAID
- ✅ No afecta efectivo en caja (es transferencia)

---

### **Categoría 2: Pagos Parciales (Adelantos)**

#### **TC-PAY-004: Adelanto del 50%**
**Objetivo**: Registrar adelanto parcial de un servicio

**Precondiciones**:
- Turno completado con monto $100,000
- Caja abierta

**Pasos**:
1. Abrir modal de pago
2. Ingresar monto: $50,000
3. Seleccionar método: "Efectivo"
4. Click en "Procesar Pago"

**Resultado Esperado**:
- ✅ Toast: "Adelanto registrado exitosamente"
- ✅ Estado del turno: PARTIAL_PAID
- ✅ Monto pagado: $50,000
- ✅ Saldo pendiente: $50,000
- ✅ Turno permanece en "Pagos Pendientes"
- ✅ Registro en caja

---

#### **TC-PAY-005: Completar pago después de adelanto**
**Objetivo**: Pagar el saldo restante después de un adelanto

**Precondiciones**:
- Turno con adelanto de $50,000
- Saldo pendiente: $50,000

**Pasos**:
1. Abrir modal de pago del mismo turno
2. Ver monto sugerido: $50,000
3. Confirmar monto: $50,000
4. Seleccionar método: "Efectivo"
5. Click en "Procesar Pago"

**Resultado Esperado**:
- ✅ Toast: "Pago completado"
- ✅ Estado del turno: PAID
- ✅ Monto pagado total: $100,000
- ✅ Saldo pendiente: $0
- ✅ Turno desaparece de pendientes

---

#### **TC-PAY-006: Múltiples adelantos**
**Objetivo**: Realizar varios pagos parciales hasta completar

**Precondiciones**:
- Turno de $150,000

**Pasos**:
1. Primer pago: $50,000 (efectivo)
2. Segundo pago: $50,000 (tarjeta)
3. Tercer pago: $50,000 (transferencia)

**Resultado Esperado**:
- ✅ Después del pago 1: PARTIAL_PAID, saldo $100,000
- ✅ Después del pago 2: PARTIAL_PAID, saldo $50,000
- ✅ Después del pago 3: PAID, saldo $0
- ✅ Historial de 3 transacciones

---

### **Categoría 3: Pagos con Propina**

#### **TC-PAY-007: Pago completo + propina**
**Objetivo**: Registrar propina adicional al monto del servicio

**Precondiciones**:
- Turno de $50,000 completado

**Pasos**:
1. Abrir modal de pago
2. Ingresar monto servicio: $50,000
3. Ingresar propina: $10,000
4. Total a pagar: $60,000
5. Método: "Efectivo"
6. Click en "Procesar Pago"

**Resultado Esperado**:
- ✅ Pago registrado: $50,000
- ✅ Propina registrada: $10,000
- ✅ Total en caja: $60,000
- ✅ Estado: PAID
- ✅ Propina asignada al especialista

---

#### **TC-PAY-008: Adelanto + propina**
**Objetivo**: Verificar que no se permita propina en adelantos

**Precondiciones**:
- Turno de $100,000

**Pasos**:
1. Abrir modal de pago
2. Ingresar monto: $50,000 (parcial)
3. Intentar ingresar propina: $5,000

**Resultado Esperado**:
- ⚠️ Campo de propina deshabilitado o mensaje
- ⚠️ "Las propinas solo se pueden agregar en pagos completos"

---

### **Categoría 4: Cambio de Efectivo**

#### **TC-PAY-009: Cliente paga con billetes mayores**
**Objetivo**: Calcular cambio correctamente

**Precondiciones**:
- Turno de $47,000

**Pasos**:
1. Abrir modal de pago
2. Ingresar monto recibido: $50,000
3. Sistema calcula cambio: $3,000
4. Método: "Efectivo"
5. Click en "Procesar Pago"

**Resultado Esperado**:
- ✅ Mostrar claramente: "Cambio: $3,000"
- ✅ Pago registrado: $47,000
- ✅ Estado: PAID
- ✅ En caja se registra $47,000 (no $50,000)

---

#### **TC-PAY-010: Cliente paga justo**
**Objetivo**: Verificar cuando no hay cambio

**Precondiciones**:
- Turno de $50,000

**Pasos**:
1. Ingresar monto recibido: $50,000
2. Sistema muestra: "Cambio: $0"

**Resultado Esperado**:
- ✅ Sin cambio
- ✅ Pago procesado normalmente

---

### **Categoría 5: Múltiples Métodos de Pago**

#### **TC-PAY-011: Pago mixto (efectivo + tarjeta)**
**Objetivo**: Dividir pago entre dos métodos

**Precondiciones**:
- Turno de $100,000

**Pasos**:
1. Abrir modal de pago
2. Pago 1: $60,000 en efectivo
3. Confirmar
4. Pago 2: $40,000 con tarjeta
5. Confirmar

**Resultado Esperado**:
- ✅ Dos transacciones registradas
- ✅ Total pagado: $100,000
- ✅ Estado: PAID
- ✅ $60,000 en efectivo de caja
- ✅ $40,000 en tarjeta

---

#### **TC-PAY-012: Triple método de pago**
**Objetivo**: Pago con tres métodos diferentes

**Precondiciones**:
- Turno de $150,000

**Pasos**:
1. Pago 1: $50,000 efectivo
2. Pago 2: $50,000 tarjeta
3. Pago 3: $50,000 transferencia

**Resultado Esperado**:
- ✅ Tres transacciones separadas
- ✅ Estado final: PAID
- ✅ Desglose correcto por método

---

### **Categoría 6: Servicios con Paquetes (Multi-Sesión)**

#### **TC-PAY-013: Primera sesión de paquete**
**Objetivo**: Pagar primera sesión de un paquete de 3

**Precondiciones**:
- Servicio "Botox 3 sesiones" - $300,000 total
- Primera cita completada

**Pasos**:
1. Completar primera sesión
2. Abrir modal de pago
3. Monto sugerido: $100,000 (1/3)
4. Procesar pago

**Resultado Esperado**:
- ✅ Pago de $100,000 registrado
- ✅ Sesión 1 de 3 marcada como pagada
- ✅ Cliente puede agendar sesión 2
- ✅ Saldo pendiente del paquete: $200,000

---

#### **TC-PAY-014: Pagar paquete completo anticipado**
**Objetivo**: Pagar las 3 sesiones por adelantado

**Precondiciones**:
- Primera sesión completada
- Paquete de $300,000

**Pasos**:
1. Abrir modal de pago
2. Ingresar monto: $300,000 (completo)
3. Procesar pago

**Resultado Esperado**:
- ✅ Pago total registrado
- ✅ Las 3 sesiones marcadas como pre-pagadas
- ✅ Cliente puede usar sesiones 2 y 3 sin pagar

---

#### **TC-PAY-015: Intentar sesión sin pagar anterior**
**Objetivo**: Validar que no se pueda usar sesión no pagada

**Precondiciones**:
- Sesión 1 completada pero NO pagada
- Cliente intenta agendar sesión 2

**Pasos**:
1. Intentar crear cita para sesión 2
2. Sistema debe validar pago de sesión anterior

**Resultado Esperado**:
- ⚠️ Error: "Debe pagar la sesión anterior antes de continuar"
- ❌ No permite crear la cita

---

### **Categoría 7: Validaciones y Errores**

#### **TC-PAY-016: Pago sin caja abierta**
**Objetivo**: Verificar validación de caja cerrada

**Precondiciones**:
- Caja registradora cerrada
- Turno completado

**Pasos**:
1. Intentar registrar pago
2. Seleccionar método "Efectivo"

**Resultado Esperado**:
- ❌ Error: "Debe abrir la caja registradora primero"
- ❌ Botón de pago deshabilitado
- ℹ️ Link para abrir caja

---

#### **TC-PAY-017: Monto inválido (mayor al pendiente)**
**Objetivo**: Validar que no se pague más del saldo

**Precondiciones**:
- Turno con saldo pendiente: $50,000

**Pasos**:
1. Abrir modal de pago
2. Intentar ingresar: $60,000
3. Click en "Procesar Pago"

**Resultado Esperado**:
- ⚠️ Mensaje: "El monto no puede exceder el saldo pendiente"
- ❌ Botón de pago deshabilitado
- ℹ️ Mostrar saldo máximo permitido

---

#### **TC-PAY-018: Monto inválido (cero o negativo)**
**Objetivo**: Validar montos inválidos

**Precondiciones**:
- Turno pendiente de pago

**Pasos**:
1. Intentar ingresar monto: $0
2. Intentar ingresar monto: -$10,000

**Resultado Esperado**:
- ⚠️ "El monto debe ser mayor a cero"
- ❌ Botón deshabilitado

---

#### **TC-PAY-019: Método de pago no seleccionado**
**Objetivo**: Validar selección de método obligatorio

**Pasos**:
1. Ingresar monto válido
2. NO seleccionar método de pago
3. Click en "Procesar Pago"

**Resultado Esperado**:
- ⚠️ "Debe seleccionar un método de pago"
- ❌ No procesa el pago

---

#### **TC-PAY-020: Turno ya pagado completamente**
**Objetivo**: Prevenir pagos duplicados

**Precondiciones**:
- Turno con estado PAID
- Saldo: $0

**Pasos**:
1. Intentar abrir modal de pago nuevamente

**Resultado Esperado**:
- ℹ️ Botón de pago no visible
- ℹ️ Badge: "PAGADO" en verde
- ℹ️ Mostrar historial de pagos

---

### **Categoría 8: Permisos y Roles**

#### **TC-PAY-021: Pago como BUSINESS**
**Objetivo**: Verificar que BUSINESS puede procesar pagos

**Precondiciones**:
- Usuario con rol BUSINESS logueado

**Pasos**:
1. Ver turno completado
2. Botón "Registrar Pago" debe estar visible
3. Procesar pago

**Resultado Esperado**:
- ✅ Puede registrar pagos
- ✅ Tiene acceso completo

---

#### **TC-PAY-022: Pago como RECEPTIONIST**
**Objetivo**: Verificar permisos de recepcionista

**Precondiciones**:
- Usuario RECEPTIONIST logueado

**Pasos**:
1. Intentar registrar pago

**Resultado Esperado**:
- ✅ Puede registrar pagos
- ✅ Solo de su sucursal (si aplica)

---

#### **TC-PAY-023: Pago como SPECIALIST**
**Objetivo**: Verificar que especialista solo ve sus turnos

**Precondiciones**:
- Usuario SPECIALIST logueado

**Pasos**:
1. Ver lista de pagos pendientes
2. Intentar pagar sus propios turnos

**Resultado Esperado**:
- ✅ Solo ve sus propios turnos
- ✅ Puede procesar pagos de sus servicios
- ❌ No ve turnos de otros especialistas

---

### **Categoría 9: Integración con Caja Registradora**

#### **TC-PAY-024: Verificar registro en caja**
**Objetivo**: Confirmar que pagos se registran en caja

**Precondiciones**:
- Caja abierta con monto inicial $100,000

**Pasos**:
1. Procesar pago de $50,000 en efectivo
2. Ir a vista de caja registradora
3. Verificar movimientos

**Resultado Esperado**:
- ✅ Movimiento registrado: +$50,000
- ✅ Tipo: "Ingreso por servicio"
- ✅ Total en caja: $150,000
- ✅ Referencia al turno

---

#### **TC-PAY-025: Pago con tarjeta no afecta efectivo**
**Objetivo**: Verificar que pagos no-efectivo no suman a caja física

**Precondiciones**:
- Caja con $100,000 efectivo

**Pasos**:
1. Procesar pago de $50,000 con tarjeta
2. Verificar caja registradora

**Resultado Esperado**:
- ✅ Efectivo en caja sigue en $100,000
- ✅ Registro del pago con método CARD
- ℹ️ Se registra en ventas totales pero no en efectivo

---

#### **TC-PAY-026: Cerrar caja con pagos del día**
**Objetivo**: Verificar cierre correcto de caja

**Precondiciones**:
- Caja abierta con $100,000 inicial
- 3 pagos procesados: $50,000 + $30,000 + $20,000

**Pasos**:
1. Ir a cerrar turno de caja
2. Sistema calcula esperado: $200,000
3. Contar físicamente y confirmar
4. Cerrar caja

**Resultado Esperado**:
- ✅ Monto esperado: $200,000
- ✅ Desglose de ingresos por servicio
- ✅ Reporte generado
- ✅ Caja cerrada correctamente

---

### **Categoría 10: UI/UX y Notificaciones**

#### **TC-PAY-027: Toast de confirmación**
**Objetivo**: Verificar mensajes de éxito

**Pasos**:
1. Procesar cualquier pago exitoso

**Resultado Esperado**:
- ✅ Toast verde: "✅ Pago registrado exitosamente"
- ✅ Duración: 3 segundos
- ✅ Auto-desaparece

---

#### **TC-PAY-028: Actualización en tiempo real**
**Objetivo**: Verificar actualización automática de datos

**Precondiciones**:
- Lista de pagos pendientes abierta

**Pasos**:
1. Procesar un pago
2. Verificar que la lista se actualiza

**Resultado Esperado**:
- ✅ Turno pagado desaparece de pendientes
- ✅ Sin necesidad de recargar página
- ✅ Contador actualizado

---

#### **TC-PAY-029: Historial de pagos visible**
**Objetivo**: Ver historial de transacciones de un turno

**Precondiciones**:
- Turno con múltiples pagos parciales

**Pasos**:
1. Abrir detalles del turno
2. Ver sección "Historial de Pagos"

**Resultado Esperado**:
- ✅ Lista de todas las transacciones
- ✅ Fecha y hora de cada pago
- ✅ Método utilizado
- ✅ Monto de cada transacción
- ✅ Usuario que procesó el pago

---

### **Categoría 11: Casos Edge**

#### **TC-PAY-030: Turno cancelado - no debe permitir pago**
**Objetivo**: Validar que turnos cancelados no se puedan pagar

**Precondiciones**:
- Turno con estado CANCELED

**Pasos**:
1. Intentar ver turno cancelado
2. Buscar opción de pago

**Resultado Esperado**:
- ❌ Botón de pago no visible
- ℹ️ Badge: "CANCELADO"
- ⚠️ No aparece en pagos pendientes

---

#### **TC-PAY-031: Conexión perdida durante pago**
**Objetivo**: Manejar errores de red

**Pasos**:
1. Desconectar internet
2. Intentar procesar pago
3. Reconectar

**Resultado Esperado**:
- ⚠️ Error: "Error de conexión"
- ℹ️ Instrucciones para reintentar
- ✅ Pago no se procesa parcialmente
- ✅ Botón "Reintentar" disponible

---

#### **TC-PAY-032: Doble click en botón de pago**
**Objetivo**: Prevenir pagos duplicados por doble click

**Pasos**:
1. Llenar formulario de pago
2. Hacer doble click rápido en "Procesar Pago"

**Resultado Esperado**:
- ✅ Solo se procesa un pago
- ✅ Botón se deshabilita inmediatamente
- ✅ Indicador de "Procesando..."

---

## 📊 Resumen de Casos

- **Total de casos**: 32
- **Casos positivos** (Happy Path): 20
- **Casos negativos** (Validaciones): 12
- **Roles a probar**: 3 (BUSINESS, RECEPTIONIST, SPECIALIST)
- **Métodos de pago**: 3 (Efectivo, Tarjeta, Transferencia)

---

## ✅ Checklist de Testing

### Antes de empezar
- [ ] Resetear base de datos de pruebas
- [ ] Crear datos de prueba básicos
- [ ] Verificar que todos los métodos de pago estén activos
- [ ] Tener calculadora a mano para verificar cálculos

### Durante el testing
- [ ] Documentar cada falla encontrada
- [ ] Tomar screenshots de errores
- [ ] Anotar tiempo de respuesta (debe ser < 2 segundos)
- [ ] Verificar en base de datos que los registros sean correctos

### Después del testing
- [ ] Reportar bugs encontrados
- [ ] Priorizar correcciones
- [ ] Re-testear casos fallidos después de fix

---

## 🐛 Registro de Bugs

### Formato de Reporte
```
ID: BUG-XXX
Título: [Descripción breve]
Severidad: [Crítica/Alta/Media/Baja]
Caso de Prueba: TC-PAY-XXX
Pasos para Reproducir:
1. ...
2. ...

Comportamiento Esperado:
...

Comportamiento Actual:
...

Screenshots/Logs:
...
```

---

## 📝 Notas Adicionales

### Montos de Prueba Recomendados
- Usa montos redondos para facilitar verificación
- Incluye montos con decimales para probar redondeo
- Prueba con montos grandes (> $1,000,000)

### Métodos de Pago a Configurar
1. Efectivo (CASH)
2. Tarjeta de Crédito (CREDIT_CARD)
3. Tarjeta de Débito (DEBIT_CARD)
4. Transferencia Bancaria (BANK_TRANSFER)
5. Nequi/Daviplata (MOBILE_PAYMENT)

### Tiempos de Respuesta Esperados
- Carga de modal: < 500ms
- Procesamiento de pago: < 2 segundos
- Actualización de lista: < 1 segundo

---

## 🎯 Criterios de Aceptación General

Para considerar el sistema de pagos como **APROBADO**, todos los siguientes criterios deben cumplirse:

- ✅ 100% de casos críticos pasan (TC-PAY-001 a TC-PAY-015)
- ✅ 95% de casos de validación pasan (TC-PAY-016 a TC-PAY-032)
- ✅ No hay bugs de severidad crítica
- ✅ Máximo 2 bugs de severidad alta sin resolver
- ✅ Todos los pagos se registran correctamente en BD
- ✅ Caja registradora sincroniza correctamente
- ✅ Historial de pagos es preciso y completo

---

**Última actualización**: 11 de Enero de 2026
**Responsable**: Equipo de QA
**Versión del Sistema**: 1.0
