# 🗂️ Plan de Limpieza del Mobile

## ❌ Archivos a ELIMINAR (Configuración - Ya no se usan)

### 1. Hook de Configuración
```bash
rm packages/business-control-mobile/src/hooks/usePaymentMethods.js
```
**Razón:** Este hook era para CRUD de métodos. Ahora eso se hace en web-app.

### 2. Componente de Card
```bash
rm packages/business-control-mobile/src/components/payments/PaymentMethodCard.js
```
**Razón:** Card para mostrar y editar métodos. Ya no se editan en mobile.

### 3. Modal de Formulario
```bash
rm packages/business-control-mobile/src/components/payments/PaymentMethodFormModal.js
```
**Razón:** Modal para crear/editar métodos. Ya no se hace en mobile.

### 4. Screen de Configuración
```bash
rm packages/business-control-mobile/src/screens/settings/PaymentMethodsScreen.js
```
**Razón:** Pantalla de configuración completa. Ya no aplica.

### 5. Actualizar SettingsScreen
```javascript
// packages/business-control-mobile/src/screens/settings/SettingsScreen.js

// ELIMINAR esta sección:
<View style={styles.section}>
  <Text style={styles.sectionTitle}>Pagos y Facturación</Text>
  
  <SettingOption
    icon="wallet-outline"
    title="Métodos de Pago"
    subtitle="Configura los métodos de pago disponibles"
    onPress={() => navigation.navigate('PaymentMethods')}
    color="#10b981"
  />
</View>
```

### 6. Actualizar MainNavigator
```javascript
// packages/business-control-mobile/src/navigation/MainNavigator.js

// ELIMINAR esta línea:
import PaymentMethodsScreen from '../screens/settings/PaymentMethodsScreen';

// ELIMINAR esta ruta:
<Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
```

---

## ✅ Archivos a CREAR (Uso - Para specialists)

### 1. Hook de Solo Lectura
```bash
touch packages/business-control-mobile/src/hooks/usePaymentMethodsReadOnly.js
```

```javascript
// Contenido sugerido:
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

export const usePaymentMethodsReadOnly = (businessId) => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPaymentMethods = useCallback(async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      const response = await axios.get(
        `${API_BASE_URL}/business/${businessId}/payment-methods`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        // Solo métodos activos
        const activeMethods = response.data.data.paymentMethods.filter(
          m => m.isActive === true
        );
        setPaymentMethods(activeMethods);
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      Alert.alert('Error', 'No se pudieron cargar los métodos de pago');
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    if (businessId) {
      fetchPaymentMethods();
    }
  }, [businessId, fetchPaymentMethods]);

  return { paymentMethods, loading, refresh: fetchPaymentMethods };
};
```

### 2. Componente Selector
```bash
touch packages/business-control-mobile/src/components/payments/PaymentMethodSelector.js
```

```javascript
// Dropdown simple para seleccionar método
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PAYMENT_TYPE_ICONS = {
  CASH: 'cash-outline',
  CARD: 'card-outline',
  TRANSFER: 'swap-horizontal-outline',
  QR: 'qr-code-outline',
  ONLINE: 'globe-outline',
  OTHER: 'ellipsis-horizontal-outline'
};

export const PaymentMethodSelector = ({ methods, selected, onSelect }) => {
  return (
    <View style={styles.container}>
      {methods.map(method => (
        <TouchableOpacity
          key={method.id}
          style={[
            styles.methodCard,
            selected?.id === method.id && styles.selectedCard
          ]}
          onPress={() => onSelect(method)}
        >
          <Ionicons 
            name={PAYMENT_TYPE_ICONS[method.type]} 
            size={24} 
            color={selected?.id === method.id ? '#ec4899' : '#6b7280'}
          />
          <View style={styles.methodInfo}>
            <Text style={styles.methodName}>{method.name}</Text>
            {method.bankInfo?.phoneNumber && (
              <Text style={styles.methodDetail}>
                📱 {method.bankInfo.phoneNumber}
              </Text>
            )}
            {method.requiresProof && (
              <Text style={styles.badge}>Requiere comprobante</Text>
            )}
          </View>
          {selected?.id === method.id && (
            <Ionicons name="checkmark-circle" size={24} color="#10b981" />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};
```

### 3. Modal de Registro de Pago
```bash
touch packages/business-control-mobile/src/components/payments/PaymentRegistrationModal.js
```

```javascript
// Modal completo para registrar un pago en una cita
import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';
import { PaymentMethodSelector } from './PaymentMethodSelector';
import { PaymentProofUpload } from './PaymentProofUpload';
import { usePaymentMethodsReadOnly } from '../../hooks/usePaymentMethodsReadOnly';
import axios from 'axios';

export const PaymentRegistrationModal = ({ 
  visible, 
  onClose, 
  appointment,
  businessId,
  onPaymentRegistered 
}) => {
  const { paymentMethods, loading } = usePaymentMethodsReadOnly(businessId);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [proofUri, setProofUri] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleRegisterPayment = async () => {
    // Validaciones
    if (!selectedMethod) {
      Alert.alert('Error', 'Selecciona un método de pago');
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Ingresa un monto válido');
      return;
    }

    if (selectedMethod.requiresProof && !proofUri) {
      Alert.alert('Error', 'Este método requiere un comprobante');
      return;
    }

    try {
      setSaving(true);
      
      // 1. Registrar pago
      const paymentData = {
        amount: parseFloat(amount),
        paymentMethodId: selectedMethod.id,
        paymentMethodName: selectedMethod.name,
        paymentMethodType: selectedMethod.type,
        referenceNumber: reference,
        notes
      };

      const token = await AsyncStorage.getItem('authToken');
      const response = await axios.post(
        `${API_BASE_URL}/appointments/${appointment.id}/payments`,
        paymentData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // 2. Si hay comprobante, subirlo
      if (proofUri && response.data.data.payment.id) {
        const formData = new FormData();
        formData.append('proof', {
          uri: proofUri,
          type: 'image/jpeg',
          name: `payment_proof_${Date.now()}.jpg`
        });

        await axios.post(
          `${API_BASE_URL}/appointments/${appointment.id}/payments/${response.data.data.payment.id}/proof`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      }

      Alert.alert('Éxito', 'Pago registrado correctamente');
      onPaymentRegistered();
      onClose();
      
    } catch (error) {
      console.error('Error registering payment:', error);
      Alert.alert('Error', error.response?.data?.message || 'Error al registrar pago');
    } finally {
      setSaving(false);
    }
  };

  const pendingAmount = appointment.totalPrice - (appointment.paidAmount || 0);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Registrar Pago</Text>
          
          {/* Info de la cita */}
          <View style={styles.infoBox}>
            <Text>Total: S/ {appointment.totalPrice.toFixed(2)}</Text>
            <Text>Pagado: S/ {(appointment.paidAmount || 0).toFixed(2)}</Text>
            <Text style={styles.pendingAmount}>
              Pendiente: S/ {pendingAmount.toFixed(2)}
            </Text>
          </View>

          {/* Monto */}
          <TextInput
            style={styles.input}
            placeholder="Monto a registrar"
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
          />

          {/* Selector de método */}
          {loading ? (
            <ActivityIndicator />
          ) : (
            <PaymentMethodSelector
              methods={paymentMethods}
              selected={selectedMethod}
              onSelect={setSelectedMethod}
            />
          )}

          {/* Upload de comprobante */}
          {selectedMethod?.requiresProof && (
            <PaymentProofUpload
              proofUri={proofUri}
              onProofSelected={setProofUri}
            />
          )}

          {/* Referencia */}
          <TextInput
            style={styles.input}
            placeholder="Nº de operación (opcional)"
            value={reference}
            onChangeText={setReference}
          />

          {/* Notas */}
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Notas (opcional)"
            multiline
            numberOfLines={3}
            value={notes}
            onChangeText={setNotes}
          />

          {/* Botones */}
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={onClose}
              disabled={saving}
            >
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={handleRegisterPayment}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveText}>Registrar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
```

### 4. Componente de Upload
```bash
touch packages/business-control-mobile/src/components/payments/PaymentProofUpload.js
```

```javascript
import React from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

export const PaymentProofUpload = ({ proofUri, onProofSelected }) => {
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      onProofSelected(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      onProofSelected(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Comprobante de Pago *</Text>
      
      {proofUri ? (
        <View style={styles.imagePreview}>
          <Image source={{ uri: proofUri }} style={styles.image} />
          <TouchableOpacity 
            style={styles.removeButton}
            onPress={() => onProofSelected(null)}
          >
            <Ionicons name="close-circle" size={24} color="#ef4444" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.uploadButtons}>
          <TouchableOpacity style={styles.uploadButton} onPress={takePhoto}>
            <Ionicons name="camera-outline" size={24} color="#ec4899" />
            <Text style={styles.uploadText}>Tomar Foto</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
            <Ionicons name="image-outline" size={24} color="#ec4899" />
            <Text style={styles.uploadText}>Galería</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};
```

### 5. Componente de Historial
```bash
touch packages/business-control-mobile/src/components/payments/PaymentHistoryList.js
```

```javascript
import React from 'react';
import { View, Text, FlatList, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const PaymentHistoryList = ({ payments }) => {
  const renderPaymentItem = ({ item }) => (
    <View style={styles.paymentCard}>
      <View style={styles.paymentHeader}>
        <Text style={styles.paymentAmount}>
          S/ {item.amount.toFixed(2)}
        </Text>
        <View style={[styles.statusBadge, styles[item.status]]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      
      <View style={styles.paymentDetails}>
        <Text style={styles.methodName}>
          {item.paymentMethodName} ({item.paymentMethodType})
        </Text>
        {item.referenceNumber && (
          <Text style={styles.reference}>
            Ref: {item.referenceNumber}
          </Text>
        )}
        <Text style={styles.date}>
          {new Date(item.registeredAt).toLocaleString()}
        </Text>
      </View>

      {item.proofUrl && (
        <Image source={{ uri: item.proofUrl }} style={styles.proofThumb} />
      )}
    </View>
  );

  return (
    <FlatList
      data={payments}
      renderItem={renderPaymentItem}
      keyExtractor={item => item.id}
      ListEmptyComponent={
        <Text style={styles.emptyText}>No hay pagos registrados</Text>
      }
    />
  );
};
```

---

## 📋 Checklist de Limpieza

### Paso 1: Eliminar archivos
- [ ] Eliminar `usePaymentMethods.js`
- [ ] Eliminar `PaymentMethodCard.js`
- [ ] Eliminar `PaymentMethodFormModal.js`
- [ ] Eliminar `PaymentMethodsScreen.js`

### Paso 2: Actualizar navegación
- [ ] Remover import de `PaymentMethodsScreen` en `MainNavigator.js`
- [ ] Remover ruta `PaymentMethods` en `MainNavigator.js`
- [ ] Remover sección "Pagos y Facturación" de `SettingsScreen.js`

### Paso 3: Crear nuevos componentes
- [ ] Crear `usePaymentMethodsReadOnly.js`
- [ ] Crear `PaymentMethodSelector.js`
- [ ] Crear `PaymentRegistrationModal.js`
- [ ] Crear `PaymentProofUpload.js`
- [ ] Crear `PaymentHistoryList.js`

### Paso 4: Integrar en AppointmentDetailModal
- [ ] Importar `PaymentRegistrationModal`
- [ ] Importar `PaymentHistoryList`
- [ ] Agregar botón "Registrar Pago"
- [ ] Mostrar resumen de pagos (total/pagado/pendiente)
- [ ] Mostrar historial de pagos

---

## 🎯 Resultado Final

### Mobile App ANTES (Incorrecto)
```
Settings → Métodos de Pago → CRUD completo ❌
```

### Mobile App DESPUÉS (Correcto)
```
Appointment Detail → 
  Ver métodos disponibles (readonly) ✅
  Registrar pago ✅
  Subir comprobante ✅
  Ver historial ✅
```

### Web-App (Nuevo)
```
Business Profile → Métodos de Pago → CRUD completo ✅
```

---

**Estado:** Documentación completa  
**Archivos a eliminar:** 4  
**Archivos a crear:** 5  
**Archivos a modificar:** 3
