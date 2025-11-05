# Sist## 🏗️ Arquitectura del Sistema

### Gestión de Estado con Redux Toolkit

#### Slice `publicBookingSlice`
- **Estado Global**: Centraliza todo el estado del flujo de reservas
- **Campos Principales**:
  - `services`: Lista de servicios disponibles
  - `specialists`: Especialistas para el servicio seleccionado
  - `availability`: Slots de tiempo disponibles
  - `bookingData`: Datos acumulados de la reserva (servicio, especialista, fecha/hora, cliente, pago)
  - `paymentInfo`: Información bancaria para transferencias
  - `currentStep`: Paso actual del flujo (1-6)
- **Estados de Carga**: `isLoading*` para cada operación asíncrona
- **Manejo de Errores**: `error*` para cada tipo de error

#### Actions y Thunks
- `fetchPublicServices`: Carga servicios del negocio
- `fetchPublicSpecialists`: Carga especialistas disponibles
- `fetchPublicAvailability`: Consulta disponibilidad horaria
- `fetchPaymentInfo`: Obtiene datos bancarios
- `createBooking`: Crea la reserva final
- `uploadProof`: Sube comprobante de pago
- `updateBookingData`: Actualiza datos del booking
- `nextStep/prevStep`: Navegación entre pasos

### Componentes Principales

#### Backend (Node.js + Express + Sequelize)
- **APIs Públicas**: Endpoints sin autenticación para consultas de disponibilidad y creación de reservas
- **Controladores**: `PublicBookingsController.js` maneja toda la lógica de reservas públicas
- **Modelos**: `Appointment`, `Service`, `Specialist`, `Client`, `Business` para gestión de datos
- **Integraciones**: Wompi para pagos online, Cloudinary para subida de comprobantes

#### Frontend (React + React Router + Redux Toolkit)
- **Flujo Multi-paso**: Componentes modulares para cada etapa de la reserva
- **Interfaz Responsiva**: Optimizada para móviles y desktop
- **Estado Centralizado**: Redux Toolkit para gestión global del estado de reserva
- **Operaciones Asíncronas**: Thunks para llamadas API y manejo de loading/error statess Online - Beauty Control

## 📋 Descripción General

El **Sistema de Reservas Online** permite a los clientes de negocios de estética y bienestar agendar citas de manera autónoma a través de una interfaz web pública. El sistema incluye un flujo completo de reserva con selección de servicios, especialistas, horarios, datos del cliente y opciones de pago flexibles.

## 🏗️ Arquitectura del Sistema

### Componentes Principales

#### Backend (Node.js + Express + Sequelize)
- **APIs Públicas**: Endpoints sin autenticación para consultas de disponibilidad y creación de reservas
- **Controladores**: `PublicBookingsController.js` maneja toda la lógica de reservas públicas
- **Modelos**: `Appointment`, `Service`, `Specialist`, `Client`, `Business` para gestión de datos
- **Integraciones**: Wompi para pagos online, Cloudinary para subida de comprobantes

#### Frontend (React + React Router + Redux Toolkit)
- **Flujo Multi-paso**: Componentes modulares para cada etapa de la reserva
- **Interfaz Responsiva**: Optimizada para móviles y desktop
- **Estado Centralizado**: Redux Toolkit para gestión global del estado de reserva
- **Operaciones Asíncronas**: Thunks para llamadas API y manejo de loading/error states

## 🔄 Flujo Completo de Reserva

### 1. Selección de Servicio
**Endpoint**: `GET /api/public/bookings/business/{businessCode}/services`
- Lista todos los servicios activos del negocio
- Incluye precios, duración y descripción
- Filtros por categoría si están disponibles

### 2. Selección de Especialista
**Endpoint**: `GET /api/public/bookings/business/{businessCode}/specialists`
- Lista especialistas disponibles para el servicio seleccionado
- Muestra información del especialista (nombre, especialidades)
- Filtra especialistas que ofrecen el servicio seleccionado

### 3. Selección de Fecha y Hora
**Endpoint**: `GET /api/public/bookings/business/{businessCode}/availability`
- **Parámetros**:
  - `serviceId`: ID del servicio seleccionado
  - `specialistId`: ID del especialista seleccionado
  - `date`: Fecha en formato YYYY-MM-DD
- Retorna slots disponibles con duración del servicio
- Maneja restricciones de horario del negocio y especialista

### 4. Datos del Cliente
- Formulario para capturar información del cliente
- Campos: nombre, email, teléfono, notas adicionales
- Validación de formato de email y teléfono

### 5. Método de Pago
Opciones disponibles:
- **Wompi**: Pago online con tarjeta de crédito/débito
- **Transferencia Bancaria**: Pago por depósito o transferencia
- **Efectivo**: Pago en el establecimiento

### 6. Confirmación y Creación de Reserva
**Endpoint**: `POST /api/public/bookings/business/{businessCode}`
- Crea la cita en la base de datos
- Procesa pago si es con Wompi
- Envía confirmación por email (pendiente de implementar)
- Retorna código único de reserva

### 7. Subida de Comprobante (para transferencias y efectivo)
**Endpoint**: `POST /api/public/bookings/business/{businessCode}/upload-proof/{bookingCode}`
- Acepta archivos: JPG, PNG, WebP, PDF (máximo 10MB)
- Sube a Cloudinary para almacenamiento
- Actualiza el registro de la cita con URL del comprobante

## � Flujo de Datos con Redux

### Estado Global del Booking
```javascript
{
  // Datos del negocio
  businessInfo: null,
  
  // Listados
  services: [],
  specialists: [],
  availability: [],
  
  // Datos acumulados de la reserva
  bookingData: {
    service: null,        // Servicio seleccionado
    specialist: null,     // Especialista seleccionado
    dateTime: null,       // Fecha y hora elegidas
    clientData: null,     // Información del cliente
    paymentMethod: null   // Método de pago
  },
  
  // Información adicional
  paymentInfo: null,      // Datos bancarios
  createdBooking: null,   // Reserva creada
  
  // Estados de UI
  currentStep: 1,         // Paso actual (1-6)
  isLoading*: false,      // Loading states por operación
  *Error: null           // Errores por operación
}
```

### Patrón de Componentes
1. **useSelector**: Obtener estado relevante del store Redux
2. **dispatch**: Ejecutar actions/thunks para actualizar estado
3. **Render condicional**: Basado en estado de loading/error
4. **Efectos secundarios**: useEffect para cargar datos iniciales

## �📡 APIs Disponibles

### Consultas Públicas (sin autenticación)

#### Servicios
```http
GET /api/public/bookings/business/{businessCode}/services
```

#### Especialistas
```http
GET /api/public/bookings/business/{businessCode}/specialists
```

#### Disponibilidad
```http
GET /api/public/bookings/business/{businessCode}/availability?serviceId={id}&specialistId={id}&date={YYYY-MM-DD}
```

#### Crear Reserva
```http
POST /api/public/bookings/business/{businessCode}
Content-Type: application/json

{
  "serviceId": 1,
  "specialistId": 2,
  "dateTime": {
    "date": "2025-01-15",
    "time": "14:30"
  },
  "clientData": {
    "name": "María González",
    "email": "maria@email.com",
    "phone": "+57 300 123 4567",
    "notes": "Cliente frecuente"
  },
  "paymentMethod": "wompi|transfer|cash",
  "paymentData": {
    // Para Wompi
    "amount": 50000,
    "currency": "COP",
    "reference": "BK-123456"
  }
}
```

#### Subir Comprobante
```http
POST /api/public/bookings/business/{businessCode}/upload-proof/{bookingCode}
Content-Type: multipart/form-data

paymentProof: [archivo]
notes: "Comprobante de transferencia"
```

## 🎨 Interfaz de Usuario

### Páginas y Componentes

#### `OnlineBookingPage.jsx`
Página principal del flujo de reservas con navegación entre pasos.

#### Componentes de Pasos
- `ServiceSelection.jsx`: Selección de servicio (usa `bookingData.service`)
- `SpecialistSelection.jsx`: Elección de especialista (usa `bookingData.specialist`)
- `DateTimeSelection.jsx`: Calendario y horarios (usa `bookingData.dateTime`)
- `ClientForm.jsx`: Formulario de datos del cliente (usa `bookingData.clientData`)
- `PaymentSelection.jsx`: Opciones de pago (usa `bookingData.paymentMethod`)
- `BookingConfirmation.jsx`: Resumen y confirmación (crea reserva con `createBooking`)

#### `BookingSuccess.jsx`
Página de éxito post-reserva con opción de subir comprobante.

### Navegación
- Rutas públicas: `/booking/{businessCode}` para iniciar reserva
- Ruta de éxito: `/booking/success` con datos de reserva en state

## ⚙️ Configuración y Variables de Entorno

### Backend (.env)
```env
# Base de datos
DATABASE_URL=postgresql://user:password@localhost:5432/beauty_control

# Wompi
WOMPI_PUBLIC_KEY=pub_test_...
WOMPI_PRIVATE_KEY=prv_test_...
WOMPI_BASE_URL=https://production.wompi.co/v1
WOMPI_INTEGRITY_SECRET=...

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (pendiente)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### Frontend
No requiere configuración adicional - usa las APIs del backend.

## 🔒 Seguridad y Validaciones

### Validaciones Implementadas
- **Código de negocio**: Validación de existencia y estado activo
- **Disponibilidad**: Verificación de slots disponibles antes de reserva
- **Archivos**: Validación de tipo y tamaño para comprobantes
- **Datos del cliente**: Formato de email y teléfono
- **Pagos**: Integridad de datos de transacción Wompi

### Medidas de Seguridad
- Rate limiting en endpoints públicos
- Validación de archivos en subida
- Sanitización de inputs
- Logs de auditoría para reservas

## 📱 Flujo Móvil

La interfaz está completamente optimizada para dispositivos móviles:
- Diseño responsivo con Tailwind CSS
- Navegación touch-friendly
- Formularios adaptados a pantallas pequeñas
- Calendario optimizado para móvil

## 🔄 Estados de Reserva

### Estados del Appointment
- `pending`: Reserva creada, esperando confirmación/pago
- `confirmed`: Reserva confirmada (pago aprobado o comprobante subido)
- `cancelled`: Reserva cancelada
- `completed`: Servicio realizado

### Estados de Pago
- `pending`: Esperando pago/comprobante
- `processing`: Procesando pago Wompi
- `completed`: Pago aprobado
- `failed`: Pago rechazado

## 📊 Monitoreo y Logs

### Logs Implementados
- Creación de reservas
- Procesamiento de pagos Wompi
- Subida de comprobantes
- Errores de validación
- Consultas de disponibilidad

### Métricas Disponibles
- Número de reservas por día
- Tasa de conversión del flujo
- Métodos de pago más usados
- Servicios más solicitados

## 🚀 Próximas Implementaciones

### Funcionalidades Pendientes
- **Notificaciones**: Email y WhatsApp para confirmaciones y recordatorios
- **Sistema de Penalizaciones**: Para cancelaciones tardías
- **Reprogramaciones**: Cambio de fecha/hora por parte del cliente
- **Dashboard de Staff**: Gestión de citas por especialistas
- **Valoraciones**: Sistema de reseñas post-servicio

### Mejoras Técnicas
- **Cache Redis**: Para consultas de disponibilidad frecuente
- **WebSockets**: Actualización en tiempo real de slots disponibles
- **Queue System**: Para procesamiento de pagos masivo
- **Analytics Avanzado**: Reportes detallados de conversión y uso
- **PWA**: Progressive Web App para experiencia móvil nativa

## 🧪 Testing

### Pruebas Implementadas
- Validación de flujo completo de reserva con Redux
- Pruebas de APIs públicas y thunks asíncronos
- Testing de subida de archivos con Cloudinary
- Validación de pagos Wompi y métodos de pago
- Testing de navegación entre pasos del flujo

### Colección Insomnia
Archivo: `beauty_control_insomnia_complete.json`
Incluye todas las APIs públicas y privadas para testing.

## 📝 Notas de Desarrollo

### Consideraciones Importantes
- Las APIs públicas NO requieren autenticación para facilitar el acceso de clientes
- Todas las validaciones se hacen a nivel de negocio (businessCode)
- Los comprobantes se almacenan en Cloudinary con URLs públicas
- El sistema maneja zonas horarias pero asume UTC en la base de datos

### Troubleshooting Común
- **Error 404 en servicios**: Verificar que el businessCode existe y está activo
- **Slots no disponibles**: Revisar configuración de horarios del especialista
- **Error en pago Wompi**: Verificar credenciales y formato de datos
- **Subida de archivo falla**: Verificar tipo de archivo y tamaño máximo

---

**Desarrollado por**: Beauty Control Team
**Versión**: 1.1.0
**Última actualización**: Septiembre 2025

### 🎯 Cambios Recientes (v1.1.0)
- ✅ **Refactorización completa con Redux Toolkit**: Estado centralizado para todo el flujo de booking
- ✅ **Componentes modulares**: Separación clara entre UI y lógica de estado
- ✅ **Manejo robusto de operaciones asíncronas**: Thunks para todas las llamadas API
- ✅ **Gestión centralizada de errores**: Estados de error y loading en Redux
- ✅ **Arquitectura escalable**: Fácil mantenimiento y extensión del sistema</content>
<parameter name="filePath">c:\Users\merce\Desktop\desarrollo\BC\ONLINE_BOOKING_README.md