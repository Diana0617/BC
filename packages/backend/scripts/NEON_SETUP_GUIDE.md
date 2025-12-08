# 🗄️ Guía de Configuración de Base de Datos Neon

Esta guía explica cómo inicializar y resetear la base de datos de producción en Neon PostgreSQL.

## 📋 Scripts Disponibles

### 1. `reset-neon-database.js`
Limpia completamente la base de datos eliminando todas las tablas, secuencias y tipos ENUM.

**Uso:**
```bash
node scripts/reset-neon-database.js
```

**Requisitos:**
- `DATABASE_URL` debe estar configurada en `.env`
- Conexión a internet

**Qué hace:**
- ✅ Elimina todas las tablas (con CASCADE)
- ✅ Elimina todas las secuencias
- ✅ Elimina todos los tipos ENUM personalizados
- ✅ Verifica que todo se eliminó correctamente

---

### 2. `init-production-db.js`
Inicializa la base de datos creando tablas y sembrando datos iniciales.

**Uso:**
```bash
node scripts/init-production-db.js
```

**Requisitos:**
- `DATABASE_URL` debe estar configurada en `.env`
- Base de datos vacía (ejecutar `reset-neon-database.js` primero)

**Qué hace:**
- ✅ Verifica conexión a Neon
- ✅ Sincroniza modelos (crea tablas con `alter: true`)
- ✅ Inserta módulos base
- ✅ Inserta planes de suscripción
- ✅ Inserta plantillas de reglas
- ✅ Crea usuario de prueba (`Owner@bc.com`)

---

### 3. `setup-neon.sh` / `setup-neon.bat`
Script automatizado que ejecuta todo el proceso de setup.

**Uso (Linux/Mac):**
```bash
bash scripts/setup-neon.sh
```

**Uso (Windows):**
```bash
scripts\setup-neon.bat
```

---

## 🚀 Proceso Completo de Setup

### Opción A: Proceso Manual (Recomendado para entender cada paso)

#### 1. Configurar `.env`
```env
# Descomentar la URL de Neon
DATABASE_URL=postgresql://neondb_owner:npg_sVkni1pYdKP4@ep-divine-bread-adt4an18-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require

# Configurar sincronización
DISABLE_SYNC=false
FORCE_SYNC_DB=true
```

#### 2. Limpiar base de datos existente
```bash
cd packages/backend
node scripts/reset-neon-database.js
```

Verás:
```
✅ Conectado a Neon
📋 Se encontraron 44 tablas
🗑️  Eliminando todas las tablas...
   ✓ appointments eliminada
   ✓ branches eliminada
   ...
✅ Todas las tablas eliminadas correctamente
```

#### 3. Crear tablas
```bash
npm start
```

Espera unos 10-15 segundos hasta que veas en la consola:
```
✅ Modelos sincronizados
🚀 Servidor iniciado en puerto 3001
```

Presiona `Ctrl+C` para detener.

#### 4. Sembrar datos iniciales
```bash
node scripts/seed-modules.js
node scripts/seed-rule-templates.js
```

#### 5. Configurar para producción
Edita `.env`:
```env
DISABLE_SYNC=true
FORCE_SYNC_DB=false
```

#### 6. Iniciar servidor normalmente
```bash
npm start
```

---

### Opción B: Proceso Automático (Más rápido)

```bash
cd packages/backend
node scripts/init-production-db.js
```

Este script hace todo en un solo comando:
1. ✅ Verifica conexión
2. ✅ Crea todas las tablas
3. ✅ Siembra módulos
4. ✅ Siembra planes
5. ✅ Siembra reglas
6. ✅ Crea usuario inicial

**Después de ejecutar:**
1. Cambia en `.env`: `DISABLE_SYNC=true` y `FORCE_SYNC_DB=false`
2. Ejecuta: `npm start`

---

## 🔐 Usuario Inicial

Después del setup, tendrás un usuario creado:

```
Email: Owner@bc.com
Password: AdminPassword123!
Rol: OWNER
```

---

## ⚠️ Notas Importantes

### Variables de Entorno Críticas

1. **`DATABASE_URL`** (Obligatoria para Neon)
   ```env
   DATABASE_URL=postgresql://user:password@host/database?sslmode=require
   ```

2. **`DISABLE_SYNC`**
   - `false`: Sequelize sincroniza modelos en cada inicio (más lento)
   - `true`: No sincroniza, inicio más rápido (producción)

3. **`FORCE_SYNC_DB`**
   - `false`: Sincronización normal, no destruye datos
   - `true`: Recrear tablas (⚠️ DESTRUYE TODOS LOS DATOS)

### Cuándo usar cada configuración

**Desarrollo local (PostgreSQL local):**
```env
# Comentar DATABASE_URL
# DATABASE_URL=...

DB_HOST=localhost
DISABLE_SYNC=false
FORCE_SYNC_DB=false
```

**Primera vez en Neon (crear tablas):**
```env
DATABASE_URL=postgresql://...
DISABLE_SYNC=false
FORCE_SYNC_DB=true
```

**Producción en Neon (tablas ya creadas):**
```env
DATABASE_URL=postgresql://...
DISABLE_SYNC=true
FORCE_SYNC_DB=false
```

---

## 🐛 Troubleshooting

### Error: "DATABASE_URL no está configurada"
**Solución:** Descomentar la línea `DATABASE_URL` en `.env`

### Error: "Cannot connect to database"
**Solución:** Verificar que la URL de Neon sea correcta y tengas internet

### Error: "relation already exists"
**Solución:** Ejecutar `reset-neon-database.js` primero para limpiar

### Las tablas no se crean
**Solución:** Verificar que `FORCE_SYNC_DB=true` en `.env`

### El servidor tarda mucho en iniciar
**Solución:** Cambiar `DISABLE_SYNC=true` después del primer setup

---

## 📊 Tablas Creadas

El sistema crea 44+ tablas incluyendo:
- `users`, `businesses`, `branches`
- `clients`, `appointments`, `services`
- `products`, `inventory_movements`
- `financial_movements`, `receipts`
- `subscription_plans`, `modules`
- `specialist_profiles`, `specialist_commissions`
- `consent_templates`, `consent_signatures`
- Y más...

---

## 🔄 Actualizar Modelos en Producción

Si agregas nuevos campos o tablas:

1. Cambiar en `.env`:
   ```env
   DISABLE_SYNC=false
   FORCE_SYNC_DB=false  # NO usar true o perderás datos
   ```

2. Iniciar servidor:
   ```bash
   npm start
   ```

3. Sequelize aplicará los cambios (alter tables)

4. Volver a configurar:
   ```env
   DISABLE_SYNC=true
   ```

**⚠️ Para cambios grandes, mejor usar migraciones**

---

## 📝 Logs Útiles

Durante el setup verás:
```
🔌 Conectando a Neon PostgreSQL...
✅ Conectado a Neon

📦 Sincronizando módulos...
   ✓ SubscriptionPlan sincronizado
   ✓ Module sincronizado
   ✓ Business sincronizado
   ...

🌱 Sembrando módulos del sistema...
   ✓ Gestión de Clientes
   ✓ Agenda y Citas
   ...

✨ Base de datos inicializada exitosamente!
```

---

## 🆘 Soporte

Si tienes problemas:
1. Revisa los logs del servidor
2. Verifica las variables de entorno
3. Intenta el reset completo: `reset-neon-database.js` + `init-production-db.js`
