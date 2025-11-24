# Sistema de Recibos en PDF - Beauty Control

## 📋 Descripción General

Sistema completo para generar recibos en PDF descargables y enviables por WhatsApp a clientes. Cada cita completada con pago genera un recibo con numeración secuencial única por negocio.

## 🎯 Características Principales

### ✅ Generación Automática
- Cada cita completada con pago genera un recibo
- Numeración secuencial por negocio: `REC-2024-00001`, `REC-2024-00002`, etc.
- Información completa del servicio, cliente y pago
- PDF profesional con formato estandarizado

### ✅ Descarga y Envío
- Descarga directa del PDF desde la app móvil
- Envío por WhatsApp al cliente con mensaje pre-formateado
- Tracking de envíos (registra si fue enviado por WhatsApp o Email)
- Posibilidad de reenviar múltiples veces

### ✅ Información Incluida en el Recibo
- **Encabezado:** Nombre y datos del negocio
- **Número de recibo:** Único e irrepetible
- **Cliente:** Nombre, teléfono, email
- **Servicio:** Nombre, descripción, fecha, hora
- **Especialista:** Nombre completo
- **Desglose financiero:** Subtotal, descuentos, impuestos, propina, total
- **Pago:** Método, referencia, estado
- **Código de verificación:** Para autenticidad

## 🗄️ Base de Datos

### Modelo: `Receipt`

```javascript
{
  id: UUID,
  receiptNumber: "REC-2024-00001",     // Número visible
  sequenceNumber: 1,                    // Número secuencial interno
  
  // Relaciones
  businessId: UUID,                     // Negocio emisor
  appointmentId: UUID,                  // Cita asociada
  specialistId: UUID,                   // Especialista
  userId: UUID,                         // Cliente
  
  // Información desnormalizada (histórica)
  specialistName: "María García",
  specialistCode: "ESP-001",
  clientName: "Juan Pérez",
  clientPhone: "+573001234567",
  clientEmail: "juan@example.com",
  
  // Fechas
  serviceDate: "2024-01-15",
  serviceTime: "14:30:00",
  issueDate: "2024-01-15T15:00:00Z",
  
  // Servicio
  serviceName: "Corte de Cabello",
  serviceDescription: "Corte caballero + arreglo barba",
  
  // Financiero
  subtotal: 50000,
  tax: 0,
  discount: 0,
  tip: 5000,
  totalAmount: 55000,
  
  // Pago
  paymentMethod: "CASH",               // CASH, CARD, TRANSFER, WOMPI, OTHER
  paymentReference: "TXN-123456",
  paymentStatus: "PAID",               // PENDING, PAID, CANCELLED, REFUNDED
  
  // Estado
  status: "ACTIVE",                    // ACTIVE, CANCELLED, REFUNDED
  
  // Envío
  sentViaEmail: false,
  sentViaWhatsApp: true,
  emailSentAt: null,
  whatsAppSentAt: "2024-01-15T15:05:00Z",
  
  // Metadata
  metadata: {
    appointmentServices: [],
    appliedRules: [],
    commissionData: {},
    paymentData: {}
  },
  
  // Auditoría
  createdBy: UUID,
  notes: "Cliente satisfecho",
  createdAt: "2024-01-15T15:00:00Z",
  updatedAt: "2024-01-15T15:05:00Z"
}
```

### Métodos del Modelo

```javascript
// Generar número de recibo
const { receiptNumber, sequenceNumber } = await Receipt.generateReceiptNumber(businessId);

// Crear recibo desde cita
const receipt = await Receipt.createFromAppointment(appointmentData, paymentData, options);

// Marcar como enviado
await receipt.markSentViaEmail();
await receipt.markSentViaWhatsApp();

// Obtener resumen
const summary = receipt.getSummary();
```

## 🌐 API Endpoints

### Base URL
```
/api/cash-register
```

### 1. Generar Recibo PDF

```http
GET /api/cash-register/generate-receipt-pdf/:appointmentId?businessId={uuid}
Authorization: Bearer {token}
```

**Comportamiento:**
1. Busca la cita por ID
2. Si ya existe recibo, lo usa
3. Si no existe, lo crea automáticamente desde la cita
4. Genera PDF en memoria
5. Retorna PDF como descarga

**Response:**
```http
200 OK
Content-Type: application/pdf
Content-Disposition: attachment; filename="recibo-REC-2024-00001-1234567890.pdf"

[Binary PDF Data]
```

**Errores:**
- `400` - businessId o appointmentId faltante
- `400` - No hay pagos completados para la cita
- `404` - Cita no encontrada
- `500` - Error al generar PDF

### 2. Obtener Datos del Recibo

```http
GET /api/cash-register/receipt-data/:appointmentId?businessId={uuid}
Authorization: Bearer {token}
```

**Propósito:** Obtener información del recibo para preparar mensaje de WhatsApp.

**Response:**
```json
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

### 3. Marcar Recibo como Enviado

```http
POST /api/cash-register/mark-receipt-sent/:receiptId
Authorization: Bearer {token}
Content-Type: application/json

{
  "method": "whatsapp"  // o "email"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "receiptId": "uuid",
    "sentViaWhatsApp": true,
    "sentViaEmail": false
  }
}
```

## 📱 Integración en Mobile

### Flujo Completo

```
1. Usuario completa cita y registra pago
   ↓
2. App muestra botón "Generar Recibo"
   ↓
3. Usuario presiona botón
   ↓
4. App llama a /generate-receipt-pdf/:appointmentId
   ↓
5. PDF se descarga automáticamente
   ↓
6. App muestra opciones:
   - Ver PDF
   - Enviar por WhatsApp
   - Enviar por Email
   ↓
7. Si elige WhatsApp:
   - Llama a /receipt-data/:appointmentId
   - Comparte PDF usando expo-sharing
   - Abre WhatsApp con mensaje pre-formateado
   - Llama a /mark-receipt-sent con method: "whatsapp"
   ↓
8. Confirmación de envío exitoso
```

### API Client

```javascript
// cashRegisterApi.js
import axios from 'axios';
import { getAuthToken } from './auth';

const API_BASE_URL = 'https://api.beautycontrol.com/api/cash-register';

export const cashRegisterApi = {
  
  // Generar recibo PDF
  generateReceiptPDF: async (appointmentId, businessId) => {
    const token = await getAuthToken();
    return axios.get(
      `${API_BASE_URL}/generate-receipt-pdf/${appointmentId}`,
      {
        params: { businessId },
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      }
    );
  },
  
  // Obtener datos del recibo
  getReceiptData: async (appointmentId, businessId) => {
    const token = await getAuthToken();
    return axios.get(
      `${API_BASE_URL}/receipt-data/${appointmentId}`,
      {
        params: { businessId },
        headers: { Authorization: `Bearer ${token}` }
      }
    );
  },
  
  // Marcar como enviado
  markReceiptSent: async (receiptId, method) => {
    const token = await getAuthToken();
    return axios.post(
      `${API_BASE_URL}/mark-receipt-sent/${receiptId}`,
      { method },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  }
  
};
```

### Componente React Native Completo

```jsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Linking } from 'react-native';
import { cashRegisterApi } from '../api/cashRegisterApi';

export const ReceiptActions = ({ appointmentId, businessId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [receiptPdfUri, setReceiptPdfUri] = useState(null);
  const [receiptData, setReceiptData] = useState(null);

  const handleGenerateReceipt = async () => {
    try {
      setLoading(true);
      
      // 1. Generar PDF
      const pdfResponse = await cashRegisterApi.generateReceiptPDF(appointmentId, businessId);
      
      // 2. Convertir blob a base64
      const reader = new FileReader();
      reader.readAsDataURL(pdfResponse.data);
      reader.onloadend = async () => {
        const base64data = reader.result.split(',')[1];
        
        // 3. Guardar en el dispositivo
        const fileUri = `${FileSystem.documentDirectory}recibo-${Date.now()}.pdf`;
        await FileSystem.writeAsStringAsync(fileUri, base64data, {
          encoding: FileSystem.EncodingType.Base64
        });
        
        setReceiptPdfUri(fileUri);
        
        // 4. Obtener datos del recibo
        const dataResponse = await cashRegisterApi.getReceiptData(appointmentId, businessId);
        setReceiptData(dataResponse.data);
        
        // 5. Mostrar opciones
        Alert.alert(
          'Recibo Generado',
          '¿Qué deseas hacer con el recibo?',
          [
            { text: 'Ver PDF', onPress: handleViewPDF },
            { text: 'Enviar por WhatsApp', onPress: handleSendWhatsApp },
            { text: 'Cerrar', style: 'cancel' }
          ]
        );
      };
      
    } catch (error) {
      console.error('Error generando recibo:', error);
      Alert.alert('Error', 'No se pudo generar el recibo. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewPDF = async () => {
    try {
      if (receiptPdfUri) {
        await Sharing.shareAsync(receiptPdfUri);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo abrir el PDF');
    }
  };

  const handleSendWhatsApp = async () => {
    try {
      if (!receiptData || !receiptPdfUri) {
        Alert.alert('Error', 'Primero genera el recibo');
        return;
      }
      
      const { whatsappReady, receipt } = receiptData.data;
      
      // 1. Compartir PDF primero
      await Sharing.shareAsync(receiptPdfUri);
      
      // 2. Formatear mensaje
      const message = `Hola ${whatsappReady.clientName}! 

Gracias por tu visita. Adjunto el recibo de tu ${whatsappReady.serviceName}.

📄 Recibo N°: ${whatsappReady.receiptNumber}
💰 Total: $${whatsappReady.totalAmount.toLocaleString('es-CO')}
📅 Fecha: ${new Date(whatsappReady.serviceDate).toLocaleDateString('es-CO')}

¡Esperamos verte pronto!`;
      
      // 3. Abrir WhatsApp
      const whatsappUrl = `whatsapp://send?phone=${whatsappReady.clientPhone}&text=${encodeURIComponent(message)}`;
      const canOpen = await Linking.canOpenURL(whatsappUrl);
      
      if (canOpen) {
        await Linking.openURL(whatsappUrl);
        
        // 4. Marcar como enviado
        await cashRegisterApi.markReceiptSent(receipt.id, 'whatsapp');
        
        Alert.alert('Éxito', 'Recibo enviado por WhatsApp');
        onSuccess && onSuccess();
      } else {
        Alert.alert('Error', 'No se puede abrir WhatsApp. ¿Lo tienes instalado?');
      }
      
    } catch (error) {
      console.error('Error enviando por WhatsApp:', error);
      Alert.alert('Error', 'No se pudo enviar por WhatsApp');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleGenerateReceipt}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>📄 Generar Recibo</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  buttonDisabled: {
    backgroundColor: '#94a3b8'
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }
});
```

## 🎨 Formato del PDF

### Estructura Visual

```
┌─────────────────────────────────────────────┐
│                                             │
│          RECIBO DE PAGO                     │
│                                             │
│         Beauty Control Spa                  │
│      Calle 123 #45-67, Bogotá              │
│         Tel: +57 300 123 4567              │
│                                             │
│         N° REC-2024-00001                  │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  INFORMACIÓN DEL CLIENTE                    │
│                                             │
│  Cliente: Juan Pérez                        │
│  Teléfono: +57 300 765 4321               │
│  Email: juan@example.com                    │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  DETALLES DEL SERVICIO                     │
│                                             │
│  Servicio: Corte de Cabello                │
│  Fecha: 15 de enero de 2024                │
│  Hora: 2:30 PM                             │
│  Especialista: María García                 │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  DESGLOSE DE PAGO                          │
│                                             │
│  Subtotal:           $ 50,000              │
│  Descuento:        - $ 5,000               │
│  Propina:          + $ 5,000               │
│  ────────────────────────────              │
│  TOTAL:              $ 50,000              │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  INFORMACIÓN DEL PAGO                      │
│                                             │
│  Método: Efectivo                          │
│  Estado: Pagado                            │
│  Referencia: TXN-123456                    │
│  Fecha: 15/01/2024 3:00 PM                │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│      ¡Gracias por tu preferencia!          │
│                                             │
│  Generado el: 15/01/2024 3:00 PM          │
│  Beauty Control - Sistema de Gestión       │
│                                             │
│  Código de verificación: a3b4c5d6          │
│                                             │
└─────────────────────────────────────────────┘
```

## 🔒 Seguridad

- ✅ Autenticación requerida en todos los endpoints
- ✅ Validación de pertenencia (usuario puede acceder solo a citas de su negocio)
- ✅ Código de verificación único en cada recibo
- ✅ Registro de auditoría (quién creó, cuándo se envió)
- ✅ Soft delete (paranoid: true)

## 🚀 Próximos Pasos

### Backend ✅ COMPLETADO
- [x] Modelo Receipt creado
- [x] Servicio ReceiptPDFService implementado
- [x] Endpoints en CashRegisterController
- [x] Rutas registradas
- [x] Relaciones configuradas

### Mobile 🔄 PENDIENTE
- [ ] Crear API client (cashRegisterApi.js)
- [ ] Componente ReceiptActions
- [ ] Integrar en pantalla de detalles de cita
- [ ] Probar descarga de PDF
- [ ] Probar envío por WhatsApp
- [ ] Lista de recibos enviados

### Testing
- [ ] Generar recibo desde cita
- [ ] Descargar PDF correctamente
- [ ] Enviar por WhatsApp con mensaje formateado
- [ ] Marcar como enviado
- [ ] Verificar numeración secuencial

## 💡 Tips de Implementación

### 1. Generación Automática
Puedes llamar automáticamente a `Receipt.createFromAppointment()` cuando:
- Una cita se marca como completada
- Se registra un pago completado

### 2. WhatsApp Business
Si tienes WhatsApp Business API configurado, podrías enviar el recibo automáticamente sin necesidad de que el usuario abra WhatsApp manualmente.

### 3. Email
Similar a WhatsApp, podrías enviar el recibo por email usando un servicio como SendGrid o similar.

### 4. Historial de Recibos
Agrega una pantalla en la app móvil para ver:
- Todos los recibos generados
- Filtro por fecha, cliente, especialista
- Indicador de envío (✓ WhatsApp, ✉ Email)
- Opción de reenviar

## 📞 Soporte

¿Necesitas ayuda con la integración? ¡Solo pregunta! 🚀
