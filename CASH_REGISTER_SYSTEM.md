# Sistema de Gestión de Caja (Cash Register) - Beauty Control

## 📋 Descripción General

Sistema completo de gestión de turnos de caja para recepcionistas y especialistas en la aplicación móvil `business-control-mobile`. Permite registrar aperturas/cierres de caja, calcular resúmenes automáticos de transacciones y detectar diferencias en el efectivo.

## 🎯 Lógica de Negocio

### ¿Quién usa la gestión de caja?

```
SI hay RECEPTIONIST o RECEPTIONIST_SPECIALIST en el negocio:
  → Solo ellos usan caja
  → Especialistas NO usan caja

SI solo hay SPECIALIST (sin recepcionistas):
  → Especialistas usan caja
  
OWNER y BUSINESS:
  → NUNCA usan caja (solo visualizan reportes)
```

### 🔄 Persistencia de Turnos (IMPORTANTE)

**Los turnos permanecen abiertos incluso si:**
- El usuario pierde conexión a internet
- El usuario cierra la aplicación
- El usuario cierra sesión
- La sesión expira

**Recuperación automática:**
- Al iniciar sesión nuevamente, la app detecta el turno abierto
- Se muestra pantalla de "Turno Activo" automáticamente
- Todos los datos del turno se preservan
- El resumen se calcula en tiempo real con datos actualizados

**Cierre del turno:**
- SOLO se cierra cuando el usuario completa el flujo manual de cierre
- Requiere generar PDF obligatoriamente
- Requiere ingresar balance real
- Opcionalmente agregar notas de cierre

### 📄 Sistema de Recibos

**Generación automática:**
- Cada cita completada con pago genera un recibo
- Numeración secuencial por negocio (REC-2024-00001)
- Incluye toda la información: cliente, servicio, especialista, pago

**Descarga y envío:**
- PDF profesional descargable desde la app
- Opción de enviar por WhatsApp al cliente
- Tracking de envíos (registra si fue enviado)
- Se puede reenviar múltiples veces

### Flujo de Trabajo

1. **Apertura de Turno**
   - Usuario verifica último cierre para saber cuánto efectivo debe recibir
   - Registra balance inicial (efectivo recibido de caja anterior)
   - Puede agregar notas de apertura
   - Sistema genera número de turno automático del día

2. **Durante el Turno**
   - Usuario atiende citas y cobra pagos
   - Sistema automáticamente va sumando:
     - Citas completadas
     - Pagos recibidos por método (efectivo, tarjeta, transferencia, etc.)
     - Productos vendidos
   - Usuario puede consultar resumen en tiempo real

3. **Cierre de Turno**
   - Usuario cuenta efectivo físico en caja
   - Ingresa monto real contado
   - Sistema calcula:
     - Balance esperado = balance inicial + efectivo cobrado
     - Diferencia = balance real - balance esperado
   - Usuario puede agregar notas explicando diferencias
   - Sistema cierra el turno

## 🗄️ Estructura de Base de Datos

### Modelo: `CashRegisterShift`

```javascript
{
  id: UUID,
  businessId: UUID,              // SIEMPRE requerido
  userId: UUID,                  // Usuario que abre/cierra
  branchId: UUID (opcional),     // Sucursal del turno
  
  shiftNumber: INTEGER,          // Auto-generado (1, 2, 3... del día)
  status: ENUM['OPEN', 'CLOSED'],
  
  // Fechas
  openedAt: DATE,
  closedAt: DATE,
  
  // Dinero
  openingBalance: DECIMAL,       // Efectivo inicial recibido
  expectedClosingBalance: DECIMAL, // Calculado al cerrar
  actualClosingBalance: DECIMAL,   // Contado físicamente
  difference: DECIMAL,             // Faltante/sobrante
  
  // Resumen del turno
  summary: JSONB {
    appointments: {
      total: 0,
      completed: 0,
      cancelled: 0,
      totalAmount: 0,
      paidAmount: 0
    },
    products: {
      total: 0,
      totalAmount: 0
    },
    paymentMethods: {
      CASH: { count: 5, total: 150000 },
      CARD: { count: 3, total: 200000 },
      TRANSFER: { count: 2, total: 100000 }
    },
    totalCash: 150000,
    totalNonCash: 300000
  },
  
  openingNotes: TEXT,
  closingNotes: TEXT,
  metadata: JSONB
}
```

## 🔌 API Endpoints

### Base URL: `/api/cash-register`

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/should-use?businessId={id}` | Verificar si usuario debe usar caja |
| `GET` | `/active-shift?businessId={id}` | Obtener turno abierto actual |
| `POST` | `/open-shift` | Abrir nuevo turno |
| `POST` | `/close-shift` | Cerrar turno actual |
| `GET` | `/shift-summary?businessId={id}` | Resumen en tiempo real |
| `GET` | `/generate-closing-pdf?businessId={id}` | **Generar PDF antes del cierre** |
| `GET` | `/shifts-history?businessId={id}` | Historial de turnos |
| `GET` | `/last-closed-shift?businessId={id}` | Último turno cerrado |

### Ejemplos de Uso

#### 1. Verificar si debe usar caja

```http
GET /api/cash-register/should-use?businessId=uuid-negocio
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "data": {
    "shouldUse": true,
    "reason": "Gestionas la caja como recepcionista",
    "userRole": "RECEPTIONIST",
    "hasReceptionist": true,
    "hasOnlySpecialists": false
  }
}
```

#### 2. Abrir Turno

```http
POST /api/cash-register/open-shift
Authorization: Bearer {token}
Content-Type: application/json

{
  "businessId": "uuid-negocio",
  "branchId": "uuid-sucursal",  // Opcional
  "openingBalance": 50000,
  "openingNotes": "Recibí 50mil de María del turno anterior"
}

Response 201:
{
  "success": true,
  "message": "Turno abierto exitosamente",
  "data": {
    "shift": {
      "id": "uuid",
      "shiftNumber": 1,
      "openedAt": "2024-01-15T08:00:00Z",
      "openingBalance": 50000,
      "status": "OPEN"
    }
  }
}
```

#### 3. Obtener Resumen del Turno

```http
GET /api/cash-register/shift-summary?businessId=uuid-negocio
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "data": {
    "shiftId": "uuid",
    "openedAt": "2024-01-15T08:00:00Z",
    "openingBalance": 50000,
    "summary": {
      "appointments": {
        "total": 10,
        "completed": 8,
        "cancelled": 2,
        "totalAmount": 500000,
        "paidAmount": 450000
      },
      "paymentMethods": {
        "CASH": { "count": 5, "total": 200000 },
        "CARD": { "count": 2, "total": 150000 },
        "TRANSFER": { "count": 1, "total": 100000 }
      },
      "totalCash": 200000,
      "totalNonCash": 250000
    }
  }
}
```

#### 4. Cerrar Turno

```http
POST /api/cash-register/close-shift
Authorization: Bearer {token}
Content-Type: application/json

{
  "businessId": "uuid-negocio",
  "actualClosingBalance": 248500,
  "closingNotes": "Faltan 1500. Cliente me pidió cambio de 5mil y solo tenía 3500"
}

Response 200:
{
  "success": true,
  "message": "Turno cerrado exitosamente",
  "data": {
    "shift": {
      "id": "uuid",
      "status": "CLOSED",
      "closedAt": "2024-01-15T18:00:00Z",
      "openingBalance": 50000,
      "expectedClosingBalance": 250000,
      "actualClosingBalance": 248500,
      "difference": -1500
    },
    "summary": {
      "expectedClosingBalance": 250000,
      "actualClosingBalance": 248500,
      "difference": -1500,
      "hasDiscrepancy": true
    }
  }
}
```

#### 5. Generar PDF antes del Cierre

```http
GET /api/cash-register/generate-closing-pdf?businessId=uuid-negocio
Authorization: Bearer {token}

Response 200:
Content-Type: application/pdf
Content-Disposition: attachment; filename="cierre-turno-1-1234567890.pdf"

[PDF Binary Data]
```

**El PDF incluye:**
- ✅ Información del turno (número, usuario, fechas)
- ✅ Resumen de dinero (balance inicial, esperado, diferencia)
- ✅ Desglose por métodos de pago
- ✅ Resumen de citas (completadas, canceladas, montos)
- ✅ Notas de apertura y cierre
- ✅ Timestamp de generación

## 🔒 Flujo Obligatorio de Cierre

**ANTES de cerrar el turno, el usuario DEBE:**

1. **Generar el PDF** 
   - Llama a `/generate-closing-pdf`
   - Descarga y revisa el documento
   - El PDF muestra el balance esperado

2. **Contar el efectivo físico**
   - Verifica cuánto hay realmente en caja
   - Compara con el balance esperado del PDF

3. **Cerrar el turno**
   - Llama a `/close-shift`
   - Ingresa el balance real contado
   - Explica diferencias en las notas

## 📱 Integración en Mobile - Flujo Actualizado

### Pantalla "Cerrar Turno" (Actualizada)

```http
POST /api/cash-register/close-shift
Authorization: Bearer {token}
Content-Type: application/json

{
  "businessId": "uuid-negocio",
  "actualClosingBalance": 248500,
  "closingNotes": "Faltan 1500. Cliente me pidió cambio de 5mil y solo tenía 3500"
}

Response 200:
{
  "success": true,
  "message": "Turno cerrado exitosamente",
  "data": {
    "shift": {
      "id": "uuid",
      "status": "CLOSED",
      "closedAt": "2024-01-15T18:00:00Z",
      "openingBalance": 50000,
      "expectedClosingBalance": 250000,
      "actualClosingBalance": 248500,
      "difference": -1500
    },
    "summary": {
      "expectedClosingBalance": 250000,
      "actualClosingBalance": 248500,
      "difference": -1500,
      "hasDiscrepancy": true
    }
  }
}
```

## 🔒 Seguridad

- Todos los endpoints requieren autenticación (`authenticate` middleware)
- `businessId` es **OBLIGATORIO** en todas las peticiones
- Los usuarios solo pueden:
  - Ver sus propios turnos (SPECIALIST, RECEPTIONIST)
  - BUSINESS y OWNER pueden ver todos los turnos del negocio
- Validaciones:
  - No se puede abrir turno si ya hay uno abierto
  - Balance inicial debe ser >= 0
  - Balance final es requerido para cerrar

## 📱 Integración en Mobile

### Ubicación Sugerida
- **Ruta:** `/cash-register` o `/shifts`
- **Acceso:** Desde menú lateral o dashboard principal
- **Visibilidad:** Solo para usuarios que `shouldUse === true`

### Pantallas Requeridas

1. **Dashboard de Caja** (`CashRegisterDashboard.jsx`)
   - Verificar si debe usar caja
   - Mostrar estado actual (sin turno / turno abierto)
   - Botón "Abrir Turno" o "Ver Turno Actual"

2. **Abrir Turno** (`OpenShiftScreen.jsx`)
   - Consultar último cierre
   - Input de balance inicial
   - Input de notas opcionales
   - Botón "Abrir Turno"

3. **Turno Activo** (`ActiveShiftScreen.jsx`)
   - Información del turno (número, hora apertura, balance inicial)
   - Resumen en tiempo real:
     - Total citas atendidas
     - Total cobrado por método de pago
     - Efectivo esperado
   - Botones:
     - "Actualizar Resumen"
     - "Cerrar Turno"

4. **Cerrar Turno** (`CloseShiftScreen.jsx`)
   - **PASO 1:** Botón "Generar PDF de Cierre"
     - Llama a `/generate-closing-pdf`
     - Descarga PDF automáticamente
     - Muestra confirmación de descarga
   - **PASO 2:** Mostrar balance esperado (del PDF)
   - **PASO 3:** Input para balance real contado
   - **PASO 4:** Indicador de diferencia (rojo si falta, verde si sobra)
   - **PASO 5:** Input de notas explicativas (obligatorio si hay diferencia)
   - **PASO 6:** Botón "Cerrar Turno" (habilitado solo después de generar PDF)

5. **Historial** (`ShiftHistoryScreen.jsx`)
   - Lista de turnos cerrados
   - Filtros por fecha
   - Ver detalle de turno cerrado

### Ejemplo de Componente React Native - Cerrar Turno

```jsx
import React, { useState, useEffect } from 'react';
import { View, Text, Button, TextInput, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { cashRegisterApi } from '../api/cashRegisterApi';

export const CloseShiftScreen = ({ route, navigation }) => {
  const { businessId, shiftId } = route.params;
  const [pdfGenerated, setPdfGenerated] = useState(false);
  const [expectedBalance, setExpectedBalance] = useState(0);
  const [actualBalance, setActualBalance] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGeneratePDF = async () => {
    try {
      setLoading(true);
      
      // Descargar PDF
      const response = await cashRegisterApi.generateClosingPDF(businessId);
      
      // Guardar en el dispositivo
      const fileUri = FileSystem.documentDirectory + `cierre-turno-${Date.now()}.pdf`;
      await FileSystem.writeAsStringAsync(fileUri, response.data, {
        encoding: FileSystem.EncodingType.Base64
      });
      
      // Compartir/abrir PDF
      await Sharing.shareAsync(fileUri);
      
      setPdfGenerated(true);
      Alert.alert('Éxito', 'PDF generado. Revisa el balance esperado antes de cerrar.');
      
    } catch (error) {
      Alert.alert('Error', 'No se pudo generar el PDF');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseShift = async () => {
    if (!pdfGenerated) {
      Alert.alert('Advertencia', 'Debes generar el PDF antes de cerrar el turno');
      return;
    }

    const difference = parseFloat(actualBalance) - expectedBalance;
    
    if (Math.abs(difference) > 0 && !notes.trim()) {
      Alert.alert('Notas requeridas', 'Debes explicar la diferencia en las notas');
      return;
    }

    try {
      setLoading(true);
      await cashRegisterApi.closeShift({
        businessId,
        actualClosingBalance: parseFloat(actualBalance),
        closingNotes: notes
      });
      
      Alert.alert('Turno Cerrado', 'El turno se cerró exitosamente');
      navigation.navigate('CashRegisterDashboard');
      
    } catch (error) {
      Alert.alert('Error', 'No se pudo cerrar el turno');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cerrar Turno</Text>
      
      {/* PASO 1: Generar PDF */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Generar PDF de Cierre</Text>
        <Button 
          title={pdfGenerated ? "✓ PDF Generado" : "Generar PDF"}
          onPress={handleGeneratePDF}
          disabled={loading || pdfGenerated}
          color={pdfGenerated ? "green" : "blue"}
        />
      </View>

      {/* PASO 2: Mostrar balance esperado */}
      {pdfGenerated && (
        <>
          <View style={styles.section}>
            <Text style={styles.label}>Balance Esperado:</Text>
            <Text style={styles.value}>${expectedBalance.toLocaleString()}</Text>
          </View>

          {/* PASO 3: Input balance real */}
          <View style={styles.section}>
            <Text style={styles.label}>Balance Real Contado:</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={actualBalance}
              onChangeText={setActualBalance}
              placeholder="Ingresa el efectivo contado"
            />
          </View>

          {/* PASO 4: Mostrar diferencia */}
          {actualBalance && (
            <View style={styles.section}>
              <Text style={styles.label}>Diferencia:</Text>
              <Text style={[
                styles.difference,
                { color: difference === 0 ? 'green' : difference > 0 ? 'blue' : 'red' }
              ]}>
                {difference === 0 ? 'Sin diferencia' : 
                 difference > 0 ? `Sobrante: $${difference}` :
                 `Faltante: $${Math.abs(difference)}`}
              </Text>
            </View>
          )}

          {/* PASO 5: Notas */}
          <View style={styles.section}>
            <Text style={styles.label}>Notas de Cierre:</Text>
            <TextInput
              style={styles.textArea}
              multiline
              numberOfLines={4}
              value={notes}
              onChangeText={setNotes}
              placeholder="Explica cualquier diferencia..."
            />
          </View>

          {/* PASO 6: Botón cerrar */}
          <Button
            title="Cerrar Turno"
            onPress={handleCloseShift}
            disabled={loading || !actualBalance}
            color="red"
          />
        </>
      )}
    </View>
  );
};
```

### Ejemplo de Componente React Native

```jsx
import React, { useState, useEffect } from 'react';
import { View, Text, Button, TextInput, Alert } from 'react-native';
import { cashRegisterApi } from '../api/cashRegisterApi';

export const CashRegisterDashboard = ({ businessId }) => {
  const [shouldUse, setShouldUse] = useState(false);
  const [activeShift, setActiveShift] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkIfShouldUseCashRegister();
  }, []);

  const checkIfShouldUseCashRegister = async () => {
    try {
      const response = await cashRegisterApi.shouldUse(businessId);
      setShouldUse(response.data.shouldUse);
      
      if (response.data.shouldUse) {
        await checkActiveShift();
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo verificar acceso a caja');
    } finally {
      setLoading(false);
    }
  };

  const checkActiveShift = async () => {
    try {
      const response = await cashRegisterApi.getActiveShift(businessId);
      setActiveShift(response.data.shift);
    } catch (error) {
      console.error('Error obteniendo turno activo:', error);
    }
  };

  if (loading) return <Text>Cargando...</Text>;
  if (!shouldUse) return null; // No mostrar nada si no usa caja

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestión de Caja</Text>
      
      {activeShift ? (
        <ActiveShiftView shift={activeShift} businessId={businessId} />
      ) : (
        <OpenShiftButton businessId={businessId} onShiftOpened={checkActiveShift} />
      )}
    </View>
  );
};
```

## 🔧 Archivos Creados/Modificados

### Backend

#### Nuevos Archivos
- ✅ `/packages/backend/src/models/CashRegisterShift.js`
- ✅ `/packages/backend/src/controllers/CashRegisterController.js`
- ✅ `/packages/backend/src/routes/cashRegister.js`

#### Archivos Modificados
- ✅ `/packages/backend/src/models/index.js` - Agregado modelo y relaciones
- ✅ `/packages/backend/src/app.js` - Agregadas rutas
- ✅ `/packages/backend/server.js` - Agregada sincronización del modelo

### Frontend Mobile (Pendiente)

#### Por Crear
- `/packages/business-control-mobile/src/screens/cashRegister/CashRegisterDashboard.jsx`
- `/packages/business-control-mobile/src/screens/cashRegister/OpenShiftScreen.jsx`
- `/packages/business-control-mobile/src/screens/cashRegister/ActiveShiftScreen.jsx`
- `/packages/business-control-mobile/src/screens/cashRegister/CloseShiftScreen.jsx`
- `/packages/business-control-mobile/src/screens/cashRegister/ShiftHistoryScreen.jsx`
- `/packages/business-control-mobile/src/api/cashRegisterApi.js`

## 🚀 Próximos Pasos

1. **Probar Backend**
   ```bash
   cd packages/backend
   npm run dev
   ```
   - Verificar que la tabla `cash_register_shifts` se crea
   - Probar endpoints con Postman/Insomnia

2. **Crear API Client Mobile**
   - Crear archivo de funciones para llamar al backend
   - Manejar tokens y errores

3. **Crear Pantallas Mobile**
   - Diseñar UI/UX de cada pantalla
   - Integrar con API
   - Agregar navegación

4. **Testing**
   - Probar flujo completo: abrir → trabajar → cerrar
   - Validar cálculos de resumen
   - Probar con diferentes roles

## 📄 Sistema de Recibos en PDF

### Descripción
Cada cita completada con pago genera un recibo que puede descargarse en PDF y enviarse por WhatsApp al cliente.

### API Endpoints - Recibos

#### 1. Generar Recibo PDF

```http
GET /api/cash-register/generate-receipt-pdf/:appointmentId?businessId=uuid-negocio
Authorization: Bearer {token}

Response 200:
Content-Type: application/pdf
Content-Disposition: attachment; filename="recibo-REC-2024-00001-1234567890.pdf"

[PDF Binary Data]
```

**El PDF del recibo incluye:**
- ✅ Encabezado con nombre del negocio
- ✅ Número de recibo único (REC-2024-00001)
- ✅ Información del cliente (nombre, teléfono, email)
- ✅ Detalles del servicio (fecha, hora, especialista)
- ✅ Desglose financiero (subtotal, descuentos, impuestos, propina, total)
- ✅ Información del pago (método, referencia, estado)
- ✅ Notas adicionales
- ✅ Código de verificación

#### 2. Obtener Datos del Recibo (para WhatsApp)

```http
GET /api/cash-register/receipt-data/:appointmentId?businessId=uuid-negocio
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "data": {
    "receipt": {
      "receiptNumber": "REC-2024-00001",
      "businessId": "uuid",
      "specialistName": "María García",
      "clientName": "Juan Pérez",
      "serviceDate": "2024-01-15",
      "serviceTime": "14:30:00",
      "serviceName": "Corte de Cabello",
      "totalAmount": 50000,
      "paymentMethod": "CASH",
      "status": "ACTIVE"
    },
    "whatsappReady": {
      "clientPhone": "+573001234567",
      "clientName": "Juan Pérez",
      "receiptNumber": "REC-2024-00001",
      "totalAmount": 50000,
      "serviceDate": "2024-01-15",
      "serviceName": "Corte de Cabello"
    }
  }
}
```

#### 3. Marcar Recibo como Enviado

```http
POST /api/cash-register/mark-receipt-sent/:receiptId
Authorization: Bearer {token}
Content-Type: application/json

{
  "method": "whatsapp"  // o "email"
}

Response 200:
{
  "success": true,
  "data": {
    "receiptId": "uuid",
    "sentViaWhatsApp": true,
    "sentViaEmail": false
  }
}
```

### Flujo de Recibos en Mobile

1. **Después de completar cita y pago:**
   - Mostrar botón "Generar Recibo"
   - Al presionar, llama a `/generate-receipt-pdf/:appointmentId`
   - Descarga PDF automáticamente

2. **Opción de envío por WhatsApp:**
   - Llama a `/receipt-data/:appointmentId` para obtener datos
   - Usa `whatsappReady.clientPhone` para abrir WhatsApp
   - Mensaje pre-formateado: 
     ```
     Hola {clientName}! 
     
     Gracias por tu visita. Adjunto el recibo de tu {serviceName}.
     
     Recibo N°: {receiptNumber}
     Total: ${totalAmount}
     Fecha: {serviceDate}
     
     ¡Esperamos verte pronto!
     ```
   - Adjunta el PDF del recibo
   - Después de enviar, llama a `/mark-receipt-sent/:receiptId` con `method: "whatsapp"`

3. **Historial de recibos:**
   - Lista de recibos generados
   - Indicador de si fue enviado (✓ WhatsApp, ✉ Email)
   - Opción de reenviar

### Ejemplo React Native - Generar y Enviar Recibo

```jsx
import React, { useState } from 'react';
import { View, Button, Alert, Linking } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { cashRegisterApi } from '../api/cashRegisterApi';

export const ReceiptButton = ({ appointmentId, businessId }) => {
  const [loading, setLoading] = useState(false);
  const [receiptPdfUri, setReceiptPdfUri] = useState(null);

  const handleGenerateReceipt = async () => {
    try {
      setLoading(true);
      
      // Generar y descargar PDF
      const pdfResponse = await cashRegisterApi.generateReceiptPDF(appointmentId, businessId);
      
      const fileUri = FileSystem.documentDirectory + `recibo-${Date.now()}.pdf`;
      await FileSystem.writeAsStringAsync(fileUri, pdfResponse.data, {
        encoding: FileSystem.EncodingType.Base64
      });
      
      setReceiptPdfUri(fileUri);
      
      Alert.alert('Recibo Generado', '¿Qué deseas hacer?', [
        { text: 'Ver PDF', onPress: () => Sharing.shareAsync(fileUri) },
        { text: 'Enviar por WhatsApp', onPress: () => handleSendWhatsApp() },
        { text: 'Cerrar', style: 'cancel' }
      ]);
      
    } catch (error) {
      Alert.alert('Error', 'No se pudo generar el recibo');
    } finally {
      setLoading(false);
    }
  };

  const handleSendWhatsApp = async () => {
    try {
      // Obtener datos para WhatsApp
      const receiptData = await cashRegisterApi.getReceiptData(appointmentId, businessId);
      const { whatsappReady } = receiptData.data;
      
      // Formatear mensaje
      const message = `Hola ${whatsappReady.clientName}! 

Gracias por tu visita. Adjunto el recibo de tu ${whatsappReady.serviceName}.

Recibo N°: ${whatsappReady.receiptNumber}
Total: $${whatsappReady.totalAmount.toLocaleString('es-CO')}
Fecha: ${new Date(whatsappReady.serviceDate).toLocaleDateString('es-CO')}

¡Esperamos verte pronto!`;
      
      // Abrir WhatsApp (primero compartir PDF, luego abrir chat)
      if (receiptPdfUri) {
        await Sharing.shareAsync(receiptPdfUri);
      }
      
      const whatsappUrl = `whatsapp://send?phone=${whatsappReady.clientPhone}&text=${encodeURIComponent(message)}`;
      const canOpen = await Linking.canOpenURL(whatsappUrl);
      
      if (canOpen) {
        await Linking.openURL(whatsappUrl);
        
        // Marcar como enviado
        await cashRegisterApi.markReceiptSent(receiptData.data.receipt.id, 'whatsapp');
        
        Alert.alert('Éxito', 'Recibo enviado por WhatsApp');
      } else {
        Alert.alert('Error', 'No se puede abrir WhatsApp');
      }
      
    } catch (error) {
      Alert.alert('Error', 'No se pudo enviar por WhatsApp');
    }
  };

  return (
    <View>
      <Button 
        title="Generar Recibo" 
        onPress={handleGenerateReceipt} 
        disabled={loading}
      />
    </View>
  );
};
```

## 💡 Consideraciones Adicionales

### Ventas de Productos
Si tu sistema también tiene ventas de productos (fuera de citas), necesitarás:
- Agregar esos registros al cálculo de resumen
- Incluir en el controlador una consulta a la tabla de ventas

### Multi-Sucursal
- El sistema ya soporta `branchId` opcional
- Usuarios pueden tener turnos en diferentes sucursales
- Filtros por sucursal en historial

### Reportes
- Podrías agregar endpoints adicionales para:
  - Reporte diario consolidado de todas las cajas
  - Estadísticas mensuales
  - Detección de patrones de faltantes

### Permisos
- Considera agregar permisos específicos:
  - `cash_register.open` - Abrir turno
  - `cash_register.close` - Cerrar turno
  - `cash_register.view_all` - Ver todos los turnos (administradores)

## 📞 Soporte

Si necesitas ayuda con:
- Integración mobile
- Ajustes en el backend
- Nuevas funcionalidades

Solo pregunta! 🚀
