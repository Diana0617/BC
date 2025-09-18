# Beauty Control - Backend API

Backend para el sistema de gestión Beauty Control, desarrollado con Node.js, Express y PostgreSQL.

## 🚀 Características

- **Arquitectura Modular**: Estructura organizada con modelos, controladores, servicios y middleware
- **Seguridad Multi-Tenant**: Aislamiento completo de datos por negocio
- **Autenticación JWT**: Sistema seguro de autenticación y autorización
- **Control de Roles**: OWNER, BUSINESS, SPECIALIST, RECEPTIONIST, CLIENT
- **Rule Templates**: Sistema de plantillas de reglas reutilizables entre negocios
- **Paginación Automática**: Sistema eficiente de paginación en todas las consultas
- **Rate Limiting**: Protección contra abuso de API
- **Validación Robusta**: Validación de datos con Sequelize y middleware personalizado

## 🏗️ Arquitectura

```
src/
├── config/          # Configuraciones (DB, JWT, etc.)
├── models/          # Modelos de Sequelize
├── controllers/     # Lógica de negocio
├── services/        # Servicios reutilizables
├── middleware/      # Middleware personalizado
├── routes/          # Definición de rutas
└── utils/           # Utilidades compartidas
```

## 📦 Modelos Principales

- **User**: Usuarios del sistema con roles específicos
- **Business**: Negocios registrados en la plataforma
- **BusinessRules**: Reglas específicas de cada negocio
- **BusinessRuleTemplate**: Plantillas de reglas creadas por Owner
- **BusinessRuleAssignment**: Asignación de plantillas a negocios
- **SubscriptionPlan**: Planes de suscripción disponibles
- **Module**: Módulos funcionales del sistema
- **Client**: Clientes de los negocios
- **Appointment**: Citas agendadas
- **Service**: Servicios ofrecidos por negocios
- **Product**: Productos en inventario

## 🎯 Sistema de Rule Templates

El sistema de **Rule Templates** permite al Owner crear plantillas de reglas de negocio reutilizables:

### Características
- **Plantillas Centralizadas**: Owner crea reglas que pueden usar múltiples negocios
- **Personalización**: Cada negocio puede personalizar las reglas según sus necesidades
- **Compatibilidad**: Plantillas específicas por tipo de negocio y plan de suscripción
- **Versionado**: Control de versiones en las plantillas
- **Sincronización**: Actualización masiva cuando el Owner modifica plantillas

### Flujo de Trabajo
1. **Owner** crea plantillas con configuraciones base
2. **Negocios** exploran plantillas compatibles con su tipo y plan
3. **Negocios** asignan plantillas y las personalizan si es necesario
4. **Admin** puede sincronizar cambios cuando se actualizan plantillas

### Archivos de Documentación
- [`RULE_TEMPLATES_API.md`](./RULE_TEMPLATES_API.md) - Documentación completa de la API
- [`RULE_TEMPLATES_EXAMPLES.md`](./RULE_TEMPLATES_EXAMPLES.md) - Ejemplos de uso
- [`beauty_control_insomnia_complete.json`](./beauty_control_insomnia_complete.json) - Colección de Insomnia actualizada
- [`BUSINESS_CONFIGURATION_WORKFLOW_GUIDE.md`](./BUSINESS_CONFIGURATION_WORKFLOW_GUIDE.md) - Guía completa de configuración

### Endpoints Owner (Gestión de Plantillas)
```http
POST   /api/rule-templates/owner/templates           # Crear plantilla
GET    /api/rule-templates/owner/templates           # Listar plantillas  
PUT    /api/rule-templates/owner/templates/{id}      # Actualizar plantilla
DELETE /api/rule-templates/owner/templates/{id}      # Eliminar plantilla
```

**Autenticación**: Requiere token JWT con rol `OWNER`
- **Business**: Negocios suscriptores
- **BusinessRules**: Reglas configurables por negocio
- **Client**: Clientes finales
- **Appointment**: Sistema de citas y agenda
- **Service**: Servicios ofrecidos por los negocios
- **Product**: Productos e inventario
- **FinancialMovement**: Movimientos financieros
- **SubscriptionPlan**: Planes de suscripción

## 🔐 Seguridad

### Multi-Tenancy
- Filtrado automático por `businessId`
- Middleware de tenancy en todas las rutas
- Validación de acceso a recursos

### Autenticación
- JWT con expiración configurable
- Rate limiting en endpoints de auth
- Protección contra ataques de fuerza bruta

### Autorización
- Sistema de roles jerárquico
- Middleware de verificación de permisos
- Validación de acceso a módulos

## 🚀 Instalación

1. **Clonar el repositorio**
```bash
git clone [repo-url]
cd BC/packages/backend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

4. **Configurar base de datos**
```bash
# Crear base de datos PostgreSQL
createdb beauty_control_dev

# Las tablas se crean automáticamente en desarrollo
```

5. **Iniciar servidor**
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 🌍 Variables de Entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `NODE_ENV` | Ambiente de ejecución | `development` |
| `PORT` | Puerto del servidor | `5000` |
| `DB_HOST` | Host de PostgreSQL | `localhost` |
| `DB_NAME` | Nombre de la base de datos | `beauty_control_dev` |
| `DB_USER` | Usuario de la base de datos | `postgres` |
| `DB_PASSWORD` | Contraseña de la base de datos | `password` |
| `JWT_SECRET` | Secreto para JWT | `your_secret_key` |

## 📡 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/logout` - Cerrar sesión

### Negocios
- `GET /api/business` - Obtener información del negocio
- `PUT /api/business` - Actualizar negocio
- `GET /api/business/rules` - Obtener reglas del negocio

### Clientes
- `GET /api/clients` - Listar clientes (paginado)
- `POST /api/clients` - Crear cliente
- `GET /api/clients/:id` - Obtener cliente
- `PUT /api/clients/:id` - Actualizar cliente

### Citas
- `GET /api/appointments` - Listar citas
- `POST /api/appointments` - Crear cita
- `PATCH /api/appointments/:id/complete` - Completar cita

### Servicios
- `GET /api/services` - Listar servicios
- `POST /api/services` - Crear servicio

### Finanzas
- `GET /api/financial/summary` - Resumen financiero
- `GET /api/financial/movements` - Movimientos financieros

## 🔄 Estados de Respuesta

Todas las respuestas siguen el formato:

```json
{
  "success": boolean,
  "data": object|array,
  "error": string,
  "pagination": {
    "currentPage": number,
    "totalPages": number,
    "totalItems": number,
    "itemsPerPage": number
  }
}
```

## 🛠️ Desarrollo

### Scripts Disponibles
```bash
npm run dev      # Servidor con nodemon
npm start        # Servidor de producción
npm test         # Ejecutar tests
```

### Estructura de Middleware
1. **Helmet** - Headers de seguridad
2. **CORS** - Configuración de CORS
3. **Rate Limiting** - Limitación de requests
4. **Auth Middleware** - Verificación de JWT
5. **Tenancy Middleware** - Filtrado multi-tenant
6. **Role Check** - Verificación de permisos

## 📊 Base de Datos

- **PostgreSQL** como base de datos principal
- **Sequelize** como ORM
- **Migraciones automáticas** en desarrollo
- **Índices optimizados** para consultas frecuentes

## 🚀 Deployment

### Render.com (Desarrollo)
1. Conectar repositorio en Render
2. Configurar variables de entorno
3. Deploy automático desde `main`

### AWS (Producción)
- **Elastic Beanstalk** para el backend
- **RDS PostgreSQL** para la base de datos
- **CloudFront** para CDN
- **S3** para archivos estáticos

## 🔍 Monitoreo

- Logs estructurados con Morgan
- Health check en `/health`
- Error handling centralizado
- Métricas de performance

## 📝 TODO

- [x] ✅ Sistema de Rule Templates (Completado)
- [x] ✅ Controladores y servicios de Rule Templates
- [x] ✅ Middlewares de seguridad y tenancy
- [x] ✅ Documentación completa de Rule Templates API
- [ ] Sistema de notificaciones
- [ ] Integración con Cloudinary
- [ ] Tests unitarios y de integración
- [ ] Documentación con Swagger
- [ ] Sistema de cache con Redis
- [ ] Logging avanzado con Winston

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request