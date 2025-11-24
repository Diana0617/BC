# Sistema Redux - Caja y Recibos

## 📋 Descripción General

Redux slices organizados en `packages/shared/src/store/slices` para gestionar el estado del sistema de caja y recibos tanto en web-app como en business-control-mobile.

## 🗂️ Estructura

```
packages/shared/src/store/
├── index.js                          # Store principal
└── slices/
    ├── cashRegisterSlice.js          # ✨ NUEVO - Gestión de turnos de caja
    ├── receiptSlice.js               # ✨ NUEVO - Gestión de recibos PDF
    └── index.js                      # Exportaciones de todos los slices
```

## 💰 Cash Register Slice

### Estado Inicial

```javascript
{
  // Permisos
  shouldUse: false,
  shouldUseReason: '',
  userRole: null,
  
  // Turno actual
  activeShift: null,
  
  // Resumen del turno
  summary: null,
  
  // Último turno cerrado
  lastClosedShift: null,
  
  // Historial
  shiftsHistory: [],
  historyPagination: {
    currentPage: 1,
    totalPages: 0,
    totalShifts: 0,
    limit: 20
  },
  
  // Loading states
  loading: {
    checkingAccess: false,
    fetchingActiveShift: false,
    openingShift: false,
    closingShift: false,
    fetchingSummary: false,
    generatingPDF: false,
    fetchingHistory: false,
    fetchingLastClosed: false
  },
  
  error: null
}
```

### Async Thunks

#### `checkShouldUseCashRegister({ businessId })`
Verifica si el usuario debe usar gestión de caja.

```javascript
import { checkShouldUseCashRegister } from '@shared/store/slices';

dispatch(checkShouldUseCashRegister({ 
  businessId: 'uuid'
}));
```

#### `getActiveShift({ businessId })`
Obtiene el turno activo del usuario. Retorna `null` si no hay turno abierto.

```javascript
import { getActiveShift } from '@shared/store/slices';

dispatch(getActiveShift({ 
  businessId: 'uuid'
}));
```

#### `openShift({ businessId, branchId?, openingBalance, openingNotes? })`
Abre un nuevo turno de caja.

```javascript
import { openShift } from '@shared/store/slices';

dispatch(openShift({ 
  businessId: 'uuid',
  branchId: 'uuid',  // Opcional
  openingBalance: 50000,
  openingNotes: 'Recibí 50mil de María'
}));
```

#### `getShiftSummary({ businessId })`
Obtiene resumen en tiempo real del turno actual.

```javascript
import { getShiftSummary } from '@shared/store/slices';

dispatch(getShiftSummary({ 
  businessId: 'uuid'
}));
```

#### `generateClosingPDF({ businessId })`
Genera PDF de cierre del turno (blob).

```javascript
import { generateClosingPDF } from '@shared/store/slices';

const result = await dispatch(generateClosingPDF({ 
  businessId: 'uuid'
}));

// Resultado es un blob, manejarlo en componente
const blob = result.payload;
```

#### `closeShift({ businessId, actualClosingBalance, closingNotes? })`
Cierra el turno actual.

```javascript
import { closeShift } from '@shared/store/slices';

dispatch(closeShift({ 
  businessId: 'uuid',
  actualClosingBalance: 248500,
  closingNotes: 'Todo correcto'
}));
```

#### `getShiftsHistory({ businessId, page?, limit?, status?, startDate?, endDate? })`
Obtiene historial paginado de turnos.

```javascript
import { getShiftsHistory } from '@shared/store/slices';

dispatch(getShiftsHistory({ 
  businessId: 'uuid',
  page: 1,
  limit: 20,
  status: 'CLOSED',  // Opcional: OPEN, CLOSED
  startDate: '2024-01-01',  // Opcional
  endDate: '2024-01-31'    // Opcional
}));
```

#### `getLastClosedShift({ businessId })`
Obtiene el último turno cerrado (para balance inicial del siguiente).

```javascript
import { getLastClosedShift } from '@shared/store/slices';

dispatch(getLastClosedShift({ 
  businessId: 'uuid'
}));
```

### Actions

```javascript
import { 
  clearError,
  clearActiveShift,
  clearHistory,
  resetCashRegister 
} from '@shared/store/slices';

// Limpiar errores
dispatch(clearError());

// Limpiar turno activo (al cerrar sesión)
dispatch(clearActiveShift());

// Limpiar historial
dispatch(clearHistory());

// Reset completo
dispatch(resetCashRegister());
```

### Selectors

```javascript
import { 
  selectShouldUseCashRegister,
  selectActiveShift,
  selectShiftSummary,
  selectLastClosedShift,
  selectShiftsHistory,
  selectHistoryPagination,
  selectCashRegisterLoading,
  selectCashRegisterError
} from '@shared/store/slices';

const shouldUse = useSelector(selectShouldUseCashRegister);
const activeShift = useSelector(selectActiveShift);
const summary = useSelector(selectShiftSummary);
const lastClosed = useSelector(selectLastClosedShift);
const history = useSelector(selectShiftsHistory);
const pagination = useSelector(selectHistoryPagination);
const loading = useSelector(selectCashRegisterLoading);
const error = useSelector(selectCashRegisterError);
```

## 📄 Receipt Slice

### Estado Inicial

```javascript
{
  // Recibos por appointmentId
  receipts: {},
  
  // PDF generado (blob) temporal
  generatedPDF: null,
  generatedPDFFilename: null,
  
  // Datos del recibo actual para WhatsApp
  currentReceiptData: null,
  
  // Loading states
  loading: {
    generatingPDF: false,
    fetchingData: false,
    markingSent: false
  },
  
  error: null
}
```

### Async Thunks

#### `generateReceiptPDF({ appointmentId, businessId })`
Genera recibo PDF para una cita.

```javascript
import { generateReceiptPDF } from '@shared/store/slices';

const result = await dispatch(generateReceiptPDF({ 
  appointmentId: 'uuid',
  businessId: 'uuid'
}));

// Acceder al blob
const { blob, filename } = result.payload;
```

#### `getReceiptData({ appointmentId, businessId })`
Obtiene datos del recibo para envío por WhatsApp.

```javascript
import { getReceiptData } from '@shared/store/slices';

dispatch(getReceiptData({ 
  appointmentId: 'uuid',
  businessId: 'uuid'
}));

// Acceder desde selector
const receiptData = useSelector(selectCurrentReceiptData);
const { receipt, whatsappReady } = receiptData;
```

#### `markReceiptSent({ receiptId, method })`
Marca recibo como enviado ('whatsapp' o 'email').

```javascript
import { markReceiptSent } from '@shared/store/slices';

dispatch(markReceiptSent({ 
  receiptId: 'uuid',
  method: 'whatsapp'  // o 'email'
}));
```

### Actions

```javascript
import { 
  clearGeneratedPDF,
  clearCurrentReceiptData,
  clearError,
  addReceipt,
  resetReceipts 
} from '@shared/store/slices';

// Limpiar PDF generado
dispatch(clearGeneratedPDF());

// Limpiar datos actuales
dispatch(clearCurrentReceiptData());

// Agregar recibo local
dispatch(addReceipt({
  appointmentId: 'uuid',
  receipt: { /* data */ }
}));

// Reset completo
dispatch(resetReceipts());
```

### Selectors

```javascript
import { 
  selectGeneratedPDF,
  selectGeneratedPDFFilename,
  selectCurrentReceiptData,
  selectReceiptByAppointmentId,
  selectAllReceipts,
  selectReceiptLoading,
  selectReceiptError,
  selectReceiptSentStatus
} from '@shared/store/slices';

const pdfBlob = useSelector(selectGeneratedPDF);
const filename = useSelector(selectGeneratedPDFFilename);
const receiptData = useSelector(selectCurrentReceiptData);
const receipt = useSelector(selectReceiptByAppointmentId('appointment-uuid'));
const allReceipts = useSelector(selectAllReceipts);
const loading = useSelector(selectReceiptLoading);
const error = useSelector(selectReceiptError);
const sentStatus = useSelector(selectReceiptSentStatus('appointment-uuid'));
// { sentViaWhatsApp: true, sentViaEmail: false }
```

## 🎯 Ejemplos de Uso

### Web App - React

#### Verificar y Abrir Turno

```jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  checkShouldUseCashRegister,
  getActiveShift,
  openShift,
  selectShouldUseCashRegister,
  selectActiveShift,
  selectCashRegisterLoading
} from '@shared/store/slices';

const CashRegisterDashboard = () => {
  const dispatch = useDispatch();
  const shouldUse = useSelector(selectShouldUseCashRegister);
  const activeShift = useSelector(selectActiveShift);
  const loading = useSelector(selectCashRegisterLoading);
  
  const [openingBalance, setOpeningBalance] = useState('');
  
  const businessId = 'your-business-id';
  const token = 'your-jwt-token';

  useEffect(() => {
    // Verificar si debe usar caja
    dispatch(checkShouldUseCashRegister({ businessId, token }));
    
    // Obtener turno activo
    dispatch(getActiveShift({ businessId, token }));
  }, [dispatch, businessId, token]);

  const handleOpenShift = async () => {
    await dispatch(openShift({
      businessId,
      openingBalance: parseFloat(openingBalance),
      openingNotes: 'Apertura del día',
      token
    }));
  };

  if (!shouldUse) {
    return <div>No tienes acceso a gestión de caja</div>;
  }

  if (activeShift) {
    return <div>Ya tienes un turno abierto</div>;
  }

  return (
    <div>
      <h2>Abrir Turno de Caja</h2>
      <input
        type="number"
        value={openingBalance}
        onChange={(e) => setOpeningBalance(e.target.value)}
        placeholder="Balance inicial"
      />
      <button onClick={handleOpenShift} disabled={loading.openingShift}>
        {loading.openingShift ? 'Abriendo...' : 'Abrir Turno'}
      </button>
    </div>
  );
};
```

#### Cerrar Turno con PDF

```jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  generateClosingPDF,
  closeShift,
  selectActiveShift,
  selectCashRegisterLoading
} from '@shared/store/slices';

const CloseShiftForm = () => {
  const dispatch = useDispatch();
  const activeShift = useSelector(selectActiveShift);
  const loading = useSelector(selectCashRegisterLoading);
  
  const [actualBalance, setActualBalance] = useState('');
  const [pdfGenerated, setPdfGenerated] = useState(false);
  
  const businessId = 'your-business-id';
  const token = 'your-jwt-token';

  const handleGeneratePDF = async () => {
    const result = await dispatch(generateClosingPDF({ businessId, token }));
    
    if (result.payload) {
      // Descargar PDF
      const blob = result.payload;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cierre-turno-${Date.now()}.pdf`;
      a.click();
      
      setPdfGenerated(true);
    }
  };

  const handleCloseShift = async () => {
    if (!pdfGenerated) {
      alert('Primero debes generar el PDF');
      return;
    }
    
    await dispatch(closeShift({
      businessId,
      actualClosingBalance: parseFloat(actualBalance),
      closingNotes: 'Cierre del día',
      token
    }));
    
    alert('Turno cerrado exitosamente');
  };

  return (
    <div>
      <h2>Cerrar Turno</h2>
      
      <button onClick={handleGeneratePDF} disabled={loading.generatingPDF}>
        {loading.generatingPDF ? 'Generando...' : '1. Generar PDF'}
      </button>
      
      <input
        type="number"
        value={actualBalance}
        onChange={(e) => setActualBalance(e.target.value)}
        placeholder="Balance real contado"
      />
      
      <button 
        onClick={handleCloseShift} 
        disabled={!pdfGenerated || loading.closingShift}
      >
        {loading.closingShift ? 'Cerrando...' : '2. Cerrar Turno'}
      </button>
    </div>
  );
};
```

#### Generar y Enviar Recibo

```jsx
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  generateReceiptPDF,
  getReceiptData,
  markReceiptSent,
  selectReceiptLoading,
  selectCurrentReceiptData
} from '@shared/store/slices';

const ReceiptActions = ({ appointmentId }) => {
  const dispatch = useDispatch();
  const loading = useSelector(selectReceiptLoading);
  const receiptData = useSelector(selectCurrentReceiptData);
  
  const businessId = 'your-business-id';
  const token = 'your-jwt-token';

  const handleGeneratePDF = async () => {
    const result = await dispatch(generateReceiptPDF({ 
      appointmentId, 
      businessId, 
      token 
    }));
    
    if (result.payload) {
      const { blob, filename } = result.payload;
      
      // Descargar PDF
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
    }
  };

  const handleSendWhatsApp = async () => {
    // Obtener datos del recibo
    await dispatch(getReceiptData({ appointmentId, businessId, token }));
    
    // Simular envío por WhatsApp
    if (receiptData?.whatsappReady) {
      const { clientPhone, clientName, receiptNumber, totalAmount } = receiptData.whatsappReady;
      
      const message = `Hola ${clientName}! Adjunto tu recibo ${receiptNumber} por $${totalAmount}`;
      const whatsappUrl = `https://wa.me/${clientPhone}?text=${encodeURIComponent(message)}`;
      
      window.open(whatsappUrl, '_blank');
      
      // Marcar como enviado
      await dispatch(markReceiptSent({ 
        receiptId: receiptData.receipt.id, 
        method: 'whatsapp', 
        token 
      }));
    }
  };

  return (
    <div>
      <button onClick={handleGeneratePDF} disabled={loading.generatingPDF}>
        {loading.generatingPDF ? 'Generando...' : 'Generar Recibo PDF'}
      </button>
      
      <button onClick={handleSendWhatsApp} disabled={loading.fetchingData}>
        Enviar por WhatsApp
      </button>
    </div>
  );
};
```

### Mobile App - React Native

#### Ejemplo Completo con Expo

```jsx
import React, { useState, useEffect } from 'react';
import { View, Button, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import {
  generateReceiptPDF,
  getReceiptData,
  markReceiptSent,
  selectReceiptLoading
} from '@shared/store/slices';

const ReceiptButton = ({ appointmentId, businessId, token }) => {
  const dispatch = useDispatch();
  const loading = useSelector(selectReceiptLoading);
  const [pdfUri, setPdfUri] = useState(null);

  const handleGenerate = async () => {
    try {
      const result = await dispatch(generateReceiptPDF({ 
        appointmentId, 
        businessId, 
        token 
      })).unwrap();
      
      // Convertir blob a base64
      const reader = new FileReader();
      reader.readAsDataURL(result.blob);
      reader.onloadend = async () => {
        const base64 = reader.result.split(',')[1];
        
        // Guardar en dispositivo
        const fileUri = `${FileSystem.documentDirectory}${result.filename}`;
        await FileSystem.writeAsStringAsync(fileUri, base64, {
          encoding: FileSystem.EncodingType.Base64
        });
        
        setPdfUri(fileUri);
        
        // Compartir
        await Sharing.shareAsync(fileUri);
      };
      
    } catch (error) {
      Alert.alert('Error', 'No se pudo generar el recibo');
    }
  };

  return (
    <Button 
      title="Generar Recibo" 
      onPress={handleGenerate} 
      disabled={loading.generatingPDF}
    />
  );
};
```

## 🔄 Persistencia

Para persistir el estado de caja entre sesiones, usar redux-persist:

```javascript
// En tu store config
import { persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

const persistConfig = {
  key: 'cashRegister',
  storage: AsyncStorage,
  whitelist: ['activeShift', 'lastClosedShift'] // Solo persistir estos
};

const persistedCashRegisterReducer = persistReducer(
  persistConfig, 
  cashRegisterReducer
);
```

## 📝 Notas Importantes

1. **Tokens**: Todos los thunks requieren `token` JWT para autenticación
2. **businessId**: Siempre requerido para evitar mezclar datos entre negocios
3. **Blobs**: Los PDFs se retornan como blobs, manejarlos en componentes
4. **Errores**: Usar selectores de error para mostrar mensajes al usuario
5. **Loading**: Usar selectores de loading para deshabilitar botones durante requests

## 🚀 Próximos Pasos

- [ ] Configurar redux-persist para mobile
- [ ] Agregar tests unitarios para slices
- [ ] Documentar casos edge (sin internet, etc.)
- [ ] Agregar middleware para logging (dev only)
