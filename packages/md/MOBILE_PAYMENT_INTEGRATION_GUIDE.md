# Guía de Integración de Métodos de Pago en Mobile

## 📱 Componentes Creados

### 1. Hook: `usePaymentMethodsReadOnly`
**Ubicación:** `src/hooks/usePaymentMethodsReadOnly.js`

**Propósito:** Obtener métodos de pago configurados por el negocio (solo lectura)

**Uso:**
```javascript
import { usePaymentMethodsReadOnly } from '../hooks/usePaymentMethodsReadOnly';

const MyComponent = () => {
  const { methods, loading, error, refetch } = usePaymentMethodsReadOnly();
  
  // methods: Array de métodos de pago activos
  // loading: Boolean indicando carga
  // error: String con mensaje de error (si hay)
  // refetch: Función para recargar métodos
};
```

---

### 2. Componente: `PaymentMethodSelector`
**Ubicación:** `src/components/payment/PaymentMethodSelector.js`

**Propósito:** Selector visual de métodos de pago con información detallada

**Props:**
- `methods`: Array de métodos disponibles
- `selectedMethod`: Método actualmente seleccionado
- `onSelectMethod`: Callback cuando se selecciona un método
- `amount`: Monto a cobrar
- `onAmountChange`: Callback cuando cambia el monto
- `loading`: Indica carga
- `disabled`: Deshabilita el selector

**Uso:**
```javascript
import { PaymentMethodSelector } from '../components/payment';

const [selectedMethod, setSelectedMethod] = useState(null);
const [amount, setAmount] = useState('');

<PaymentMethodSelector
  methods={methods}
  selectedMethod={selectedMethod}
  onSelectMethod={setSelectedMethod}
  amount={amount}
  onAmountChange={setAmount}
/>
```

**Características:**
- ✅ Muestra iconos y colores según tipo de método
- ✅ Información bancaria para TRANSFER
- ✅ Teléfono para QR
- ✅ Indica si requiere comprobante
- ✅ Lista expandible/colapsable

---

### 3. Componente: `PaymentProofUpload`
**Ubicación:** `src/components/payment/PaymentProofUpload.js`

**Propósito:** Subir foto del comprobante de pago

**Props:**
- `proofImage`: Objeto con imagen seleccionada
- `onImageSelected`: Callback cuando se selecciona imagen
- `onImageRemoved`: Callback cuando se elimina imagen
- `disabled`: Deshabilita upload
- `required`: Indica si es requerido

**Uso:**
```javascript
import { PaymentProofUpload } from '../components/payment';

const [proofImage, setProofImage] = useState(null);

<PaymentProofUpload
  proofImage={proofImage}
  onImageSelected={setProofImage}
  onImageRemoved={() => setProofImage(null)}
  required={selectedMethod?.requiresProof}
/>
```

**Características:**
- ✅ Tomar foto con cámara
- ✅ Seleccionar de galería
- ✅ Preview de imagen
- ✅ Edición de imagen (crop 4:3)
- ✅ Cambiar/eliminar imagen

---

## 🔗 Integración en Cierre de Turno

### Paso 1: Verificar Permiso
Antes de mostrar el selector de pago, verifica que el usuario tenga permiso:

```javascript
import { useSelector } from 'react-redux';

const permissions = useSelector(state => state.auth.user?.permissions || {});
const canCloseWithPayment = permissions.close_appointments_with_payment;

if (!canCloseWithPayment) {
  // No mostrar selector de pago
  return null;
}
```

---

### Paso 2: Implementar en Modal/Screen de Cierre

```javascript
import React, { useState } from 'react';
import { usePaymentMethodsReadOnly } from '../hooks/usePaymentMethodsReadOnly';
import { PaymentMethodSelector, PaymentProofUpload } from '../components/payment';

const AppointmentCloseModal = ({ appointment, onClose }) => {
  // Obtener métodos de pago
  const { methods, loading } = usePaymentMethodsReadOnly();
  
  // Estados locales
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [amount, setAmount] = useState(appointment.totalAmount?.toString() || '');
  const [proofImage, setProofImage] = useState(null);
  
  // Validación antes de cerrar
  const handleClose = async () => {
    // Validar monto
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Ingresa un monto válido');
      return;
    }
    
    // Validar método seleccionado
    if (!selectedMethod) {
      Alert.alert('Error', 'Selecciona un método de pago');
      return;
    }
    
    // Validar comprobante si es requerido
    if (selectedMethod.requiresProof && !proofImage) {
      Alert.alert('Error', 'Este método requiere comprobante de pago');
      return;
    }
    
    // Preparar datos de pago
    const paymentData = {
      methodId: selectedMethod.id,
      methodName: selectedMethod.name,
      methodType: selectedMethod.type,
      amount: parseFloat(amount),
      proofImage: proofImage?.uri || null
    };
    
    // Llamar API para cerrar turno con pago
    await closeAppointmentWithPayment(appointment.id, paymentData);
    
    onClose();
  };
  
  return (
    <ScrollView style={styles.container}>
      {/* Selector de método de pago */}
      <PaymentMethodSelector
        methods={methods}
        selectedMethod={selectedMethod}
        onSelectMethod={setSelectedMethod}
        amount={amount}
        onAmountChange={setAmount}
        loading={loading}
      />
      
      {/* Upload de comprobante (si es requerido) */}
      {selectedMethod?.requiresProof && (
        <PaymentProofUpload
          proofImage={proofImage}
          onImageSelected={setProofImage}
          onImageRemoved={() => setProofImage(null)}
          required={true}
        />
      )}
      
      {/* Botón de confirmar */}
      <Button
        title="Cerrar turno y registrar pago"
        onPress={handleClose}
      />
    </ScrollView>
  );
};
```

---

### Paso 3: Backend - Endpoint de Cierre con Pago

El backend ya tiene el modelo `PaymentMethod`, ahora necesitas actualizar el endpoint de cierre de turno para aceptar datos de pago.

**Ejemplo de payload:**
```json
{
  "status": "COMPLETED",
  "payment": {
    "methodId": "uuid-del-metodo",
    "methodName": "Bancolombia",
    "methodType": "TRANSFER",
    "amount": 50000,
    "proofImageBase64": "data:image/jpeg;base64,..."
  }
}
```

---

## 📊 Tipos de Métodos y Validaciones

### CASH (Efectivo)
- ✅ No requiere info adicional
- ⚠️ Puede o no requerir comprobante

### CARD (Tarjeta)
- ✅ No requiere info adicional
- ⚠️ Generalmente no requiere comprobante

### TRANSFER (Transferencia)
- ✅ **Requiere `bankInfo`:**
  - `bankName` (ej: "Bancolombia")
  - `accountNumber`
  - `accountType` (ej: "Cuenta Corriente")
  - `holderName` (titular)
- ✅ **Generalmente requiere comprobante**

### QR (Yape, Plin, etc.)
- ✅ **Requiere `qrInfo`:**
  - `phoneNumber` o `qrImage`
- ✅ **Generalmente requiere comprobante**

### ONLINE (Wompi, PayU, etc.)
- ✅ Procesamiento en línea
- ⚠️ No aplica en cierre manual

### OTHER (Otros)
- ✅ Flexible
- ⚠️ Configuración personalizada

---

## 🎨 Flujo Completo

1. **Usuario abre modal de cierre de turno**
2. **Sistema verifica permiso:** `close_appointments_with_payment`
3. **Hook carga métodos:** `usePaymentMethodsReadOnly()`
4. **Usuario selecciona método:** `PaymentMethodSelector`
5. **Sistema muestra info del método:** Datos bancarios/QR según tipo
6. **Usuario ingresa monto**
7. **Si requiere comprobante:** Muestra `PaymentProofUpload`
8. **Usuario toma foto o selecciona de galería**
9. **Validación:** Monto > 0, método seleccionado, comprobante (si required)
10. **Envío a backend:** Cierra turno + registra pago
11. **Éxito:** Turno cerrado, pago registrado

---

## 🔐 Permisos Requeridos

- **Cámara:** `expo-image-picker` → Para tomar fotos de comprobantes
- **Galería:** `expo-image-picker` → Para seleccionar imágenes

**Instalación:**
```bash
npx expo install expo-image-picker
```

---

## ✅ Checklist de Integración

- [x] Hook `usePaymentMethodsReadOnly` creado
- [x] Componente `PaymentMethodSelector` creado
- [x] Componente `PaymentProofUpload` creado
- [ ] Integrar en modal/screen de cierre de turno
- [ ] Validar permisos de usuario
- [ ] Actualizar endpoint backend para aceptar pago
- [ ] Probar flujo completo end-to-end
- [ ] Manejar errores de upload de imagen
- [ ] Mostrar confirmación de éxito

---

## 📝 Próximos Pasos

1. **Identificar screen de cierre de turno** en el código mobile
2. **Integrar los componentes** según el ejemplo
3. **Actualizar backend** para procesar pago en cierre
4. **Testing:** Probar con diferentes tipos de métodos
5. **Edge cases:** Sin métodos configurados, sin permisos, etc.

---

**¿Dónde está el código de cierre de turno actualmente?** 
Necesito saber qué archivo modificar para integrar estos componentes.
