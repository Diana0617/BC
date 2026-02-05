# 🛠️ Sistema de Mantenimiento y Backup - Beauty Control

## 📋 Índice

1. [Backups Automáticos](#backups-automáticos)
2. [Panel de Desarrollador](#panel-de-desarrollador)
3. [Modo Mantenimiento](#modo-mantenimiento)
4. [Configuración](#configuración)

---

## 🔄 Backups Automáticos

### Características

- ✅ Backup diario de PostgreSQL
- ✅ Compresión automática (.gz)
- ✅ Retención configurable (por defecto 30 días)
- ✅ Opción de subida a la nube (Azure/AWS/GCP)
- ✅ Logs de ejecución

### Configuración

1. **Crear directorio de backups:**
```bash
mkdir backups
```

2. **Configurar variables de entorno** (`.env`):
```env
BACKUP_DIR=./backups
BACKUP_RETENTION_DAYS=30
BACKUP_TO_CLOUD=false
```

3. **Probar manualmente:**
```bash
node scripts/backup-database.js
```

### Programar Backups Automáticos

#### Windows (Task Scheduler)

1. Abrir "Programador de tareas"
2. Crear tarea básica:
   - Nombre: "BC Database Backup"
   - Desencadenador: Diario a las 2:00 AM
   - Acción: Iniciar programa
     - Programa: `C:\Program Files\nodejs\node.exe`
     - Argumentos: `C:\Users\merce\Desktop\desarrollo\BC\scripts\backup-database.js`
     - Iniciar en: `C:\Users\merce\Desktop\desarrollo\BC`

#### Linux/Mac (Cron)

```bash
# Editar crontab
crontab -e

# Agregar línea (ejecutar a las 2:00 AM):
0 2 * * * cd /ruta/a/BC && node scripts/backup-database.js >> /var/log/bc-backup.log 2>&1
```

#### Azure/Render (Cloud)

- **Azure**: Usar Azure Functions con Timer Trigger
- **Render**: Usar Cron Jobs (plan Pro)

### Restaurar un Backup

```bash
# Descomprimir
gunzip backups/backup-2026-02-04.sql.gz

# Restaurar
psql -h <host> -U <user> -d <database> -f backups/backup-2026-02-04.sql
```

---

## 🔧 Panel de Desarrollador

### Acceso

- **URL**: `/developer`
- **Requisito**: Rol `OWNER`
- **Propósito**: Administración avanzada del sistema

### Funcionalidades

#### 1. Modo Mantenimiento
- Activar/desactivar modo mantenimiento
- Configurar mensaje personalizado
- Establecer tiempo estimado
- Los usuarios OWNER mantienen acceso

#### 2. Estadísticas del Sistema
- Conteo de registros principales
- Tamaño de tablas
- Operaciones de BD (inserts, updates, deletes)

#### 3. Consultas SQL
- Ejecutar queries SELECT (solo lectura)
- Validación de seguridad
- Vista de resultados en JSON

#### 4. Eliminación de Datos
- Borrar registros específicos
- Código de confirmación requerido
- Registro de auditoría
- Tablas permitidas:
  - `users`
  - `clients`
  - `appointments`
  - `receipts`
  - `financial_movements`
  - `business_expenses`
  - `commission_payment_requests`

### Uso del Panel

1. **Iniciar sesión** como usuario OWNER
2. **Navegar** a `/developer`
3. **Realizar operaciones** con precaución

---

## 🚧 Modo Mantenimiento

### ¿Qué hace el Modo Mantenimiento?

- Bloquea acceso a la API para usuarios regulares
- Muestra página de mantenimiento con mensaje personalizado
- Permite acceso a usuarios OWNER para verificaciones
- Preserva sesiones activas

### ¿Cuándo usarlo?

- ✅ Actualizaciones mayores de base de datos
- ✅ Migraciones que requieren tiempo
- ✅ Cambios en lógica crítica del negocio
- ✅ Mantenimiento de servidores
- ❌ NO para cambios menores o hotfixes

### Activar Modo Mantenimiento

#### Desde Panel de Desarrollador (Recomendado)

1. Ir a `/developer`
2. Click en "Activar Mantenimiento"
3. Ingresar mensaje (ej: "Estamos actualizando el sistema")
4. Ingresar tiempo estimado (ej: "30 minutos")

#### Desde API (Programático)

```bash
curl -X POST https://api.tudominio.com/api/developer/maintenance-mode \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "enabled": true,
    "message": "Sistema en mantenimiento. Volveremos pronto.",
    "estimatedEndTime": "23:00"
  }'
```

### Desactivar Modo Mantenimiento

```bash
curl -X POST https://api.tudominio.com/api/developer/maintenance-mode \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"enabled": false}'
```

---

## ⚙️ Configuración

### Migraciones

```bash
# Ejecutar migración para crear tabla system_config
npm run db:migrate
```

### Variables de Entorno

```env
# Base de datos
DATABASE_URL=postgresql://user:pass@host:5432/database

# Backups
BACKUP_DIR=./backups
BACKUP_RETENTION_DAYS=30
BACKUP_TO_CLOUD=false

# Opcional: Azure Blob Storage
# AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;...
```

### Rutas Protegidas

- `/api/developer/*` - Solo OWNER
- `/api/auth/login` - Permitida en mantenimiento
- `/api/health` - Permitida en mantenimiento
- Todas las demás rutas - Bloqueadas en mantenimiento (excepto OWNER)

---

## 🔒 Seguridad

### Backups

- ✅ Backups comprimidos con gzip
- ✅ Almacenamiento local por defecto
- ✅ Limpieza automática de backups antiguos
- ⚠️ Asegurar permisos de archivo (chmod 600)
- ⚠️ No compartir backups públicamente

### Panel de Desarrollador

- ✅ Solo rol OWNER tiene acceso
- ✅ Queries SQL limitados a SELECT
- ✅ Código de confirmación para eliminaciones
- ✅ Auditoría de todas las operaciones
- ⚠️ No compartir credenciales OWNER

### Modo Mantenimiento

- ✅ Preserva acceso para OWNER
- ✅ Mensaje personalizable
- ✅ Sin exposición de información sensible
- ⚠️ Notificar a usuarios antes de activar

---

## 📝 Logs

### Backups

```bash
# Ver logs de backups
tail -f /var/log/bc-backup.log  # Linux/Mac
# Windows: Ver en Task Scheduler History
```

### Operaciones de Desarrollador

Los logs se registran automáticamente en la consola del servidor:

```
🔒 Modo mantenimiento ACTIVADO por usuario abc-123
🗑️ DEVELOPER DELETE - Usuario xyz-789 eliminó registro de users: {...}
📊 DEVELOPER QUERY - Usuario xyz-789 ejecutó query: SELECT * FROM...
```

---

## 🆘 Troubleshooting

### Problema: Backup falla con error de pg_dump

**Solución**: Instalar PostgreSQL client tools

```bash
# Ubuntu/Debian
sudo apt-get install postgresql-client

# Mac
brew install postgresql

# Windows
# Descargar desde postgresql.org
```

### Problema: No puedo acceder al Panel de Desarrollador

**Solución**: Verificar que tu usuario tenga rol `OWNER`

```sql
SELECT email, role FROM users WHERE email = 'tu@email.com';
```

### Problema: Modo mantenimiento no se activa

**Solución**: 
1. Verificar que la migración se ejecutó
2. Verificar logs del servidor
3. Intentar desde API directamente

---

## 📞 Soporte

Si necesitas ayuda:

- 📧 Email: soporte@controldenegocios.com
- 🐛 Issues: GitHub (si aplica)
- 📚 Documentación: Este README

---

## ✅ Checklist de Implementación

- [ ] Ejecutar migración `create-system-config`
- [ ] Configurar variables de entorno
- [ ] Probar backup manual
- [ ] Programar backups automáticos
- [ ] Verificar acceso al Panel de Desarrollador
- [ ] Probar activación/desactivación de Modo Mantenimiento
- [ ] Configurar retención de backups
- [ ] (Opcional) Configurar subida a la nube
- [ ] Documentar procedimientos para tu equipo

---

**Última actualización**: Febrero 2026
**Versión**: 1.0.0
