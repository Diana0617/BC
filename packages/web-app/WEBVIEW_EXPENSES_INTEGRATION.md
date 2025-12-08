# Integración de Gastos con WebView Mobile

## Descripción General

Este módulo permite a recepcionistas y especialistas-recepcionistas registrar gastos del negocio directamente desde la aplicación móvil usando WebView. Los usuarios con este rol pueden cargar gastos sin ver las estadísticas financieras del negocio.

## Arquitectura

### Frontend (Web App)
- **Componente Principal**: `ExpenseFormWebView.jsx`
  - Ubicación: `packages/web-app/src/pages/webview/ExpenseFormWebView.jsx`
  - Ruta: `/webview/expense-form?businessId={businessId}`
  - Optimizado para mobile (diseño responsive, inputs grandes)

- **Componentes de Desktop**:
  - `ExpenseFormModal.jsx`: Modal para escritorio
  - `ExpensesTab.jsx`: Tab completo con lista y estadísticas
  - `MovementsSection.jsx`: Sección principal de movimientos

### Backend
- **Controller**: `BusinessExpenseController.js`
  - Método principal: `createExpense()`
  - Soporta carga de archivos (imágenes y PDFs) vía Cloudinary
  - Validación de permisos por rol

### Redux
- **Slice**: `businessExpensesSlice.js`
  - Action: `createExpense`
  - Manejo de FormData para archivos
  - Estado de loading y errores

## Uso desde React Native

### 1. Importar WebView

```javascript
import { WebView } from 'react-native-webview';
```

### 2. Implementar el Componente

```javascript
import React, { useRef } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

const ExpenseFormScreen = ({ route }) => {
  const { businessId, userToken } = route.params;
  const webViewRef = useRef(null);

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'EXPENSE_CREATED') {
        if (data.success) {
          // Mostrar mensaje de éxito
          Alert.alert('Éxito', 'Gasto registrado correctamente');
          // Opcional: Navegar de vuelta
          navigation.goBack();
        } else {
          // Mostrar error
          Alert.alert('Error', data.error || 'No se pudo registrar el gasto');
        }
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  const injectedJavaScript = `
    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'BUSINESS_ID',
      businessId: '${businessId}'
    }));
    true;
  `;

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ 
          uri: \`https://tu-dominio.com/webview/expense-form?businessId=\${businessId}\`,
          headers: {
            'Authorization': \`Bearer \${userToken}\`
          }
        }}
        onMessage={handleMessage}
        injectedJavaScript={injectedJavaScript}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ExpenseFormScreen;
```

### 3. Navegación desde el Menú

En tu componente de menú o dashboard mobile, agrega la opción para recepcionistas:

```javascript
// En tu BusinessDashboard o similar
const canCreateExpenses = user.role === 'RECEPTIONIST' || 
                          user.role === 'SPECIALIST_RECEPTIONIST' ||
                          user.role === 'ADMIN';

if (canCreateExpenses) {
  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('ExpenseForm', {
        businessId: currentBusiness.id,
        userToken: authToken
      })}
      style={styles.menuItem}
    >
      <Icon name="receipt" size={24} color="#EC4899" />
      <Text style={styles.menuText}>Registrar Gasto</Text>
    </TouchableOpacity>
  );
}
```

## Flujo de Datos

### 1. Inicialización
```
Mobile App → WebView → Web Component
businessId (via URL params o postMessage)
```

### 2. Autenticación
```
Mobile envía token en headers HTTP
Web usa token para autenticar requests API
```

### 3. Registro de Gasto
```
Usuario completa formulario
→ Dispatch createExpense action
→ Backend valida y guarda
→ Cloudinary procesa archivo (si existe)
→ Success/Error response
→ postMessage a React Native
→ Mobile muestra feedback
```

## Campos del Formulario

### Requeridos
- **Categoría**: Dropdown con categorías del negocio
- **Monto**: Input numérico con formato de moneda
- **Fecha**: Date picker
- **Descripción**: Textarea (mínimo 3 caracteres)

### Opcionales
- **Proveedor**: Input de texto
- **Método de Pago**: Dropdown (Efectivo, Tarjeta, Transferencia, etc.)
- **Número de Recibo**: Input de texto
- **Comprobante**: File upload (imágenes o PDF, máx 5MB)
- **Notas**: Textarea

## Validaciones

### Frontend
```javascript
- categoryId: Required
- amount: Required, > 0
- expenseDate: Required, valid date
- description: Required, min 3 chars
- receipt file: Optional, max 5MB, formats: jpg, png, webp, pdf
```

### Backend
```javascript
- User authentication
- Business ownership/membership validation
- Role permissions (ADMIN, RECEPTIONIST, SPECIALIST_RECEPTIONIST)
- File type and size validation
- Data sanitization
```

## Estados del Gasto

1. **PENDING**: Creado, esperando aprobación (default para recepcionistas)
2. **APPROVED**: Aprobado por administrador
3. **REJECTED**: Rechazado
4. **PAID**: Marcado como pagado

> **Nota**: Recepcionistas crean gastos en estado PENDING. Solo administradores pueden aprobar/rechazar.

## Comunicación WebView ↔ React Native

### Mensajes desde React Native a WebView

```javascript
// Enviar businessId
{
  type: 'BUSINESS_ID',
  businessId: 'uuid-del-negocio'
}
```

### Mensajes desde WebView a React Native

```javascript
// Gasto creado exitosamente
{
  type: 'EXPENSE_CREATED',
  success: true
}

// Error al crear gasto
{
  type: 'EXPENSE_CREATED',
  success: false,
  error: 'Mensaje de error'
}
```

## Permisos y Seguridad

### Roles Permitidos
- ✅ `ADMIN`: Acceso completo
- ✅ `RECEPTIONIST`: Crear gastos (pending)
- ✅ `SPECIALIST_RECEPTIONIST`: Crear gastos (pending)
- ❌ `SPECIALIST`: No tiene acceso a gastos

### Restricciones para Recepcionistas
- ✅ Puede: Crear nuevos gastos
- ✅ Puede: Subir comprobantes
- ❌ No puede: Ver lista completa de gastos
- ❌ No puede: Ver totales/estadísticas
- ❌ No puede: Aprobar/rechazar gastos
- ❌ No puede: Eliminar gastos
- ❌ No puede: Ver movimientos financieros

## Cloudinary Integration

### Configuración
```javascript
// packages/backend/.env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Carpeta de Almacenamiento
```
beauty_control/expenses/{businessId}/{timestamp}-{filename}
```

### Tipos Soportados
- Imágenes: JPEG, JPG, PNG, WEBP
- Documentos: PDF

### Tamaño Máximo
- 5 MB por archivo

## Testing

### URL de Prueba en Desarrollo
```
http://localhost:5173/webview/expense-form?businessId=your-business-id
```

### Casos de Prueba
1. ✓ Crear gasto sin archivo
2. ✓ Crear gasto con imagen
3. ✓ Crear gasto con PDF
4. ✓ Validación de campos requeridos
5. ✓ Validación de archivo muy grande
6. ✓ Validación de formato de archivo inválido
7. ✓ Mensaje de éxito después de crear
8. ✓ Reset de formulario después de éxito
9. ✓ Manejo de errores de red

## Troubleshooting

### Problema: WebView no carga
**Solución**: Verificar que la URL sea correcta y el token sea válido

### Problema: businessId undefined
**Solución**: Verificar que se envíe via URL params O postMessage al montar

### Problema: Archivo no se sube
**Solución**: 
- Verificar permisos de cámara/galería en mobile
- Verificar formato y tamaño de archivo
- Verificar configuración de Cloudinary

### Problema: Token expirado
**Solución**: Implementar refresh token o re-autenticación en mobile

## API Endpoints

### POST /api/business/:businessId/expenses
Crea un nuevo gasto

**Headers**:
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Body** (FormData):
```javascript
{
  categoryId: "uuid",
  amount: 50000,
  expenseDate: "2025-11-27",
  description: "Compra de productos",
  vendor: "Proveedor XYZ",
  paymentMethod: "CASH",
  receiptNumber: "FAC-001",
  notes: "Notas adicionales",
  receipt: File // opcional
}
```

**Response Success** (201):
```javascript
{
  success: true,
  data: {
    id: "uuid",
    categoryId: "uuid",
    amount: 50000,
    status: "pending",
    receiptUrl: "https://cloudinary.../image.jpg",
    ...
  }
}
```

## Próximas Mejoras

- [ ] Modo offline con sincronización posterior
- [ ] Captura de foto directa desde la app
- [ ] Escáner de códigos de barras para recibos
- [ ] Reconocimiento OCR de recibos
- [ ] Notificaciones push cuando un gasto es aprobado/rechazado
- [ ] Historial de gastos creados por el usuario (vista simplificada)

## Soporte

Para dudas o problemas, contactar al equipo de desarrollo.
