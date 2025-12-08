# Beauty Control - Shared Package

Este paquete contiene toda la lógica compartida entre la aplicación web y la aplicación móvil de Beauty Control.

## 📦 Contenido

### 🔧 API Client
- **`api/client.js`** - Cliente HTTP base con manejo de autenticación
- **`api/auth.js`** - Funciones específicas para autenticación y usuarios

### 🏪 Redux Store
- **`store/index.js`** - Configuración principal del store
- **`store/slices/authSlice.js`** - Manejo de autenticación (login, register, recuperación de contraseña)
- **`store/slices/userSlice.js`** - Manejo de usuarios (CRUD, filtros, paginación)
- **`store/slices/cashRegisterSlice.js`** - ✨ **NUEVO** - Gestión de turnos de caja
- **`store/slices/receiptSlice.js`** - ✨ **NUEVO** - Gestión de recibos en PDF
- Y muchos más... (ver `store/slices/index.js`)

### 🎯 Selectors
- **`store/selectors/authSelectors.js`** - Selectores para estado de autenticación
- **`store/selectors/userSelectors.js`** - Selectores para estado de usuarios

### 🔧 Utilities
- **`utils/validation.js`** - Validaciones de formularios
- **`utils/helpers.js`** - Utilidades generales (storage, formatters, text utils)

### 📋 Constants
- **`constants/api.js`** - URLs, endpoints y configuración de API

## 🚀 Uso

### Configuración del Store

```javascript
import { store, createStore } from '@bc/shared';
import { Provider } from 'react-redux';

// Usar store por defecto
function App() {
  return (
    <Provider store={store}>
      {/* Tu aplicación */}
    </Provider>
  );
}

// O crear store personalizado
const customStore = createStore({ /* preloaded state */ });
```

### Autenticación

```javascript
import { useDispatch, useSelector } from 'react-redux';
import { 
  loginUser, 
  registerUser, 
  forgotPassword, 
  selectIsAuthenticated,
  selectUser,
  selectIsLoggingIn 
} from '@bc/shared';

function LoginComponent() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectIsLoggingIn);

  const handleLogin = async (credentials) => {
    try {
      await dispatch(loginUser({ 
        credentials, 
        rememberMe: true 
      })).unwrap();
      // Login exitoso
    } catch (error) {
      // Manejar error
    }
  };
}
```

### Recuperación de Contraseñas

```javascript
import { 
  forgotPassword, 
  verifyResetToken, 
  resetPassword,
  selectForgotPasswordSuccess 
} from '@bc/shared';

function ForgotPasswordComponent() {
  const dispatch = useDispatch();
  
  const handleForgotPassword = async (email) => {
    await dispatch(forgotPassword(email));
  };
  
  const handleResetPassword = async (token, newPassword) => {
    await dispatch(resetPassword({ token, newPassword }));
  };
}
```

### Manejo de Usuarios

```javascript
import { 
  fetchUsers, 
  updateUser, 
  selectUsers, 
  selectIsFetchingUsers,
  updateFilters 
} from '@bc/shared';

function UsersComponent() {
  const dispatch = useDispatch();
  const users = useSelector(selectUsers);
  const isLoading = useSelector(selectIsFetchingUsers);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleSearch = (searchTerm) => {
    dispatch(updateFilters({ search: searchTerm }));
  };
}
```

### Validaciones

```javascript
import { createValidator, validateEmail, validatePassword } from '@bc/shared';

const validator = createValidator({
  email: [
    { required: true, message: 'Email es requerido' },
    { type: 'email', message: 'Email inválido' }
  ],
  password: [
    { required: true, message: 'Contraseña es requerida' },
    { type: 'password', message: 'Contraseña muy débil' }
  ]
});

const errors = validator({ email: 'test@example.com', password: '123' });
```

### Utilidades

```javascript
import { formatters, textUtils, storage } from '@bc/shared';

// Formatear moneda
const price = formatters.formatCurrency(150000); // "$150.000"

// Formatear fecha
const date = formatters.formatDate(new Date()); // "11 de septiembre de 2025"

// Obtener iniciales
const initials = textUtils.getInitials('María', 'García'); // "MG"

// Storage
storage.setItem('key', 'value', true); // persistent = true
const value = storage.getItem('key');
```

## 🔧 Configuración de Environment

Asegúrate de configurar estas variables de entorno:

```bash
REACT_APP_API_URL=http://localhost:3001  # URL del backend
```

## 📱 Compatibilidad

Este paquete está diseñado para funcionar tanto en:
- ⚛️ **React Web App** (con localStorage)
- 📱 **React Native App** (adaptar storage para AsyncStorage)

## 📚 Documentación Adicional

### Sistemas Implementados

- **[Sistema de Caja y Recibos](./CASH_REGISTER_REDUX.md)** - Redux slices para gestión de turnos de caja y recibos PDF
- **[Sistema de Planes de Tratamiento](./TREATMENT_PLANS_REDUX.md)** - Redux para planes y sesiones
- **[Sistema de Vouchers](./VOUCHER_REDUX_IMPLEMENTATION.md)** - Redux para gestión de vouchers
- **[Sistema de Calendario](./CALENDAR_SYSTEM_REDUX.md)** - Redux para calendario y citas
- **[Sistema de Comisiones](./COMMISSION_REDUX.md)** - Redux para comisiones y consentimientos
- Y más en la carpeta raíz...

### Slices Disponibles

Para ver todos los slices disponibles y sus exports, consulta:
```javascript
import * as allSlices from '@shared/store/slices';
console.log(Object.keys(allSlices));
```

O revisa el archivo: `src/store/slices/index.js`

## 🎯 Próximos Pasos

1. Instalar Redux Toolkit: `npm install @reduxjs/toolkit react-redux`
2. Configurar el Provider en tu app
3. Importar y usar los slices y selectors según necesites
4. Adaptar el storage para React Native si es necesario

¡Listo para usar en ambas aplicaciones! 🚀