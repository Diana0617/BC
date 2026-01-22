# Instrucciones de Codificación IA para Beauty Control

## Visión General de la Arquitectura

**Beauty Control** es una plataforma SaaS multi-tenant para gestión de salones/spas construida con:
- **Backend:** Node.js/Express + Sequelize ORM + PostgreSQL (Neon)
- **Frontend:** React + Redux Toolkit + Tailwind CSS (Vite)
- **Mobile:** React Native (store Redux compartido vía paquete `@bc/shared`)

### Decisiones Arquitectónicas Clave

1. **Modelo Multi-Tenancy**: Los negocios están completamente aislados vía `businessId` a nivel de middleware. Usa `req.user.businessId` en todos los controladores; nunca confíes en input del cliente para límites de tenancy.

2. **Control de Acceso Basado en Roles**: 4 niveles - `OWNER` (plataforma), `BUSINESS` (admin), `SPECIALIST` (servicios), `RECEPTIONIST` (agendamiento). El middleware `permissions.js` aplica reglas por endpoint.

3. **Store Redux Compartido**: `packages/shared/src/store/` contiene slices centralizados. Web-app importa de `@bc/shared`. Mobile usa misma estructura. Los slices manejan: auth, user, business config, calendars, payments, loyalty, WhatsApp, Wompi, etc.

4. **Pagos Basados en Webhooks**: Integración con Wompi (procesador de pagos colombiano) y WhatsApp Business Platform vía webhooks. Los negocios pueden recibir pagos directamente; la plataforma maneja suscripciones.

## Patrones Críticos de Desarrollo

### Autenticación & Tenancy
```javascript
// ✅ CORRECTO: Siempre validar businessId en la entrada del controlador
const { businessId } = req.user; // Del token JWT
req.tenancy = { businessId, addFilter: (where) => ({ ...where, businessId }) };

// ❌ INCORRECTO: Usar businessId del cliente sin validación JWT
const businessId = req.query.businessId; // Riesgo de seguridad
```

### Patrón de Capa de Servicio
- `services/` contiene lógica de negocio (no controladores)
- Siempre retornar objeto `{ success, data, error }`
- Ejemplo: `TenancyService.addTenancyFilter()`, `PermissionService.checkPermission()`

### Patrones Redux (Frontend)
- Slices en `shared/src/store/slices/` siguen convenciones Redux Toolkit
- Usar `createAsyncThunk` para llamadas API, no fetch directo en componentes
- Estructura de slice: `{name, initialState, reducers, extraReducers}`
- Componentes despachan acciones: `dispatch(fetchBusiness(businessId))`

### Manejo de Errores
```javascript
// Backend: Errores específicos de Sequelize (ver app.js líneas 360+)
if (error.name === 'SequelizeValidationError') { ... }
if (error.name === 'SequelizeUniqueConstraintError') { ... }

// Frontend: Usar notificaciones toast (react-hot-toast)
import toast from 'react-hot-toast';
toast.error(error.message);
```

## Flujos de Trabajo Esenciales

### Ejecutar Localmente
```bash
# Backend
cd packages/backend
npm install
npm run db:migrate
npm run dev  # Inicia en puerto 5000

# Web Frontend
cd packages/web-app
npm install
npm run dev  # Inicia en puerto 5173

# Store compartido (auto-instalado por postinstall hooks)
cd packages/shared && npm install
```

### Operaciones de Base de Datos
- Migraciones: `packages/backend/src/migrations/`
- Modelos heredan de Sequelize (ver `models/index.js`)
- Datos seed: `packages/backend/src/routes/seed.js` (endpoint solo OWNER)
- BD Producción: PostgreSQL en Neon vía variable de entorno `DATABASE_URL`

### Formato de Respuesta API
Todos los endpoints retornan JSON estandarizado:
```json
{
  "success": true|false,
  "data": {...},
  "error": "mensaje de error si success=false"
}
```

## Relaciones de Modelos & Flujo de Datos

### Entidades Principales
- **Business** → posee Users, Clients, Appointments, Products
- **Appointment** → vincula Client + Service + Specialist + Payments
- **User** → tiene Role (OWNER/BUSINESS/SPECIALIST/RECEPTIONIST) + asignación Branch
- **Branch** → soporte multi-sucursal; controla stock, horarios por sucursal
- **BusinessSubscription** → rastrea acceso a plan (ACTIVE/EXPIRED/SUSPENDED)

### Sistemas de Pago (3 Tipos)
1. **Pagos Plataforma (Owner)**: Cobros de suscripción vía Wompi (renovaciones mensuales vía `AutoRenewalService`)
2. **Pagos Clientes de Negocios**: Negocios cobran a clientes vía `BusinessWompiPaymentConfig`
3. **Caja Registradora**: `CashRegisterShift` + `Receipt` + `Sale` para transacciones presenciales

### Integración WhatsApp
- `WhatsAppToken` almacena tokens API del negocio
- `WhatsAppMessage` registra mensajes enviados
- Webhooks en `/api/webhooks/whatsapp` manejan mensajes entrantes
- `WhatsAppService` maneja envíos; `WhatsAppTokenManager` refresca tokens

## Listas de Verificación de Código

### Agregar Endpoints
1. ✅ Requerir middleware `authenticateToken`
2. ✅ Agregar filtro `tenancy` (usar `req.tenancy.addFilter()`)
3. ✅ Verificar permisos vía `PermissionService` o verificación de rol
4. ✅ Documentar con anotaciones JSDoc + Swagger
5. ✅ Retornar formato estándar `{ success, data, error }`
6. ✅ Probar en Insomnia (colecciones en raíz: `*-insomnia.json`)

### Agregar Componentes Frontend
1. ✅ Usar slices Redux para estado (no useState para datos async)
2. ✅ Envolver con contexto `<BrowserRouter>` (antes de `<StoreProvider>`)
3. ✅ Manejar `businessId` desde store Redux (`selectBusinessId`)
4. ✅ Mostrar notificaciones toast para errores/éxito
5. ✅ Usar clases Tailwind (no CSS inline)

### Modificar Modelos
1. ✅ Crear migración en `src/migrations/`
2. ✅ Actualizar definición del modelo (asociaciones, validaciones)
3. ✅ Actualizar sección de asociaciones en `models/index.js`
4. ✅ Agregar endpoints para exponer nuevos campos
5. ✅ Actualizar slices Redux si frontend muestra el campo

## Errores Comunes a Evitar

- **Violación de Tenancy**: Leer `businessId` directo del body en vez del JWT
- **Imports No Usados**: Ejecutar refactoring Pylance `source.unusedImports` antes de commit
- **Migración Faltante**: Cambios de schema sin archivo de migración correspondiente
- **Condiciones de Carrera**: Webhooks disparándose antes de commits a BD; usar locks/transacciones
- **Problemas CORS**: Agregar nuevos origins a config cors en `app.js` (URLs producción + variantes localhost)
- **Estado Redux Obsoleto**: Despachar acción de refresh después de mutaciones, no solo actualizar cache

## Archivos & Directorios Clave

| Ruta | Propósito |
|------|-----------|
| `packages/backend/src/app.js` | App Express principal, registro de rutas |
| `packages/backend/src/middleware/` | Auth, tenancy, permissions, verificación de roles |
| `packages/backend/src/services/` | Lógica de negocio (IMPORTANTE - 33 archivos de servicios) |
| `packages/backend/src/models/` | Modelos Sequelize (95+ modelos) |
| `packages/shared/src/store/slices/` | Estado Redux (60+ slices) |
| `packages/web-app/src/components/` | Componentes React (organizados por dominio) |
| `packages/web-app/src/pages/` | Componentes nivel de ruta |
| `packages/backend/src/routes/` | Definiciones de endpoints API |
| `packages/backend/src/webhooks/` | Controladores webhook (Wompi, WhatsApp) |

## Testing & Debugging

- **Testing API**: Usar colecciones Insomnia (`*-insomnia.json`)
- **Logs**: Consola frontend + backend `console.log()` (buscar 🔐 auth, 📤 requests, ❌ errors)
- **Base de Datos**: Consultas directas vía herramienta `pgsql` con string conexión Neon
- **Redux DevTools**: Extensión de navegador para inspeccionar estado/acciones (en desarrollo)
- **Detalles de Error**: Verificar `error.name` para errores específicos de Sequelize (SequelizeValidationError, etc.)
